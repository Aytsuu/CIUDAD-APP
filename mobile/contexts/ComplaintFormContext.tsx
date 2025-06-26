import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { complaintFormSchema } from '@/form-schema/complaint-schema';
import { z } from 'zod';

type ComplaintForm = z.infer<typeof complaintFormSchema>;
const FormContext = createContext<UseFormReturn<ComplaintForm> | null>(null);

export const ComplaintFormProvider = ({
  children,
  methods,
}: {
  children: React.ReactNode;
  methods: UseFormReturn<ComplaintForm>;
}) => {
  return (
    <FormContext.Provider value={methods}>
      {children}
    </FormContext.Provider>
  );
};

export const useComplaintFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};