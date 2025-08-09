import { getVaccineList } from "@/pages/healthInventory/InventoryList/restful-api/Antigen/VaccineFetchAPI";

// services/vaccineService.ts
export const fetchVaccineList = async () => {
  const data = await getVaccineList();
  
  // Filter for vaccines with age group 0-5 years (0-60 months)
  const filteredData = data.filter((vaccine: any) => {
    const ageGroup = vaccine.age_group;
    if (!ageGroup) return false;
    
    // Convert max age to months based on time unit
    const maxAge = ageGroup.max_age;
    const timeUnit = ageGroup.time_unit?.toLowerCase();
    
    // Get max age in months
    let maxAgeMonths;
    switch(timeUnit) {
      case 'days': maxAgeMonths = maxAge / 30; break;
      case 'weeks': maxAgeMonths = maxAge / 4.345; break;
      case 'months': maxAgeMonths = maxAge; break;
      case 'years': maxAgeMonths = maxAge * 12; break;
      default: return false; // Unknown time unit
    }
    
    // Check if min age is 0 and max age is ≤ 60 months (5 years)
    return (ageGroup.min_age === 0 || ageGroup.min_age === undefined) && 
           maxAgeMonths <= 60;
  });

  return {
    default: filteredData,
    formattedOptions: filteredData.map((v: any) => ({
      id: `${v.vac_id},${v.vac_name}`,
      name: v.vac_name,
    })),
  };
};