// import { Button } from "@/components/ui/button/button";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { Form } from "@/components/ui/form/form";
// import { FormInput } from "@/components/ui/form/form-input";
// import { FormSelect } from "@/components/ui/form/form-select";
// import GADAddEntrySchema from "@/form-schema/gad-budget-track-create-form-schema";
// import { useAddGADBudget } from "./queries/BTAddQueries"; // Import the new hook

// interface GADAddEntryFormProps {
//   onSuccess?: () => void;
// }

// function GADAddEntryForm({ onSuccess }: GADAddEntryFormProps) {
//   const form = useForm<z.infer<typeof GADAddEntrySchema>>({
//     resolver: zodResolver(GADAddEntrySchema),
//     defaultValues: {
//       gbud_type: "",
//       gbud_add_notes: "",
//       gbud_amount: 0,
//       gbud_particulars: "",
//     },
//   });

//   const { mutate: addGADBudget, isPending } = useAddGADBudget();

//   const onSubmit = (values: z.infer<typeof GADAddEntrySchema>) => {
//     addGADBudget(values, {
//       onSuccess: () => {
//         if (onSuccess) onSuccess();
//       }
//     });
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
//               name="gbud_type"
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
//               name="gbud_amount"
//               label="Amount"
//               placeholder="Enter amount"
//               readOnly={false}
//             />

//             {/* Particulars */}
//             <FormInput
//               control={form.control}
//               name="gbud_particulars"
//               label="Particulars"
//               placeholder="Enter particulars"
//               readOnly={false}
//             />

//             {/* Additional Notes */}
//             <FormInput
//               control={form.control}
//               name="gbud_add_notes"
//               label="Additional Notes"
//               placeholder="Enter additional notes (if there is any)"
//               readOnly={false}
//             />

//             {/* Submit Button */}
//             <div className="mt-8 flex justify-end gap-3">
//               <Button
//                 type="submit"
//                 className="bg-blue hover:bg-blue hover:opacity-[95%]"
//                 disabled={isPending}
//               >
//                 {isPending ? "Submitting..." : "Save"}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// }

// export default GADAddEntryForm;

// import { Button } from "@/components/ui/button/button";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { Form } from "@/components/ui/form/form";
// import { FormInput } from "@/components/ui/form/form-input";
// import { FormSelect } from "@/components/ui/form/form-select";
// import { useAddGADBudget } from "./queries/BTAddQueries";
// import { useParams } from "react-router-dom";
// import { MediaUpload } from "@/components/ui/media-upload";
// import { useState, useEffect } from "react";
// import GADAddEntrySchema from "@/form-schema/gad-budget-track-create-form-schema";

// interface GADAddEntryFormProps {
//   onSuccess?: () => void;
// }

// function GADAddEntryForm({ onSuccess }: GADAddEntryFormProps) {
//   const { year } = useParams<{ year: string }>();
//   const [mediaFiles, setMediaFiles] = useState<any[]>([]);
//   const [activeVideoId, setActiveVideoId] = useState<string>("");

//   const form = useForm<z.infer<typeof GADAddEntrySchema>>({
//     resolver: zodResolver(GADAddEntrySchema),
//     defaultValues: {
//       gbud_type: "",
//       gbud_amount: 0,
//       gbud_particulars: "",
//       gbud_add_notes: "",
//       gbud_receipt: "",
//       gbudy_num: year ? parseInt(year) : 0,
//     },
//   });

//   const { mutate: addGADBudget, isPending } = useAddGADBudget();

//   // Handle media file changes
//   useEffect(() => {
//     if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
//       form.setValue("gbud_receipt", mediaFiles[0].publicUrl);
//     } else {
//       form.setValue("gbud_receipt", "");
//     }
//   }, [mediaFiles, form]);

//   const onSubmit = (values: z.infer<typeof GADAddEntrySchema>) => {
//     const payload = {
//       ...values,
//       gbud_date: new Date().toISOString().split("T")[0],
//       gbud_remaining_bal: 0,
//     };

