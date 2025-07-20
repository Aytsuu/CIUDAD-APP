// FirstAidRequestSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function FirstAidRequestSkeleton({ mode }: { mode: string }) {
  return (
    <div className="p-4 space-y-4">
      {/* Skeleton for patient search in fromallrecordtable mode */}
      {mode === "fromallrecordtable" && (
        <div className="mb-4">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      )}
      
      {/* Skeleton for patient info card */}
      <div className="mb-4">
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
      
      {/* Skeleton for first aid display */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        ))}
      </div>
     
    
    </div>
  );
}