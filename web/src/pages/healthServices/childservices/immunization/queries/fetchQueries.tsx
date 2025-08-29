import { useQuery } from '@tanstack/react-query';
import { getVaccintStocks } from '@/pages/healthServices/vaccination/restful-api/get';
import { fetchVaccineList } from '../restful-api/fetchAPI';

export const useVaccinesListImmunization = () => {
  return useQuery({
    queryKey: ['vaccineListImmunization'],
    queryFn: fetchVaccineList,
    staleTime: 5 * 60 * 1000, 
    retry: 2, 
  });
};




export const fetchVaccinesWithStock = () => {
  return useQuery({
    queryKey: ["vaccineStocks"],
    queryFn: async () => {
      try {
        const stocks = await getVaccintStocks();
        
        if (!stocks || !Array.isArray(stocks)) {
          return {
            default: [],
            formatted: []
          };
        }

        const availableStocks = stocks.filter((stock) => {
          // Check stock availability and expiry first
          const isExpired = stock.inv_details?.expiry_date &&
            new Date(stock.inv_details.expiry_date) < new Date();
          if (stock.vacStck_qty_avail <= 0 || isExpired) return false;

          // Check if vaccine has age group information
          const ageGroup = stock.vaccinelist?.age_group;
          if (!ageGroup) return false;

          // Convert max age to months for comparison
          let maxAgeMonths = ageGroup.max_age;
          const timeUnit = ageGroup.time_unit?.toLowerCase();

          switch (timeUnit) {
            case 'days':
              maxAgeMonths = ageGroup.max_age / 30; // Approximate
              break;
            case 'weeks':
              maxAgeMonths = ageGroup.max_age / 4.345; // Approximate
              break;
            case 'months':
              // Already in months
              break;
            case 'years':
              maxAgeMonths = ageGroup.max_age * 12;
              break;
            default:
              // If time unit is unknown, assume it's not for 0-5
              return false;
          }

          // Vaccine is for 0-5 years if max age is ≤ 60 months (5 years)
          // and min age is not specified or is 0
          const minAge = ageGroup.min_age || 0;
          return maxAgeMonths <= 60 && minAge === 0;
        });

        return {
          default: availableStocks,
          formatted: availableStocks.map((stock: any) => ({
            id: `${stock.vacStck_id},${stock.vac_id},${
              stock.vaccinelist?.vac_name || "Unknown Vaccine"
            },${stock.inv_details?.expiry_date || "No Expiry"}`,
            name: (
              <div className="flex gap-3">
                <span className="bg-blue-500 rounded text-white p-1 text-xs">
                  {stock.inv_details?.inv_id}
                </span>
                {`${stock.vaccinelist?.vac_name || "Unknown Vaccine"} 
                (Avail: ${stock.vacStck_qty_avail}) ${
                  stock.inv_details?.expiry_date 
                    ? `[Exp: ${new Date(stock.inv_details.expiry_date).toLocaleDateString()}]` 
                    : ''
                }`}
              </div>
            ),
          })),
        };
      } catch (error) {
        console.error("Failed to fetch vaccine stocks");
        throw error;
      }
    },
  });
};