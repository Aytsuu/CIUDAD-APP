// "use client"

// import { forwardRef, useImperativeHandle } from "react"
// import { formatDate } from "@/helpers/dateHelper"
// import cityHealthLogo from "./logo/city-health-logo.svg"
// import officialSealCebu from "./logo/official-seal-cebu.svg"


// interface FamilyProfilePrintPreviewProps {
//   data: any
// }

// export type FamilyProfilePrintPreviewHandle = {
//   PrintForm: () => void
// }

// // Print-specific form field component
// const PrintFormField = ({
//   label,
//   value,
//   width = "auto",
// }: {
//   label: string
//   value: string | null
//   width?: string
// }) => {
//   const displayValue = value || ""

//   return (
//     <div className={`print-field ${width === "full" ? "w-full" : width === "half" ? "w-1/2" : "flex-1"}`}>
//       <div className="flex items-center gap-2">
//         <span className="text-xs font-medium">{label}:</span>
//         <div className="border-b border-gray-400 flex-1 min-h-[20px] text-xs px-1">{displayValue}</div>
//       </div>
//     </div>
//   )
// }

// const FamilyProfilePrintPreview = forwardRef<FamilyProfilePrintPreviewHandle, FamilyProfilePrintPreviewProps>(({ data }, ref) => {
//   const householdData = data.family_info.household
//   const familyMembers = data.family_members
//   const environmentalData = data.environmental_health
//   const ncdRecords = data.ncd_records || []
//   const tbRecords = data.tb_surveillance_records || []
//   const surveyData = data.survey_identification

//   // Helpers to normalize backend values for status fields
//   const isTruthyLike = (val: unknown) => {
//     if (val == null) return false
//     const s = String(val).trim().toLowerCase()
//     return ["yes", "true", "y", "1"].includes(s)
//   }

//   const isFalsyLike = (val: unknown) => {
//     if (val == null) return false
//     const s = String(val).trim().toLowerCase()
//     return ["no", "false", "n", "0"].includes(s)
//   }

//   const isNhts = (val: unknown) => {
//     if (val == null) return false
//     const s = String(val).trim().toLowerCase()
//     // Handle common variants
//     if (isTruthyLike(s)) return true
//     return (
//       s === "nhts" ||
//       s === "4ps" ||
//       s === "nhts (4ps)" ||
//       s === "nhts household" ||
//       s === "nhts4ps" ||
//       s === "yes (4ps)"
//     )
//   }

//   const isIndigenous = (val: unknown) => {
//     if (val == null) return false
//     const s = String(val).trim().toLowerCase()
//     if (isTruthyLike(s)) return true
//     return s === "ip" || s === "indigenous" || s === "indigenous people" || s === "indigenouspeoples"
//   }

//   // Normalize toilet facility shared/not-shared values from backend (sf_toilet_type)
//   const isSharedToilet = (val: unknown) => {
//     if (val == null) return false
//     const s = String(val).trim().toLowerCase()
//     // Consider variants like "shared", "shared with other household", and truthy-like yes
//     // Guard against "not shared" containing the word "shared"
//     if (s.includes("not shared") || s.includes("not-shared") || s.includes("exclusive")) return false
//     return s === "shared" || s.includes("shared with") || s.includes("shared") || isTruthyLike(s)
//   }

//   const isNotSharedToilet = (val: unknown) => {
//     if (val == null) return false
//     const s = String(val).trim().toLowerCase()
//     // Consider variants like "not shared", "exclusive use", and falsy-like no
//     return s === "not shared" || s.includes("not shared") || s.includes("exclusive") || isFalsyLike(s)
//   }

//   // Generic normalization utilities for robust, case-insensitive comparisons
//   const norm = (val: unknown) => (val == null ? "" : String(val).trim())
//   const lower = (val: unknown) => norm(val).toLowerCase()
//   const token = (val: unknown) => lower(val).replace(/[^a-z0-9]/g, "") // remove spaces, slashes, punctuation
//   const equalsCI = (a: unknown, b: unknown) => lower(a) === lower(b)
//   const equalsToken = (a: unknown, b: unknown) => token(a) === token(b)
//   const inSetCI = (val: unknown, set: string[]) => set.some((s) => equalsCI(val, s))
//   const inSetToken = (val: unknown, set: string[]) => set.some((s) => equalsToken(val, s))
//   const tokenIncludes = (val: unknown, sub: string) => token(val).includes(token(sub))

//   // Explicit negative classifiers
//   const isNonNhts = (val: unknown) => {
//     if (val == null) return false
//     const t = token(val)
//     return t === "nonnhts" || isFalsyLike(val)
//   }
//   const isNonIp = (val: unknown) => {
//     if (val == null) return false
//     const t = token(val)
//     return t === "nonip" || isFalsyLike(val)
//   }

//   // Sanitary facility classifier (sanitary vs unsanitary) based on facility_type
//   const SANITARY_TYPES = [
//     "sanitary",
//     "POUR/FLUSH WITH SEPTIC TANK",
//     "POUR/FLUSH CONNECTED TO SEPTIC TANK AND SEWERAGE SYSTEM",
//     "VENTILATED PIT (VIP) LATRINE",
//   ]
//   const UNSANITARY_TYPES = [
//     "unsanitary",
//     "WATER-SEALED TOILET WITHOUT SEPTIC TANK",
//     "OVERHUNG LATRINE",
//     "OPEN PIT LATRINE",
//     "WITHOUT TOILET",
//   ]
//   const classifySanitaryFacilityType = (val: unknown): "sanitary" | "unsanitary" | null => {
//     if (!val) return null
//     if (inSetToken(val, SANITARY_TYPES)) return "sanitary"
//     if (inSetToken(val, UNSANITARY_TYPES)) return "unsanitary"
//     return null
//   }

//   // Derive once for reuse
//   const sanitaryFacilityType = environmentalData?.sanitary_facility?.facility_type
//   const sanitaryFacilityDesc = environmentalData?.sanitary_facility?.description
//   const sanitaryClass = classifySanitaryFacilityType(sanitaryFacilityType)
//   const waterSupplyType = environmentalData?.water_supply?.type
//   // Be robust to different backend field names for solid waste
//   const wasteType = (
//     environmentalData?.waste_management?.type ??
//     environmentalData?.waste_management?.disposal_type ??
//     environmentalData?.waste_management?.waste_management_type ??
//     ""
//   )
//   const buildingType = data.family_info?.family_building
//   const toiletFacilityRaw = environmentalData?.sanitary_facility?.toilet_facility_type
//   const toiletShareStatus: "shared" | "not-shared" | null = (() => {
//     const s = lower(toiletFacilityRaw)
//     if (!s) return null
//     if (isNotSharedToilet(s)) return "not-shared"
//     if (isSharedToilet(s)) return "shared"
//     return null
//   })()

