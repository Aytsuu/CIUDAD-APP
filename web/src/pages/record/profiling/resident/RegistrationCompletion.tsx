"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  ArrowRight,
  CircleUserRound,
  HousePlus,
  UsersRound,
  Store,
  UserRoundPlus,
} from "lucide-react";
import { Card } from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { useSafeNavigate } from "@/hooks/use-safe-navigate";

const RegistrationCompletion = () => {
  const [completedSteps, setCompletedSteps] = useState(0);
  const { safeNavigate } = useSafeNavigate();

  const steps = [
    { icon: UserRoundPlus, label: "Personal Profile" },
    { icon: CircleUserRound, label: "Account Setup" },
    { icon: HousePlus, label: "Household Info" },
    { icon: UsersRound, label: "Family Details" },
    { icon: Store, label: "Business Registration" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCompletedSteps((prev) => {
        if (prev < steps.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

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
            Registration Complete
          </h1>

          <p className="text-gray-600 mb-8">
            Welcome! Your account has been successfully created.
          </p>

          {/* Steps List */}
          <div className="space-y-3 mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < completedSteps;

              return (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-50 border border-green-100"
                      : "bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${
                      isCompleted ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Icon className="w-4 h-4 text-gray-500" />
                    )}
                  </div>

                  <span
                    className={`text-sm font-medium ${
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

          <Button onClick={() => safeNavigate.back()}>
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Button>

          {/* Footer Note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Next:</span> Check your email for
              confirmation and setup instructions.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationCompletion;
