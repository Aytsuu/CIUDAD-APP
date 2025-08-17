// src/queries/fetch.ts
import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { getUnvaccinatedVaccines } from "../restful-api/get";
import { VaccinationRecord } from "../tables/columns/types";
import { getAgeInUnit } from "@/helpers/ageCalculator";
import { getUnvaccinatedResidents, getVaccinationRecords, getVaccinationRecordById, getLatestVitals } from "../restful-api/get";


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
              followv_status: record.follow_up_visit?.followv_status || "N/A"
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
      const allUnvaccinated = await getUnvaccinatedVaccines(patientId);
      if (!allUnvaccinated) return [];

      if (!patientDob) {
        return allUnvaccinated.map((vaccine: any) => ({
          vac_name: vaccine?.vac_name || "Unknown Vaccine",
          vac_type_choices: vaccine?.vac_type_choices || "Unknown Type"
        }));
      }
      return allUnvaccinated
        .filter((vaccine: any) => {
          const ageGroup = vaccine.age_group;

          // Include if vaccine has no age group requirements
          if (!ageGroup) return true;

          const { min_age, max_age, time_unit } = ageGroup;

          // Include if age group has no valid restrictions
          if (time_unit === "NA" || min_age == null || max_age == null) {
            return true;
          }

          try {
            // Calculate patient's age in the required unit
            const ageInUnit = getAgeInUnit(patientDob, time_unit);
            return ageInUnit >= min_age && ageInUnit <= max_age;
          } catch (error) {
            console.error("Age calculation error:", error);
            return false;
          }
        })
        .map((vaccine: any) => ({
          vac_name: vaccine?.vac_name || "Unknown Vaccine",
          vac_type_choices: vaccine?.vac_type_choices || "Unknown Type",
          // Include age group info for display
          age_group: vaccine.age_group
            ? {
                name: vaccine.age_group.agegroup_name,
                range: `${vaccine.age_group.min_age}-${vaccine.age_group.max_age} ${vaccine.age_group.time_unit}`
              }
            : null
        }));
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
    retry: 3,
  });
};

// Updated hook with parameters
export const useVaccinationRecords = () => {
  return useQuery<VaccinationRecord[]>({
    queryKey: ["vaccinationRecords"],
    queryFn: getVaccinationRecords,
    refetchOnMount: true,
    staleTime: 1 * 60 * 1000 ,
    retry: 3,
  });
};

export const useUnvaccinatedResidents = () => {
  return useQuery({
    queryKey: ["unvaccinatedResidents"],
    queryFn: getUnvaccinatedResidents,
    refetchOnMount: true,
    staleTime: 1 * 60 * 1000,
    retry: 3,
  });
};
