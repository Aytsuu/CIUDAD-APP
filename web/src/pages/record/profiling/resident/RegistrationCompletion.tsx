import React from "react";
import {
  CheckCircle,
  Check,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";

const RegistrationCompletion = ({ params } : {  params: Record<string, any> }) => {
  // ====================== STATE INITIALIZATION ========================
  const [completedSteps, setCompletedSteps] = React.useState<any[]>([]);
  const [_currentStepIndex, setCurrentStepIndex] = React.useState(0);

  // ====================== SIDE EFFECTS ========================
  React.useEffect(() => {
    // Start with empty completed steps for animation
    setCompletedSteps([]);
    setCurrentStepIndex(0);

    const timer = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex < params?.completed.length) {
          setCompletedSteps((prevCompleted) => [
            ...prevCompleted,
            params?.completed.sort((a: number,b: number) => a - b)[prevIndex]
          ]);
          return prevIndex + 1;
        } else {
          // Clear interval when all steps are completed
          clearInterval(timer);
          return prevIndex;
        }
      });
    }, 400);

    return () => clearInterval(timer);
  }, [params?.completed]);

  // ====================== HANDLERS ========================
  const submit = async () => {
    params?.register()
  }

  // ====================== RENDER ========================
  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-lg">
        {/* Success Card */}
        <Card className="p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Complete Your Registration
          </h1>
          <p className="text-gray-600 mb-8">
            Ensure all information provided are accurate
          </p>
          <p className="text-gray-600 mb-8">
            {completedSteps.length} of {params?.steps.length} Profile
          </p>
          {/* Steps List */}
          <div className="space-y-3 mb-8">
            {params?.steps.map((step: any, index: number) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.sort((a,b) => a - b).includes(step.id);
              return (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-lg transition-all duration-500 cursor-pointer ${
                    isCompleted
                      ? "bg-green-50 border border-green-100 scale-[1.02]"
                      : "bg-gray-50"
                  }`}
                  onClick={() => step.onClick(step.id)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-all duration-500 ${
                      isCompleted ? "bg-green-500 scale-110" : "bg-gray-300"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-white animate-pulse" />
                    ) : (
                      <Icon className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium transition-all duration-500 ${
                      isCompleted ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Action Buttons */}
          <Button 
            onClick={submit}
            className={`transition-all duration-300 ${
              completedSteps.length === params?.completed.length 
                ? "opacity-100" 
                : "opacity-50 pointer-events-none"
            }`}
            disabled={params?.isSubmitting}
          >
            {params?.isSubmitting && <Loader2 className="animate-spin"/>}
            {params?.isSubmitting ? "Registering..." : "Register"}
            <Check className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationCompletion;