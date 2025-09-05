// src/components/ui/step-indicator/StepIndicator.tsx
import React from 'react';
import { User, Users, Shield, FileText } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  allowClickNavigation?: boolean;
  completedSteps?: number[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  // totalSteps, 
  onStepClick,
  allowClickNavigation = true,
  completedSteps = []
}) => {
  const steps = [
    {
      id: 1,
      title: 'Basic Information',
      icon: User,
    },
    {
      id: 2,
      title: 'Child History',
      icon: Users,
    },
    {
      id: 3,
      title: 'Immunization History',
      icon: Shield,
    },
    {
      id: 4,
      title: 'Vitals Signs & Growth',
      icon: FileText,
    },
  ];

  const handleStepClick = (stepId: number) => {
    if (allowClickNavigation && onStepClick) {
      // Allow navigation to any step that is current or previous
      if (stepId <= currentStep || completedSteps.includes(stepId)) {
        onStepClick(stepId);
      }
    }
  };

  const isStepClickable = (stepId: number) => {
    return allowClickNavigation && (stepId <= currentStep || completedSteps.includes(stepId));
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
          const isCurrent = step.id === currentStep;
          // const isUpcoming = step.id > currentStep;
          const isClickable = isStepClickable(step.id);
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 transform
                    ${isClickable ? 'cursor-pointer hover:scale-110 hover:shadow-lg' : 'cursor-default'}
                    ${
                      isCompleted
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : isCurrent
                        ? 'bg-blue-100 border-blue-600 text-blue-600 shadow-md'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                    ${isClickable && !isCurrent ? 'hover:bg-blue-50 hover:border-blue-400' : ''}
                  `}
                  onClick={() => handleStepClick(step.id)}
                  role={isClickable ? "button" : "presentation"}
                  tabIndex={isClickable ? 0 : -1}
                  onKeyDown={(e) => {
                    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleStepClick(step.id);
                    }
                  }}
                >
                  <step.icon size={20} />
                  
                  {/* Completion checkmark overlay for completed steps */}
                  {isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-600 rounded-full">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Pulsing ring for current step */}
                  {isCurrent && (
                    <div className="absolute -inset-1 rounded-full border-2 border-blue-300 animate-ping opacity-75"></div>
                  )}
                </div>
                
                {/* Step Title */}
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-gray-400 mb-1">
                    Step {step.id}
                  </div>
                  <div
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isCompleted || isCurrent
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    } ${isClickable ? 'group-hover:text-blue-700' : ''}`}
                  >
                    {step.title}
                  </div>
                </div>
              </div>
              
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4 transition-colors duration-300
                    ${
                      step.id < currentStep
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;