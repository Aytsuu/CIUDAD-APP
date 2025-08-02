import React, { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegistrationFormSchema } from '@/form-schema/registration-schema';
import { z } from 'zod';

type RegistrationForm = z.infer<typeof RegistrationFormSchema>;
const FormContext = createContext<UseFormReturn<RegistrationForm> | null>(null);

export const FormProvider = ({
  children,
  methods,
}: {
  children: React.ReactNode;
  methods: UseFormReturn<RegistrationForm>;
}) => {
  return (
    <FormContext.Provider value={methods}>
      {children}
    </FormContext.Provider>
  );
};

export const useRegistrationFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useRegistrationFormContext must be used within a ContextProvider');
  }
  return context;
};