//   // Get household head (the resident that the household is registered to)
//   const householdHead =
//     data.family_info?.household?.head_resident ||
//     familyMembers.find((m: any) => m.is_household_head === true) ||
//     familyMembers.find((m: any) => m.role === "FATHER") ||
//     familyMembers.find((m: any) => m.role === "MOTHER") ||
//     familyMembers[0]

//   // Get father and mother data
//   const fatherData = familyMembers.find((m: any) => m.role === "FATHER")
//   const motherData = familyMembers.find((m: any) => m.role === "MOTHER")

//   // Children (members who are not FATHER or MOTHER)
//   const allChildren = familyMembers.filter((m: any) => !["FATHER", "MOTHER"].includes(m.role))

//   // Separate children by age groups
//   const childrenUnder5 = allChildren.filter((child: any) => {
//     if (!child.personal_info.date_of_birth) return false
//     const age = new Date().getFullYear() - new Date(child.personal_info.date_of_birth).getFullYear()
//     return age < 5
//   })

//   const childrenOver5 = allChildren.filter((child: any) => {
//     if (!child.personal_info.date_of_birth) return true // Include children without birth date in over 5
//     const age = new Date().getFullYear() - new Date(child.personal_info.date_of_birth).getFullYear()
//     return age >= 5
//   })

//   // Excel export removed per request

//   const exportToPDF = () => {
//     // Create a new window for printing
//     const printWindow = window.open("", "_blank")
//     if (!printWindow) {
//       alert("Please allow popups to export PDF")
//       return
//     }

//     // Get the current form HTML
//     const formContent = document.querySelector(".print-preview")?.innerHTML || ""

//     // Create the complete HTML document with all styles
//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <title>Family Profile Form - ${data.family_info.family_id}</title>
//         <style>
//           * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//           }
          
//           body {
//             font-family: Arial, sans-serif;
//             font-size: 12px;
//             line-height: 1.4;
//             color: black;
//             background: white;
//           }
          
//           .print-preview {
//             width: 8.5in;
//             min-height: 13in;
//             margin: 0 auto;
//             padding: 0.5in;
//             background: white;
//           }
          
//           /* Header styling */
//           .text-center { text-align: center; }
//           .text-left { text-align: left; }
//           .text-sm { font-size: 11px; }
//           .text-xs { font-size: 10px; }
//           .text-base { font-size: 12px; }
//           .text-xl { font-size: 18px; }
//           .font-bold { font-weight: bold; }
//           .font-medium { font-weight: 500; }
//           .italic { font-style: italic; }
          
//           /* Layout */
//           .flex { display: flex; }
//           .block { display: block; }
//           .inline { display: inline; }
//           .inline-block { display: inline-block; }
//           .inline-flex { display: inline-flex; }
//           .items-center { align-items: center; }
//           .justify-between { justify-content: space-between; }
//           .justify-center { justify-content: center; }
//           .flex-1 { flex: 1; }
//           .w-32 { width: 8rem; }
//           .h-32 { height: 8rem; }
//           .w-full { width: 100%; }
//           .w-1\\/2 { width: 50%; }
//           .w-80 { width: 20rem; }
          
//           /* Spacing */
//           .mb-1 { margin-bottom: 0.25rem; }
//           .mb-2 { margin-bottom: 0.5rem; }
//           .mb-3 { margin-bottom: 0.75rem; }
//           .mb-4 { margin-bottom: 1rem; }
//           .mb-6 { margin-bottom: 1.5rem; }
//           .mr-1 { margin-right: 0.25rem; }
//           .mr-2 { margin-right: 0.5rem; }
//           .mr-4 { margin-right: 1rem; }
//           .mr-8 { margin-right: 2rem; }
//           .ml-1 { margin-left: 0.25rem; }
//           .mt-1 { margin-top: 0.25rem; }
//           .mt-2 { margin-top: 0.5rem; }
//           .mt-4 { margin-top: 1rem; }
//           .mt-6 { margin-top: 1.5rem; }
//           .p-1 { padding: 0.25rem; }
//           .p-2 { padding: 0.5rem; }
//           .p-4 { padding: 1rem; }
//           .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
//           .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
//           .pr-8 { padding-right: 2rem; }
//           .pt-2 { padding-top: 0.5rem; }
//           .pb-2 { padding-bottom: 0.5rem; }
//           .pb-4 { padding-bottom: 1rem; }
          
//           /* Borders */
//           .border { border: 1px solid black; }
//           .border-2 { border: 2px solid black; }
//           .border-black { border-color: black; }
//           .border-gray-400 { border-color: #9ca3af; }
//           .border-b { border-bottom: 1px solid black; }
//           .border-t { border-top-width: 1px; border-right-width: 0; border-bottom-width: 0; border-left-width: 0; border-top-style: solid; }
//           .border-b-2 { border-bottom: 2px solid black; }
//           .border-t-1 { border-top: 1px solid black; }
//           .border-r { border-right: 1px solid black; }
//           .border-dotted { border-style: dotted; }
//           .border-dashed { border-style: dashed; }
          
//           /* Background */
//           .bg-gray-200 { background-color: #e5e7eb; }
//           .bg-white { background-color: white; }
          
//           /* Grid */
//           .grid { display: grid; }
//           .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
//           .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
//           .grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
//           .col-span-1 { grid-column: span 1 / span 1; }
//           .col-span-2 { grid-column: span 2 / span 2; }
//           .col-span-3 { grid-column: span 3 / span 3; }
//           .col-span-4 { grid-column: span 4 / span 4; }
//           .col-span-5 { grid-column: span 5 / span 5; }
//           .col-span-6 { grid-column: span 6 / span 6; }
//           .grid-rows-2 { grid-template-rows: repeat(2, minmax(0, 1fr)); }
//           .gap-1 { gap: 0.25rem; }
//           .gap-2 { gap: 0.5rem; }
//           .gap-4 { gap: 1rem; }
//           .gap-8 { gap: 2rem; }
          
//           /* Tables */
//           table {
//             width: 100%;
//             border-collapse: collapse;
//             font-size: 10px;
//           }
          
//           th, td {
//             border: 1px solid black;
//             padding: 4px;
//             text-align: left;
//             vertical-align: top;
//           }
          
//           th {
//             background-color: #f5f5f5;
//             font-weight: bold;
//             text-align: center;
//           }
          
//           /* Form fields */
//           .print-field {
//             margin-bottom: 0.5rem;
//           }
          
//           .print-field .border-b {
//             border-bottom: 1px solid #9ca3af;
//             min-height: 20px;
//             display: inline-block;
//             padding: 2px 4px;
//           }
          
//           /* Checkboxes */
//           input[type="checkbox"] {
//             margin-right: 4px;
//             transform: scale(1.2);
//           }

