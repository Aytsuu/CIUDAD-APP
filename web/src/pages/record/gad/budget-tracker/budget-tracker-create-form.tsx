// // import { useState } from 'react';
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
// import GADAddEntrySchema from "@/form-schema/gad-budget-track-create-form-schema";

// function GADAddEntryForm() {
//   const form = useForm<z.infer<typeof GADAddEntrySchema>>({
//     resolver: zodResolver(GADAddEntrySchema),
//     defaultValues: {
//       entryType: "",
//       additionalNotes: "",
//       entryAmount: "",
//       entryParticulars: "",
//     },
//   });

//   const onSubmit = (values: z.infer<typeof GADAddEntrySchema>) => {
//     console.log(values);
//     // Handle form submission
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
//                     { id: "Income", name: "Income" },
//                     { id: "Expense", name: "Expense" },
//                   ]}
//                   value={field.value}
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
//                 <Input type="text" {...field} />
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
//                 <Input type="text" {...field} />
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
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <br />
//         <div className="flex items-center justify-end">
//           <Button
//             type="submit"
//             className="bg-blue hover:bg-blue hover:opacity-[95%"
//           >
//             Save
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }

// export default GADAddEntryForm;


// without db
// import { Button } from "@/components/ui/button/button";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { Form } from "@/components/ui/form/form";
// import { FormInput } from "@/components/ui/form/form-input";
// import { FormSelect } from "@/components/ui/form/form-select";
// import GADAddEntrySchema from "@/form-schema/gad-budget-track-create-form-schema";

// function GADAddEntryForm() {
//   const form = useForm<z.infer<typeof GADAddEntrySchema>>({
//     resolver: zodResolver(GADAddEntrySchema),
//     defaultValues: {
//       entryType: "",
//       additionalNotes: "",
//       entryAmount: "",
//       entryParticulars: "",
//     },
//   });

//   const onSubmit = (values: z.infer<typeof GADAddEntrySchema>) => {
//     console.log(values);
//     // Handle form submission
//   };

//   return (
//     <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
//       <div className="pb-2">
//         <h2 className="text-lg font-semibold">ADD GAD BUDGET ENTRY</h2>
//         <p className="text-xs text-black/50">Fill out all necessary fields</p>
//       </div>
//       <div className="grid gap-4">
//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="flex flex-col gap-4"
//           >
//             {/* Entry Type */}
//             <FormSelect
//               control={form.control}
//               name="entryType"
//               label="Type of Entry"
//               options={[
//                 { id: "Income", name: "Income" },
//                 { id: "Expense", name: "Expense" },
//               ]}
//               readOnly={false}
//             />

//             {/* Amount */}
//             <FormInput
//               control={form.control}
//               name="entryAmount"
//               label="Amount"
//               placeholder="Enter amount"
//               readOnly={false}
//             />

//             {/* Particulars */}
//             <FormInput
//               control={form.control}
//               name="entryParticulars"
//               label="Particulars"
//               placeholder="Enter particulars"
//               readOnly={false}
//             />

//             {/* Additional Notes */}
//             <FormInput
//               control={form.control}
//               name="additionalNotes"
//               label="Additional Notes"
//               placeholder="Enter additional notes (if there is any)"
//               readOnly={false}
//             />

//             {/* Submit Button */}
//             <div className="mt-8 flex justify-end gap-3">
//               <Button
//                 type="submit"
//                 className="bg-blue hover:bg-blue hover:opacity-[95%]"
//               >
//                 Save
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// }

// export default GADAddEntryForm;

import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import GADAddEntrySchema from "@/form-schema/gad-budget-track-create-form-schema";
import { postdonationreq } from "./requestAPI/BTPostRequest";

function GADAddEntryForm() {
  const form = useForm<z.infer<typeof GADAddEntrySchema>>({
    resolver: zodResolver(GADAddEntrySchema),
    defaultValues: {
      gbud_type: "",
      gbud_add_notes: "",
      gbud_amount: 0,
      gbud_particulars: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof GADAddEntrySchema>) => {
    try {
      await postdonationreq(values);
      form.reset(); 
    } catch (err) {
      console.error("Error submitting GAD budget entry", err);
    }
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <div className="pb-2">
        <h2 className="text-lg font-semibold">ADD GAD BUDGET ENTRY</h2>
        <p className="text-xs text-black/50">Fill out all necessary fields</p>
      </div>
      <div className="grid gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Entry Type */}
            <FormSelect
              control={form.control}
              name="gbud_type"
              label="Type of Entry"
              options={[
                { id: "Income", name: "Income" },
                { id: "Expense", name: "Expense" },
              ]}
              readOnly={false}
            />

            {/* Amount */}
            <FormInput
              control={form.control}
              name="gbud_amount"
              label="Amount"
              placeholder="Enter amount"
              readOnly={false}
            />

            {/* Particulars */}
            <FormInput
              control={form.control}
              name="gbud_particulars"
              label="Particulars"
              placeholder="Enter particulars"
              readOnly={false}
            />

            {/* Additional Notes */}
            <FormInput
              control={form.control}
              name="gbud_add_notes"
              label="Additional Notes"
              placeholder="Enter additional notes (if there is any)"
              readOnly={false}
            />

            {/* Submit Button */}
            <div className="mt-8 flex justify-end gap-3">
              <Button
                type="submit"
                className="bg-blue hover:bg-blue hover:opacity-[95%]"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default GADAddEntryForm;