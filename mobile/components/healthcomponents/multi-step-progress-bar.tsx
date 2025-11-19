"use client"

import { cn } from "@/lib/utils"

interface Step {
  id: string | number
  label: string
  description?: string
}

interface MultiStepProgressBarProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  variant?: "linear" | "dots" | "numbers"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function MultiStepProgressBar({
  steps,
  currentStep,
  onStepClick,          
  variant = "linear",
  size = "md",
  className,
}: MultiStepProgressBarProps) {
  const isCompleted = (index: number) => index < currentStep
  const isCurrent = (index: number) => index === currentStep

  // Size configurations
  const sizeConfig = {
    sm: {
      dotSize: "h-6 w-6 text-xs",
      lineHeight: "h-1",
      gap: "gap-1",
      textSize: "text-xs",
      numberSize: "h-5 w-5 text-xs",
    },
    md: {
      dotSize: "h-10 w-10 text-sm",
      lineHeight: "h-2",
      gap: "gap-2",
      textSize: "text-sm",
      numberSize: "h-8 w-8 text-sm",
    },
    lg: {
      dotSize: "h-14 w-14 text-base",
      lineHeight: "h-2.5",
      gap: "gap-3",
      textSize: "text-base",
      numberSize: "h-10 w-10 text-base",
    },
  }

  const config = sizeConfig[size]

  if (variant === "dots") {
    return (
      <div className={cn("w-full", className)}>
        <div className={cn("flex items-center justify-center", config.gap)}>
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <button
                onClick={() => onStepClick?.(index)}
                className={cn(
                  "flex items-center justify-center rounded-full transition-all duration-300",
                  config.dotSize,
                  isCompleted(index)
                    ? "bg-blue-600 text-white shadow-lg"
                    : isCurrent(index)
                      ? "bg-blue-600 text-white ring-4 ring-blue-200 shadow-lg"
                      : "bg-gray-200 text-gray-500 hover:bg-gray-300",
                )}
              >
                {isCompleted(index) ? "✓" : index + 1}
              </button>
              {step.label && (
                <label
                  className={cn(
                    "mt-2 text-center font-medium transition-colors",
                    config.textSize,
                    isCurrent(index) ? "text-blue-600" : "text-gray-600",
                  )}
                >
                  {step.label}
                </label>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === "numbers") {
    return (
      <div className={cn("w-full px-4", className)}>
        <div className="flex items-start justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full justify-center">
                <button
                  onClick={() => onStepClick?.(index)}
                  className={cn(
                    "flex items-center justify-center rounded-full font-semibold transition-all duration-300 flex-shrink-0",
                    config.numberSize,
                    isCompleted(index)
                      ? "bg-green-600 text-white shadow-md"
                      : isCurrent(index)
                        ? "bg-blue-600 text-white ring-4 ring-blue-200 shadow-lg"
                        : "bg-gray-300 text-gray-600",
                  )}
                >
                  {isCompleted(index) ? "✓" : index + 1}
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 ml-2 transition-colors duration-300",
                      config.lineHeight,
                      index < currentStep ? "bg-green-600" : "bg-gray-300",
                    )}
                  />
                )}
              </div>
              {step.label && (
                <label className={cn("mt-3 font-medium text-center", config.textSize, "text-gray-700")}>
                  {step.label}
                </label>
              )}
              {step.description && (
                <p className={cn("mt-1 text-center text-gray-500 text-xs max-w-24")}>{step.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Default: Linear variant
  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar background */}
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden mb-6", config.lineHeight)}>
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out rounded-full"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }}
        />
      </div>

      {/* Step labels */}
      <div className="flex justify-between items-start">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className="flex items-center mb-2">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full font-semibold transition-all duration-300",
                  config.numberSize,
                  isCompleted(index)
                    ? "bg-blue-600 text-white"
                    : isCurrent(index)
                      ? "bg-blue-600 text-white ring-4 ring-blue-200"
                      : "bg-gray-300 text-gray-600",
                )}
              >
                {isCompleted(index) ? "✓" : index + 1}
              </div>
            </div>
            {step.label && (
              <label className={cn("font-medium text-center text-gray-700", config.textSize)}>{step.label}</label>
            )}
            {step.description && (
              <p className={cn("mt-1 text-gray-500 text-xs text-center max-w-24")}>{step.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