//           /* Checkbox label spacing for PDF */
//           label { display: inline-flex; align-items: center; margin-right: 0.75rem; margin-bottom: 0.25rem; }
//           .checkbox-row { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; }
          
//           /* Images */
//           img {
//             max-width: 100%;
//             height: auto;
//             object-fit: contain;
//           }
          
//           /* Specific form styling */
//           .space-y-2 > * + * { margin-top: 0.5rem; }
//           .space-y-3 > * + * { margin-top: 0.75rem; }
          
//           .min-h-\\[20px\\] { min-height: 20px; }
//           .min-h-\\[24px\\] { min-height: 24px; }
//           .h-8 { height: 2rem; }
//           .h-4 { height: 1rem; }
//           .h-6 { height: 1.5rem; }
//           .w-6 { width: 1.5rem; }
//           .w-8 { width: 2rem; }
//           .w-10 { width: 2.5rem; }
//           .w-12 { width: 3rem; }
//           .w-16 { width: 4rem; }
//           .w-20 { width: 5rem; }
//           .w-24 { width: 6rem; }
          
//           .leading-tight { line-height: 1.25; }
//           .leading-relaxed { line-height: 1.625; }
          
//           .object-contain { object-fit: contain; }
//           .object-bottom { object-position: bottom; }
          
//           .max-w-32 { max-width: 8rem; }
          
//           .text-justify { text-align: justify; }
          
//           .relative { position: relative; }
//           .absolute { position: absolute; }
//           .bottom-0 { bottom: 0; }
          
//           /* Print specific styles */
//           @media print {
//             @page {
//               size: 8.5in 13in;
//               margin: 0.5in;
//             }
            
//             body {
//               -webkit-print-color-adjust: exact;
//               print-color-adjust: exact;
//             }
            
//             .print-preview {
//               margin: 0;
//               padding: 0;
//               box-shadow: none;
//             }
            
//             .page-break {
//               page-break-before: always;
//               border-top: none;
//               margin: 0;
//               padding-top: 0;
//             }
//           }
          
//           .page-break {
//             border-top: 2px dashed #ccc;
//             margin: 20px 0;
//             padding-top: 20px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="print-preview">
//           ${formContent}
//         </div>
//         <script>
//           window.onload = function() {
//             setTimeout(function() {
//               window.print();
//               setTimeout(function() {
//                 window.close();
//               }, 1000);
//             }, 500);
//           }
//         </script>
//       </body>
//       </html>
//     `

//     printWindow.document.write(htmlContent)
//     printWindow.document.close()
//   }

//   // Expose methods to parent
//   useImperativeHandle(ref, () => ({
//     PrintForm: exportToPDF,
//   }))

//   return (
//     <div className="w-full">
//       {/* Export buttons moved to parent top bar */}

//       <div className="print-preview bg-white p-8 max-w-none">
//         {/* Header */}
//         <div className="text-center mb-6 border-b-2 border-black pb-4">
//           <div className="flex justify-between items-center">
//             <div className="w-32 h-32 flex items-center justify-center">
//               <img
//               src={cityHealthLogo || "/placeholder.svg"}
//               alt="City Health Logo"
//               className="w-full h-full object-contain"
//             />
//             </div>
//             <div className="flex-1 text-center">
//               <p className="text-sm font-bold font-canterbury">Republic of the Philippines</p>
//               <p className="text-base font-bold">City of Cebu</p>
//               <p className="text-base font-bold">CITY HEALTH DEPARTMENT</p>
//               <p className="text-xs">Gen. Maxilom Ave. Ext., Carreta, Cebu City, Philippines</p>
//               <p className="text-xs">Tel No.: (032) 414-5170, (032) 232-6969</p>
//               <p className="text-xs">Email add: cebucity.chd@gmail.com, chocommunication1022@gmail.com</p>
//             </div>
//             <div className="w-32 h-32 flex items-center justify-center">
//              <img
//               src={officialSealCebu || "/placeholder.svg"}
//               alt="Official Seal of Cebu"
//               className="w-full h-full object-contain"
//             />
//             </div>
//           </div>
//         </div>

//         {/* Title and Building Type */}
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-xl font-bold text-center flex-1">FAMILY Profile Form</h1>
//         </div>

//         {/* Health Center/ Station and Building Type */}
//         <div className="mb-4 space-y-3">
//           {/* Health Center/ Station */}
//           <div className="flex items-center">
//             <span className="text-sm font-bold mr-2">Health Center/ Station:</span>
//             <div className="border-b border-black flex-1 px-2 text-sm min-h-[24px] flex items-center">
//               {householdData?.address?.barangay || "San Roque"}
//             </div>
//           </div>

//           {/* Building Type */}
//           <div className="border border-black p-2">
//             <div className="flex items-center">
//               <span className="text-xs font-bold mr-4">Building Occupancy:</span>
//               <div className="flex items-center gap-4">
//                 <label className="flex items-center text-xs">
//                   <input type="checkbox" className="mr-1" checked={equalsCI(buildingType, "OWNER")} readOnly />
//                   OWNER
//                 </label>
//                 <label className="flex items-center text-xs">
//                   <input type="checkbox" className="mr-1" checked={equalsCI(buildingType, "RENTER")} readOnly />
//                   RENTER
//                 </label>
//                 <label className="flex items-center text-xs">
//                   <input
//                     type="checkbox"
//                     className="mr-1"
//                     checked={!!norm(buildingType) && !inSetCI(buildingType, ["OWNER", "RENTER"])}
//                     readOnly
//                   />
//                   OTHERS
//                   {/* If needed, render specific other type here */}
//                 </label>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Demographic Data Section */}
//         <div className="mb-6">
//           <h2 className="text-sm font-bold mb-3 bg-gray-200 p-1">DEMOGRAPHIC DATA</h2>

//           {/* Household and Quarter Information */}
//           <div className="grid grid-cols-3 gap-8 mb-4">
//             <div className="grid grid-rows-2 gap-2">
//               <PrintFormField label="Household No." value={householdData?.household_id} width="full" />
//               <PrintFormField label="Family No." value={data.family_info.family_id} width="full" />
//             </div>

//             <div className="flex gap-2 items-center">
//               <span className="text-xs">Quarter:</span>
//               <div className="flex gap-1">
//                 <label className="flex text-xs items-center">
//                   <input type="checkbox" className="mr-1" /> First (1st)
//                 </label>
//                 <label className="flex text-xs items-center">
//                   <input type="checkbox" className="mr-1" /> Second (2nd)
//                 </label>
//                 <label className="flex text-xs items-center">
//                   <input type="checkbox" className="mr-1" /> Third (3rd)
//                 </label>
//                 <label className="flex text-xs items-center">
//                   <input type="checkbox" className="mr-1" /> Fourth (4th)
//                 </label>
//               </div>
//             </div>

