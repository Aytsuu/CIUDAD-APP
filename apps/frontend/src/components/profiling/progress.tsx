import React from 'react';
import { BsFillPersonFill, BsFillPeopleFill, BsCheckLg, BsFillPersonPlusFill } from 'react-icons/bs';
import { IconType } from 'react-icons';

interface ProgressProps {
  progress: number;
}

interface Step {
  label: string;
  minProgress: number;
  icon: IconType;
}

interface StepIconProps {
  progress: number;
  step: Step;
}

const STEPS: readonly Step[] = [
  { label: "Personal", minProgress: 33, icon: BsFillPersonFill },
  { label: "Parent", minProgress: 66, icon: BsFillPeopleFill },
  { label: "Dependent", minProgress: 100, icon: BsFillPersonPlusFill }
] as const;

const StepIcon: React.FC<StepIconProps> = ({ progress, step }) => {
  if (progress > step.minProgress) {
    return <BsCheckLg className="text-white" size={30} />;
  }
  
  const IconComponent = step.icon;
  return (
    <IconComponent 
      size={30}
      className={progress === step.minProgress ? "text-gray-500" : "text-gray-400"}
    />
  );
};

export default function Progress({ progress }: ProgressProps) {
  return (
    <div className="flex items-center justify-center space-x-2">
      {STEPS.map((step, index) => (
        <div key={step.label} className="flex items-center">
          {index > 0 && (
            <div
              className={`
                w-44 h-1 mr-2 rounded-sm
                ${progress > STEPS[index - 1].minProgress ? "bg-green-500" : "bg-gray-300"}
                transition-colors duration-300
              `}
            />
          )}
          
          <div className="flex flex-col items-center space-y-2">
            <div
              className={`
                w-12 h-12 rounded-full border-2 flex items-center justify-center
                ${
                  progress > step.minProgress
                    ? "bg-green-500 border-green-500"
                    : progress === step.minProgress
                    ? "border-green-500 bg-white"
                    : "border-gray-300 bg-white"
                }
                transition-all duration-300
              `}
            >
              <StepIcon progress={progress} step={step} />
            </div>
            
            <p
              className={`
                text-xs
                ${progress >= step.minProgress ? "text-green-600 font-semibold" : "text-gray-500"}
              `}
            >
              {step.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}