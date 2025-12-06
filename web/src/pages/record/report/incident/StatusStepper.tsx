import { FileText, CheckCircle2, Check, Activity } from "lucide-react";

export const StatusStepper = ({
  isVerified,
  isResolved,
}: {
  isVerified: boolean;
  isResolved: boolean;
}) => {
  // Determine current step index (0: Reported, 1: In Progress, 2: Resolved)
  let currentStep = 0;
  if (isVerified) currentStep = 1;
  if (isResolved) currentStep = 2;

  const steps = [
    { label: "Reported", icon: FileText },
    { label: "In Progress", icon: Activity },
    { label: "Resolved", icon: CheckCircle2 },
  ];

  return (
    <div className="w-full py-4 mb-2">
      <div className="relative flex items-center justify-between w-full">
        {/* Background Line (Gray) */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full -z-0" />

        {/* Active Progress Line (Colored) */}
        <div
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-1 ${
            isResolved ? "bg-green-600" : "bg-blue-600"
          } rounded-full -z-0 transition-all duration-500`}
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStep;
          const isCompleted = index < currentStep;
          const isFinal = index === steps.length - 1;

          // Color Logic
          let circleColor = "bg-white border-gray-300 text-gray-300"; // Default inactive
          if (isActive)
            circleColor = `${
              isResolved
                ? "bg-green-600 border-green-600"
                : "bg-blue-600 border-blue-600"
            } text-white`; // Active/Past
          if (isResolved && isFinal)
            circleColor = "bg-green-600 border-green-600 text-white"; // Final Success

          return (
            <div
              key={step.label}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${circleColor}`}
              >
                {isCompleted || (isResolved && isFinal) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Label */}
              <span
                className={`absolute -bottom-6 text-[10px] font-semibold tracking-tight whitespace-nowrap ${
                  isActive ? "text-gray-800" : "text-gray-400"
                } ${isResolved ? "text-green-700" : ""}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Spacer for labels */}
      <div className="h-4" />
    </div>
  );
};
