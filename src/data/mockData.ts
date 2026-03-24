export const features = [
  {
    id: 'body-map',
    icon: 'clipboard',
    colorClass: 'bg-sage-light/50 text-sage-dark',
    title: 'Body Map Visualization',
    description: 'Pinpoint localized symptoms and map sensor data directly onto an interactive anatomical model.',
  },
  {
    id: 'ecg',
    icon: 'ecg',
    colorClass: 'bg-rose-light/50 text-rose-dark',
    title: 'Live ECG Monitoring',
    description: 'Continuous, high-fidelity waveform rendering with automatic irregularity highlighting and historical scrub.',
  },
  {
    id: 'ai',
    icon: 'clock',
    colorClass: 'bg-lavender-light/50 text-lavender-dark',
    title: 'AI Prediction Engine',
    description: 'Foresee potential clinical events hours before they occur using our proprietary longitudinal trend analysis.',
  },
  {
    id: 'pdf',
    icon: 'file',
    colorClass: 'bg-sand-light/50 text-sand-dark',
    title: 'PDF Report Parsing',
    description: 'Drag and drop external lab reports. Our OCR extracts structured vitals instantly into the timeline.',
  },
  {
    id: 'voice',
    icon: 'mic',
    colorClass: 'bg-ink-soft/10 text-ink-main',
    title: 'Voice Input & Dictation',
    description: 'Record vitals and clinical notes hands-free. NLP automatically categorizes metrics into the patient chart.',
  },
  {
    id: 'chat',
    icon: 'chat',
    colorClass: 'bg-sand-light/30 text-ink-main',
    title: 'Clinical Chat Assistant',
    description: 'Query patient histories naturally. "What was Eleanor\'s average resting HR last month compared to this week?"',
  },
] as const;

export const steps = [
  {
    number: '01',
    title: 'Connect & Ingest',
    description: 'Link remote telemetry devices or upload historical records. VitalSense unifies disparate data instantly.',
  },
  {
    number: '02',
    title: 'AI Synthesis',
    description: 'Our engine normalizes the data, applies longitudinal analysis, and calculates composite risk scores.',
  },
  {
    number: '03',
    title: 'Review & Act',
    description: 'Interact with the clean dashboard to review flagged anomalies and generate comprehensive clinical reports.',
  },
] as const;

export const testimonials = [
  {
    id: 't1',
    quote: 'VitalSense has removed the noise from our telemetry. The predictive models catch subtle arrhythmias hours before they escalate. It feels like practicing medicine in the future.',
    name: 'Dr. Elena Silva',
    role: 'Chief of Cardiology, Metro Health',
    image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 't2',
    quote: 'The voice input and PDF parsing alone save me an hour a day. The interface is remarkably calm, a welcome contrast to the cluttered clinical software we use.',
    name: 'Dr. Marcus Reed',
    role: 'Internal Medicine, Pacific Medical',
    image:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 't3',
    quote: 'Having the AI assistant instantly synthesize months of telemetry into a readable summary before I walk into a patient room is an absolute game-changer.',
    name: 'Dr. Aris Thorne',
    role: 'Director of Longevity, Veda Clinic',
    image:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 't4',
    quote: 'Remote patient review is finally fast enough for morning rounds. My team can triage faster and spend more time with the right cases.',
    name: 'Dr. Priya Menon',
    role: 'Clinical Operations Lead, Harbor One',
    image:
      'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 't5',
    quote: 'The design matters more than people think. VitalSense makes high-volume monitoring feel focused instead of overwhelming.',
    name: 'Dr. Julian Cross',
    role: 'Medical Director, Northline Health',
    image:
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 't6',
    quote: 'We adopted it for predictive alerts, but the reporting workflow is what won the team over. It turned daily review into a clean handoff.',
    name: 'Dr. Maya Foster',
    role: 'Head of Preventive Cardiology, Elara Clinic',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 't7',
    quote: 'I can explain risk changes to patients much more clearly now. The interface surfaces trend shifts in a way that supports real decisions.',
    name: 'Dr. Nikhil Shah',
    role: 'Consultant Physician, Crestview Medical',
    image:
      'https://images.unsplash.com/photo-1614436163996-25cee5f54290?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 't8',
    quote: 'The biggest win is confidence. We catch what matters sooner, and the team trusts what they are seeing on screen.',
    name: 'Dr. Sofia Alvarez',
    role: 'Chief Clinical Officer, Meridian Care',
    image:
      'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 't9',
    quote: 'Setup took less time than our last reporting tool, and the value was obvious in the first week of live monitoring.',
    name: 'Dr. Ethan Brooks',
    role: 'Director of Digital Health, Grand Oak',
    image:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
  },
] as const;

