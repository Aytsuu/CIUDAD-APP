import { Skeleton } from "@/components/ui/skeleton";

export function VaccinationStatusCardsSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-4">
      {/* Unvaccinated Vaccines Skeleton */}
      <div className="rounded-xl p-6 flex-1 border border-gray-200 shadow-sm bg-white">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-6 w-48 rounded" />
        </div>
        
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-up Visit Schedules Skeleton */}
      <div className="rounded-xl p-6 flex-1 border border-gray-200 shadow-sm bg-white">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-6 w-48 rounded" />
        </div>
        
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
                <Skeleton className="h-4 w-40 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}