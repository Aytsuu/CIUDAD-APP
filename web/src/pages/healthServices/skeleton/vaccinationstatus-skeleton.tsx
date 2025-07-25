// components/vaccination/VaccinationStatusCardsSkeleton.tsx
import React from "react";

export function VaccinationStatusCardsSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-pulse">
      {/* Unvaccinated Vaccines Skeleton */}
      <div className="bg- rounded-xl p-6 flex-1 border border-gray-300 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2  rounded-md shadow-sm">
            <div className="h-5 w-5  rounded-full" />
          </div>
          <div className="h-6 w-48  rounded" />
        </div>
        
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className=" rounded-xl p-4 border border-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4  rounded-full" />
                <div className="h-4 w-32  rounded" />
                <div className="h-4 w-20  rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-up Visit Schedules Skeleton */}
      <div className="bg-gray-100 rounded-xl p-6 flex-1 border border-gray-300 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-200 rounded-md shadow-sm">
            <div className="h-5 w-5  rounded-full" />
          </div>
          <div className="h-6 w-48  rounded" />
        </div>
        
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className=" rounded-xl p-4 border border-gray-300">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4  rounded-full" />
                  <div className="h-4 w-32  rounded" />
                </div>
                <div className="h-4 w-40  rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}