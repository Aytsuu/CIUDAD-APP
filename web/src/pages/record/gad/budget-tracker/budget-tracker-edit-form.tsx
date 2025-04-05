// import { useState } from 'react';
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button/button";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form/form";
// import GADEditEntrySchema from "@/form-schema/gad-budget-tracker-edit-form-schema";

// function GADEditEntryForm() {
//   const form = useForm<z.infer<typeof GADEditEntrySchema>>({
//     resolver: zodResolver(GADEditEntrySchema),
//     defaultValues: {
//       entryType: "",
//       additionalNotes: "",
//       entryAmount: "",
//       entryParticulars: "",
//     },
//   });

//   const [isEditing, setIsEditing] = useState(false);
//   const onSubmit = (values: z.infer<typeof GADEditEntrySchema>) => {
//     console.log(values);
//     // Handle form submission
//     setIsEditing(false);
//   };

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="p-6 max-w-4xl mx-auto"
//       >
//         <FormField
//           control={form.control}
//           name="entryType"
//           render={({ field }) => (
//             <FormItem>
//               <Label>Type of Entry:</Label>
//               <FormControl>
//                 <SelectLayout
//                   className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
//                   label="Entry Type"
//                   placeholder="Select Type"
//                   options={[
//                     { id: "1", name: "Entry 1" },
//                     { id: "2", name: "Entry 2" },
//                   ]}
//                   value={field.value || ""}
//                   onChange={field.onChange}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <br />

//         <FormField
//           control={form.control}
//           name="entryAmount"
//           render={({ field }) => (
//             <FormItem>
//               <Label>Amount:</Label>
//               <FormControl>
//                 <Input type="text" {...field} readOnly={!isEditing} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <br />

//         <FormField
//           control={form.control}
//           name="entryParticulars"
//           render={({ field }) => (
//             <FormItem>
//               <Label>Particulars:</Label>
//               <FormControl>
//                 <Input type="text" {...field} readOnly={!isEditing}  />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <br />

//         <FormField
//           control={form.control}
//           name="additionalNotes"
//           render={({ field }) => (
//             <FormItem>
//               <Label>Additional Notes:</Label>
//               <FormControl>
//                 <Textarea
//                   placeholder="Enter additional notes (if there is any)"
//                   {...field} readOnly={!isEditing} 
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <br />
//         <div className="flex items-center justify-end">
//           <Button type="button" onClick={() => setIsEditing(!isEditing)} 
//             className="bg-blue hover:bg-blue hover:opacity-[95%]">
//             {isEditing ? 'Save' : 'Edit'}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }

// export default GADEditEntryForm;

// import { useState } from 'react';
// import { Button } from "@/components/ui/button/button";
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { Form } from '@/components/ui/form/form';
// import { FormInput } from "@/components/ui/form/form-input";
// import { FormSelect } from "@/components/ui/form/form-select";
// import GADEditEntrySchema from '@/form-schema/gad-budget-tracker-edit-form-schema';

// type GADEditEntryFormProps = {
//   gbud_type?: string;
//   gbud_amount?: number;
//   gbud_particulars?: string;
//   gbud_add_notes?: string;
//   onSaveSuccess?: () => void;
// };

// function GADEditEntryForm({
//   gbud_type = "",
//   gbud_add_notes = "",
//   gbud_amount = 0,
//   gbud_particulars = "",
//   onSaveSuccess,
// }: GADEditEntryFormProps) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const form = useForm<z.infer<typeof GADEditEntrySchema>>({
//     resolver: zodResolver(GADEditEntrySchema),
//     defaultValues: {
//       gbud_type: "",
//       gbud_add_notes: "",
//       gbud_amount: 0,
//       gbud_particulars: "",
//     },
//   });

//   const onSubmit = async (values: z.infer<typeof GADEditEntrySchema>) => {
//     try {
//       setIsSubmitting(true);
//       setError(null);
//       console.log("Submitting:", values);
      
//       // Here you would typically call your API to update the entry
//       // await updateGADEntry(values);
      
//       // On successful update
//       setIsEditing(false);
//       if (onSaveSuccess) onSaveSuccess();
      
//     } catch (err) {
//       console.error("Update failed:", err);
//       setError(err instanceof Error ? err.message : "Failed to update entry");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-0 h-auto p-6 max-w-4xl mx-auto rounded-lg overflow-auto">
//       <div className="pb-4">
//         <h2 className="text-lg font-semibold">GAD BUDGET ENTRY</h2>
//         <p className="text-xs text-black/50">View or edit budget entry details</p>
//       </div>
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
//           {/* Entry Type */}
//           <FormSelect
//             control={form.control}
//             name="entryType"
//             label="Type of Entry"
//             options={[
//               { id: "Income", name: "Income" },
//               { id: "Expense", name: "Expense" },
//             ]}
//             readOnly={!isEditing}
//           />