//             <div className="flex items-center">
//               <span className="text-xs">Date of Visit:</span>
//               <div className="flex gap-1">
//                 {surveyData?.date ? (
//                   (() => {
//                     const dateObj = new Date(surveyData.date)
//                     const month = String(dateObj.getMonth() + 1).padStart(2, "0")
//                     const day = String(dateObj.getDate()).padStart(2, "0")
//                     const year = String(dateObj.getFullYear())
//                     return (
//                       <>
//                         <input
//                           type="text"
//                           value={month.charAt(0)}
//                           readOnly
//                           className="border border-black w-6 h-4 text-center text-xs"
//                         />
//                         <input
//                           type="text"
//                           value={month.charAt(1)}
//                           readOnly
//                           className="border border-black w-6 h-4 text-center text-xs"
//                         />
//                         <span className="text-xs">/</span>
//                         <input
//                           type="text"
//                           value={day.charAt(0)}
//                           readOnly
//                           className="border border-black w-6 h-4 text-center text-xs"
//                         />
//                         <input
//                           type="text"
//                           value={day.charAt(1)}
//                           readOnly
//                           className="border border-black w-6 h-4 text-center text-xs"
//                         />
//                         <span className="text-xs">/</span>
//                         <input
//                           type="text"
//                           value={year}
//                           readOnly
//                           className="border border-black w-10 h-4 text-center text-xs"
//                         />
//                       </>
//                     )
//                   })()
//                 ) : (
//                   <>
//                     <input type="text" className="border border-black w-8 h-6 text-center text-xs" />
//                     <input type="text" className="border border-black w-8 h-6 text-center text-xs" />
//                     <span className="text-xs">/</span>
//                     <input type="text" className="border border-black w-8 h-6 text-center text-xs" />
//                     <input type="text" className="border border-black w-8 h-6 text-center text-xs" />
//                     <span className="text-xs">/</span>
//                     <input type="text" className="border border-black w-12 h-6 text-center text-xs" />
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//           {/* Address and Contact */}
//           <div className="space-y-2 mb-4">
//             <div className="flex gap-4">
//               <PrintFormField label="Respondent Name" value={surveyData?.informant || ""} width="half" />
//               <PrintFormField label="Contact Number" value={surveyData?.informant_contact || ""} width="half" />
//             </div>
//             <PrintFormField
//               label="Address"
//               value={`${householdData?.address?.street || ""}, ${householdData?.address?.sitio || ""}, ${householdData?.address?.barangay || ""}, ${householdData?.address?.city || ""}`}
//               width="full"
//             />

//             <div className="flex gap-4">
//               <PrintFormField
//                 label="Name of Household Head"
//                 value={
//                   householdHead
//                     ? `${householdHead.personal_info.last_name}, ${householdHead.personal_info.first_name} ${householdHead.personal_info.middle_name || ""}`.trim()
//                     : ""
//                 }
//                 width="half"
//               />
//               <PrintFormField label="Contact Number" value={householdHead?.personal_info.contact} width="half" />
//             </div>
//           </div>

//           {/* NHTS and Indigenous Status */}
//           <div className="flex gap-4 mb-4">
//             <div className="flex items-center gap-4">
//               <span className="text-xs font-bold">NHTS Household:</span>
//               <label className="flex items-center text-xs">
//                 <input
//                   type="checkbox"
//                   className="mr-1"
//                   checked={(() => {
//                     const raw = householdData?.nhts_status ?? householdData?.nhts
//                     if (raw == null || String(raw).trim() === "") return false
//                     return isNonNhts(raw)
//                   })()}
//                   readOnly
//                 />
//                 Non-NHTS
//               </label>
//               <label className="flex items-center text-xs">
//                 <input
//                   type="checkbox"
//                   className="mr-1"
//                   checked={(() => {
//                     const raw = householdData?.nhts_status ?? householdData?.nhts
//                     if (raw == null || String(raw).trim() === "") return false
//                     return isNhts(raw)
//                   })()}
//                   readOnly
//                 />
//                 NHTS (4Ps)
//               </label>
//             </div>
//             <div className="flex items-center gap-4">
//               <span className="text-xs font-bold">Indigenous People:</span>
//               <label className="flex items-center text-xs">
//                 <input
//                   type="checkbox"
//                   className="mr-1"
//                   checked={(() => {
//                     const raw = data.family_info.family_indigenous
//                     if (raw == null || String(raw).trim() === "") return false
//                     return isIndigenous(raw)
//                   })()}
//                   readOnly
//                 />{" "}
//                 IP
//               </label>
//               <label className="flex items-center text-xs">
//                 <input
//                   type="checkbox"
//                   className="mr-1"
//                   checked={(() => {
//                     const raw = data.family_info.family_indigenous
//                     if (raw == null || String(raw).trim() === "") return false
//                     return isNonIp(raw)
//                   })()}
//                   readOnly
//                 />{" "}
//                 Non-IP
//               </label>
//             </div>
//           </div>

//           {/* Father's Information */}
//           {fatherData && (
//             <div className="border border-black mb-4 p-2">
//               <h3 className="text-sm font-bold mb-2">Father's Information</h3>
//               <div className="grid grid-cols-6 gap-4 mb-2">
//                 <div className="col-span-3">
//                   <PrintFormField
//                     label="Father's Name"
//                     value={`${fatherData.personal_info.last_name}, ${fatherData.personal_info.first_name} ${fatherData.personal_info.middle_name || ""}`.trim()}
//                   />
//                 </div>
//                 <div className="col-span-1">
//                   <PrintFormField
//                     label="Age"
//                     value={
//                       fatherData.personal_info.date_of_birth
//                         ? `${new Date().getFullYear() - new Date(fatherData.personal_info.date_of_birth).getFullYear()}`
//                         : ""
//                     }
//                   />
//                 </div>
//                 <div className="col-span-2">
//                   <PrintFormField
//                     label="Birthday"
//                     value={
//                       fatherData.personal_info.date_of_birth
//                         ? formatDate(fatherData.personal_info.date_of_birth, "short")
//                         : ""
//                     }
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-3 gap-4 mb-2">
//                 <PrintFormField label="Civil Status" value={fatherData.personal_info.civil_status} />
//                 <PrintFormField label="Educational Attainment" value={fatherData.personal_info.education} />
//                 <PrintFormField label="Religion" value={fatherData.personal_info.religion} />
//               </div>
//               <div className="grid grid-cols-3 gap-4">
//                 <PrintFormField label="Blood Type" value={fatherData.health_details?.blood_type} />
//                 <PrintFormField
//                   label="PhilHealth ID"
//                   value={
//                     fatherData.per_additional_details?.per_add_philhealth_id ||
//                     fatherData.health_details?.philhealth_id ||
//                     ""
//                   }
//                 />
//                 <PrintFormField
//                   label="COVID Vaccination Status"
//                   value={
//                     fatherData.per_additional_details?.per_add_covid_vax_status ||
//                     fatherData.health_details?.covid_vax_status ||
//                     ""
//                   }
//                 />
//               </div>
//             </div>
//           )}

