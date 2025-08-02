import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button/button";
import { generateProposalPdf } from "./personalized-compo/pdfGenerator";
import { ViewProjectProposalProps } from "./projprop-types";

export const ViewProjectProposal: React.FC<ViewProjectProposalProps> = ({
  project,
  onLoad,
  onError,
  onClose,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationError, setGenerationError] = useState(false);
  const isMounted = useRef(true);

  const effectiveHeaderImage = project.headerImage || 
    project.headerImage || 
    project.headerImage || 
    null;

  useEffect(() => {
    isMounted.current = true;
    setIsGenerating(true);
    setGenerationError(false);

    const generateAndSetPdf = async () => {
      try {
        const pdfUrl = await generateProposalPdf({
          projectTitle: project.projectTitle || "Untitled Project",
          background: project.background || "",
          objectives: project.objectives || [],
          participants: project.participants.map(p => ({...p,
            count: p.count.toString()
          })),
          date: project.date || "",
          venue: project.venue || "",
          budgetItems: project.budgetItems.map(item => ({
          ...item,
          amount: item.amount.toString()
        })),
          monitoringEvaluation: project.monitoringEvaluation || "",
          signatories: project.signatories || [],
          paperSize: project.paperSize || "a4",
          headerImage: effectiveHeaderImage,
        }, true);

        if (isMounted.current) {
          setPdfUrl(pdfUrl);
          setIsGenerating(false);
          onLoad?.();
        }
      } catch (error) {
        console.error("PDF generation failed:", error);
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
  }, [project, effectiveHeaderImage]);

  if (pdfUrl && !isGenerating) {
    return (
      <div className="w-full h-full flex flex-col">
        <iframe
          src={`${pdfUrl}#zoom=FitH`}
          className="flex-1 w-full border-0 bg-white"
          title="PDF Preview"
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

export default ViewProjectProposal;