import { Control } from "react-hook-form";
import { FormData } from "@/form-schema/chr-schema/chr-schema";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Patient } from "@/components/ui/patientSearch";

interface FormSectionsProps {
  control: Control<FormData>;
  isTransient: boolean;
  isAddNewMode: boolean;
  selectedPatient: Patient | null;
}


export const FatherInfoSection = ({ control, isAddNewMode, selectedPatient, isTransient }: FormSectionsProps) => (
  <div className="space-y-4">
    <h2 className="font-bold text-lg text-darkBlue2 mt-10">Father's Information</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <FormInput
        control={control}
        name="fatherFname"
        label="First Name"
        placeholder="Enter First Name"
        type="text"
        readOnly={isAddNewMode || (!isTransient && !!selectedPatient)}
      />
      <FormInput
        control={control}
        name="fatherLname"
        placeholder="Enter Last Name"
        label="Last Name"
        type="text"
        readOnly={isAddNewMode || (!isTransient && !!selectedPatient)}
      />
      <FormInput
        control={control}
        name="fatherMname"
        label="Middle Name"
        placeholder="Enter Middle Name"
        type="text"
        readOnly={isAddNewMode || (!isTransient && !!selectedPatient)}
      />
      <FormDateTimeInput
        control={control}
        name="fatherdob"
        label="Date of Birth"
        type="date"
        readOnly={isAddNewMode || (!isTransient && !!selectedPatient)}
      />
      <FormInput
        control={control}
        name="fatherAge"
        label="Age"
        type="text"
        readOnly
        className="bg-gray-100"
      />
      <FormInput
        control={control}
        name="fatherOccupation"
        label="Occupation"
        placeholder="Enter Occupation"
        type="text"
        readOnly={isAddNewMode || (!isTransient && !!selectedPatient)}
      />
    </div>
  </div>
);
