import { createContext, useContext, useState } from 'react';
import { UseFormReturn, FormProvider } from 'react-hook-form';
import { complaintFormSchema } from '@/form-schema/complaint-schema';
import { z } from 'zod';

type ComplaintForm = z.infer<typeof complaintFormSchema>;

interface ComplaintContextType {
  // Form methods
  formMethods: UseFormReturn<ComplaintForm>;
  
  // Resident selection tracking
  selectedComplainantResidents: string[];
  selectedAccusedResidents: string[];
  setSelectedComplainantResidents: (ids: string[]) => void;
  setSelectedAccusedResidents: (ids: string[]) => void;
}

const FormContext = createContext<ComplaintContextType | null>(null);

export const ComplaintFormProvider = ({
  children,
  methods,
}: {
  children: React.ReactNode;
  methods: UseFormReturn<ComplaintForm>;
}) => {
  const [selectedComplainantResidents, setSelectedComplainantResidents] = useState<string[]>([]);
  const [selectedAccusedResidents, setSelectedAccusedResidents] = useState<string[]>([]);

  return (
    <FormContext.Provider
      value={{
        formMethods: methods,
        selectedComplainantResidents,
        selectedAccusedResidents,
        setSelectedComplainantResidents,
        setSelectedAccusedResidents,
      }}
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </FormContext.Provider>
  );
};

export const useComplaintFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useComplaintFormContext must be used within a ComplaintFormProvider');
  }
  return context;
};

// Optional: Separate hook for just resident tracking if needed
export const useResidentSelection = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useResidentSelection must be used within a ComplaintFormProvider');
  }
  return {
    selectedComplainantResidents: context.selectedComplainantResidents,
    selectedAccusedResidents: context.selectedAccusedResidents,
    setSelectedComplainantResidents: context.setSelectedComplainantResidents,
    setSelectedAccusedResidents: context.setSelectedAccusedResidents,
  };
};