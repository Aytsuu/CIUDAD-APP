"use client"

import { forwardRef, useImperativeHandle } from "react"
import Header from "./print/Header"
import DemographicData from "./print/DemographicData"
import EnvironmentalHealth from "./print/EnvironmentalHealth"
import MedicalRecords from "./print/MedicalRecords"
import SurveyIdentification from "./print/SurveyIdentification"
import { 
  FamilyProfilePrintPreviewProps, 
  FamilyProfilePrintPreviewHandle, 
  getDerivedData,
  PRINT_STYLES
} from "./print/utils"

const FamilyProfilePrintPreview = forwardRef<FamilyProfilePrintPreviewHandle, FamilyProfilePrintPreviewProps>(({ data }, ref) => {
  // Extract all derived data using the utility function
  const {
    householdData,
    environmentalData,
    ncdRecords,
    tbRecords,
    surveyData,
    sanitaryFacilityType,
    sanitaryFacilityDesc,
    sanitaryClass,
    waterSupplyType,
    wasteType,
    buildingType,
    toiletShareStatus,
    householdHead,
    fatherData,
    motherData,
    childrenUnder5,
    childrenOver5,
  } = getDerivedData(data)

  // Excel export removed per request

  const exportToPDF = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow popups to export PDF")
      return
    }

    // Get the current form HTML
    const formContent = document.querySelector(".print-preview")?.innerHTML || ""

    // Create the complete HTML document with all styles
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Family Profile Form - ${data.family_info.family_id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: black;
            background: white;
          }
          
          .print-preview {
            width: 8.5in;
            min-height: 13in;
            margin: 0 auto;
            padding: 0.5in;
            background: white;
          }
          
          /* Header styling */
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-sm { font-size: 11px; }
          .text-xs { font-size: 10px; }
          .text-base { font-size: 12px; }
          .text-xl { font-size: 18px; }
          .font-bold { font-weight: bold; }
          .font-medium { font-weight: 500; }
          .italic { font-style: italic; }
          
          /* Layout */
          .flex { display: flex; }
          .block { display: block; }
          .inline { display: inline; }
          .inline-block { display: inline-block; }
          .inline-flex { display: inline-flex; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
          .flex-1 { flex: 1; }
          .w-32 { width: 8rem; }
          .h-32 { height: 8rem; }
          .w-full { width: 100%; }
          .w-1\\/2 { width: 50%; }
          .w-80 { width: 20rem; }
          
          /* Spacing */
          .mb-1 { margin-bottom: 0.25rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mr-1 { margin-right: 0.25rem; }
          .mr-2 { margin-right: 0.5rem; }
          .mr-4 { margin-right: 1rem; }
          .mr-8 { margin-right: 2rem; }
          .ml-1 { margin-left: 0.25rem; }
          .mt-1 { margin-top: 0.25rem; }
          .mt-2 { margin-top: 0.5rem; }
          .mt-4 { margin-top: 1rem; }
          .mt-6 { margin-top: 1.5rem; }
          .p-1 { padding: 0.25rem; }
          .p-2 { padding: 0.5rem; }
          .p-4 { padding: 1rem; }
          .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          .pr-8 { padding-right: 2rem; }
          .pt-2 { padding-top: 0.5rem; }
          .pb-2 { padding-bottom: 0.5rem; }
          .pb-4 { padding-bottom: 1rem; }
          
          /* Borders */
          .border { border: 1px solid black; }
          .border-2 { border: 2px solid black; }
          .border-black { border-color: black; }
          .border-gray-400 { border-color: #9ca3af; }
          .border-b { border-bottom: 1px solid black; }
          .border-t { border-top-width: 1px; border-right-width: 0; border-bottom-width: 0; border-left-width: 0; border-top-style: solid; }
          .border-b-2 { border-bottom: 2px solid black; }
          .border-t-1 { border-top: 1px solid black; }
          .border-r { border-right: 1px solid black; }
          .border-dotted { border-style: dotted; }
          .border-dashed { border-style: dashed; }
          
          /* Background */
          .bg-gray-200 { background-color: #e5e7eb; }
          .bg-white { background-color: white; }
          
          /* Grid */
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
          .col-span-1 { grid-column: span 1 / span 1; }
          .col-span-2 { grid-column: span 2 / span 2; }
          .col-span-3 { grid-column: span 3 / span 3; }
          .col-span-4 { grid-column: span 4 / span 4; }
          .col-span-5 { grid-column: span 5 / span 5; }
          .col-span-6 { grid-column: span 6 / span 6; }
          .grid-rows-2 { grid-template-rows: repeat(2, minmax(0, 1fr)); }
          .gap-1 { gap: 0.25rem; }
          .gap-2 { gap: 0.5rem; }
          .gap-4 { gap: 1rem; }
          .gap-8 { gap: 2rem; }
          
          /* Tables */
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          
          th, td {
            border: 1px solid black;
            padding: 4px;
            text-align: left;
            vertical-align: top;
          }
          
          th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
          }
          
          /* Form fields */
          .print-field {
            margin-bottom: 0.5rem;
          }
          
          .print-field .border-b {
            border-bottom: 1px solid #9ca3af;
            min-height: 20px;
            display: inline-block;
            padding: 2px 4px;
          }
          
          /* Checkboxes */
          input[type="checkbox"] {
            margin-right: 4px;
            transform: scale(1.2);
          }

          /* Checkbox label spacing for PDF */
          label { display: inline-flex; align-items: center; margin-right: 0.75rem; margin-bottom: 0.25rem; }
          .checkbox-row { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; }
          
          /* Images */
          img {
            max-width: 100%;
            height: auto;
            object-fit: contain;
          }
          
          /* Specific form styling */
          .space-y-2 > * + * { margin-top: 0.5rem; }
          .space-y-3 > * + * { margin-top: 0.75rem; }
          
          .min-h-\\[20px\\] { min-height: 20px; }
          .min-h-\\[24px\\] { min-height: 24px; }
          .h-8 { height: 2rem; }
          .h-4 { height: 1rem; }
          .h-6 { height: 1.5rem; }
          .w-6 { width: 1.5rem; }
          .w-8 { width: 2rem; }
          .w-10 { width: 2.5rem; }
          .w-12 { width: 3rem; }
          .w-16 { width: 4rem; }
          .w-20 { width: 5rem; }
          .w-24 { width: 6rem; }
          
          .leading-tight { line-height: 1.25; }
          .leading-relaxed { line-height: 1.625; }
          
          .object-contain { object-fit: contain; }
          .object-bottom { object-position: bottom; }
          
          .max-w-32 { max-width: 8rem; }
          
          .text-justify { text-align: justify; }
          
          .relative { position: relative; }
          .absolute { position: absolute; }
          .bottom-0 { bottom: 0; }
          
          /* Print specific styles */
          @media print {
            @page {
              size: 8.5in 13in;
              margin: 0.5in;
            }
            
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .print-preview {
              margin: 0;
              padding: 0;
              box-shadow: none;
            }
            
            .page-break {
              page-break-before: always;
              border-top: none;
              margin: 0;
              padding-top: 0;
            }
          }
          
          .page-break {
            border-top: 2px dashed #ccc;
            margin: 20px 0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="print-preview">
          ${formContent}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 500);
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    PrintForm: exportToPDF,
  }))

  return (
    <div className="w-full">
      {/* Export buttons moved to parent top bar */}

      <div className="print-preview bg-white p-8 max-w-none">
        <Header householdData={householdData} buildingType={buildingType} />
        
        <DemographicData 
          data={data}
          householdData={householdData}
          householdHead={householdHead}
          fatherData={fatherData}
          motherData={motherData}
          childrenUnder5={childrenUnder5}
          childrenOver5={childrenOver5}
          surveyData={surveyData}
        />

        {/* Page Break - Start of Page 2 */}
        <div className="page-break"></div>

        <EnvironmentalHealth 
          waterSupplyType={waterSupplyType}
          sanitaryClass={sanitaryClass}
          sanitaryFacilityType={sanitaryFacilityType}
          sanitaryFacilityDesc={sanitaryFacilityDesc}
          toiletShareStatus={toiletShareStatus}
          wasteType={wasteType}
          environmentalData={environmentalData}
        />

        <MedicalRecords 
          ncdRecords={ncdRecords} 
          tbRecords={tbRecords} 
        />

        <SurveyIdentification surveyData={surveyData} />

        {/* Print styles for 8.5" x 13" bond paper */}
        <style>{PRINT_STYLES}</style>
      </div>
    </div>
  )
})

export default FamilyProfilePrintPreview