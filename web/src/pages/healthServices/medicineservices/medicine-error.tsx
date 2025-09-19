import { AlertCircle } from "lucide-react";

interface MedicineRequestErrorProps {
  mode: string;
  selectedPatientData: any; // Replace 'any' with your Patient type
  selectedPatientId: string;
  selectedMedicinesLength: number;
  hasExceededStock: boolean;
}

export function MedicineRequestError({ mode, selectedPatientData, selectedPatientId, selectedMedicinesLength, hasExceededStock }: MedicineRequestErrorProps) {
  return (
    <div className=" mb-4 ">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              {mode === "fromindivrecord" && !selectedPatientData ? "Patient Required" : mode === "fromallrecordtable" && !selectedPatientId ? "Patient Required" : selectedMedicinesLength === 0 ? "Medicines Required" : hasExceededStock ? "Stock Limit Exceeded" : "Invalid Quantities"}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {mode === "fromindivrecord" && !selectedPatientData
                ? "Please select a patient first from the medicine records page."
                : mode === "fromallrecordtable" && !selectedPatientId
                ? "Please select a patient to continue with the medicine request."
                : selectedMedicinesLength === 0
                ? "Please select at least one medicine to submit the request."
                : hasExceededStock
                ? "One or more medicines exceed available stock. Please adjust quantities."
                : "Please ensure all medicine quantities are at least 1."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
