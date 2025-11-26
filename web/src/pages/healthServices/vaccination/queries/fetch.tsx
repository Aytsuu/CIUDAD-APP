// src/queries/fetch.ts
import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { getUnvaccinatedVaccines, getUnvaccinatedVaccinesSummary, getUnvaccinatedResidentsDetailsForVaccine } from "../restful-api/get";
import { VaccinationRecord } from "../tables/columns/types";
import { getUnvaccinatedResidents, getVaccinationRecords, getVaccinationRecordById, getLatestVitals } from "../restful-api/get";
import { showErrorToast } from "@/components/ui/toast";
import { getVaccintStocks } from "../restful-api/get";
import { calculateAge } from "@/helpers/ageCalculator";

export const useIndivPatientVaccinationRecords = (patientId?: string) => {
  return useQuery({
    queryKey: ["patientVaccinationRecords", patientId],
    queryFn: async (): Promise<any[]> => {
      if (!patientId) return [];

      const response = await getVaccinationRecordById(patientId);

      if (!response || response.length === 0) {
        return [];
      }

      return response
        .map((record: any) => {
          console.log("Vaccine Type Choice:", record?.vaccine_stock?.vaccinelist?.vac_type_choices);

          return {
            patrec_id: record.vacrec_details?.patrec_id,
            vachist_id: record.vachist_id,
            vachist_doseNo: record.vachist_doseNo,
            vachist_status: record.vachist_status,
            vachist_age: record.vachist_age,
            assigned_to: record.assigned_to,
            staff_id: record.staff_id,
            vital: record.vital,
            vacrec: record.vacrec,
            vacStck: record.vacStck_id,
            date_administered: record.date_administered,
            vacrec_totaldose: record.vacrec_details?.vacrec_totaldose,
            vacrec_status: record.vachist_status,
            vaccination_count: record.vaccination_count || 0,
            created_at: record.created_at || "",
            signature: record.signature || null,
            vital_signs: record.vital_signs || {
              vital_bp_systolic: "",
              vital_bp_diastolic: "",
              vital_temp: "",
              vital_RR: "",
              vital_o2: "",
              created_at: ""
            },
            vaccine_stock: record.vaccine_stock || null,
            vaccine_name: record.vaccine_stock?.vaccinelist?.vac_name || record.vac_details?.vac_name,
            batch_number: record.vaccine_stock?.batch_number || "",
            vaccine_details: {
              no_of_doses: record.vaccine_stock?.vaccinelist?.no_of_doses || 0,
              age_group: record.vaccine_stock?.vaccinelist?.age_group || "N/A",
              vac_type: record.vaccine_stock?.vaccinelist?.vac_type_choices || "N/A"
            },
            follow_up_visit: {
              followv_id: record.follow_up_visit?.followv_id,
              followv_date: record.follow_up_visit?.followv_date || "No Schedule",
              followv_status: record.follow_up_visit?.followv_status || "N/A",
              followv_description: record.follow_up_visit?.followv_description || "N/A"
            },
            vacrec_details: record.vacrec_details || {
              vacrec_id: record.vacrec_details?.vacrec_id || 0,
              vacrec_status: record.vacrec_details?.vacrec_status || "N/A",
              vacrec_totaldose: record.vacrec_details?.vacrec_totaldose || 0,
              patrec_id: record.vacrec_details?.patrec_id || 0,
              vacrec_created_at: record.vacrec_details?.created_at || "N/A",
              vacrec_updated_at: record.vacrec_details?.updated_at || "N/A"
            }
          };
        })
        .sort((a: VaccinationRecord, b: VaccinationRecord) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },

    staleTime: 2 * 60 * 1000,
    enabled: !!patientId
  });
};

export const useFollowupVaccines = (patientId?: string) => {
  return useQuery({
    queryKey: ["followupVaccines", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const res = await api2.get(`/vaccination/patient-vaccine-followups/${patientId}/`);
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!patientId,
    retry: 3
  });
};

export const useLatestVitals = (patientId?: string) => {
  return useQuery({
    queryKey: ["latestVitals", patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const res = await getLatestVitals(patientId);
      return res || null;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!patientId,
    retry: 3
  });
};

export const useFollowupChildHealthandVaccines = (patientId?: string) => {
  return useQuery({
    queryKey: ["followupChildHealth", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const res = await api2.get(`/vaccination/child-followups/${patientId}/`);
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!patientId
  });
};

export const useUnvaccinatedVaccines = (patientId?: string, patientDob?: string) => {
  return useQuery({
    queryKey: ["unvaccinatedVaccines", patientId, patientDob],
    queryFn: async () => {
      if (!patientId) return [];
      
      try {
        const allUnvaccinated = await getUnvaccinatedVaccines(patientId);
        
        if (!allUnvaccinated || !Array.isArray(allUnvaccinated) || allUnvaccinated.length === 0) {
          return [];
        }

        // Map the response to include proper structure
        return allUnvaccinated.map((vaccine: any) => ({
          vac_id: vaccine?.vac_id,
          vac_name: vaccine?.vac_name || "Unknown Vaccine",
          vac_type_choices: vaccine?.vac_type_choices || "Unknown Type",
          no_of_doses: vaccine?.no_of_doses || 0,
          // Include age group info for display
          age_group: vaccine.age_group
            ? {
                agegrp_id: vaccine.age_group.agegrp_id,
                name: vaccine.age_group.agegroup_name,
                agegroup_name: vaccine.age_group.agegroup_name,
                min_age: vaccine.age_group.min_age,
                max_age: vaccine.age_group.max_age,
                time_unit: vaccine.age_group.time_unit,
                range: vaccine.age_group.time_unit !== "NA" 
                  ? `${vaccine.age_group.min_age}-${vaccine.age_group.max_age} ${vaccine.age_group.time_unit}`
                  : "No age restriction"
              }
            : null
        }));
      } catch (error) {
        console.error("Error fetching unvaccinated vaccines:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!patientId,
    retry: 3
  });
};

export const usePatientVaccinationDetails = (patientId: string) => {
  return useQuery({
    queryKey: ["patientVaccinationDetails", patientId],
    queryFn: () => getVaccinationRecordById(patientId),
    refetchOnMount: true,
    staleTime: 0,
    enabled: !!patientId,
    retry: 3
  });
};



// Update your fetch query hook
export const useVaccinationRecords = (params?: { page?: number; page_size?: number; search?: string; patient_type?: string }) => {
  return useQuery({
    queryKey: ["VaccinationRecords", params],
    queryFn: () => getVaccinationRecords(params),
    staleTime: 1000 * 60 * 5,
    retry: 3
  });
};



export const useUnvaccinatedResidents = () => {
  return useQuery({
    queryKey: ["unvaccinatedResidents"],
    queryFn: getUnvaccinatedResidents,
    refetchOnMount: true,
    staleTime: 1 * 60 * 1000,
    retry: 3
  });
};

//  useFetchVaccinesWithStock function with age filtering
export const useFetchVaccinesWithStock = (dob?: string) => {
  return useQuery({
    queryKey: ["vaccineStocks", dob],
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
          const isExpired = stock.inv_details?.expiry_date && new Date(stock.inv_details.expiry_date) < new Date();
          return stock.vacStck_qty_avail > 0 && !isExpired;
        });

        // Apply age filtering if DOB is provided
        const filteredStocks = dob ? filterVaccinesByAge(availableStocks, dob) : availableStocks;

        return {
          default: filteredStocks,
          formatted: filteredStocks.map((stock: any) => ({
            id: `${stock.vacStck_id},${stock.vac_id},${stock.vaccinelist?.vac_name || "Unknown Vaccine"},${stock.inv_details?.expiry_date || "No Expiry"}`,
            name: (
              <div className="flex gap-3">
                <span className="bg-blue-500 rounded text-white p-1 text-xs">{stock.inv_details?.inv_id}</span>
                {`${stock.vaccinelist?.vac_name || "Unknown Vaccine"} 
                (Avail: ${stock.vacStck_qty_avail}) ${stock.inv_details?.expiry_date ? `[Exp: ${new Date(stock.inv_details.expiry_date).toLocaleDateString()}]` : ""}`}
              </div>
            )
          }))
        };
      } catch (error) {
        showErrorToast("Failed to fetch vaccine stocks");
        throw error;
      }
    }
  });
};

//HELPERS
export const filterVaccinesByAge = (vaccines: any[], dob: string) => {
  if (!dob) return vaccines; // Return all vaccines if no DOB provided

  try {
    const ageString = calculateAge(dob);
    const patientAge = parseAgeString(ageString);

    return vaccines.filter((vaccine) => {
      const ageGroup = vaccine.vaccinelist?.age_group;
      if (!ageGroup) return false; // Skip if no age group info

      const minAge = ageGroup.min_age;
      const maxAge = ageGroup.max_age;
      const timeUnit = ageGroup.time_unit;

      // Convert patient age to the vaccine's time unit
      let patientAgeInVaccineUnits = patientAge.value;

      if (patientAge.unit !== timeUnit) {
        if (timeUnit === "years" && patientAge.unit === "months") {
          patientAgeInVaccineUnits = patientAge.value / 12;
        } else if (timeUnit === "months" && patientAge.unit === "years") {
          patientAgeInVaccineUnits = patientAge.value * 12;
        } else if (timeUnit === "weeks") {
          // Convert to weeks if needed
          if (patientAge.unit === "months") {
            patientAgeInVaccineUnits = patientAge.value * 4.34524; // Approximate weeks in a month
          } else if (patientAge.unit === "years") {
            patientAgeInVaccineUnits = patientAge.value * 52.1429; // Approximate weeks in a year
          }
        }
      }

      // Check if patient age falls within the vaccine's age range
      return patientAgeInVaccineUnits >= minAge && patientAgeInVaccineUnits <= maxAge;
    });
  } catch (error) {
    console.error("Error filtering vaccines by age:", error);
    return vaccines; // Return all vaccines if there's an error calculating age
  }
};

// Helper function to parse the age string into numeric value and unit
const parseAgeString = (ageString: string): { value: number; unit: string } => {
  const parts = ageString.split(" ");
  if (parts.length < 2) return { value: 0, unit: "days" };

  const value = parseInt(parts[0]);
  const unit = parts[1].includes("year") ? "years" : parts[1].includes("month") ? "months" : parts[1].includes("day") ? "days" : "days";

  return { value, unit };
};

// Query hooks with proper types
export const useUnvaccinatedVaccinesSummary = (params: any = {}) => {
  return useQuery({
    queryKey: ["unvaccinated-vaccines-summary", params],
    queryFn: () => getUnvaccinatedVaccinesSummary(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};

export const useUnvaccinatedResidentsDetails = (vacId: number, params: any = {}) => {
  return useQuery({
    queryKey: ["unvaccinated-residents", vacId, params],
    queryFn: () => getUnvaccinatedResidentsDetailsForVaccine(vacId, params),
    enabled: !!vacId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};
