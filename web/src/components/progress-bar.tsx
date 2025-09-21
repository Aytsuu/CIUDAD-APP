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
  const progressPercentage = currentStep > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <div
      className={`flex items-center justify-center w-full ${className}`}
    >
      <div className="w-full max-w-4xl relative">
        {/* Base gray connecting line */}
        <div 
          className="absolute top-6 h-0.5 bg-gray-300"
          style={{
            left: `calc(50% / ${steps.length} + 16px)`,
            right: `calc(50% / ${steps.length} + 16px)`,
          }}
        />

        {/* Progress gradient line */}
        {currentStep > 1 && (
          <div
            className="absolute top-6 h-0.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 transition-all duration-700 ease-out z-10"
            style={{
              left: `calc(50% / ${steps.length} + 16px)`,
              width: `calc(${progressPercentage / 100} * (100% - ${100 / steps.length}% - 32px))`,
            }}
          />
        )}

        {/* Step Circles and Labels */}
        <div className="flex justify-between relative z-20">
          {steps.map((stepItem) => {
            const isCompleted = currentStep > stepItem.number;
            const isCurrent = currentStep === stepItem.number;
            const IconComponent = stepItem.icon;

            return (
              <div
                key={stepItem.number}
                className="flex flex-col items-center text-center"
                style={{
                  width: `${100 / steps.length}%`,
                  maxWidth: '200px',
                  minWidth: '120px'
                }}
              >
                <div
                  className={`
                  w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500
                  ${
                    isCompleted
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-110"
                      : isCurrent
                      ? "bg-gradient-to-r ring-2 ring-offset-1 from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/25 border-2 border-blue-500"
                      : "bg-gray-200 text-gray-600 border-2 border-gray-300 hover:border-gray-400 hover:shadow"
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
                <div className="mt-3 space-y-1 px-2 w-full">
                  <h3
                    className={`
                    font-semibold text-sm transition leading-tight
                    ${
                      isCurrent
                        ? "text-blue-700 scale-105"
                        : isCompleted
                        ? "text-emerald-700"
                        : "text-gray-700"
                    }
                  `}
                  >
                    {stepItem.title}
                  </h3>
                  {showDescription && (
                    <p
                      className={`text-xs font-medium leading-relaxed break-words ${
                        isCompleted
                          ? "text-gray-600"
                          : isCurrent
                          ? "text-gray-700"
                          : "text-gray-500"
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