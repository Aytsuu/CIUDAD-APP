// src/components/consultation-history-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function ConsultationHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="border rounded-lg p-4">
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
          
          {/* Vital signs and BMI */}
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
          
          {/* Separator */}
          <Separator className="my-3" />
          
          {/* Assessment summary */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}