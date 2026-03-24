import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FAQ } from './ui/faq-tabs';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const categories = {
  'platform': 'Platform',
  'clinical-data': 'Clinical Data',
  'ai-insights': 'AI & Predictions',
  'security': 'Security & Compliance',
};

const faqData = {
  'platform': [
    {
      question: 'What is VitalSense and who is it designed for?',
      answer: 'VitalSense is a clinical AI platform for real-time vital signs monitoring and predictive health analytics. It is designed for clinicians, hospitals, and remote patient monitoring programs that need a unified view of patient data with actionable AI-driven insights.',
    },
    {
      question: 'Which devices and telemetry sources does VitalSense support?',
      answer: 'VitalSense integrates with standard bedside monitors, wearable ECG patches, pulse oximeters, blood pressure cuffs, and HL7/FHIR-compatible EHR systems. Our open API layer allows custom device integrations within hours.',
    },
    {
      question: 'Is there a mobile application available?',
      answer: 'A progressive web app optimised for tablet and mobile is available on all plans. A native iOS and Android app is on the roadmap for Q3 2026.',
    },
    {
      question: 'How does the dashboard differ from a traditional EMR?',
      answer: 'VitalSense is a decision-support layer, not a replacement EMR. It sits on top of existing records and adds real-time vitals streaming, AI risk scoring, and longitudinal trend analysis — the three layers most EMRs lack.',
    },
  ],
  'clinical-data': [
    {
      question: 'What vital signs does VitalSense monitor and track?',
      answer: 'Heart rate, blood pressure (systolic and diastolic), SpO₂, respiratory rate, temperature, and HRV (heart rate variability). The platform derives composite stress indices and autonomic balance metrics from these core inputs.',
    },
    {
      question: 'How far back does the longitudinal history view go?',
      answer: 'VitalSense retains rolling history for up to 7 years depending on your plan. The History & Trends view provides 1-month, 3-month, 1-year, and all-time chart modes with anomaly markers overlaid on every range.',
    },
    {
      question: 'Can I export patient data for use in research or reporting?',
      answer: 'Yes. Clinical reports can be exported as PDF (via the Reports page), and raw time-series data can be exported as CSV or JSON via the API. All exports are audit-logged.',
    },
    {
      question: 'How does VitalSense handle missing or low-quality readings?',
      answer: 'The ingestion pipeline applies signal quality scoring to each reading. Low-quality samples are flagged rather than silently discarded, and interpolation is applied only within configurable tolerance thresholds to preserve clinical integrity.',
    },
  ],
  'ai-insights': [
    {
      question: 'How is the composite risk score calculated?',
      answer: 'The composite risk score (0–100) is produced by a rule-based engine that weights current vitals against established clinical thresholds, longitudinal trends, HRV patterns, and stress index changes. SHAP attribution values surface the top contributing factors for every score.',
    },
    {
      question: 'What conditions can VitalSense predict?',
      answer: 'The current engine produces probability estimates for arrhythmia, hypertension exacerbation, tachycardia, and hypoxic events. Condition coverage expands with each quarterly model update.',
    },
    {
      question: 'Is the AI explainable — can I see why it flagged a patient?',
      answer: 'Yes. Every prediction includes a SHAP attribution panel that ranks the exact factors (HR variability, blood pressure trend, SpO₂ level, etc.) driving the score, so clinicians can verify AI reasoning against their own clinical judgement.',
    },
    {
      question: 'Does the AI learn from my patient population over time?',
      answer: 'The base model is pre-trained on large multi-site datasets. Federated fine-tuning on your de-identified cohort data is available on the Enterprise plan, subject to your institution\'s data governance policies.',
    },
  ],
  'security': [
    {
      question: 'Is VitalSense HIPAA compliant?',
      answer: 'Yes. VitalSense is fully HIPAA-compliant. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We sign a Business Associate Agreement (BAA) with every healthcare organisation that subscribes to a paid plan.',
    },
    {
      question: 'Where is patient data stored?',
      answer: 'Data is stored in SOC 2 Type II certified cloud infrastructure with regional options in the US (us-east-1, us-west-2) and EU (eu-west-1). Data residency selection is available on Professional and Enterprise plans.',
    },
    {
      question: 'What authentication methods are supported?',
      answer: 'VitalSense supports email/password, SSO via SAML 2.0 or OIDC, and hardware security key (FIDO2/WebAuthn). Role-based access control (RBAC) lets admins define read/write/export permissions per clinical role.',
    },
    {
      question: 'How are security vulnerabilities disclosed and patched?',
      answer: 'We operate a responsible disclosure programme at security@vitalsense.health. Critical patches are deployed within 24 hours. All enterprise customers receive advance notification of patches that may affect integrations.',
    },
  ],
};

export default function FAQSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: EASE }}
    >
      <FAQ
        title="Frequently Asked Questions"
        subtitle="Got questions?"
        categories={categories}
        faqData={faqData}
        className="bg-ivory"
      />
    </motion.div>
  );
}
