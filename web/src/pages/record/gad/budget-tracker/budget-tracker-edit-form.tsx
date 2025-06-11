// import { useState } from "react";
// import { Button } from "@/components/ui/button/button";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { Form } from "@/components/ui/form/form";
// import { FormInput } from "@/components/ui/form/form-input";
// import { FormSelect } from "@/components/ui/form/form-select";
// import GADEditEntrySchema from "@/form-schema/gad-budget-tracker-edit-form-schema";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { useUpdateGADBudgets } from "./queries/BTUpdateQueries";
// import { useGetGADBudgets } from "./queries/BTFetchQueries";

// type GADEditEntryFormProps = {
//   gbud_num: number;
//   onSaveSuccess?: () => void;
// };

// function GADEditEntryForm({ gbud_num, onSaveSuccess }: GADEditEntryFormProps) {
//   const [isEditing, setIsEditing] = useState(false);
//   const { data: budgetEntries } = useGetGADBudgets();
//   const { mutate: updateBudgetEntry, isPending } = useUpdateGADBudgets();

//   // Find the specific budget entry
//   const budgetEntry = budgetEntries?.find((entry) => entry.gbud_num === gbud_num);

//   const form = useForm<z.infer<typeof GADEditEntrySchema>>({
//     resolver: zodResolver(GADEditEntrySchema),
//     defaultValues: {
//       gbud_type: budgetEntry?.gbud_type || "",
//       gbud_amount: budgetEntry?.gbud_amount || 0,
//       gbud_particulars: budgetEntry?.gbud_particulars || "",
//       gbud_add_notes: budgetEntry?.gbud_add_notes || "",
//     },
//   });

//   const handleConfirmSave = () => {
//     const values = form.getValues();
//     updateBudgetEntry(
//       { gbud_num, budgetEntryInfo: values },
//       {
//         onSuccess: () => {
//           setIsEditing(false);
//           if (onSaveSuccess) onSaveSuccess();
//         },
//       }
//     );
//   };

//   if (!budgetEntry) {
//     return <div className="text-center py-8">Loading budget entry details...</div>;
//   }

//   return (
//     <div className="flex flex-col min-h-0 h-auto p-6 max-w-4xl mx-auto rounded-lg overflow-auto">
//       <div className="pb-4">
//         <h2 className="text-lg font-semibold">GAD BUDGET ENTRY #{gbud_num}</h2>
//         <p className="text-xs text-black/50">View or edit budget entry details</p>
//       </div>
//       <Form {...form}>
//         <form className="flex flex-col gap-4">
//           {/* Entry Type */}
//           <FormSelect
//             control={form.control}
//             name="gbud_type"
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
//             name="gbud_amount"
//             label="Amount"
//             placeholder="Enter amount"
//             readOnly={!isEditing}
//           />

//           {/* Particulars */}
//           <FormInput
//             control={form.control}
//             name="gbud_particulars"
//             label="Particulars"
//             placeholder="Enter particulars"
//             readOnly={!isEditing}
//           />

//           {/* Additional Notes */}
//           <FormInput
//             control={form.control}
//             name="gbud_add_notes"
//             label="Additional Notes"
//             placeholder="Enter additional notes (if any)"
//             readOnly={!isEditing}
//           />

//           {/* Form Errors */}
//           {Object.values(form.formState.errors).length > 0 && (
//             <div className="text-red-500 text-sm">
//               {Object.values(form.formState.errors)
//                 .map((error) => error.message)
//                 .join(', ')}
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
//                   }}
//                   variant="outline"
//                 >
//                   Cancel
//                 </Button>

//                 <ConfirmationModal
//                   trigger={
//                     <Button
//                       type="button"
//                       className="bg-blue hover:bg-blue/90"
//                       disabled={isPending}
//                     >
//                       {isPending ? "Saving..." : "Save Changes"}
//                     </Button>
//                   }
//                   title="Confirm Save"
//                   description="Are you sure you want to save the changes to this budget entry?"
//                   actionLabel="Confirm"
//                   onClick={handleConfirmSave}
//                 />
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

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useUpdateGADBudgets } from "./queries/BTUpdateQueries";
import { useGetGADBudgetEntry } from "./queries/BTFetchQueries";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import GADEditEntrySchema from "@/form-schema/gad-budget-tracker-edit-form-schema";

type GADEditEntryFormProps = {
  gbud_num: number;
  onSaveSuccess?: () => void;
};