//     addGADBudget(payload, {
//       onSuccess: () => {
//         if (onSuccess) onSuccess();
//       },
//     });
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
//               name="gbud_type"
//               label="Type of Entry"
//               options={[
//                 { id: "Income", name: "Income" },
//                 { id: "Expense", name: "Expense" },
//               ]}
//             />

//             {/* Amount */}
//             <FormInput
//               control={form.control}
//               name="gbud_amount"
//               label="Amount"
//               type="number"
//             />

//             {/* Particulars */}
//             <FormInput
//               control={form.control}
//               name="gbud_particulars"
//               label="Particulars"
//             />

//             {/* Additional Notes */}
//             <FormInput
//               control={form.control}
//               name="gbud_add_notes"
//               label="Additional Notes"
//               placeholder="Enter additional notes (if there is any)"
//               readOnly={false}
//             />

//             {/* Receipt Image Upload */}
//             <MediaUpload
//               title="Receipt Image"
//               description="Upload an image of your receipt as proof of transaction"
//               mediaFiles={mediaFiles}
//               activeVideoId={activeVideoId}
//               setMediaFiles={setMediaFiles}
//               setActiveVideoId={setActiveVideoId}
//             />

//             {/* Hidden Budget Year Field */}
//             <input type="hidden" {...form.register("gbudy_num")} />

//             <div className="mt-8 flex justify-end gap-3">
//               <Button
//                 type="submit"
//                 className="bg-blue hover:bg-blue hover:opacity-[95%]"
//                 disabled={isPending}
//               >
//                 {isPending ? "Submitting..." : "Save"}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// }

// export default GADAddEntryForm;


// import { Button } from "@/components/ui/button/button";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { Form } from "@/components/ui/form/form";
// import { FormInput } from "@/components/ui/form/form-input";
// import { FormSelect } from "@/components/ui/form/form-select";
// import { useAddGADBudget } from "./queries/BTAddQueries";
// import { useParams } from "react-router-dom";
// import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
// import { useState, useEffect } from "react";
// import GADAddEntrySchema from "@/form-schema/gad-budget-track-create-form-schema";
// import { useQueryClient } from "@tanstack/react-query";
// import { useGetGADBudgets } from "./queries/BTFetchQueries";
// import { useGetGADYearBudgets } from "./queries/BTYearQueries";

// interface GADAddEntryFormProps {
//   onSuccess?: () => void;
// }

// function GADAddEntryForm({ onSuccess }: GADAddEntryFormProps) {
//   const { year } = useParams<{ year: string }>();
//   const queryClient = useQueryClient();
//   const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
//   const [activeVideoId, setActiveVideoId] = useState<string>("");

//   // Get the current year's budget data
//   const { data: yearBudgets } = useGetGADYearBudgets();
//   const currentYearBudget = yearBudgets?.find(b => b.gbudy_year === year);

//   // Get all entries for the current year
//   const { data: budgetEntries = [] } = useGetGADBudgets(year || '');

//   const form = useForm<z.infer<typeof GADAddEntrySchema>>({
//     resolver: zodResolver(GADAddEntrySchema),
//     defaultValues: {
//       gbud_type: "",
//       gbud_amount: '',
//       gbud_particulars: "",
//       gbud_add_notes: "",
//       gbud_receipt: "",
//       gbudy_num: year ? parseInt(year) : 0,
//     },
//   });

//   const { mutate: addGADBudget, isPending } = useAddGADBudget();

//   // Calculate remaining balance in background (only for expenses)
//   const calculateRemainingBalance = (): number => {
//     if (!currentYearBudget) return 0;
    
//     const initialBudget = Number(currentYearBudget.gbudy_budget) || 0;
//     let remainingBalance = initialBudget;
    
//     budgetEntries.forEach(entry => {
//       const amount = entry.gbud_amount || 0;
//       if (entry.gbud_type === "Expense") {
//         remainingBalance -= amount;
//       }
//       // Note: We're skipping income entries for this calculation
//     });
    
