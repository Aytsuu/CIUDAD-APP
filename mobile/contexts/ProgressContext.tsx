import React from 'react';

const ProgressContext = React.createContext<Record<string, any> | null>(null);

export const ProgressProvider = ({ children } : {
  children: React.ReactNode
}) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([1,2,3,4,5,6,7]);
  const [isRespondentLinked, setIsRespondentLinked] = React.useState<boolean>(false)
  const [linkedTo, setLinkedTo] = React.useState<number>(0);

  const link = React.useCallback((stepId: number) => {
    setIsRespondentLinked(true);
    setLinkedTo(stepId);
  }, [])

  const unlink = React.useCallback((stepId: number) => {
    setCompletedSteps((prev) => prev.filter((step) => step !== stepId))
    setIsRespondentLinked(false);
    setLinkedTo(0)
  }, [])
  
  // Combine state updates to prevent multiple re-renders
  const completeStep = React.useCallback((stepId: number) => {
    setCompletedSteps(prev => {
      const newCompletedSteps = [...prev];
      if (!newCompletedSteps.includes(stepId)) {
        newCompletedSteps.push(stepId);
      }
      return newCompletedSteps;
    });
    
    // Use setTimeout to batch the state update
    setTimeout(() => {
      setCurrentStep(prev => Math.max(prev, stepId + 1));
    }, 0);
  }, []);
  
  const resetProgress = React.useCallback(async () => {
    try {
      setCurrentStep(1);
      setCompletedSteps([]);
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  }, []);
  
  const isStepCompleted = React.useCallback((stepId: number) => {
    return completedSteps.includes(stepId);
  }, [completedSteps]);
  
  const setCurrentStepOptimized = React.useCallback((stepId: number) => {
    setCurrentStep(stepId);
  }, []);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    currentStep,
    completedSteps,
    isRespondentLinked,
    linkedTo,
    link,
    unlink,
    completeStep,
    resetProgress,
    isStepCompleted,
    setCurrentStep: setCurrentStepOptimized
  }), [
    currentStep,
    completedSteps,
    isRespondentLinked,
    linkedTo,
    link,
    unlink,
    completeStep,
    resetProgress,
    isStepCompleted,
    setCurrentStepOptimized
  ]);
  
  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgressContext = () => {
  const context = React.useContext(ProgressContext);
  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};