import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function PatientRecordSkeleton() {
  return (
    <div className="w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-10 w-20 sm:ml-auto" />
      </div>
      <Separator className="bg-gray mb-4 sm:mb-6" />

      {/* Patient Card Skeleton */}
      <div className="mb-6">
        <div className="border shadow-sm rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="ml-2">
        <div className="mb-4 border-b w-full">
          <div className="flex gap-6 ml-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}