//     return remainingBalance;
//   };

//   // Update form when media files change
//   useEffect(() => {
//     if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
//       form.setValue("gbud_receipt", mediaFiles[0].publicUrl);
//     } else {
//       form.setValue("gbud_receipt", "");
//     }
//   }, [mediaFiles, form]);

//   const onSubmit = (values: z.infer<typeof GADAddEntrySchema>) => {
//   const receiptUrl = mediaFiles[0]?.publicUrl || "";
//   const currentRemainingBalance = calculateRemainingBalance();
  
//   // Ensure we have valid numbers
//   const amount = Number(values.gbud_amount) || 0;
//   const remainingBalance = Number(currentRemainingBalance) || 0;

    
//     // Prepare payload with conditional remaining balance
//     const payload = {
//       ...values,
//     gbud_date: new Date().toISOString().split("T")[0],
//     gbud_amount: amount,
//     gbud_remaining_bal: values.gbud_type === "Expense"
//       ? remainingBalance - amount  // Now definitely a number
//       : 0, // Use 0 instead of empty string for Income entries
//     gbud_receipt: receiptUrl,
//     };

//     addGADBudget(payload, {
//       onSuccess: () => {
//         setMediaFiles([]); // Only reset form state here
//         onSuccess?.(); // Optional callback for UI-specific logic
//       }
//     });
//   };

//   return (
//     <div className="flex flex-col min-h-0 h-auto p-4 md:p5 rounded-lg overflow-auto">
//       <div className="pb-2">
//         <h2 className="text-lg font-semibold">ADD GAD BUDGET ENTRY</h2>
//         <p className="text-xs text-black/50">Fill out all necessary fields</p>
//       </div>
//       <div className="grid gap-4">
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
//             <FormSelect
//               control={form.control}
//               name="gbud_type"
//               label="Type of Entry"
//               options={[
//                 { id: "Income", name: "Income" },
//                 { id: "Expense", name: "Expense" },
//               ]}
//             />

//             <FormInput
//               control={form.control}
//               name="gbud_amount"
//               label="Amount"
//               type="number"
//             />

//             <FormInput
//               control={form.control}
//               name="gbud_particulars"
//               label="Particulars"
//             />

//             <FormInput
//               control={form.control}
//               name="gbud_add_notes"
//               label="Additional Notes"
//               placeholder="Enter additional notes (if any)"
//             />

//             <MediaUpload
//               title="Receipt Image"
//               description="Upload an image of your receipt as proof of transaction"
//               mediaFiles={mediaFiles}
//               activeVideoId={activeVideoId}
//               setMediaFiles={setMediaFiles}
//               setActiveVideoId={setActiveVideoId}
//             />

//             <input type="hidden" {...form.register("gbudy_num")} />

//             <div className="mt-8 flex justify-end gap-3">
//               <Button
//                 type="submit"
//                 className="bg-blue hover:bg-blue hover:opacity-[95%]"
//                 disabled={isPending}
//               >
//                 {isPending ? "Submitting..." : "Save"}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// }

// export default GADAddEntryForm;

// import { Button } from "@/components/ui/button/button";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { Form } from "@/components/ui/form/form";
// import { FormInput } from "@/components/ui/form/form-input";
// import { FormSelect } from "@/components/ui/form/form-select";
// import { useAddGADBudget } from "./queries/BTAddQueries";
// import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
// import { useState, useEffect } from "react";
// import GADAddEntrySchema from "@/form-schema/gad-budget-track-create-form-schema";
// import { toast } from "sonner";
// import { CircleCheck } from "lucide-react";

// interface GADAddEntryFormProps {
//   onSuccess?: () => void;
// }

// function GADAddEntryForm({ onSuccess }: GADAddEntryFormProps) {
//   const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
//   const [activeVideoId, setActiveVideoId] = useState<string>("");

