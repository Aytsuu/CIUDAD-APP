
export default function HeaderUserSkeleton() {
  return (
    <div className="flex justify-end w-full">
      <div className="flex items-center gap-x-2">
        {/* Skeleton profile picture */}
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />

        {/* Name skeleton */}
        <div className="flex flex-col space-y-1 w-[120px] sm:w-[180px]">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
      </div>
    </div>
  );
}
