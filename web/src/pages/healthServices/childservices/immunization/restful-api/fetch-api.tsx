import { getVaccineList } from "@/pages/healthInventory/InventoryList/restful-api/Antigen/fetch-api";
// services/vaccineService.ts


export const fetchVaccineList = async () => {
  const data = await getVaccineList();
  
  // Filter for vaccines that cover ANY part of the 0-5 years range
  const filteredData = data.filter((vaccine: any) => {
    const ageGroup = vaccine.age_group;
    if (!ageGroup) return false;
    
    // Convert min and max age to a common unit (months) for easy comparison
    const convertToMonths = (age:any, unit:any) => {
      unit = unit?.toLowerCase();
      switch(unit) {
        case 'days': return age / 30.44; // More precise than /30
        case 'weeks': return age / 4.345;
        case 'months': return age;
        case 'years': return age * 12;
        default: return NaN; // Invalid unit
      }
    };
    
    const minAgeMonths = convertToMonths(ageGroup.min_age || 0, ageGroup.min_age_unit || ageGroup.time_unit);
    const maxAgeMonths = convertToMonths(ageGroup.max_age, ageGroup.max_age_unit || ageGroup.time_unit);
    
  
    return minAgeMonths <= 60 && maxAgeMonths >= 0;
  });

  return {
    default: filteredData,
    formattedOptions: filteredData.map((v: any) => ({
      id: `${v.vac_id},${v.vac_name}`,
      name: v.vac_name,
    })),
  };
};