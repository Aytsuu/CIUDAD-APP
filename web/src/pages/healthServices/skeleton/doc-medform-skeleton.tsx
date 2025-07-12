// src/components/consultation-history-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function ConsultationHistorySkeleton() {
  return (
    <div className="space-y-4">
        <div  className="border rounded-lg p-4">
          {/* Header with date and status */}
          <div className="flex justify-between items-start mb-3">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-20" />
          </div>
          
          {/* Chief complaint */}
          <div className="space-y-2 mb-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
       
        </div>
      ))
    </div>
  );
}