//   const form = useForm<z.infer<typeof GADAddEntrySchema>>({
//     resolver: zodResolver(GADAddEntrySchema),
//     defaultValues: {
//       gbud_type: "",
//       gbud_amount: '',
//       gbud_particulars: "",
//       gbud_add_notes: "",
//       gbud_receipt: "",
//       gbudy_num: 0, // Will be set in onSubmit
//     },
//   });

//   const { mutate: addGADBudget, isPending } = useAddGADBudget();

//   // Update form when media files change
//   useEffect(() => {
//     if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
//       form.setValue("gbud_receipt", mediaFiles[0].publicUrl);
//     } else {
//       form.setValue("gbud_receipt", "");
//     }
//   }, [mediaFiles, form]);

//   useEffect(() => {
//     console.log("Current form errors:", form.formState.errors);
//   }, [form.formState.errors]);
  
//   const onSubmit = (values: z.infer<typeof GADAddEntrySchema>) => {
//     const toastId = toast.loading('Submitting budget entry...', {
//       duration: Infinity  
//     });
//     console.log("Form submitted with values:", values); // Debug log

//     const payload = {
//       ...values,
//       gbud_date: new Date().toISOString().split("T")[0],
//       gbud_amount: Number(values.gbud_amount),
//       gbud_remaining_bal: values.gbud_type === "Expense" 
//         ? Number(values.gbud_remaining_bal) 
//         : 0,
//       gbud_receipt: mediaFiles[0]?.publicUrl || "",
//     };

//     addGADBudget(payload, {
//       onSuccess: () => {
//         toast.success('Budget entry recorded successfully', {
//           id: toastId, 
//           icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//           duration: 2000,
//           onAutoClose: () => {
//             setMediaFiles([]);
//             if (onSuccess) onSuccess();
//           }
//         });
//       },
//       onError: (error) => {
//         toast.error(
//           "Failed to submit budget entry. Please check the input data and try again.",
//           {
//             id: toastId,
//             duration: 2000
//           }
//         );
//         console.error("Error submitting budget entry", error);
//       }
//     });
//   };

//   return (
//     <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
//       <div className="grid gap-4">
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
//             <FormSelect
//               control={form.control}
//               name="gbud_type"
//               label="Type of Entry"
//               options={[
//                 { id: "Income", name: "Income" },
//                 { id: "Expense", name: "Expense" },
//               ]}
//             />

//             <FormInput
//               control={form.control}
//               name="gbud_amount"
//               label="Amount"
//               type="number"
//             />

//             <FormInput
//               control={form.control}
//               name="gbud_particulars"
//               label="Particulars"
//             />

//             <FormInput
//               control={form.control}
//               name="gbud_add_notes"
//               label="Additional Notes"
//               placeholder="Enter additional notes (if any)"
//             />

//             <MediaUpload
//               title="Receipt Image"
//               description="Upload an image of your receipt as proof of transaction"
//               mediaFiles={mediaFiles}
//               activeVideoId={activeVideoId}
//               setMediaFiles={setMediaFiles}
//               setActiveVideoId={setActiveVideoId}
//             />

//             <div className="mt-8 flex justify-end gap-3">
//               <Button
//                 type="submit"
//                 className="bg-blue hover:bg-blue/90"
//                 disabled={isPending}
//               >
//                 {isPending ? "Saving..." : "Save"}
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
import { useAddGADBudget } from "./queries/BTAddQueries";
import { useParams } from "react-router-dom";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { useState, useEffect } from "react";
import GADAddEntrySchema from "@/form-schema/gad-budget-track-create-form-schema";
import { useQueryClient } from "@tanstack/react-query";
import { useGetGADBudgets } from "./queries/BTFetchQueries";
import { useGetGADYearBudgets } from "./queries/BTYearQueries";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

interface GADAddEntryFormProps {
  onSuccess?: () => void;
}

