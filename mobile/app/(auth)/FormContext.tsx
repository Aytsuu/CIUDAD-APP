import React, { createContext, useContext, useState, ReactNode } from "react";
import * as z from "zod";
import {
  FormData,
  emptyPersonInfo,
  validateFormData,
} from "@/form-schema/registration-schema"; 

// Define the context type
interface FormContextType {
  formData: FormData;
  setFormData: (data: FormData) => void;
  validateForm: () => z.SafeParseReturnType<FormData, FormData>;
}

// Create the context
const FormContext = createContext<FormContextType | undefined>(undefined);

// FormProvider component
export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FormData>({
    identityVerification: {
      dob: "",
      residency: "",
    },
    demographicData: {
      householdNo: "",
      familyNo: "",
    },
    personalInformation: {
      ...emptyPersonInfo,
      placeOfBrith: "",
      citizenship: "",
      religion: "",
      address: "",
      contactNo: "",
      occupation: "",
      dateOfResidency: "",
    },
    motherInformation: {
      ...emptyPersonInfo,
    },
    fatherInformation: {
      ...emptyPersonInfo,
    },
    accountDetails: {
      userName: "",
      email: "",
      password: "",
    },
    dependentInformation: [],
    identification: {
      id: "",
      userPhoto: "",
    },
  });

  // Function to validate the form data using the Zod schema
  const validateForm = () => {
    return validateFormData(formData);
  };

  return (
    <FormContext.Provider value={{ formData, setFormData, validateForm }}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};