function GADEditEntryForm({ gbud_num, onSaveSuccess }: GADEditEntryFormProps) {
  const { year } = useParams<{ year: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  console.log(`Component year: ${year}, entry ID: ${gbud_num}`);

  const { data: budgetEntry } = useGetGADBudgetEntry(gbud_num);
  console.log("data entries", budgetEntry);
  const { mutate: updateBudgetEntry, isPending } = useUpdateGADBudgets();

  const form = useForm<z.infer<typeof GADEditEntrySchema>>({
    resolver: zodResolver(GADEditEntrySchema),
    defaultValues: {
      gbud_type: budgetEntry?.gbud_type || "",
      gbud_amount: budgetEntry?.gbud_amount || 0,
      gbud_particulars: budgetEntry?.gbud_particulars || "",
      gbud_add_notes: budgetEntry?.gbud_add_notes || "",
      gbud_receipt: budgetEntry?.gbud_receipt || "",
      gbudy_num: year ? parseInt(year) : 0,
    },
  });

  useEffect(() => {
    if (budgetEntry) {
      form.reset({
        gbud_type: budgetEntry.gbud_type,
        gbud_amount: budgetEntry.gbud_amount,
        gbud_particulars: budgetEntry.gbud_particulars,
        gbud_add_notes: budgetEntry.gbud_add_notes || "",
        gbud_receipt: budgetEntry.gbud_receipt || "",
        gbudy_num: budgetEntry.gbudy_num,
      });
  
      if (budgetEntry.gbud_receipt) {
        const dummyFile = new File([], "receipt.jpg", { type: "image/jpeg" });
        setMediaFiles([
          {
            id: `receipt-${budgetEntry.gbud_num}`,
            type: "image" as const,
            file: dummyFile,
            publicUrl: budgetEntry.gbud_receipt,
            status: "uploaded" as const,
            previewUrl: budgetEntry.gbud_receipt,
            storagePath: ""
          }
        ]);
      }
    }
  }, [budgetEntry, form]);

  // Update form value when media files change
  useEffect(() => {
    if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
      form.setValue("gbud_receipt", mediaFiles[0].publicUrl);
    } else {
      form.setValue("gbud_receipt", "");
    }
  }, [mediaFiles, form]);

  // In your form submission handler
  const handleConfirmSave = () => {
    const values = form.getValues();

    // Find the first image media file (if any)
    const receiptMedia = mediaFiles.find((m) => m.type === "image");
    const receiptUrl = receiptMedia?.publicUrl || "";

    updateBudgetEntry(
      {
        gbud_num,
        budgetEntryInfo: {
          ...values,
          gbud_receipt: receiptUrl,
          gbud_date:
            budgetEntry?.gbud_date || new Date().toISOString().split("T")[0],
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          if (onSaveSuccess) onSaveSuccess();
        },
      }
    );
  };

  if (!budgetEntry) {
    return (
      <div className="text-center py-8">Loading budget entry details...</div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 h-auto p-6 rounded-lg overflow-auto">
      <Form {...form}>
        <form className="flex flex-col gap-4">
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
            type="number"
            readOnly={!isEditing}
          />

          {/* Particulars */}
          <FormInput
            control={form.control}
            name="gbud_particulars"
            label="Particulars"
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

          {/* Receipt Image Upload */}
          {isEditing ? (
            <MediaUpload
              title="Receipt Image"
              description="Upload an image of your receipt as proof of transaction"
              mediaFiles={mediaFiles}
              activeVideoId={activeVideoId}
              setMediaFiles={setMediaFiles}
              setActiveVideoId={setActiveVideoId}
            />
          ) : (
            mediaFiles.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Receipt Image
                </label>
                <div className="border rounded-md p-2">
                  <img
                    src={mediaFiles[0].publicUrl}
                    alt="Receipt"
                    className="max-h-60 object-contain"
                  />
                </div>
              </div>
            )
          )}

          {/* Hidden Budget Year Field */}
          <input type="hidden" {...form.register("gbudy_num")} />

          {/* Form Errors */}
          {Object.values(form.formState.errors).length > 0 && (
            <div className="text-red-500 text-sm">
              {Object.values(form.formState.errors)
                .map((error) => error.message)
                .join(", ")}
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
                    // Reset media files to original with proper type
                    if (budgetEntry?.gbud_receipt) {
                      const dummyFile = new File([], 'receipt.jpg', { type: 'image/jpeg' });
                      setMediaFiles([{
                        id: `receipt-${budgetEntry.gbud_num}`, // Use entry ID for consistency
                        type: "image" as const,
                        file: dummyFile,
                        publicUrl: budgetEntry.gbud_receipt,
                        status: "uploaded" as const,
                        previewUrl: budgetEntry.gbud_receipt,
                        storagePath: "" // Add if required
                      }]);
                    } else {
                      setMediaFiles([]);
                    }
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>

                <ConfirmationModal
                  trigger={
                    <Button
                      type="button"
                      className="bg-blue hover:bg-blue/90"
                      disabled={isPending}
                    >
                      {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  }
                  title="Confirm Save"
                  description="Are you sure you want to save the changes to this budget entry?"
                  actionLabel="Confirm"
                  onClick={handleConfirmSave}
                />
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
