import { AlertCircle } from "lucide-react";

interface ValidationAlertProps {
  patientError?: boolean;
  vaccineError?: boolean;
  assigneeError?: boolean;
  vitalSignsError?: boolean;
}

export function ValidationAlert({
  patientError = false,
  vaccineError = false,
  assigneeError = false,
  vitalSignsError = false,
}: ValidationAlertProps) {
  // If no errors, return null
  if (!patientError && !vaccineError && !assigneeError && !vitalSignsError) {
    return null;
  }

  let title = "Validation Error";
  let description = "Please fill in the required fields to continue.";

  // Prioritize errors: patient > vaccine > assignee > vital signs
  if (patientError) {
    title = "Patient Required";
    description = "Please select a patient to continue with the vaccination form.";
  } else if (vaccineError) {
    title = "Vaccine Required";
    description = "Please select a vaccine to submit the form.";
  } else if (assigneeError) {
    title = "Assignee Required";
    description = "Please select a person to assign this to.";
  } else if (vitalSignsError) {
    title = "Vital Signs Required";
    description = "Please fill in all vital signs fields to complete the form.";
  }

  return (
    <div className="mb-4">
      <div
        role="alert"
        className="bg-amber-50 border border-amber-200 rounded-lg p-3"
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">{title}</p>
            <p className="text-xs text-amber-700 mt-1">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}