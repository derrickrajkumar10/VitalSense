/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';

export interface SubmittedVitals {
  hr: number;
  bp_sys: number;
  bp_dia: number;
  spo2: number;
  temp: number;
  resp: number;
  hrv: number;
  raw: Record<string, string>;
}

interface VitalsContextValue {
  submittedVitals: SubmittedVitals | null;
  submitVitals: (raw: Record<string, string>) => SubmittedVitals;
}

const VitalsContext = createContext<VitalsContextValue | null>(null);

export function VitalsProvider({ children }: { children: ReactNode }) {
  const [submittedVitals, setSubmittedVitals] = useState<SubmittedVitals | null>(null);

  const submitVitals = (raw: Record<string, string>): SubmittedVitals => {
    const bpParts = (raw.bp ?? '').split('/');
    const bp_sys = parseFloat(bpParts[0]) || 0;
    const bp_dia = parseFloat(bpParts[1]) || 0;

    const vitals: SubmittedVitals = {
      hr:     parseFloat(raw.hr)   || 0,
      bp_sys,
      bp_dia,
      spo2:   parseFloat(raw.spo2) || 0,
      temp:   parseFloat(raw.temp) || 0,
      resp:   parseFloat(raw.resp) || 0,
      hrv:    parseFloat(raw.hrv)  || 0,
      raw,
    };
    setSubmittedVitals(vitals);
    return vitals;
  };

  return (
    <VitalsContext.Provider value={{ submittedVitals, submitVitals }}>
      {children}
    </VitalsContext.Provider>
  );
}

export function useVitals(): VitalsContextValue {
  const ctx = useContext(VitalsContext);
  if (!ctx) throw new Error('useVitals must be used within VitalsProvider');
  return ctx;
}
