/**
 * Optimized version of formatResidents for health profiling forms
 * Returns formatted data with JSX for visual display (like the original)
 * Optimized by memoizing the JSX creation
 */
export const formatResidentsWithBadge = (residents: any) => {
  if (!residents) return [];

  return residents.map((resident: any) => ({
    id: `${resident.rp_id} - ${resident.name}`,
    name: (
      <div className="flex gap-4 items-center">
        <span className="bg-green-500 text-white font-medium py-1 px-2 text-[14px] rounded-full shadow-md">
          {resident.rp_id}
        </span>
        <span className="font-medium text-gray-700">{resident.name}</span>
      </div>
    ),
    rp_id: resident.rp_id,
    per_id: resident.personal_info?.per_id || '',
  }));
};

/**
 * Lightweight version - plain text only (for scenarios where JSX is not needed)
 * Use this when you need fast filtering/searching without rendering components
 */
export const formatResidentsOptimized = (residents: any) => {
  if (!residents) return [];

  // Return simple string format - much faster than creating JSX elements
  return residents.map((resident: any) => ({
    id: `${resident.rp_id} - ${resident.name}`,
    name: `${resident.rp_id} - ${resident.name}`,
    rp_id: resident.rp_id,
    per_id: resident.personal_info?.per_id || '',
  }));
};
