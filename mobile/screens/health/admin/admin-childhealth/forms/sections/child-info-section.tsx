// import { Control } from "react-hook-form";
// import { FormData } from "@/form-schema/chr-schema/chr-schema";
// import { FormInput } from "@/components/ui/form/form-input";
// import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
// import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Patient } from "@/components/ui/patientSearch";

// interface FormSectionsProps {
//   control: Control<FormData>;
//   isTransient: boolean;
//   isAddNewMode: boolean;
//   selectedPatient: Patient | null;
//   placeOfDeliveryType: string;
// }

// export const ChildInfoSection = ({ control, isAddNewMode, selectedPatient, isTransient, placeOfDeliveryType }: FormSectionsProps) => (
//   <div className="space-y-4">
//     <h2 className="font-bold text-lg text-darkBlue2 mt-10">Child's Information</h2>
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//       <FormInput
//         control={control}
//         name="childFname"
//         label="First Name"
//         type="text"
//         readOnly={isAddNewMode || !!selectedPatient}
//       />
//       <FormInput
//         control={control}
//         name="childLname"
//         label="Last Name"
//         type="text"
//         readOnly={isAddNewMode || !!selectedPatient}
//       />
//       <FormInput
//         control={control}
//         name="childMname"
//         label="Middle Name"
//         type="text"
//         readOnly={isAddNewMode || !!selectedPatient}
//       />
//       <FormField
//         control={control}
//         name="childSex"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Gender</FormLabel>
//             <FormControl>
//               <select
//                 {...field}
//                 disabled={isAddNewMode || !!selectedPatient}
//                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 <option value="">Select Gender</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//               </select>
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//       <FormDateTimeInput
//         control={control}
//         name="childDob"
//         label="Date of Birth"
//         type="date"
//         readOnly={isAddNewMode || (!isTransient && !!selectedPatient)}
//       />
//       <FormInput
//         control={control}
//         name="childAge"
//         label="Age"
//         type="text"
//         readOnly
//       />
//       <FormInput
//         control={control}
//         name="birth_order"
//         label="Birth Order"
//         type="number"
//         min={1}
//         max={20}
//         readOnly={isAddNewMode}
//       />
//       <div className="sm:col-span-2 lg:col-span-3">
//         <FormField
//           control={control}
//           name="placeOfDeliveryType"
//           render={({ field }) => (
//             <FormItem className="space-y-3">
//               <FormLabel>Place of Delivery</FormLabel>
//               <FormControl>
//                 <RadioGroup
//                   onValueChange={field.onChange}
//                   value={field.value}
//                   className="flex flex-col space-y-1"
//                   disabled={isAddNewMode}
//                 >
//                   {[
//                     "Hospital Gov't/Private",
//                     "Home",
//                     "Private Clinic",
//                     "HC",
//                     "Lying in"
//                   ].map((option) => (
//                     <FormItem
//                       key={option}
//                       className="flex items-center space-x-3 space-y-0"
//                     >
//                       <FormControl>
//                         <RadioGroupItem value={option} />
//                       </FormControl>
//                       <FormLabel className="font-normal">
//                         {option}
//                       </FormLabel>
//                     </FormItem>
//                   ))}
//                 </RadioGroup>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         {placeOfDeliveryType === "HC" && (
//           <FormField
//             control={control}
//             name="placeOfDeliveryLocation"
//             render={({ field }) => (
//               <FormItem className="mt-4">
//                 <FormLabel>Specify Location (HC)</FormLabel>
//                 <FormControl>
//                   <input
//                     {...field}
//                     type="text"
//                     placeholder="e.g., Barangay Health Center"
//                     disabled={isAddNewMode}
//                     className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         )}
//       </div>
//     </div>
//   </div>
// );