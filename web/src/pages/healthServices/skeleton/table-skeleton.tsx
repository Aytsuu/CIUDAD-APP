import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns: any[];
  rowCount?: number;
}

export function TableSkeleton({ columns, rowCount = 5 }: TableSkeletonProps) {
  return (
    <div className="bg-white rounded-md border border-gray-200 w-full">
      {/* Skeleton for table header */}
      <div className="w-full h-16 bg-gray-50 flex items-center p-4">
        {columns.map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-6 flex-1 mx-2" />
        ))}
      </div>
      
      {/* Skeleton for table rows */}
      <div className="p-4 space-y-4">
        {[...Array(rowCount)].map((_, rowIndex) => (
          <div 
            key={`row-${rowIndex}`} 
            className="flex items-center justify-between space-x-4"
          >
            {columns.map((_, colIndex) => (
              <Skeleton 
                key={`cell-${rowIndex}-${colIndex}`} 
                className="h-12 flex-1 mx-2" 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}