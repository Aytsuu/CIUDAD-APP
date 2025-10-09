// components/FirstAidSummaryModal.tsx
import React from "react";
import { Button } from "@/components/ui/button/button";
import { FileText, X, Loader2 } from "lucide-react";
import { SignatureField, SignatureFieldRef } from "@/pages/healthServices/reports/firstaid-report/signature";

interface FirstAidSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFirstAids: { finv_id: string; qty: number; reason: string }[];
  firstAidStocksOptions: any[];
  totalSelectedQuantity: number;
  onConfirm: () => void;
  isSubmitting: boolean;
  onBackToEdit: () => void;
  signatureRef: React.RefObject<SignatureFieldRef>;
  onSignatureChange: (signature: string | null) => void;
  signature: string | null;
}

export const FirstAidSummaryModal = ({
  isOpen,
  onClose,
  selectedFirstAids,
  firstAidStocksOptions,
  totalSelectedQuantity,
  onConfirm,
  isSubmitting,
  onBackToEdit,
  signatureRef,
  onSignatureChange,
  signature
}: FirstAidSummaryModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4 rounded-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">{isSubmitting ? "Submitting Request..." : "First Aid Request Summary"}</h2>
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
              <p className="text-sm text-gray-600 mt-2">Please wait while we submit your first aid request.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-6">Review your first aid request before submission</p>

              {/* First Aid Summary Content */}
              <div className="p-6 rounded-lg border border-gray-200 bg-white">
                <h3 className="font-bold text-xl text-center mb-6 text-gray-900">First Aid Items</h3>
                <div className="space-y-4">
                  {selectedFirstAids.map((firstAid) => {
                    const faInfo = firstAidStocksOptions.find(
                      (m) => m.id === firstAid.finv_id
                    );
                    return (
                      <div
                        key={firstAid.finv_id}
                        className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{faInfo?.name ?? "Unknown Item"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">Qty: {firstAid.qty}</p>
                          {firstAid.reason && (
                            <p className="text-sm text-gray-600 mt-1">
                              Reason: {firstAid.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-lg text-gray-900">Total Items:</p>
                    <p className="font-bold text-lg text-gray-900">{totalSelectedQuantity}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <SignatureField 
                  ref={signatureRef} 
                  title="Signature" 
                  onSignatureChange={onSignatureChange} 
                  required={true} 
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Footer - Only show when not submitting */}
        {!isSubmitting && (
          <div className="flex flex-col sm:flex-row gap-3 justify-end p-6 border-t border-gray-200 sticky bottom-0 bg-white">
            <Button variant="outline" onClick={onBackToEdit} className="w-full sm:w-auto">
              Back to Edit
            </Button>
            <Button 
              onClick={onConfirm} 
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700" 
              disabled={!signature || isSubmitting}
            >
              Confirm and Submit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};