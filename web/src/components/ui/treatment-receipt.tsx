"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button/button";
import { useRef } from "react";

interface TreatmentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
  date: string;
  treatmentPlan: string;
  doctorName: string;
}

export function TreatmentReceipt({
  isOpen,
  onClose,
  patientName,
  patientId,
  date,
  treatmentPlan,
  doctorName,
}: TreatmentReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;

    // Create a more comprehensive print styles
    const printStyles = `
      <style>
      @page {
        size: 8.5in 13in; /* Legal size bond paper */
        margin: 15mm;
      }
      
      @media print {
        body {
        font-family: 'Times New Roman', serif;
        font-size: 12pt;
        line-height: 1.4;
        color: #000;
        background: white;
        padding: 5px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        }
        
        .receipt-container {
        max-width: 100%;
        margin: 0;
        padding: 0;
        border: 2px solid #000;
        page-break-inside: avoid;
        }
        
        .receipt-header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #000;
        }
        
        .receipt-title {
        font-size: 18pt;
        font-weight: bold;
        margin-bottom: 5px;
        letter-spacing: 2px;
        }
        
        .receipt-subtitle {
        font-size: 10pt;
        color: #666;
        }
        
        .patient-info {
        margin: 20px 0;
        }
        
        .info-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px dotted #ccc;
        }
        
        .info-label {
        font-weight: bold;
        width: 30%;
        }
        
        .info-value {
        width: 65%;
        text-align: right;
        }
        
        .treatment-section {
        margin: 25px 0;
        }
        
        .treatment-title {
        font-size: 14pt;
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
        padding: 8px;
        background-color: #f5f5f5;
        border: 1px solid #000;
        }
        
        .treatment-content {
        padding: 15px;
        border: 1px solid #000;
        background-color: #fafafa;
        white-space: pre-wrap;
        font-family: 'Courier New', monospace;
        font-size: 11pt;
        line-height: 1.6;
        }
        
        .doctor-signature {
        margin-top: 40px;
        text-align: right;
        page-break-inside: avoid;
        }
        
        .signature-line {
        border-top: 2px solid #000;
        width: 250px;
        display: inline-block;
        text-align: center;
        padding-top: 8px;
        }
        
        .doctor-name {
        font-weight: bold;
        font-size: 12pt;
        margin-bottom: 2px;
        }
        
        .doctor-details {
        font-size: 9pt;
        color: #333;
        }
        
        .print-date {
        position: absolute;
        bottom: 10mm;
        right: 10mm;
        font-size: 8pt;
        color: #666;
        }
      }
      
      @media screen {
        body {
        font-family: Arial, sans-serif;
        padding: 20px;
        background-color: #f0f0f0;
        }
      }
      </style>
    `;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Treatment Receipt - ${patientName}</title>
          ${printStyles}
        </head>
        <body>
          <div class="receipt-container">
            ${content.innerHTML}
          </div>
          <div class="print-date">
            Printed on: ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    // Try modern printing approach first
    if (window.navigator && 'share' in window.navigator) {
      // For modern browsers, create a blob and try to print
      try {
        const blob = new Blob([printContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const printWindow = window.open(url, '_blank', 'width=800,height=600');
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.focus();
              printWindow.print();
              setTimeout(() => {
                printWindow.close();
                URL.revokeObjectURL(url);
              }, 1000);
            }, 500);
          };
        }
        return;
      } catch (error) {
        console.warn('Modern print method failed, falling back to traditional method');
      }
    }

    // Fallback to traditional method
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    if (!printWindow) {
      alert('Print window was blocked. Please allow popups for this site.');
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        // Clean up after printing
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 1000);
      }, 750);
    };

    // Fallback if onload doesn't fire
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (e) {
          console.error('Print failed:', e);
        }
      }
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Treatment Plan Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Printable content with improved structure */}
          <div
            ref={receiptRef}
            className="receipt-container p-6 bg-white rounded-lg border border-gray-200"
          >
            {/* Header */}
            <div className="receipt-header text-center mb-6">
              <h2 className="receipt-title text-xl font-bold text-gray-800 tracking-wider">
                TREATMENT PLAN
              </h2>
              <p className="receipt-subtitle text-sm text-gray-600">
                Medical Consultation Receipt
              </p>
            </div>

            {/* Patient Info */}
            <div className="patient-info mb-6">
              <div className="info-row flex justify-between border-b border-gray-200 pb-2 mb-2">
                <span className="info-label font-semibold">Patient Name:</span>
                <span className="info-value font-medium">{patientName}</span>
              </div>
              <div className="info-row flex justify-between border-b border-gray-200 pb-2 mb-2">
                <span className="info-label font-semibold">Patient ID:</span>
                <span className="info-value font-medium">{patientId}</span>
              </div>
              <div className="info-row flex justify-between border-b border-gray-200 pb-2">
                <span className="info-label font-semibold">Date:</span>
                <span className="info-value font-medium">{date}</span>
              </div>
            </div>

            {/* Treatment Plan */}
            <div className="treatment-section mb-8">
              <h3 className="treatment-title font-bold text-gray-800 mb-3 text-center py-2 bg-gray-100 rounded">
                TREATMENT PRESCRIBED
              </h3>
              <div className="treatment-content bg-gray-50 p-4 rounded border-2 border-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {treatmentPlan}
              </div>
            </div>

            {/* Doctor Signature */}
            <div className="doctor-signature mt-12 text-right">
              <div className="signature-line border-t-2 border-gray-800 pt-3 inline-block min-w-[250px]">
                <p className="doctor-name font-bold text-base">{doctorName}</p>
               
                <p className="doctor-details text-xs text-gray-600">
                  Medical Doctor
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} className="px-6">
              Close
            </Button>
            <Button onClick={handlePrint} className="px-6">
               Print Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}