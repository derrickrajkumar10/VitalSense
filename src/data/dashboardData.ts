export interface Patient {
  name: string;
  mrn: string;
  age: number;
  weight: string;
  height: string;
  blood: string;
  photo?: string;
}

export interface Vital {
  id: string;
  label: string;
  value: number;
  unit: string;
  displayValue: string;
  status: 'normal' | 'elevated' | 'critical';
  icon: string;
}

export interface Appointment {
  time: string;
  doctor: string;
  specialty: string;
  status: 'past' | 'current' | 'upcoming';
}

export interface BloodTest {
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'low' | 'high';
}

export interface Hotspot {
  id: string;
  label: string;
  x: number; // percent of SVG width
  y: number; // percent of SVG height
  status: 'normal' | 'active' | 'warning';
  vitalSummary: string;
}

export interface Scan {
  id: string;
  label: string;
  date: string;
  color: string;
}

export const patient: Patient = {
  name: 'Eleanor Vance',
  mrn: '849-291-B',
  age: 45,
  weight: '62 kg',
  height: '168 cm',
  blood: 'O+',
};

export const vitals: Vital[] = [
  {
    id: 'hr',
    label: 'Heart Rate',
    value: 72,
    unit: 'bpm',
    displayValue: '72',
    status: 'normal',
    icon: '♥',
  },
  {
    id: 'bp',
    label: 'Blood Pressure',
    value: 135,
    unit: 'mmHg',
    displayValue: '135/85',
    status: 'elevated',
    icon: '⬆',
  },
  {
    id: 'spo2',
    label: 'SpO₂',
    value: 99,
    unit: '%',
    displayValue: '99',
    status: 'normal',
    icon: '○',
  },
  {
    id: 'rr',
    label: 'Resp. Rate',
    value: 14,
    unit: 'br/m',
    displayValue: '14',
    status: 'normal',
    icon: '~',
  },
];

export const appointments: Appointment[] = [
  {
    time: '09:00',
    doctor: 'Dr. J. Silva',
    specialty: 'General Checkup',
    status: 'past',
  },
  {
    time: '11:30',
    doctor: 'Dr. A. Thorne',
    specialty: 'Cardiology Review',
    status: 'current',
  },
  {
    time: '14:00',
    doctor: 'Dr. M. Chen',
    specialty: 'Physiotherapy',
    status: 'upcoming',
  },
];

export const bloodTests: BloodTest[] = [
  { label: 'CRP', value: '1.2', unit: 'mg/L', status: 'normal' },
  { label: 'WBC', value: '6.8', unit: 'K/uL', status: 'normal' },
  { label: 'ESR', value: '12', unit: 'mm/hr', status: 'normal' },
  { label: 'HGB', value: '14.2', unit: 'g/dL', status: 'normal' },
];

export const hotspots: Hotspot[] = [
  {
    id: 'head',
    label: 'Neurological',
    x: 50,
    y: 7,
    status: 'normal',
    vitalSummary: 'No anomalies',
  },
  {
    id: 'heart',
    label: 'Cardiovascular',
    x: 55,
    y: 33,
    status: 'active',
    vitalSummary: '72 bpm · Irregular',
  },
  {
    id: 'lung',
    label: 'Pulmonary',
    x: 43,
    y: 30,
    status: 'normal',
    vitalSummary: 'SpO₂ 99%',
  },
  {
    id: 'abdomen',
    label: 'Abdominal',
    x: 50,
    y: 54,
    status: 'normal',
    vitalSummary: 'Within range',
  },
];

export const scans: Scan[] = [
  { id: 'ecg', label: 'ECG-12H', date: '03/18', color: '#6A608A' },
  { id: 'echo', label: 'ECHO', date: '08/12', color: '#63755A' },
];

export const tabs = ['Intake', 'Assessment', 'Diagnosis', 'Treatment Plan'];
