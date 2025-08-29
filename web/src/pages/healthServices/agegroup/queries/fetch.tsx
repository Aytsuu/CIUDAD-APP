import { useQuery } from "@tanstack/react-query";
import { AgeGroupRecord } from "../AgeGroup";
import { getAgegroup } from "../restful-api/api";

export const useAgeGroups = () => {
  return useQuery<AgeGroupRecord[]>({
    queryKey: ["ageGroups"],
    queryFn: getAgegroup,
    refetchOnMount: true,
    staleTime: 0,
  });
};

export const fetchAgeGroups = async () => {
  try {
    const response = await getAgegroup();
    const ageGroupData = Array.isArray(response) ? response : [];
    return {
      default: ageGroupData,
      formatted: ageGroupData.map((ageGroup: any) => ({
        id: String(ageGroup.agegrp_id),
        name: `${ageGroup.agegroup_name} (${ageGroup.min_age}-${ageGroup.max_age} ${ageGroup.time_unit})`,
        originalData: ageGroup,
      })),
    };
  } catch (error) {
    console.error("Error fetching age groups:", error);
    throw error;
  }
};
