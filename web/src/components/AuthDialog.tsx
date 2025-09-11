import { useState } from "react";
import SignIn from "@/pages/landing/signin/Signin";
import ForgotPassword from "@/pages/landing/ForgotPass";

type ForgotPasswordStep = 'forgot-email' | 'forgot-verification' | 'forgot-reset' | 'forgot-success';
type AuthView = 'signin' | ForgotPasswordStep;

export default function AuthDialog() {
  const [currentView, setCurrentView] = useState<AuthView>('signin');

  const handleShowForgotPassword = () => {
    setCurrentView('forgot-email');
  };

  const handleBackToSignIn = () => {
    setCurrentView('signin');
  };

  const handleForgotStepChange = (step: ForgotPasswordStep) => {
    console.log('Changing step to:', step); // Debug log
    setCurrentView(step);
  };

  if (currentView === 'signin') {
    return <SignIn onShowForgotPassword={handleShowForgotPassword} />;
  }

  // Make sure currentView is a valid ForgotPasswordStep
  const forgotPasswordStep = currentView as ForgotPasswordStep;
  
  return (
    <ForgotPassword
      onBackToSignIn={handleBackToSignIn}
      currentStep={forgotPasswordStep}
      onStepChange={handleForgotStepChange}
    />
  );
}