//           {/* Mother's Information */}
//           {motherData && (
//             <div className="border border-black mb-4 p-2">
//               <h3 className="text-sm font-bold mb-2">Mother's Information</h3>
//               <div className="grid grid-cols-6 gap-2 mb-2">
//                 <div className="col-span-3">
//                   <PrintFormField
//                     label="Mother's Name"
//                     value={`${motherData.personal_info.last_name}, ${motherData.personal_info.first_name} ${motherData.personal_info.middle_name || ""}`.trim()}
//                   />
//                 </div>
//                 <div className="col-span-1">
//                   <PrintFormField
//                     label="Age"
//                     value={
//                       motherData.personal_info.date_of_birth
//                         ? `${new Date().getFullYear() - new Date(motherData.personal_info.date_of_birth).getFullYear()}`
//                         : ""
//                     }
//                   />
//                 </div>
//                 <div className="col-span-2">
//                   <PrintFormField
//                     label="Birthday"
//                     value={
//                       motherData.personal_info.date_of_birth
//                         ? formatDate(motherData.personal_info.date_of_birth, "short")
//                         : ""
//                     }
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-3 gap-4 mb-2">
//                 <PrintFormField label="Civil Status" value={motherData.personal_info.civil_status} />
//                 <PrintFormField label="Educational Attainment" value={motherData.personal_info.education} />
//                 <PrintFormField label="Religion" value={motherData.personal_info.religion} />
//               </div>
//               <div className="grid grid-cols-3 gap-4 mb-2">
//                 <PrintFormField label="Blood Type" value={motherData.health_details?.blood_type} />
//                 <PrintFormField
//                   label="PhilHealth ID"
//                   value={
//                     motherData.per_additional_details?.per_add_philhealth_id ||
//                     motherData.health_details?.philhealth_id ||
//                     ""
//                   }
//                 />
//                 <PrintFormField
//                   label="COVID Vaccination Status"
//                   value={
//                     motherData.per_additional_details?.per_add_covid_vax_status ||
//                     motherData.health_details?.covid_vax_status ||
//                     ""
//                   }
//                 />
//               </div>

//               {/* Mother Health Info */}
//               {motherData.mother_health_info && (
//                 <div className="mt-4">
//                   <h4 className="text-xs font-bold mb-2">Health Risk Classification & Family Planning</h4>
//                   <div className="grid grid-cols-3 gap-4 mb-2">
//                     <PrintFormField
//                       label="LMP Date"
//                       value={
//                         motherData.mother_health_info.lmp_date
//                           ? formatDate(motherData.mother_health_info.lmp_date, "short")
//                           : ""
//                       }
//                     />
//                     <PrintFormField label="Health Risk Class" value={motherData.mother_health_info.health_risk_class} />
//                     <PrintFormField
//                       label="Immunization Status"
//                       value={motherData.mother_health_info.immunization_status}
//                     />
            
//                   </div>
//                   <div className="grid grid-cols-2 gap-4 mb-1">
//                     <PrintFormField
//                       label="Family Planning Method"
//                       value={motherData.mother_health_info.family_planning_method}
//                     />
//                     <PrintFormField
//                       label="Family Planning Source"
//                       value={motherData.mother_health_info.family_planning_source}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Children Under 5 Table */}
//         <div className="mb-6">
//           <h3 className="text-sm font-bold mb-2 bg-gray-200 p-1">MGA BATA/MGA 0-59 KA BULAN (Under five)</h3>
//           <table className="w-full border border-black text-xs">
//             <thead>
//               <tr className="border-b border-black">
//                 <th className="border-r border-black p-1 text-left">Pangalan (Magulang sa Magulang)</th>
//                 <th className="border-r border-black p-1">Kasarian (M/F)</th>
//                 <th className="border-r border-black p-1">Edad</th>
//                 <th className="border-r border-black p-1">Birthday (mm/dd/yy)</th>
//                 <th className="border-r border-black p-1">Relasyon sa HH Head</th>
//                 <th className="border-r border-black p-1">FIC (encircle)</th>
//                 <th className="border-r border-black p-1">Nutritional Status</th>
//                 <th className="p-1">Exclusive BF (encircle)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {childrenUnder5.map((child: any, index: number) => (
//                 <tr key={index} className="border-b border-black">
//                   <td className="border-r border-black p-1">
//                     {`${child.personal_info.last_name}, ${child.personal_info.first_name} ${child.personal_info.middle_name || ""}`.trim()}
//                   </td>
//                   <td className="border-r border-black p-1 text-center">{child.personal_info.sex}</td>
//                   <td className="border-r border-black p-1 text-center">
//                     {child.personal_info.date_of_birth
//                       ? new Date().getFullYear() - new Date(child.personal_info.date_of_birth).getFullYear()
//                       : ""}
//                   </td>
//                   <td className="border-r border-black p-1 text-center">
//                     {child.personal_info.date_of_birth ? formatDate(child.personal_info.date_of_birth, "short") : ""}
//                   </td>
//                   <td className="border-r border-black p-1 text-center">{norm(child.health_details?.relationship_to_hh_head) || 'NONE'}</td>
//                   <td className="border-r border-black p-1 text-center">{child.under_five?.fic || ''}</td>
//                   <td className="border-r border-black p-1 text-center">{child.under_five?.nutritional_status || ''}</td>
//                   <td className="p-1 text-center">{child.under_five?.exclusive_bf || ''}</td>
//                 </tr>
//               ))}
//               {Array.from({ length: Math.max(0, 3 - childrenUnder5.length) }).map((_, i) => (
//                 <tr key={`u5-empty-${i}`} className="border-b border-black">
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="p-1">&nbsp;</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Children Over 5 Table */}
//         <div className="mb-6">
//           <h3 className="text-sm font-bold mb-2 bg-gray-200 p-1">MGA BATA/ANAk NGA 5 KA TUIG PATAAS (Over 5)</h3>
//           <table className="w-full border border-black text-xs">
//             <thead>
//               <tr className="border-b border-black">
//                 <th className="border-r border-black p-1 text-left">Pangalan (Magulang sa Magulang)</th>
//                 <th className="border-r border-black p-1">Kasarian (M/F)</th>
//                 <th className="border-r border-black p-1">Edad</th>
//                 <th className="border-r border-black p-1">Birthday (mm/dd/yy)</th>
//                 <th className="border-r border-black p-1">Relasyon sa HH Head</th>
//                 <th className="border-r border-black p-1">Blood Type</th>
//                 <th className="border-r border-black p-1">Covid Vax Status</th>
//                 <th className="p-1">Philhealth ID No.</th>
//               </tr>
//             </thead>
//             <tbody>
//               {childrenOver5.map((child: any, index: number) => (
//                 <tr key={index} className="border-b border-black">
//                   <td className="border-r border-black p-1">
//                     {`${child.personal_info.last_name}, ${child.personal_info.first_name} ${child.personal_info.middle_name || ""}`.trim()}
//                   </td>
//                   <td className="border-r border-black p-1 text-center">{child.personal_info.sex}</td>
//                   <td className="border-r border-black p-1 text-center">
//                     {child.personal_info.date_of_birth
//                       ? new Date().getFullYear() - new Date(child.personal_info.date_of_birth).getFullYear()
//                       : ""}
//                   </td>
//                   <td className="border-r border-black p-1 text-center">
//                     {child.personal_info.date_of_birth ? formatDate(child.personal_info.date_of_birth, "short") : ""}
//                   </td>
//                   <td className="border-r border-black p-1 text-center">{norm(child.health_details?.relationship_to_hh_head) || 'NONE'}</td>
//                   <td className="border-r border-black p-1 text-center">{child.health_details?.blood_type || ""}</td>
//                   <td className="border-r border-black p-1 text-center">
//                     {child.per_additional_details?.per_add_covid_vax_status || child.health_details?.covid_vax_status || ""}
//                   </td>
//                   <td className="p-1 text-center">{child.per_additional_details?.per_add_philhealth_id || child.health_details?.philhealth_id || ""}</td>
//                 </tr>
//               ))}
//               {Array.from({ length: Math.max(0, 3 - childrenOver5.length) }).map((_, i) => (
//                 <tr key={`o5-empty-${i}`} className="border-b border-black">
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="p-1">&nbsp;</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Page Break - Start of Page 2 */}
//         <div className="page-break"></div>

