"use client";

import { AlertCircle } from "lucide-react";

interface FirstAidRequestErrorProps {
  mode: string;
  selectedPatientData: any; // Replace 'any' with your Patient type
  selectedPatientId: string;
  selectedFirstAidsLength: number;
}

export function FirstAidRequestError({
  mode,
  selectedPatientData,
  selectedPatientId,
  selectedFirstAidsLength,
}: FirstAidRequestErrorProps) {
  return (
    <div className="mb-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              {mode === "fromindivrecord" && !selectedPatientData
                ? "Patient Required"
                : mode === "fromallrecordtable" && !selectedPatientId
                ? "Patient Required"
                : "First Aid Items Required"}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {mode === "fromindivrecord" && !selectedPatientData
                ? "Please select a patient first from the first aid records page."
                : mode === "fromallrecordtable" && !selectedPatientId
                ? "Please select a patient to continue with the request."
                : "Please select at least one first aid item to submit the request."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}