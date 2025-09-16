import React from "react";
import { Button } from "@/components/ui/button/button";
import { FileText, X, Loader2, AlertCircle } from "lucide-react";
import { MediaUploadType } from "@/components/ui/media-upload";
import { SignatureField, SignatureFieldRef } from "@/pages/healthServices/Reports/firstaid-report/signature";
import { ImageGallery } from "./StatusIndicator";
import { RequestSummary } from "@/components/ui/medicine-sumdisplay";

export const MedicineSummaryModal = ({
  isOpen,
  onClose,
  selectedMedicines,
  medicineStocksOptions,
  totalSelectedQuantity,
  mediaFiles,
  onConfirm,
  isSubmitting,
  onBackToEdit,
  signatureRef,
  onSignatureChange,
  hasPrescriptionMedicine,
  signature
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedMedicines: { minv_id: string; medrec_qty: number; reason: string }[];
  medicineStocksOptions: any[];
  totalSelectedQuantity: number;
  mediaFiles: MediaUploadType;
  onConfirm: () => void;
  isSubmitting: boolean;
  onBackToEdit: () => void;
  signatureRef: React.RefObject<SignatureFieldRef>;
  onSignatureChange: (signature: string | null) => void;
  hasPrescriptionMedicine: boolean;
  signature: string | null;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">{isSubmitting ? "Submitting Request..." : "Medicine Request Summary"}</h2>
          </div>
          {/* Disable close button when submitting */}
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting} className="h-8 w-8 rounded-full hover:bg-gray-100">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {isSubmitting ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className="text-lg font-medium text-gray-900">Processing your request...</p>
              <p className="text-sm text-gray-600 mt-2">Please wait while we submit your medicine request.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-6">Review your medicine request before submission</p>

              <RequestSummary selectedMedicines={selectedMedicines} medicineStocksOptions={medicineStocksOptions} totalSelectedQuantity={totalSelectedQuantity} />

              {/* Display uploaded images */}
              <ImageGallery mediaFiles={mediaFiles} />

              <div className="mt-6">
                <SignatureField ref={signatureRef} title="Signature" onSignatureChange={onSignatureChange} required={true} />
              </div>

              {hasPrescriptionMedicine && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Prescription Medicine Included</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">This request contains prescription medication that requires proper authorization.</p>
                  {mediaFiles.length > 0 && <p className="text-xs text-green-700 mt-1">✓ Supporting documents have been uploaded.</p>}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer - Only show when not submitting */}
        {!isSubmitting && (
          <div className="flex flex-col sm:flex-row gap-3 justify-end p-6 border-t border-gray-200 sticky bottom-0 bg-white">
            <Button variant="outline" onClick={onBackToEdit} className="w-full sm:w-auto">
              Back to Edit
            </Button>
            <Button onClick={onConfirm} className="w-full sm:w-auto bg-green-600 hover:bg-green-700" disabled={!signature || isSubmitting}>
              Confirm and Submit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