function GADAddEntryForm({ onSuccess }: GADAddEntryFormProps) {
  const { year } = useParams<{ year: string }>();
  const queryClient = useQueryClient();
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = useState<string>("");

  // Get the current year's budget data
  const { data: yearBudgets } = useGetGADYearBudgets();
  const currentYearBudget = yearBudgets?.find(b => b.gbudy_year === year);

  // Get all entries for the current year
  const { data: budgetEntries = [] } = useGetGADBudgets(year || '');

  const form = useForm<z.infer<typeof GADAddEntrySchema>>({
    resolver: zodResolver(GADAddEntrySchema),
    defaultValues: {
      gbud_type: "",
      gbud_amount: '',
      gbud_particulars: "",
      gbud_add_notes: "",
      gbud_receipt: "",
      gbudy_num: currentYearBudget?.gbudy_num || 0, // Get from year budget data
    },
  });

  // Update form when year budget data loads
  useEffect(() => {
    if (currentYearBudget) {
      form.setValue("gbudy_num", currentYearBudget.gbudy_num);
    }
  }, [currentYearBudget, form]);

  const { mutate: addGADBudget, isPending } = useAddGADBudget();

  // Calculate remaining balance in background (only for expenses)
  const calculateRemainingBalance = (): number => {
    if (!currentYearBudget) return 0;
    
    const initialBudget = Number(currentYearBudget.gbudy_budget) || 0;
    let remainingBalance = initialBudget;
    
    budgetEntries.forEach(entry => {
      const amount = Number(entry.gbud_amount) || 0;
      if (entry.gbud_type === "Expense") {
        remainingBalance -= amount;
      }
    });
    
    return remainingBalance;
  };

  // Update form when media files change
  useEffect(() => {
    if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
      form.setValue("gbud_receipt", mediaFiles[0].publicUrl);
    } else {
      form.setValue("gbud_receipt", "");
    }
  }, [mediaFiles, form]);

  const onSubmit = (values: z.infer<typeof GADAddEntrySchema>) => {
    const toastId = toast.loading('Submitting budget entry...');
    
    try {
      const receiptUrl = mediaFiles[0]?.publicUrl || "";
      const currentRemainingBalance = calculateRemainingBalance();
      
      const amount = Number(values.gbud_amount) || 0;
      const remainingBalance = Number(currentRemainingBalance) || 0;

      const payload = {
        ...values,
        gbud_date: new Date().toISOString().split("T")[0],
        gbud_amount: amount,
        gbud_remaining_bal: values.gbud_type === "Expense"
          ? remainingBalance - amount
          : 0,
        gbud_receipt: receiptUrl,
        gbudy_num: currentYearBudget?.gbudy_num || 0, // Ensure we use the correct reference
      };

      addGADBudget(payload, {
        onSuccess: () => {
          toast.success('Budget entry recorded successfully', {
            icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
          });
          setMediaFiles([]);
          form.reset();
          onSuccess?.();
        },
        onError: (error) => {
          toast.error("Failed to submit budget entry", {
            description: error.message,
          });
        }
      });
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <div className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormSelect
              control={form.control}
              name="gbud_type"
              label="Type of Entry"
              options={[
                { id: "Income", name: "Income" },
                { id: "Expense", name: "Expense" },
              ]}
            />

            <FormInput
              control={form.control}
              name="gbud_amount"
              label="Amount"
              type="number"
            />

            <FormInput
              control={form.control}
              name="gbud_particulars"
              label="Particulars"
            />

            <FormInput
              control={form.control}
              name="gbud_add_notes"
              label="Additional Notes"
              placeholder="Enter additional notes (if any)"
            />

            <MediaUpload
              title="Receipt Image"
              description="Upload an image of your receipt as proof of transaction"
              mediaFiles={mediaFiles}
              activeVideoId={activeVideoId}
              setMediaFiles={setMediaFiles}
              setActiveVideoId={setActiveVideoId}
            />

            <input type="hidden" {...form.register("gbudy_num")} />

            <div className="mt-8 flex justify-end gap-3">
              <Button
                type="submit"
                className="bg-blue hover:bg-blue hover:opacity-[95%]"
                disabled={isPending}
              >
                {isPending ? "Submitting..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default GADAddEntryForm;