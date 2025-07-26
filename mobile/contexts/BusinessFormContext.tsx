import React, { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { BusinessFormSchema } from '@/form-schema/business-schema';

type BusinessForm = z.infer<typeof BusinessFormSchema>;
const FormContext = createContext<UseFormReturn<BusinessForm> | null>(null);

export const BusinessFormProvider = ({
  children,
  methods,
}: {
  children: React.ReactNode;
  methods: UseFormReturn<BusinessForm>;
}) => {
  return (
    <FormContext.Provider value={methods}>
      {children}
    </FormContext.Provider>
  );
};

export const useBusinessFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useBusinessFormContext must be used within a ContextProvider');
  }
  return context;
};