import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button/button";

interface ViewResolutionProps {
  resolution: {
    res_num: number;
    res_title: string;
    res_date_approved: string;
    resolution_files: Array<{
      rf_id: number;
      rf_url: string;
    }>;
  };
  onLoad?: () => void;
  onError?: () => void;
  onClose?: () => void;
}

export const ViewResolution: React.FC<ViewResolutionProps> = ({
  resolution,
  onLoad,
  onError,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
      onLoad?.();
    }, 500);

    return () => clearTimeout(timer);
  }, [resolution, onLoad]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
        <span className="text-lg font-medium">Failed to load resolution</span>
        <span className="text-sm">Please try again later</span>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  if (isLoading) {
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
  }

  const pdfUrl = resolution.resolution_files?.[0]?.rf_url;

  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
        <span className="text-lg font-medium">No resolution file available</span>
        <span className="text-sm">This resolution does not have an associated file</span>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <iframe
        src={`${pdfUrl}#zoom=FitH`}
        className="flex-1 w-full border-0 bg-white"
        title="Resolution Preview"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </div>
  );
};

export default ViewResolution;
