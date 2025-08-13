import { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  showDescription?: boolean;
}
export const ProgressBar = ({
  steps,
  currentStep,
  className = "",
  showDescription = true,
}: ProgressBarProps) => {
  return (
    <div
      className={`flex items-center justify-center w-full px-6 py-8 ${className}`}
    >
      <div className="w-full max-w-5xl relative">
        {/* Base gray connecting line (full width) */}
        <div className="absolute top-7 left-6 right-6 h-0.5 bg-gray" />

        {/* Progress gradient line */}
        <div
          className="absolute top-7 h-0.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 z-10 transition-all duration-700 ease-out"
          style={{
            left: "6%",
            width: `${((currentStep - 1) / (steps.length - 1)) * 88}%`, 
          }}
        />

        {/* Step Circles and Labels */}
        <div className="flex justify-between relative z-20">
          {steps.map((stepItem) => {
            const isCompleted = currentStep > stepItem.number;
            const isCurrent = currentStep === stepItem.number;
            const IconComponent = stepItem.icon;

            return (
              <div
                key={stepItem.number}
                className="flex flex-col items-center w-24 text-center"
              >
                <div
                  className={`
                  w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500
                  ${
                    isCompleted
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-110"
                      : isCurrent
                      ? "bg-gradient-to-r ring-2 ring-offset-1 from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/25 border-2 border-blue-500"
                      : "bg-gray text-darkGray/70 border-2 border-gray-300 hover:border-gray-400 hover:shadow"
                  }
                `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <IconComponent
                      className={`w-5 h-5 ${isCurrent ? "animate-pulse" : ""}`}
                    />
                  )}
                </div>

                {/* Title and description */}
                <div className="mt-2 space-y-1 px-2">
                  <h3
                    className={`
                    font-semibold text-sm transition
                    ${
                      isCurrent
                        ? "text-blue-700 scale-105"
                        : isCompleted
                        ? "text-emerald-700"
                        : "text-darkGray"
                    }
                  `}
                  >
                    {stepItem.title}
                  </h3>
                  {showDescription && (
                    <p
                      className={`text-xs font-medium leading-snug ${
                        isCompleted
                          ? "text-gray-600"
                          : isCurrent
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      {stepItem.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
