// import { Control } from "react-hook-form";
// import { FormData } from "@/form-schema/chr-schema/chr-schema";
// import { FormInput } from "@/components/ui/form/form-input";
// import { Patient } from "@/components/ui/patientSearch";

// interface FormSectionsProps {
//   control: Control<FormData>;
//   isTransient: boolean;
//   isAddNewMode: boolean;
//   selectedPatient: Patient | null;
// }



// export const AddressSection = ({ control, isAddNewMode, selectedPatient, isTransient }: FormSectionsProps) => (
//   <div className="space-y-4">
//     <h2 className="font-bold text-lg text-darkBlue2 mt-10">Address</h2>
//     <div className="grid grid-cols-1 gap-4">
//       <FormInput
//         control={control}
//         name="address"
//         label="Complete Address"
//         type="text"
//         readOnly={isAddNewMode || (!isTransient && !!selectedPatient)}
//       />
//       <FormInput
//         control={control}
//         name="landmarks"
//         label="Landmarks"
//         type="text"
//         placeholder="Enter landmarks"
//         readOnly={isAddNewMode}
//       />
//     </div>
//   </div>
// );