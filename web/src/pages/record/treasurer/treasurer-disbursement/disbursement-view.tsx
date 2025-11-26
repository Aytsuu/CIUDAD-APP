import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button/button";
import { generateDisbursementPdf } from "./disbursement-pdf";
import { DisbursementVoucher } from "./incDisb-types";

export interface ViewDisbursementVoucherProps {
  disbursement: DisbursementVoucher;
  onLoad?: () => void;
  onError?: () => void;
  onClose?: () => void;
}

export const ViewDisbursementVoucher: React.FC<
  ViewDisbursementVoucherProps
> = ({ disbursement, onLoad, onError, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationError, setGenerationError] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setIsGenerating(true);
    setGenerationError(false);

    const generateAndSetPdf = async () => {
      try {
        const pdfData = {
          dis_num: disbursement.dis_num,
          dis_payee: disbursement.dis_payee || "",
          dis_tin: disbursement.dis_tin || "",
          dis_date: disbursement.dis_date || "",
          dis_fund: disbursement.dis_fund || 0,
          dis_particulars: Array.isArray(disbursement.dis_particulars)
            ? disbursement.dis_particulars.map((p) => ({
                forPayment: p.forPayment || "",
                tax: typeof p.tax === "number" ? p.tax : parseFloat(p.tax) || 0,
                amount:
                  typeof p.amount === "number"
                    ? p.amount
                    : parseFloat(p.amount) || 0,
              }))
            : [],
          dis_signatories: Array.isArray(disbursement.dis_signatories)
            ? disbursement.dis_signatories.map((s) => ({
                name: s.name || "",
                position: s.position || "",
                type: s.type || "certified_appropriation",
              }))
            : [],
          dis_checknum: disbursement.dis_checknum || "",
          dis_bank: disbursement.dis_bank || "",
          dis_or_num: disbursement.dis_or_num || "",
          dis_paydate: disbursement.dis_paydate || "",
          dis_payacc: Array.isArray(disbursement.dis_payacc)
            ? disbursement.dis_payacc.map((p) => ({
                account: p.account || "",
                accCode: p.accCode || "",
                debit:
                  typeof p.debit === "number"
                    ? p.debit
                    : parseFloat(p.debit) || 0,
                credit:
                  typeof p.credit === "number"
                    ? p.credit
                    : parseFloat(p.credit) || 0,
              }))
            : [],
          staff_name: disbursement.staff_name || "",
          files: disbursement.files || [],
        };

        const pdfUrl = await generateDisbursementPdf(pdfData, true);

        if (isMounted.current) {
          setPdfUrl(pdfUrl);
          setIsGenerating(false);
          onLoad?.();
        }
      } catch (error) {
        // console.error("PDF generation failed:", error);
        if (isMounted.current) {
          setGenerationError(true);
          setIsGenerating(false);
          onError?.();
        }
      }
    };

    generateAndSetPdf();

    return () => {
      isMounted.current = false;
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [disbursement]);

  if (pdfUrl && !isGenerating) {
    return (
      <div className="w-full h-full flex flex-col">
        <iframe
          src={`${pdfUrl}#zoom=FitH`}
          className="flex-1 w-full border-0 bg-white"
          title="Disbursement Voucher PDF Preview"
          onLoad={() => onLoad?.()}
          onError={() => {
            setGenerationError(true);
            onError?.();
          }}
        />
      </div>
    );
  }

  if (generationError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
        <span className="text-lg font-medium">Failed to generate PDF</span>
        <span className="text-sm">Please try again later</span>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 space-y-4">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  );
};

export default ViewDisbursementVoucher;