//         {/* Environmental Health Section */}
//         <div className="mb-6">
//           <h2 className="text-sm font-bold mb-3 bg-gray-200 p-1">ENVIRONMENTAL HEALTH AND SANITATION</h2>

//           {/* Water Supply */}
//           <div className="mb-4">
//             <h3 className="text-sm font-bold mb-2">TYPE OF WATER SUPPLY</h3>
//             <div className="grid grid-cols-3 gap-4 border border-black p-2">
//               <div>
//                 <div className="font-bold text-xs mb-1">LEVEL I</div>
//                 <div className="text-xs">POINT SOURCE</div>
//                 <div className="text-xs mt-1">
//                   <label className="block">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={equalsToken(waterSupplyType, "LEVEL I")}
//                       readOnly
//                     />
//                     Dug well protected/improved artesian or dug well without distribution/piping system supplying within
//                     50 meters
//                   </label>
//                 </div>
//               </div>
//               <div>
//                 <div className="font-bold text-xs mb-1">LEVEL II</div>
//                 <div className="text-xs">COMMUNAL FAUCET OR STAND POST</div>
//                 <div className="text-xs mt-1">
//                   <label className="block">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={equalsToken(waterSupplyType, "LEVEL II")}
//                       readOnly
//                     />
//                     Piped water source with distribution system to a communal faucet or standpost supplying within 25
//                     meter radius
//                   </label>
//                 </div>
//               </div>
//               <div>
//                 <div className="font-bold text-xs mb-1">LEVEL III</div>
//                 <div className="text-xs">INDIVIDUAL CONNECTION</div>
//                 <div className="text-xs mt-1">
//                   <label className="block">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={equalsToken(waterSupplyType, "LEVEL III")}
//                       readOnly
//                     />
//                     Piped water system with household taps supplied by MCWD, BWSA, Homeowners' Assoc/Subdivision
//                   </label>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sanitary Facility */}
//           <div className="mb-4">
//             <h3 className="text-sm font-bold mb-2">TYPE OF SANITARY FACILITY</h3>
//             <div className="border border-black p-2">
//               {/* Table Headers with checkboxes */}
//               <div className="grid grid-cols-2 gap-4 mb-3 border-b border-black pb-2">
//                 <div className="text-center">
//                   <label className="flex items-center justify-center text-xs font-bold">
//                     <input type="checkbox" className="mr-2" checked={sanitaryClass === "sanitary"} readOnly />
//                     SANITARY
//                   </label>
//                 </div>
//                 <div className="text-center">
//                   <label className="flex items-center justify-center text-xs font-bold">
//                     <input type="checkbox" className="mr-2" checked={sanitaryClass === "unsanitary"} readOnly />
//                     UNSANITARY
//                   </label>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={
//                         equalsToken(sanitaryFacilityDesc, "POUR/FLUSH TYPE WITH SEPTIC TANK") ||
//                         equalsToken(sanitaryFacilityType, "POUR/FLUSH TYPE WITH SEPTIC TANK")
//                       }
//                       readOnly
//                     />
//                     Pour/flush type with septic tank
//                   </label>
//                   <label className="block text-xs">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={
//                         equalsToken(sanitaryFacilityDesc, "POUR/FLUSH TOILET CONNECTED TO SEPTIC TANK AND TO SEWERAGE SYSTEM") ||
//                         equalsToken(sanitaryFacilityType, "POUR/FLUSH TOILET CONNECTED TO SEPTIC TANK AND TO SEWERAGE SYSTEM")
//                       }
//                       readOnly
//                     />
//                     Pour/flush toilet connected to septic tank AND to sewerage system
//                   </label>
//                   <label className="block text-xs">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={
//                         equalsToken(sanitaryFacilityDesc, "VENTILATED PIT (VIP) LATRINE") ||
//                         equalsToken(sanitaryFacilityType, "VENTILATED PIT (VIP) LATRINE")
//                       }
//                       readOnly
//                     />
//                     Ventilated Pit (VIP) Latrine
//                   </label>
//                 </div>
//                 <div>
//                   <label className="block text-xs">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={
//                         equalsToken(sanitaryFacilityDesc, "WATER-SEALED TOILET WITHOUT SEPTIC TANK") ||
//                         equalsToken(sanitaryFacilityType, "WATER-SEALED TOILET WITHOUT SEPTIC TANK")
//                       }
//                       readOnly
//                     />
//                     Water-sealed toilet without septic tank
//                   </label>
//                   <label className="block text-xs">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={
//                         equalsToken(sanitaryFacilityDesc, "OVERHUNG LATRINE") ||
//                         equalsToken(sanitaryFacilityType, "OVERHUNG LATRINE")
//                       }
//                       readOnly
//                     />
//                     Overhung latrine
//                   </label>
//                   <label className="block text-xs">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={
//                         equalsToken(sanitaryFacilityDesc, "OPEN PIT LATRINE") ||
//                         equalsToken(sanitaryFacilityType, "OPEN PIT LATRINE")
//                       }
//                       readOnly
//                     />
//                     Open Pit Latrine
//                   </label>
//                   <label className="block text-xs">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={
//                         equalsToken(sanitaryFacilityDesc, "WITHOUT TOILET") ||
//                         equalsToken(sanitaryFacilityType, "WITHOUT TOILET")
//                       }
//                       readOnly
//                     />
//                     Without toilet
//                   </label>
//                 </div>
//               </div>
//               <div className="mt-2 text-xs">
//                 Is Toilet
//                 <label className="ml-2">
//                   <input type="checkbox" className="mr-1" checked={toiletShareStatus === "not-shared"} readOnly />
//                   NOT SHARED with Other Household
//                 </label>
//                 or
//                 <label className="ml-2">
//                   <input type="checkbox" className="mr-1" checked={toiletShareStatus === "shared"} readOnly />
//                   SHARED with Other Household
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* Solid Waste Management */}
//           <div className="mb-4">
//             <h3 className="text-sm font-bold mb-2">SOLID WASTE MANAGEMENT</h3>
//             <div className="border border-black p-2">
//               <div className="grid grid-cols-3 gap-4 text-xs">
//                 <div>
//                   <label className="block">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={equalsToken(wasteType, "WASTE SEGREGATION")}
//                       readOnly
//                     />
//                     Waste Segregation
//                   </label>
//                   <label className="block">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={equalsToken(wasteType, "BACKYARD COMPOSTING")}
//                       readOnly
//                     />
//                     Backyard Composting
//                   </label>
//                 </div>
//                 <div>
//                   <label className="block">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={
//                         // Accept either "RECYCLING" or "RECYCLING/REUSE" saved values
//                         equalsToken(wasteType, "RECYCLING/REUSE") ||
//                         equalsToken(wasteType, "RECYCLING")
//                       }
//                       readOnly
//                     />
//                     Recycling/Reuse
//                   </label>
//                   <label className="block">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={
//                         equalsToken(wasteType, "COLLECTED BY CITY COLLECTION AND DISPOSAL SYSTEM") ||
//                         tokenIncludes(wasteType, "collectedbycity")
//                       }
//                       readOnly
//                     />
//                     Collected by City Collection and Disposal System
//                   </label>
//                 </div>
//                 <div>
//                   <label className="block">
//                     <input
//                       type="checkbox"
//                       className="mr-1"
//                       checked={equalsToken(wasteType, "BURNING/BURYING")}
//                       readOnly
//                     />
//                     Burning/Burying
//                   </label>
//                   <label className="block">
//                     <input type="checkbox" className="mr-1" checked={equalsToken(wasteType, "OTHERS")} readOnly />
//                     Others (pls. specify):{" "}
//                     {equalsToken(wasteType, "OTHERS") && environmentalData?.waste_management?.description && (
//                       <span className="border-b border-black px-1">
//                         {environmentalData.waste_management.description}
//                       </span>
//                     )}
//                   </label>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* NCD Section */}
//         <div className="mb-6">
//           <h3 className="text-sm font-bold mb-2 bg-gray-200 p-1">NON-COMMUNICABLE DISEASE</h3>
//           <table className="w-full border border-black text-xs">
//             <thead>
//               <tr className="border-b border-black">
//                 <th className="border-r border-black p-1">Pangalan</th>
//                 <th className="border-r border-black p-1">Edad</th>
//                 <th className="border-r border-black p-1">Kasarian</th>
//                 <th className="border-r border-black p-1">Risk Class (40+ years)</th>
//                 <th className="border-r border-black p-1">Comorbidities</th>
//                 <th className="border-r border-black p-1">Lifestyle Risk</th>
//                 <th className="p-1">In Maintenance</th>
//               </tr>
//             </thead>
//             <tbody>
//               {ncdRecords.map((ncd: any, index: number) => (
//                 <tr key={index} className="border-b border-black">
//                   <td className="border-r border-black p-1">{`${ncd.resident_info.personal_info.last_name}, ${ncd.resident_info.personal_info.first_name}`}</td>
//                   <td className="border-r border-black p-1 text-center">
//                     {ncd.resident_info.personal_info.date_of_birth
//                       ? new Date().getFullYear() - new Date(ncd.resident_info.personal_info.date_of_birth).getFullYear()
//                       : ""}
//                   </td>
//                   <td className="border-r border-black p-1 text-center">{ncd.resident_info.personal_info.sex}</td>
//                   <td className="border-r border-black p-1 text-center">{ncd.health_data.risk_class_age_group}</td>
//                   <td className="border-r border-black p-1 text-center">{`${ncd.health_data.comorbidities || ''}${ncd.health_data.comorbidities_others ? ` (${ncd.health_data.comorbidities_others})` : ''}`}</td>
//                   <td className="border-r border-black p-1 text-center">{`${ncd.health_data.lifestyle_risk || ''}${ncd.health_data.lifestyle_risk_others ? ` (${ncd.health_data.lifestyle_risk_others})` : ''}`}</td>
//                   <td className="p-1 text-center">{
//                     (() => {
//                       const raw = ncd?.health_data?.in_maintenance ?? ncd?.ncd_maintenance_status ?? ncd?.health_data?.maintenance_status
//                       if (raw == null || String(raw).trim() === '') return ''
//                       const s = String(raw).trim().toLowerCase()
//                       if (["yes","y","true","1"].includes(s)) return "YES"
//                       if (["no","n","false","0"].includes(s)) return "NO"
//                       return String(raw)
//                     })()
//                   }</td>
//                 </tr>
//               ))}
//               {Array.from({ length: Math.max(0, 3 - ncdRecords.length) }).map((_, i) => (
//                 <tr key={`ncd-empty-${i}`} className="border-b border-black">
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="p-1">&nbsp;</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* TB Surveillance Section */}
//         <div className="mb-6">
//           <h3 className="text-sm font-bold mb-2 bg-gray-200 p-1">TUBERCULOSIS SURVEILLANCE</h3>
//           <table className="w-full border border-black text-xs">
//             <thead>
//               <tr className="border-b border-black">
//                 <th className="border-r border-black p-1">Pangalan</th>
//                 <th className="border-r border-black p-1">Edad</th>
//                 <th className="border-r border-black p-1">Kasarian (M/F)</th>
//                 <th className="border-r border-black p-1">Source of Anti-TB Meds</th>
//                 <th className="border-r border-black p-1">No. of Days on Anti-TB Meds</th>
//                 <th className="p-1">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {tbRecords.map((tb: any, index: number) => (
//                 <tr key={index} className="border-b border-black">
//                   <td className="border-r border-black p-1">{`${tb.resident_info.personal_info.last_name}, ${tb.resident_info.personal_info.first_name}`}</td>
//                   <td className="border-r border-black p-1 text-center">
//                     {tb.resident_info.personal_info.date_of_birth
//                       ? new Date().getFullYear() - new Date(tb.resident_info.personal_info.date_of_birth).getFullYear()
//                       : ""}
//                   </td>
//                   <td className="border-r border-black p-1 text-center">{tb.resident_info.personal_info.sex}</td>
//                   <td className="border-r border-black p-1 text-center">{tb.health_data.src_anti_tb_meds}</td>
//                   <td className="border-r border-black p-1 text-center">{tb.health_data.no_of_days_taking_meds}</td>
//                   <td className="p-1 text-center">{tb.health_data.tb_status}</td>
//                 </tr>
//               ))}
//               {Array.from({ length: Math.max(0, 3 - tbRecords.length) }).map((_, i) => (
//                 <tr key={`tb-empty-${i}`} className="border-b border-black">
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="border-r border-black p-1">&nbsp;</td>
//                   <td className="p-1">&nbsp;</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Survey Identification Section - Exact layout from scanned form */}
//         <div className="mb-6">
//           <div className="border-t-1 border-black pt-2 mb-4">
//             <h3 className="text-sm font-bold mb-4">SURVEY IDENTIFICATION</h3>
//           </div>

