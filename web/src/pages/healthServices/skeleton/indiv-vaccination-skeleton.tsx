import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/pages/healthServices/skeleton/table-skeleton";

interface IndivVaccinationRecordsSkeletonProps {
  columns: any[];
}

export function IndivVaccinationRecordsSkeleton({ columns }: IndivVaccinationRecordsSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      
      {/* Patient Info Card Skeleton */}
      <div className="space-y-4 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Vaccination Status Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-gray-200 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Search and Filter Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-6" />
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-16 mt-1" />
          </div>
        </div>
        <Skeleton className="h-10 flex-1" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      
      {/* Table Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between p-4 border border-gray-200 rounded-t-lg">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <TableSkeleton columns={columns} rowCount={5} />
        <div className="flex justify-between p-4 border border-gray-200 rounded-b-lg">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
    </div>
  );
}