

import { Printer } from "lucide-react";
import {useRef} from "react";


export const handlePrint = () => {
    const printRef = useRef<HTMLDivElement>(null);

    if (!printRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = printRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient Record</title>
          <style>
            @page {
              size: 8.5in 13in;
              margin: 0.5in;
            }

            * {
              box-sizing: border-box;
            }

            body {
              background: white;
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 9pt;
              line-height: 1.2;
              color: black;
            }

            /* Typography */
            h3 {
              font-size: 10pt;
              font-weight: bold;
              color: black;
              text-align: center;
              margin-bottom: 8pt;
            }

            h5 {
              font-size: 9pt;
              font-weight: bold;
              margin-bottom: 4pt;
              text-align: center;
              padding-bottom: 8pt;
            }

            span {
              font-size: 8pt;
            }

            /* Layout Classes */
            .grid {
              display: grid;
            }

            .grid-cols-1 {
              grid-template-columns: 1fr;
            }

            .grid-cols-2 {
              grid-template-columns: 1fr 1fr;
              gap: 16pt;
            }

           

            .flex {
              display: flex;
            }

            .flex-col {
              flex-direction: column;
            }

            .flex-row {
              flex-direction: row;
            }

            .items-baseline {
              align-items: baseline;
            }

            .gap-2 > * + * {
              margin-left: 4pt;
            }

            .flex-1 {
              flex: 1;
            }

            .min-w-0 {
              min-width: 0;
            }

            /* Spacing */
            .space-y-4 > * + * {
              margin-top: 16pt;
            }

          

            .space-y-2 > * + * {
              margin-top: 8pt;
            }

            /* Margins */
            .mb-6 {
              margin-bottom: 24pt;
            }

            .mb-8 {
              margin-bottom: 32pt;
            }

            .mb-10 {
              margin-bottom: 40pt;
            }

            .mb-2 {
              margin-bottom: 8pt;
            }

            .mt-1 {
              margin-top: 4pt;
            }

            .mt-4 {
              margin-top: 16pt;
            }

          .py-4 {
  padding-top: 16pt;
  padding-bottom: 16pt;
}

            .py-4 {
              padding-top: 16pt;
              padding-bottom: 16pt;
            }

            .pb-4 {
              padding-bottom: 16pt;
            }

            .pt-2 {
              padding-top: 8pt;
            }

            /* Text styles */
            .font-bold {
              font-weight: bold;
            }

            .text-center {
              text-align: center;
            }

            .text-sm {
              font-size: 8pt;
            }

            .text-black {
              color: black;
            }

            .truncate {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .line-clamp-2 {
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            /* Borders */
            .border-b {
              border-bottom: 1px solid black;
            }

            .border {
              border: 1px solid black;
            }

            .border-black {
              border-color: black;
            }

            /* Responsive behavior for print */
            .sm\\:grid-cols-2 {
              grid-template-columns: 1fr 1fr;
            }

            .sm\\:flex-row {
              flex-direction: row;
            }

          

          

            .sm\\:ml-4 {
              margin-left: 16pt;
            }

            .sm\\:space-y-8 > * + * {
              margin-top: 15pt;
            }

            .sm\\:mb-8 {
              margin-bottom: 32pt;
            }

            .sm\\:mb-10 {
              margin-bottom: 40pt;
            }

            /* Hide print button */
            .no-print {
              display: none;
            }

            button {
              display: none;
            }

            /* Page breaks */
            .print-section {
              page-break-inside: avoid;
              margin-bottom: 8pt;
            }

            /* Ensure proper width distribution */
            .w-full {
              width: 100%;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };