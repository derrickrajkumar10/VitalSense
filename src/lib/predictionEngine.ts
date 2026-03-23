import type { SubmittedVitals } from '../context/VitalsContext';

export interface PredictionCondition {
  label: string;
  pct: number;
  ci: string;
}

export interface ShapValue {
  label: string;
  pct: number;
  dir: 'pos' | 'neg';
  display: string;
}

export interface Prediction {
  riskScore: number;
  conditions: PredictionCondition[];
  shapValues: ShapValue[];
  topCondition: string;
}

export function computePrediction(vitals: SubmittedVitals | null): Prediction {
  if (vitals === null) {
    return {
      riskScore: 78,
      conditions: [
        { label: 'Arrhythmia',                pct: 78, ci: '72–84%' },
        { label: 'Hypertension Exacerbation', pct: 62, ci: '55–68%' },
        { label: 'Tachycardia',               pct: 45, ci: '38–51%' },
        { label: 'Hypoxia Event',             pct: 12, ci: '8–15%'  },
        { label: 'Bradycardia',               pct:  5, ci: '2–8%'   },
      ],
      shapValues: [
        { label: 'HR Variability',   pct: 38, dir: 'pos', display: '+22%' },
        { label: 'Heart Rate',       pct: 25, dir: 'pos', display: '+15%' },
        { label: 'Stress Index',     pct: 18, dir: 'pos', display: '+10%' },
        { label: 'Blood Pressure',   pct: 14, dir: 'neg', display: '-5%'  },
        { label: 'SpO2 Level',       pct: 20, dir: 'neg', display: '-8%'  },
      ],
      topCondition: 'Hypertension Exacerbation',
    };
  }

  let score = 20;
  const conditions: PredictionCondition[] = [];
  const shapMap: Record<string, number> = { hr: 0, bp: 0, spo2: 0, hrv: 0, resp: 0 };

  // HR
  if (vitals.hr > 130) {
    score += 25;
    conditions.push({ label: 'Severe Tachycardia', pct: 82, ci: '75–88%' });
    shapMap.hr = 25;
  } else if (vitals.hr > 100) {
    score += 15;
    conditions.push({ label: 'Tachycardia', pct: Math.min(98, (55 + (vitals.hr - 100) * 0.5) | 0), ci: '48–72%' });
    shapMap.hr = 15;
  } else if (vitals.hr < 60) {
    score += 10;
    conditions.push({ label: 'Bradycardia', pct: 50, ci: '42–58%' });
    shapMap.hr = 10;
  }

  // BP
  if (vitals.bp_sys >= 180) {
    score += 35;
    conditions.push({ label: 'Hypertensive Crisis', pct: 88, ci: '82–93%' });
    shapMap.bp = 35;
  } else if (vitals.bp_sys >= 140) {
    score += 20;
    conditions.push({ label: 'Hypertension', pct: 65, ci: '58–72%' });
    shapMap.bp = 20;
  } else if (vitals.bp_sys <= 90) {
    score += 20;
    conditions.push({ label: 'Hypotension', pct: 70, ci: '62–77%' });
    shapMap.bp = 20;
  }

  // SpO2
  if (vitals.spo2 < 90) {
    score += 35;
    conditions.push({ label: 'Severe Hypoxemia', pct: 92, ci: '86–96%' });
    shapMap.spo2 = 35;
  } else if (vitals.spo2 < 95) {
    score += 20;
    conditions.push({ label: 'Hypoxemia', pct: 75, ci: '67–82%' });
    shapMap.spo2 = 20;
  }

  // Temp
  if (vitals.temp > 39.5) {
    score += 20;
    conditions.push({ label: 'High Fever', pct: 78, ci: '70–85%' });
    shapMap.resp += 5;
  } else if (vitals.temp > 38.0) {
    score += 10;
    conditions.push({ label: 'Fever', pct: 60, ci: '52–68%' });
    shapMap.resp += 3;
  } else if (vitals.temp < 36.0) {
    score += 15;
    conditions.push({ label: 'Hypothermia', pct: 65, ci: '57–73%' });
    shapMap.resp += 5;
  }

  // HRV
  if (vitals.hrv < 20) {
    score += 25;
    conditions.push({ label: 'Critical HRV Depression', pct: 80, ci: '73–86%' });
    shapMap.hrv = 25;
  } else if (vitals.hrv < 30) {
    score += 15;
    conditions.push({ label: 'Low HRV', pct: 60, ci: '52–68%' });
    shapMap.hrv = 15;
  }

  // Resp
  if (vitals.resp > 30) {
    score += 20;
    conditions.push({ label: 'Severe Tachypnea', pct: 80, ci: '72–87%' });
    shapMap.resp += 10;
  } else if (vitals.resp > 20) {
    score += 10;
    conditions.push({ label: 'Tachypnea', pct: 55, ci: '46–64%' });
    shapMap.resp += 5;
  } else if (vitals.resp < 10) {
    score += 15;
    conditions.push({ label: 'Bradypnea', pct: 65, ci: '56–73%' });
    shapMap.resp += 8;
  }

  const riskScore = Math.min(98, score);

  if (conditions.length === 0) {
    conditions.push({ label: 'All Vitals Normal', pct: 5, ci: '2–9%' });
  }

  const totalShapPoints = Object.values(shapMap).reduce((a, b) => a + b, 0) || 1;

  const shapValues: ShapValue[] = [
    {
      label: 'HR Variability',
      pct: Math.round((shapMap.hr / totalShapPoints) * 50 + 5),
      dir: shapMap.hr > 0 ? 'pos' : 'neg',
      display: shapMap.hr > 0
        ? '+' + Math.round(shapMap.hr / totalShapPoints * 40) + '%'
        : '-' + (8 - Math.round(shapMap.hr / totalShapPoints * 5)) + '%',
    },
    {
      label: 'Blood Pressure',
      pct: Math.round((shapMap.bp / totalShapPoints) * 50 + 5),
      dir: shapMap.bp > 0 ? 'pos' : 'neg',
      display: shapMap.bp > 0
        ? '+' + Math.round(shapMap.bp / totalShapPoints * 40) + '%'
        : '-5%',
    },
    {
      label: 'SpO2 Level',
      pct: Math.round((shapMap.spo2 / totalShapPoints) * 50 + 5),
      dir: shapMap.spo2 > 0 ? 'pos' : 'neg',
      display: shapMap.spo2 > 0
        ? '+' + Math.round(shapMap.spo2 / totalShapPoints * 35) + '%'
        : '-8%',
    },
    {
      label: 'HRV Index',
      pct: Math.round((shapMap.hrv / totalShapPoints) * 50 + 5),
      dir: shapMap.hrv > 0 ? 'pos' : 'neg',
      display: shapMap.hrv > 0
        ? '+' + Math.round(shapMap.hrv / totalShapPoints * 38) + '%'
        : '-6%',
    },
    {
      label: 'Resp Rate',
      pct: Math.round((shapMap.resp / totalShapPoints) * 50 + 5),
      dir: shapMap.resp > 0 ? 'pos' : 'neg',
      display: shapMap.resp > 0
        ? '+' + Math.round(shapMap.resp / totalShapPoints * 30) + '%'
        : '-4%',
    },
  ];

  const topCondition = conditions.length > 0 ? conditions[0].label : 'All Vitals Normal';

  return { riskScore, conditions, shapValues, topCondition };
}