//           <div className="flex">
//             {/* Left side: Form fields with improved typewriter styling */}
//             <div className="flex-1 pr-8">
//               {/* Filed by row */}
//               <div className="mb-6">
//                 <div className="flex items-center">
//                   <span className="text-sm font-medium mr-2 w-24">Profiled by:</span>
//                   <div className="flex-1 mr-8 relative">
//                     <div className="text-sm text-center py-1 min-h-[24px]">{surveyData?.filled_by || ""}</div>
//                     <div
//                       className="w-full absolute bottom-0 h-px border-t border-dashed border-black"
//                     ></div>
//                   </div>
//                   <span className="text-sm font-medium">B/CHW</span>
//                 </div>
//               </div>

//               {/* Conforme row */}
//               <div className="mb-6">
//                 <div className="flex items-center">
//                   <span className="text-sm font-medium mr-2 w-24">Conforme:</span>
//                   <div className="flex-1 mr-8 relative">
//                     <div className="flex flex-col items-center justify-center">
//                       {/* Signature area */}
//                       <div className="h-8 w-full flex justify-center items-end">
//                         {surveyData?.signature ? (
//                           <img
//                             src={surveyData.signature || "/placeholder.svg"}
//                             alt="Signature"
//                             className="h-full max-w-32 object-contain object-bottom"
//                           />
//                         ) : (
//                           <svg className="w-24 h-5 text-black" viewBox="0 0 100 30">
//                             <path
//                               d="M10,20 C20,5 30,35 40,20 C50,5 60,35 70,20 C80,5 90,20 95,15"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth="2"
//                             />
//                           </svg>
//                         )}
//                       </div>
//                       {/* Name area */}
//                       <div className="text-sm text-center mt-1">{surveyData?.informant || "WELZON ENTERA"}</div>
//                     </div>
//                     <div className="w-full absolute bottom-0 h-px border-t border-dashed border-black"></div>
//                   </div>
//                   <div className="text-sm font-medium text-center leading-tight">
//                     <div>Informant</div>
//                     <div>(Name & Signature)</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Checked by row */}
//               <div className="mb-6">
//                 <div className="flex items-center">
//                   <span className="text-sm font-medium mr-2 w-20">Checked by (RN/RM):</span>
//                   <div className="flex-1 relative">
//                     <div className="text-sm text-center py-1 min-h-[24px]">{surveyData?.checked_by || ""}</div>
//                     <div className="w-full absolute bottom-0 h-px border-t border-dashed border-black"></div>
//                   </div>
//                 </div>
//               </div>

