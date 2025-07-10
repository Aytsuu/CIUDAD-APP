// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form/form";
// import { Button } from "@/components/ui/button/button";
// import { MedicineDisplay } from "@/components/ui/medicine-display";
// import { Loader2 } from "lucide-react";
// import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI";
// import { FormTextArea } from "@/components/ui/form/form-text-area";
// import { SupplementSchema, SupplementType } from "@/form-schema/chr-schema";
// import { Skeleton } from "@/components/ui/skeleton";

// type ChildHRPage4Props = {
//   onPrevious3: () => void;
//   onNext5: () => void;
//   updateFormData: (data: Partial<SupplementType>) => void;
//   formData: SupplementType;
// };

// export default function ChildHRPage4({
//   onPrevious3,
//   onNext5,
//   updateFormData,
//   formData,
// }: ChildHRPage4Props) {
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const { medicineStocksOptions } = fetchMedicinesWithStock();

//   const prevSelectedMedicinesRef = useRef<typeof formData.medicines>();

//   const form = useForm<SupplementType>({
//     resolver: zodResolver(SupplementSchema),
//     defaultValues: {
//       medicines: formData.medicines || [],
//       supplementSummary: formData.supplementSummary || "",
//     },
//   });

//   const { handleSubmit, setValue, watch } = form;
//   const selectedMedicines = watch("medicines");

//   useEffect(() => {
//     if (medicineStocksOptions) {
//       setIsLoading(false);
//     }
//   }, [medicineStocksOptions]);

//   useEffect(() => {
//     if (!prevSelectedMedicinesRef.current) {
//       prevSelectedMedicinesRef.current = selectedMedicines;
//     }

//     const medicinesChanged =
//       JSON.stringify(prevSelectedMedicinesRef.current) !== JSON.stringify(selectedMedicines);

//     if (medicinesChanged) {
//       if (selectedMedicines && selectedMedicines.length > 0) {
//         const summary = selectedMedicines
//           .map((med) => {
//             const medInfo = medicineStocksOptions?.find(
//               (m) => m.id === med.minv_id
//             );
//             return `${medInfo?.name || "Unknown Medicine"} ${medInfo?.dosage || ""} (${med.medrec_qty} ${medInfo?.unit || ""}) - ${med.reason}`;
//           })
//           .join("\n");
//         setValue("supplementSummary", summary);
//         updateFormData({
//           medicines: selectedMedicines,
//           supplementSummary: summary,
//         });
//       } else {
//         setValue("supplementSummary", "");
//         updateFormData({
//           medicines: [],
//           supplementSummary: "",
//         });
//       }
//       prevSelectedMedicinesRef.current = selectedMedicines;
//     }
//   }, [selectedMedicines, setValue, updateFormData, medicineStocksOptions]);

//   const handleMedicineSelectionChange = (
//     selectedMedicines: {
//       minv_id: string;
//       medrec_qty: number;
//       reason: string;
//     }[]
//   ) => {
//     setValue("medicines", selectedMedicines);
//   };

//   const handleNext = () => {
//     handleSubmit((data) => {
//       updateFormData(data);
//       onNext5();
//     })();
//   };

  

//   return (
//     <div className="w-full bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
//       <Form {...form}>
//         <form onSubmit={handleSubmit(handleNext)} className="space-y-6">
//           <h3 className="font-semibold text-lg md:text-xl">
//             Medicine Prescription
//           </h3>

//           <div className="grid grid-cols-1 gap-6">
//             <MedicineDisplay
//               medicines={medicineStocksOptions || []}
//               initialSelectedMedicines={selectedMedicines || []}
//               onSelectedMedicinesChange={handleMedicineSelectionChange}
//               currentPage={currentPage}
//               onPageChange={setCurrentPage}
//             />

//             <FormTextArea
//               control={form.control}
//               name="supplementSummary"
//               label="Supplement summary"
//               placeholder="Describe the patient's chief complaint and history in their own words"
//               className="min-h-[120px] w-full"
//             />
//           </div>

//           <div className="flex flex-col sm:flex-row w-full justify-end gap-4 pt-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={onPrevious3}
//               className="w-full sm:w-auto"
//             >
//               Previous
//             </Button>
//             <Button
//               type="submit"
//               className="w-full sm:w-auto"
//             >
//               Next
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// }