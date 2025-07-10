import React from 'react';
import { BsFillPersonFill, BsFillPeopleFill, BsCheckLg, BsFillPersonPlusFill } from 'react-icons/bs';
import { MdGroupWork, MdHome } from "react-icons/md";
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
  { label: "Demographic", minProgress: 25, icon: MdGroupWork },
  { label: "Parent", minProgress: 50, icon: BsFillPeopleFill },
  { label: "Dependent", minProgress: 75, icon: BsFillPersonPlusFill },
  { label: "Household Info", minProgress: 100, icon: MdHome },
] as const;

const StepIcon: React.FC<StepIconProps> = ({ progress, step }) => {
  if (progress > step.minProgress) {
    return <BsCheckLg className="text-white" size={20} />;
  }
  
  const IconComponent = step.icon;
  return (
    <IconComponent 
      size={20}
      className={progress === step.minProgress ? "text-gray-500" : "text-gray-400"}
    />
  );
};

export default function ProgressWithIcon({ progress }: ProgressProps) {
  return (
    <div className="flex items-center justify-center w-full px-2 md:px-4 py-2 overflow-x-auto">
      <div className="flex items-center min-w-max">
        {STEPS.map((step, index) => (
          <div key={step.label} className="flex items-center">
            {index > 0 && (
              <div
                className={`
                  w-16 sm:w-24 md:w-32 lg:w-44 h-1 mr-2 rounded-sm
                  ${progress > STEPS[index - 1].minProgress ? "bg-green-500" : "bg-gray"}
                  transition-colors duration-300
                `}
              />
            )}
            
            <div className="flex flex-col items-center space-y-1 md:space-y-2 p-4">
              <div
                className={`
                  w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center
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
                  text-[10px] sm:text-xs
                  ${progress >= step.minProgress ? "text-green-600 font-semibold" : "text-gray-500"}
                `}
              >
                {step.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