//               {/* Date row */}
//               <div className="mb-6">
//                 <div className="flex items-center">
//                   <span className="text-sm font-medium mr-2 w-16">Date:</span>
//                   <div className="flex-1 relative">
//                     <div className="text-sm text-center py-1 min-h-[24px]">
//                       {surveyData?.date ? formatDate(surveyData.date, "short") : ""}
//                     </div>
//                     <div className="w-full absolute bottom-0 h-px border-t border-dashed border-black"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right side: PSA definition box with exact styling */}
//               <div className="w-80">
//               <div className="border border-dashed border-black p-4 text-sm leading-relaxed bg-white">
//                 <p className="mb-4 text-justify">
//                   <span className="font-bold">Household </span>
//                   as defined by the Philippine Statistical Authority (PSA) is a{" "}
//                   <span className="italic font-medium">social unit</span> consisting of a person living alone or a group
//                   of persons who sleep in the same housing unit and have a common arrangement in the preparation and
//                   consumption of food.
//                 </p>
//                 <div className="text-center mt-6 pt-2 border-t border-dashed border-black">
//                   <div className="text-xs leading-tight">
//                     <div className="mb-1">
//                       <span className="font-bold">-</span>{" "}
//                       <span className="italic justify-normal">Manual on Field Health Services Information</span>
//                     </div>
//                     <div className="italic">
//                       <span className="font-medium justify-start">(FHSIS)</span> ver. 2018 Department of Health
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Export buttons moved to parent top bar */}

//         {/* Print styles for 8.5" x 13" bond paper */}
//         <style>{`
//           @media print {
//             /* Print only the preview area */
//             body * { visibility: hidden; }
//             .print-preview, .print-preview * { visibility: visible; }
//             .print-preview { position: absolute; left: 0; top: 0; }
//             .no-print { display: none !important; }

//             @page {
//               size: 8.5in 13in;
//               margin: 0.5in;
//             }
//             .print-preview {
//               margin: 0;
//               padding: 0;
//               font-size: 10px;
//               width: 100%;
//               max-width: none;
//             }
//             .print-field {
//               break-inside: avoid;
//             }
//             table {
//               break-inside: auto;
//             }
//             tr {
//               break-inside: avoid;
//               break-after: auto;
//             }
//             .page-break {
//               page-break-before: always;
//             }
//             .page-1 {
//               page-break-after: always;
//             }
//           }
          
//           /* Screen view styling for long bond paper */
//           .print-preview {
//             width: 8.5in;
//             min-height: 13in;
//             margin: 0 auto;
//             box-shadow: 0 0 10px rgba(0,0,0,0.1);
//           }
          
//           .page-break {
//             border-top: 2px dashed #ccc;
//             margin: 20px 0;
//             padding-top: 20px;
//           }
//         `}</style>
//       </div>
//     </div>
//   )
// })

// export default FamilyProfilePrintPreview
