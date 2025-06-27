import React from 'react';
import { AlertCircle } from 'lucide-react';

// Types for the health warnings
export interface VitalWarning {
  message: string;
  isAbnormal: boolean;
}

export interface VitalWarnings {
  heartRate: VitalWarning | null;
  respiratoryRate: VitalWarning | null;
  temperature: VitalWarning | null;
  bloodPressure: VitalWarning | null;
}

export interface BMIResult {
  value: number | null;
  category: string | null;
  isAbnormal: boolean;
}

export interface HealthWarningsProps {
  vitalWarnings: VitalWarnings;
  bmiResult: BMIResult;
}

// Utility functions for calculating warnings
export const calculateVitalWarnings = (vitals: {
  vital_pulse?: number;
  vital_RR?: number;
  vital_temp?: number;
  vital_bp_systolic?: number;
  vital_bp_diastolic?: number;
}): VitalWarnings => {
  const warnings: VitalWarnings = {
    heartRate: null,
    respiratoryRate: null,
    temperature: null,
    bloodPressure: null,
  };

  // Heart Rate (60–100 bpm for adults)
  if (vitals.vital_pulse) {
    const pulse = Number(vitals.vital_pulse);
    if (pulse < 60) {
      warnings.heartRate = {
        message: `Heart Rate Low: ${pulse} bpm (Normal: 60–100 bpm)`,
        isAbnormal: true,
      };
    } else if (pulse > 100) {
      warnings.heartRate = {
        message: `Heart Rate High: ${pulse} bpm (Normal: 60–100 bpm)`,
        isAbnormal: true,
      };
    }
  }

  // Respiratory Rate (12–20 breaths per minute for adults)
  if (vitals.vital_RR) {
    const rr = Number(vitals.vital_RR);
    if (rr < 12) {
      warnings.respiratoryRate = {
        message: `Respiratory Rate Low: ${rr} breaths/min (Normal: 12–20 breaths/min)`,
        isAbnormal: true,
      };
    } else if (rr > 20) {
      warnings.respiratoryRate = {
        message: `Respiratory Rate High: ${rr} breaths/min (Normal: 12–20 breaths/min)`,
        isAbnormal: true,
      };
    }
  }

  // Temperature (36.1–37.2°C)
  if (vitals.vital_temp) {
    const temp = Number(vitals.vital_temp);
    if (temp < 36.1) {
      warnings.temperature = {
        message: `Temperature Low: ${temp}°C (Normal: 36.1–37.2°C)`,
        isAbnormal: true,
      };
    } else if (temp > 37.2) {
      warnings.temperature = {
        message: `Temperature High: ${temp}°C (Normal: 36.1–37.2°C)`,
        isAbnormal: true,
      };
    }
  }

  // Blood Pressure
  if (vitals.vital_bp_systolic && vitals.vital_bp_diastolic) {
    const systolic = Number(vitals.vital_bp_systolic);
    const diastolic = Number(vitals.vital_bp_diastolic);
    
    if (systolic < 90 || diastolic < 60) {
      warnings.bloodPressure = {
        message: `Hypotension: ${systolic}/${diastolic} mmHg (Normal: <120/<80 mmHg)`,
        isAbnormal: true,
      };
    } else if (systolic >= 140 || diastolic >= 90) {
      warnings.bloodPressure = {
        message: `Hypertension Stage 2: ${systolic}/${diastolic} mmHg (Normal: <120/<80 mmHg)`,
        isAbnormal: true,
      };
    } else if (systolic >= 130 || diastolic >= 80) {
      warnings.bloodPressure = {
        message: `Hypertension Stage 1: ${systolic}/${diastolic} mmHg (Normal: <120/<80 mmHg)`,
        isAbnormal: true,
      };
    } else if (systolic >= 120 && diastolic < 80) {
      warnings.bloodPressure = {
        message: `Elevated: ${systolic}/${diastolic} mmHg (Normal: <120/<80 mmHg)`,
        isAbnormal: true,
      };
    }
  }

  return warnings;
};

// Custom hook for managing health warnings
export const useHealthWarnings = () => {
  const [vitalWarnings, setVitalWarnings] = React.useState<VitalWarnings>({
    heartRate: null,
    respiratoryRate: null,
    temperature: null,
    bloodPressure: null,
  });

  const [bmiResult, setBmiResult] = React.useState<BMIResult>({
    value: null,
    category: null,
    isAbnormal: false,
  });

  const updateVitalWarnings = (vitals: {
    vital_pulse?: number;
    vital_RR?: number;
    vital_temp?: number;
    vital_bp_systolic?: number;
    vital_bp_diastolic?: number;
  }) => {
    const warnings = calculateVitalWarnings(vitals);
    setVitalWarnings(warnings);
  };

  const updateBMIResult = (bmi: BMIResult) => {
    setBmiResult(bmi);
  };

  return {
    vitalWarnings,
    bmiResult,
    updateVitalWarnings,
    updateBMIResult,
  };
};

// Reusable HealthWarnings component
export const HealthWarnings: React.FC<HealthWarningsProps> = ({
  vitalWarnings,
  bmiResult,
}) => {
  // Check if there are any warnings to display
  const hasWarnings = 
    vitalWarnings.heartRate ||
    vitalWarnings.respiratoryRate ||
    vitalWarnings.temperature ||
    vitalWarnings.bloodPressure ||
    bmiResult.value;

  if (!hasWarnings) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 col-span-1 sm:col-span-2 lg:col-span-3 mt-5">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900">
            Health Warnings
          </p>
          <ul className="text-xs mt-1 list-disc pl-4 space-y-1">
            {vitalWarnings.heartRate && (
              <li
                className={`${
                  vitalWarnings.heartRate.isAbnormal
                    ? "text-red-700 font-bold"
                    : "text-amber-700"
                }`}
              >
                {vitalWarnings.heartRate.message}
              </li>
            )}
            {vitalWarnings.respiratoryRate && (
              <li
                className={`${
                  vitalWarnings.respiratoryRate.isAbnormal
                    ? "text-red-700 font-bold"
                    : "text-amber-700"
                }`}
              >
                {vitalWarnings.respiratoryRate.message}
              </li>
            )}
            {vitalWarnings.temperature && (
              <li
                className={`${
                  vitalWarnings.temperature.isAbnormal
                    ? "text-red-700 font-bold"
                    : "text-amber-700"
                }`}
              >
                {vitalWarnings.temperature.message}
              </li>
            )}
            {vitalWarnings.bloodPressure && (
              <li
                className={`${
                  vitalWarnings.bloodPressure.isAbnormal
                    ? "text-red-700 font-bold"
                    : "text-amber-700"
                }`}
              >
                {vitalWarnings.bloodPressure.message}
              </li>
            )}
            {bmiResult.value && (
              <li
                className={`${
                  bmiResult.isAbnormal
                    ? "text-red-700 font-bold"
                    : "text-amber-700"
                }`}
              >
                BMI: {bmiResult.value.toFixed(1)} ({bmiResult.category})
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};