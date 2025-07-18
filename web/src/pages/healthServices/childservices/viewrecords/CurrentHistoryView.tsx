import React, { useRef } from "react";
import { format, isValid } from "date-fns";
import { getValueByPath } from "./utils";
import { VitalSignsTable } from "./tables/VitalSignsTable";
import { ChildHealthHistoryRecord } from "./types";
import { BFCheckTable } from "./tables/BFTable";
import { ImmunizationTable } from "./tables/ImmunizationTable";
import { SupplementStatusTable } from "./tables/SupplementStatusTable";
import { calculateAge } from "@/helpers/ageCalculator";
import { Button } from "@/components/ui/button/button";
import { Printer } from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";

interface PatientSummarySectionProps {
  recordsToDisplay: ChildHealthHistoryRecord[];
  fullHistoryData: ChildHealthHistoryRecord[];
  chhistId: string;
}

export function PatientSummarySection({
  recordsToDisplay,
  fullHistoryData,
  chhistId,
}: PatientSummarySectionProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (recordsToDisplay.length === 0) return null;

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = printRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Child Health Record</title>
          <style>
            /* Print styles */
            * {
              font-size: 9px !important;
              line-height: 1.2 !important;
              color: black !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body {
              background: white !important;
              margin: 0 !important;
              padding: 8px !important;
              font-family: Arial, sans-serif;
            }

            /* Maintain existing div structure */
            .bg-white {
              background: white !important;
              box-shadow: none !important;
              border: none !important;
            }

            h2 {
              font-size: 10px !important;
              font-weight: bold !important;
              color: black !important;
              text-align: center !important;
            }

            p {
              font-size: 9px !important;
              color: black !important;
              margin: 1px 0 !important;
            }

            strong {
              font-weight: bold !important;
              color: black !important;
            }

            .underline {
              text-decoration: underline !important;
              color: black !important;
            }

            /* Maintain flex layouts */
            .flex {
              display: flex !important;
            }

            .flex-col {
              flex-direction: column !important;
            }

            .flex-row {
              flex-direction: row !important;
            }

            .justify-between {
              justify-content: space-between !important;
            }

            .justify-end {
              justify-content: flex-end !important;
            }

            .items-center {
              align-items: center !important;
            }

            .space-x-2 > * + * {
              margin-left: 4px !important;
            }

            .space-y-2 > * + * {
              margin-top: 2px !important;
            }

            .space-y-4 > * + * {
              margin-top: 4px !important;
            }

            .gap-10 {
              gap: 10px !important;
            }

            /* Width controls for main layout */
            .lg\\:w-\\[50\\%\\] {
              width: 50% !important;
              flex: 0 0 50% !important;
            }

            .w-full {
              width: 100% !important;
            }

            /* Margins and padding adjustments */
            .mb-8 {
              margin-bottom: 6px !important;
            }

            .mb-10 {
              margin-bottom: 6px !important;
            }

            .mb-4 {
              margin-bottom: 3px !important;
            }

            .mb-2 {
              margin-bottom: 2px !important;
            }

            .mt-4 {
              margin-top: 3px !important;
            }

            .mt-5 {
              margin-top: 4px !important;
            }

            .ml-4 {
              margin-left: 8px !important;
            }

            .p-14 {
              padding: 8px !important;
            }

            /* Table styling */
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              font-size: 8px !important;
              margin: 2px 0 !important;
            }

            th, td {
              border: 1px solid black !important;
              padding: 1px 2px !important;
              font-size: 8px !important;
              color: black !important;
            }

            th {
              background-color: #f0f0f0 !important;
              font-weight: bold !important;
            }

            /* Overflow handling */
            .overflow-x-auto {
              overflow: visible !important;
            }

            /* Remove any background colors and shadows */
            .bg-white, .shadow-sm, .rounded-lg {
              background: white !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }

            /* Ensure proper display of immunization section */
            .lg\\:flex-row {
              flex-direction: row !important;
            }

            /* Text alignment */
            .text-center {
              text-align: center !important;
            }

            .text-xl {
              font-size: 10px !important;
            }

            .font-bold {
              font-weight: bold !important;
            }

            .block {
              display: block !important;
            }

            /* Hide any buttons that might be in the content */
            button {
              display: none !important;
            }

            /* Ensure proper spacing */
            .print-full-width {
              width: 100% !important;
            }

            .print-table-container {
              margin: 4px 0 !important;
            }

            .print-table-title {
              font-weight: bold !important;
              margin-bottom: 2px !important;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <>
      <CardLayout cardClassName="px-4"
       content={<>    {/* Main Content - This is what will be printed */}
       <div className="no-print mb-4 justify-end flex items-center space-x-2">
         <Button
           onClick={handlePrint}
           variant="outline"
           className=" flex gap-2 py-2 px-4 rounded border border-zinc-400"
         >
           <Printer /> Print
         </Button>
       </div>
 
         <div
           ref={printRef}
         >
           <h2 className="text-xl font-bold text-gray-800 text-center mb-10">
             CHILD HEALTH RECORD
           </h2>
 
           <div className="flex justify-end mb-10">
             <div className="space-y-2 mb-4">
               <p>
                 <strong>Family no:</strong>{" "}
                 <span className="underline">
                   {getValueByPath(recordsToDisplay[0], [
                     "chrec_details",
                     "family_no",
                   ]) || "N/A"}
                 </span>
               </p>
 
               <p>
                 <strong>UFC no:</strong>{" "}
                 <span className="underline">
                   {getValueByPath(recordsToDisplay[0], [
                     "chrec_details",
                     "ufc_no",
                   ]) || "N/A"}
                 </span>
               </p>
             </div>
           </div>
 
           {/* Main content area with patient details and immunization table */}
           <div className="flex flex-col lg:flex-row gap-10 mb-4 w-full">
             {/* Patient details - takes about 40% width on larger screens */}
             <div className="lg:w-[50%] space-y-4">
               <div>
                 <div className="space-y-4 mb-4">
                   <div className="flex justify-between w-full">
                     <p>
                       <strong>Name:</strong>{" "}
                       <span className="underline">
                         {getValueByPath(recordsToDisplay[0], [
                           "chrec_details",
                           "patrec_details",
                           "pat_details",
                           "personal_info",
                           "per_fname",
                         ]) || "N/A"}{" "}
                         {getValueByPath(recordsToDisplay[0], [
                           "chrec_details",
                           "patrec_details",
                           "pat_details",
                           "personal_info",
                           "per_lname",
                         ]) || ""}{" "}
                         {getValueByPath(recordsToDisplay[0], [
                           "chrec_details",
                           "patrec_details",
                           "pat_details",
                           "personal_info",
                           "per_mname",
                         ]) || ""}
                       </span>
                     </p>
                     <p>
                       <strong>Sex:</strong>{" "}
                       <span className="underline">
                         {getValueByPath(recordsToDisplay[0], [
                           "chrec_details",
                           "patrec_details",
                           "pat_details",
                           "personal_info",
                           "per_sex",
                         ]) || "N/A"}
                       </span>
                     </p>
                   </div>
                   <div className="flex justify-between">
                     <p>
                       <strong>Date of Birth:</strong>{" "}
                       <span className="underline">
                         {isValid(
                           new Date(
                             getValueByPath(recordsToDisplay[0], [
                               "chrec_details",
                               "patrec_details",
                               "pat_details",
                               "personal_info",
                               "per_dob",
                             ])
                           )
                         )
                           ? format(
                               new Date(
                                 getValueByPath(recordsToDisplay[0], [
                                   "chrec_details",
                                   "patrec_details",
                                   "pat_details",
                                   "personal_info",
                                   "per_dob",
                                 ])
                               ),
                               "MMM. d yyyy"
                             )
                           : "N/A"}
                       </span>
                     </p>
 
                     <p>
                       <strong>Birth Order:</strong>{" "}
                       <span className="underline">
                         {getValueByPath(recordsToDisplay[0], [
                           "chrec_details",
                           "birth_order",
                         ]) || "N/A"}
                       </span>
                     </p>
                   </div>
                   <p>
                     <strong>Place of Delivery:</strong>{" "}
                     {(() => {
                       const deliveryType = getValueByPath(recordsToDisplay[0], [
                         "chrec_details",
                         "place_of_delivery_type",
                       ]);
 
                       if (!deliveryType) return "N/A";
 
                       return (
                         <span className="space-x-2">
                           <span>
                             {" "}
                             (
                             <span>
                               {deliveryType === "Hospital Gov't/Private"
                                 ? "✓"
                                 : " "}
                             </span>
                             ) Hospital Gov't/Private
                           </span>
                           <span>
                             {" "}
                             (<span>{deliveryType === "Home" ? "✓" : " "}</span>)
                             Home
                           </span>
                           <span>
                             {" "}
                             (
                             <span>
                               {deliveryType === "Private Clinic" ? "✓" : " "}
                             </span>
                             ) Private Clinic
                           </span>
                           <span>
                             (
                             <span>
                               {deliveryType === "Lying In" ? "✓" : " "}
                             </span>
                             ) Lying In{" "}
                           </span>
                           <span>
                             {" "}
                             (<span>{deliveryType === "HC" ? "✓" : " "}</span>)
                             Home
                           </span>
                         </span>
                       );
                     })()}
                   </p>
 
                   <p>
                     {(() => {
                       const deliveryType = getValueByPath(recordsToDisplay[0], [
                         "chrec_details",
                         "place_of_delivery_type",
                       ]);
 
                       if (deliveryType === "HC") {
                         return (
                           <span>
                             <strong>Place of Delivery:</strong>{" "}
                             <span className="underline">Health Center</span>
                           </span>
                         );
                       }
 
                       return null;
                     })()}
                   </p>
                 </div>
 
                 {/* Mother Section */}
                 <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center space-x-2">
                     <strong>Mother:</strong>
                     <span className="underline">
                       {getValueByPath(recordsToDisplay[0], [
                         "chrec_details",
                         "patrec_details",
                         "pat_details",
                         "family_head_info",
                         "family_heads",
                         "mother",
                         "personal_info",
                       ])
                         ? `${
                             getValueByPath(recordsToDisplay[0], [
                               "chrec_details",
                               "patrec_details",
                               "pat_details",
                               "family_head_info",
                               "family_heads",
                               "mother",
                               "personal_info",
                               "per_fname",
                             ]) || ""
                           } ${
                             getValueByPath(recordsToDisplay[0], [
                               "chrec_details",
                               "patrec_details",
                               "pat_details",
                               "family_head_info",
                               "family_heads",
                               "mother",
                               "personal_info",
                               "per_lname",
                             ]) || ""
                           }`
                         : "N/A"}
                     </span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <strong>Age:</strong>
                     <span className="underline">
                       {(() => {
                         const dob = getValueByPath(recordsToDisplay[0], [
                           "chrec_details",
                           "patrec_details",
                           "pat_details",
                           "family_head_info",
                           "family_heads",
                           "mother",
                           "personal_info",
                           "per_dob",
                         ]);
                         return isValid(new Date(dob))
                           ? calculateAge(new Date(dob).toISOString())
                           : "N/A";
                       })()}
                     </span>
                   </div>
                 </div>
                 <p className="mb-4">
                   <strong>Occupation:</strong>{" "}
                   <span className="underline">
                     {getValueByPath(recordsToDisplay[0], [
                       "chrec_details",
                       "mother_occupation",
                     ]) || "N/A"}
                   </span>
                 </p>
 
                 {/* Father Section */}
                 <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center space-x-2">
                     <strong>Father:</strong>
                     <span className="underline">
                       {getValueByPath(recordsToDisplay[0], [
                         "chrec_details",
                         "patrec_details",
                         "pat_details",
                         "family_head_info",
                         "family_heads",
                         "father",
                         "personal_info",
                       ])
                         ? `${
                             getValueByPath(recordsToDisplay[0], [
                               "chrec_details",
                               "patrec_details",
                               "pat_details",
                               "family_head_info",
                               "family_heads",
                               "father",
                               "personal_info",
                               "per_fname",
                             ]) || ""
                           } ${
                             getValueByPath(recordsToDisplay[0], [
                               "chrec_details",
                               "patrec_details",
                               "pat_details",
                               "family_head_info",
                               "family_heads",
                               "father",
                               "personal_info",
                               "per_lname",
                             ]) || ""
                           }`
                         : "N/A"}
                     </span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <strong>Age:</strong>
                     <span className="underline">
                       {(() => {
                         const dob = getValueByPath(recordsToDisplay[0], [
                           "chrec_details",
                           "patrec_details",
                           "pat_details",
                           "family_head_info",
                           "family_heads",
                           "father",
                           "personal_info",
                           "per_dob",
                         ]);
                         return isValid(new Date(dob))
                           ? calculateAge(new Date(dob).toISOString())
                           : "N/A";
                       })()}
                     </span>
                   </div>
                 </div>
                 <p>
                   <strong>Occupation:</strong>{" "}
                   <span className="underline">
                     {getValueByPath(recordsToDisplay[0], [
                       "chrec_details",
                       "father_occupation",
                     ]) || "N/A"}
                   </span>
                 </p>
               </div>
 
               <div>
                 <p>
                   <strong>Date referred for newborn screening:</strong>{" "}
                   <span className="underline">
                     {isValid(
                       new Date(
                         getValueByPath(recordsToDisplay[0], [
                           "chrec_details",
                           "newborn_screening",
                         ])
                       )
                     )
                       ? format(
                           new Date(
                             getValueByPath(recordsToDisplay[0], [
                               "chrec_details",
                               "newborn_screening",
                             ])
                           ),
                           "MMM dd, yyyy"
                         )
                       : "N/A"}
                   </span>
                 </p>
               </div>
               <div>
                 <p>
                   <strong>Type of Feeding:</strong>{" "}
                   <span className="underline">
                     {getValueByPath(recordsToDisplay[0], [
                       "chrec_details",
                       "type_of_feeding",
                     ]) || "N/A"}
                   </span>
                 </p>
               </div>
             </div>
 
             {/* Immunization table - takes about 60% width on larger screens */}
             <div className="lg:w-[50%]">
               <span className="font-bold block mb-2">Type of immunization</span>
               <div className="overflow-x-auto">
                 <ImmunizationTable
                   fullHistoryData={fullHistoryData}
                   chhistId={chhistId}
                 />
               </div>
               <div className="space-y-2 mt-4">
                 <p className="mt-5">
                   <strong>Child protected at Birth:</strong>{" "}
                 </p>
                 <p className="ml-4">
                   <strong>Date assessed:</strong>{" "}
                   <span className="underline">
                     {isValid(
                       new Date(
                         getValueByPath(recordsToDisplay[0], [
                           "chrec_details",
                           "created_at",
                         ])
                       )
                     )
                       ? format(
                           new Date(
                             getValueByPath(recordsToDisplay[0], [
                               "chrec_details",
                               "created_at",
                             ])
                           ),
                           "MMM dd yyyy"
                         )
                       : "N/A"}
                   </span>
                 </p>
 
                 <p className="">
                   <strong>TT status of mother:</strong>{" "}
                   <span className="underline">
                     {getValueByPath(recordsToDisplay[0], ["tt_status"]) ||
                       "N/A"}
                   </span>
                 </p>
               </div>
             </div>
           </div>
 
           {/* BF Check and Vital Signs tables - full width */}
           <div className="print-full-width space-y-4">
             <div className="print-table-container">
               <span className="print-table-title font-bold block mb-2">
                 Exclusive BF check:
               </span>
               <div className="overflow-x-auto">
                 <BFCheckTable
                   fullHistoryData={fullHistoryData}
                   chhistId={chhistId}
                 />
               </div>
             </div>
 
             <div className="print-table-container">
               <SupplementStatusTable
                 fullHistoryData={fullHistoryData}
                 chhistId={chhistId}
               />
             </div>
 
             <div className="print-table-container">
               <VitalSignsTable
                 fullHistoryData={fullHistoryData}
                 chhistId={chhistId}
               />
             </div>
           </div>
         </div></>} />
    </>
  );
}