export const pricingPlans = {
  monthly: [
    {
      id: 'individual',
      name: 'Individual',
      description: 'For single practitioners exploring the platform.',
      price: '$0',
      period: '/mo',
      featured: false,
      cta: 'Get Started Free',
      ctaStyle: 'outline' as const,
      features: ['Up to 50 active patients', 'Basic timeline history', 'Manual data entry'],
    },
    {
      id: 'pro',
      name: 'Professional',
      description: 'Full AI capabilities for independent clinics.',
      price: '$79',
      period: '/mo',
      featured: true,
      cta: 'Start 14-Day Trial',
      ctaStyle: 'filled' as const,
      features: ['Unlimited patients', 'AI Prediction Engine & Reports', 'Voice Input & PDF Parsing', 'Live telemetry integration'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For hospitals and multi-provider groups.',
      price: '$249',
      period: '/mo',
      featured: false,
      cta: 'Contact Sales',
      ctaStyle: 'outline' as const,
      features: ['Everything in Pro', 'Full EHR/EMR Integration', 'HIPAA/SOC2 compliance pack', 'Dedicated account manager'],
    },
  ],
  annual: [
    {
      id: 'individual',
      name: 'Individual',
      description: 'For single practitioners exploring the platform.',
      price: '$0',
      period: '/mo',
      featured: false,
      cta: 'Get Started Free',
      ctaStyle: 'outline' as const,
      features: ['Up to 50 active patients', 'Basic timeline history', 'Manual data entry'],
    },
    {
      id: 'pro',
      name: 'Professional',
      description: 'Full AI capabilities for independent clinics.',
      price: '$63',
      period: '/mo',
      featured: true,
      cta: 'Start 14-Day Trial',
      ctaStyle: 'filled' as const,
      features: ['Unlimited patients', 'AI Prediction Engine & Reports', 'Voice Input & PDF Parsing', 'Live telemetry integration'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For hospitals and multi-provider groups.',
      price: '$199',
      period: '/mo',
      featured: false,
      cta: 'Contact Sales',
      ctaStyle: 'outline' as const,
      features: ['Everything in Pro', 'Full EHR/EMR Integration', 'HIPAA/SOC2 compliance pack', 'Dedicated account manager'],
    },
  ],
} as const;

export const faqs = [
  {
    question: 'Is VitalSense HIPAA compliant?',
    answer: 'Yes. VitalSense is fully HIPAA compliant and utilizes end-to-end encryption for all patient data, both in transit and at rest. We undergo regular third-party security audits.',
  },
  {
    question: 'Which telemetry devices do you integrate with?',
    answer: 'We support direct API integration with most major clinical telemetry providers including Philips, GE Healthcare, and modern wearables like Apple Watch and continuous glucose monitors via HealthKit/Google Fit APIs.',
  },
  {
    question: 'How accurate is the AI prediction engine?',
    answer: 'Our AI models are trained on over 5 million anonymized clinical records. While it serves as an assistant and not a diagnostic replacement, our models currently show a 94% accuracy rate in early arrhythmia detection compared to retrospective clinician analysis.',
  },
  {
    question: 'Can I export reports for my EMR?',
    answer: 'Absolutely. VitalSense allows one-click exports of beautifully formatted, clean PDF reports. Enterprise customers also get direct HL7/FHIR integration to push data straight into Epic, Cerner, or others.',
  },
] as const;

export const trustLogos = ['Mount Sinai', 'Cleveland Clinic', 'Mayo Clinic', 'Johns Hopkins', 'Mass General'];

export const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'Methodology' },
  { href: '#testimonials', label: 'Clinical Proof' },
  { href: '#pricing', label: 'Plans' },
];

export const footerLinks = {
  Product: ['Features', 'Integrations', 'Pricing', 'Changelog'],
  Company: ['About Us', 'Careers', 'Blog', 'Contact'],
  Resources: ['Documentation', 'API Reference', 'Status', 'Security'],
  Legal: ['Privacy Policy', 'Terms of Service', 'HIPAA BAA'],
};
