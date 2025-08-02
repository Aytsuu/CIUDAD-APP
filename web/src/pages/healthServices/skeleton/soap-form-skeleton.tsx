import { Skeleton } from "@/components/ui/skeleton";

export default function SoapFormSkeleton() {
  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <Skeleton className="h-10 w-1/3 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-6">
          {/* Subjective Section */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>

          {/* Physical Exam Section */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>

          {/* Medicine Section */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-48 w-full rounded-md" />
            </div>
          </div>

          {/* Objective and Plan Treatment Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-64 w-full rounded-md" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-64 w-full rounded-md" />
            </div>
          </div>

          {/* Illness Diagnosis and Assessment Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-48 w-full rounded-md" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-48 w-full rounded-md" />
            </div>
          </div>

          {/* Follow-up Section */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-1/3 rounded-md" />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}