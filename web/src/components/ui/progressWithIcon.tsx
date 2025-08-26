import type React from "react"
import { BsCheckLg } from "react-icons/bs"
import type { IconType } from "react-icons"

interface ProgressProps {
  progress: number
  steps: Step[]
  completed: any[]
  skippedColor?: string
  completedColor?: string
  activeColor?: string
  inactiveColor?: string
  showLabels?: boolean
}

interface Step {
  id: number
  label: string
  minProgress: number
  icon: IconType,
  onClick: (id: number) => void
}

interface StepIconProps {
  progress: number
  step: Step
  completed: any[]
  skippedColor?: string
  completedColor?: string
  activeColor?: string
  inactiveColor?: string
}

const StepIcon: React.FC<StepIconProps> = ({
  progress,
  step,
  completed,
  completedColor = "text-white",
  activeColor = "text-gray-500",
  inactiveColor = "text-gray-400",
}) => {
  if ((progress > step.minProgress && completed?.includes(step.id)) || completed?.includes(step.id)) {
    return <BsCheckLg className={completedColor} size={20} />
  }

  const IconComponent = step.icon
  return <IconComponent size={20} className={progress === step.minProgress ? activeColor : inactiveColor} />
}

export default function ProgressWithIcon({
  progress,
  steps,
  completed,
  completedColor = "blue-500",
  activeColor = "blue-500",
  inactiveColor = "gray-300",
  showLabels = true,
}: ProgressProps) {
  const getProgressBarColor = (currentIndex: number) => {
    const previousStep = steps[currentIndex - 1]
    return progress > previousStep.minProgress ? `bg-${completedColor}` : `bg-${inactiveColor}`
  }

  const getStepCircleClasses = (step: Step) => {
    if (completed?.includes(step.id)) {
      return `bg-${completedColor} border-${completedColor}`
    } else if (progress === step.minProgress) {
      return `border-${activeColor} bg-white`
    } else {
      return `border-${inactiveColor} bg-white`
    }
  }

  const getStepLabelClasses = (step: Step) => {
    if(progress > step.minProgress && !completed?.includes(step.id)) {
      return `text-${inactiveColor.replace("300", "500")}`
    }

    return progress >= step.minProgress
      ? `text-${completedColor.replace("500", "600")} font-semibold`
      : `text-${inactiveColor.replace("300", "500")}`
  }

  const getStepNumberClasses = (step: Step) => {
    if(progress > step.minProgress && !completed?.includes(step.id)) {
      return `text-${inactiveColor.replace("300", "500")} font-medium`
    }

    return progress >= step.minProgress
      ? `text-${completedColor.replace("500", "600")} font-bold`
      : `text-${inactiveColor.replace("300", "500")} font-medium`
  }

  return (
    <div className="flex items-center justify-center w-full px-2 md:px-4 overflow-x-auto">
      <div className="flex items-center min-w-max">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center">
            {index > 0 && (
              <div className="flex items-center">
                <div
                  className={`
                    w-16 sm:w-24 md:w-32 lg:w-36 h-1 rounded-full
                    ${getProgressBarColor(index)}
                    transition-colors duration-500 ease-in-out
                  `}
                />
              </div>
            )}

            <div className="flex flex-col items-center space-y-2 px-4 cursor-pointer"
              onClick={() => {
                step.onClick && step.onClick(step.id)
              }}
            >
              {/* Step Number */}
              <div className="text-center">
                <p
                  className={`
                    text-xs sm:text-sm font-medium
                    ${getStepNumberClasses(step)}
                    transition-colors duration-300
                  `}
                >
                  Step {index + 1}
                </p>
              </div>

              {/* Step Circle with Icon */}
              <div
                className={`
                  w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border-3 flex items-center justify-center
                  ${getStepCircleClasses(step)}
                  transition-all duration-500 ease-in-out
                  transform hover:scale-105
                  border
                `}
              >
                <StepIcon
                  progress={progress}
                  step={step}
                  completed={completed}
                  completedColor="text-white"
                  activeColor="text-gray-600"
                  inactiveColor="text-gray-400"
                />
              </div>

              {/* Step Label */}
              {showLabels && (
                <div className="text-center max-w-20 sm:max-w-24">
                  <p
                    className={`
                      text-[10px] sm:text-xs leading-tight
                      ${getStepLabelClasses(step)}
                      transition-colors duration-300
                    `}
                  >
                    {step.label}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