//           {/* Amount */}
//           <FormInput
//             control={form.control}
//             name="entryAmount"
//             label="Amount"
//             placeholder="Enter amount"
//             readOnly={!isEditing}
//           />

//           {/* Particulars */}
//           <FormInput
//             control={form.control}
//             name="entryParticulars"
//             label="Particulars"
//             placeholder="Enter particulars"
//             readOnly={!isEditing}
//           />

//           {/* Additional Notes */}
//           <FormInput
//             control={form.control}
//             name="additionalNotes"
//             label="Additional Notes"
//             placeholder="Enter additional notes (if there is any)"
//             readOnly={!isEditing}
//           />

//           {/* Error Message */}
//           {error && (
//             <div className="text-red-500 text-sm">
//               {error}
//             </div>
//           )}

//           {/* Edit/Save Button */}
//           <div className="mt-8 flex justify-end gap-3">
//             {isEditing ? (
//               <>
//                 <Button
//                   type="button"
//                   onClick={() => {
//                     form.reset();
//                     setIsEditing(false);
//                     setError(null);
//                   }}
//                   variant="outline"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   className="bg-blue hover:bg-blue/90"
//                   disabled={isSubmitting}
//                 >
//                   {isSubmitting ? 'Saving...' : 'Save Changes'}
//                 </Button>
//               </>
//             ) : (
//               <Button
//                 type="button"
//                 onClick={() => setIsEditing(true)}
//                 className="bg-blue hover:bg-blue/90"
//               >
//                 Edit
//               </Button>
//             )}
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// }

// export default GADEditEntryForm;


import { useState } from 'react';
import { Button } from "@/components/ui/button/button";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form/form';
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import GADEditEntrySchema from '@/form-schema/gad-budget-tracker-edit-form-schema';
import { putbudgettrackreq } from './requestAPI/BTPutRequest'; // Import your PUT request function

type GADEditEntryFormProps = {
  gbud_num: number; // Required identifier for the entry
  gbud_type?: string;
  gbud_amount?: number;
  gbud_particulars?: string;
  gbud_add_notes?: string;
  onSaveSuccess?: () => void;
};

function GADEditEntryForm({
  gbud_num,
  gbud_type = "",
  gbud_add_notes = "",
  gbud_amount = 0,
  gbud_particulars = "",
  onSaveSuccess,
}: GADEditEntryFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof GADEditEntrySchema>>({
    resolver: zodResolver(GADEditEntrySchema),
    defaultValues: {
      gbud_type,
      gbud_add_notes,
      gbud_amount,
      gbud_particulars,
    },
  });

  const onSubmit = async (values: z.infer<typeof GADEditEntrySchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Call the PUT API with the entry ID and updated values
      await putbudgettrackreq(gbud_num, values);
      
      // On successful update
      setIsEditing(false);
      if (onSaveSuccess) onSaveSuccess();
      
    } catch (err) {
      console.error("Update failed:", err);
      setError(err instanceof Error ? err.message : "Failed to update entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-6 max-w-4xl mx-auto rounded-lg overflow-auto">
      <div className="pb-4">
        <h2 className="text-lg font-semibold">GAD BUDGET ENTRY #{gbud_num}</h2>
        <p className="text-xs text-black/50">View or edit budget entry details</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Entry Type */}
          <FormSelect
            control={form.control}
            name="gbud_type"
            label="Type of Entry"
            options={[
              { id: "Income", name: "Income" },
              { id: "Expense", name: "Expense" },
            ]}
            readOnly={!isEditing}
          />

          {/* Amount */}
          <FormInput
            control={form.control}
            name="gbud_amount"
            label="Amount"
            placeholder="Enter amount"
            readOnly={!isEditing}
          />

          {/* Particulars */}
          <FormInput
            control={form.control}
            name="gbud_particulars"
            label="Particulars"
            placeholder="Enter particulars"
            readOnly={!isEditing}
          />

          {/* Additional Notes */}
          <FormInput
            control={form.control}
            name="gbud_add_notes"
            label="Additional Notes"
            placeholder="Enter additional notes (if any)"
            readOnly={!isEditing}
          />

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Edit/Save Button */}
          <div className="mt-8 flex justify-end gap-3">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  onClick={() => {
                    form.reset();
                    setIsEditing(false);
                    setError(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue hover:bg-blue/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-blue hover:bg-blue/90"
              >
                Edit
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default GADEditEntryForm;