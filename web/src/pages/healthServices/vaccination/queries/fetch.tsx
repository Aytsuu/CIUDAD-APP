// src/queries/fetch.ts
import { useQuery } from '@tanstack/react-query';
import { api2 } from '@/api/api';
import {getVaccinationRecordById} from '../restful-api/get';
import { getUnvaccinatedVaccines } from '../restful-api/get';
import { VaccinationRecord } from '../tables/columns/types';

export const usePatientVaccinationRecords = (patientId?: string) => {
  return useQuery({
    queryKey: ['patientVaccinationRecords', patientId],
    queryFn: async (): Promise<VaccinationRecord[]> => {
      if (!patientId) return [];
      
      const response = await getVaccinationRecordById(patientId);

      if (!response || response.length === 0) {
        return [];
      }

      return response.map((record: any) => {
        console.log(
          "Vaccine Type Choice:",
          record?.vaccine_stock?.vaccinelist?.vac_type_choices
        );
        
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
          vacStck: record.vacStck,
          vacrec_totaldose: record.vacrec_totaldose,
          vacrec_status: record.vacrec_details?.vacrec_status,
          vaccination_count: record.vaccination_count || 0,
          created_at: record.created_at || "N/A",
          vital_signs: record.vital_signs || {
            vital_bp_systolic: "N/A",
            vital_bp_diastolic: "N/A",
            vital_temp: "N/A",
            vital_RR: "N/A",
            vital_o2: "N/A",
            created_at: "N/A",
          },
          vaccine_stock: record.vaccine_stock || null,
          vaccine_name: record.vaccine_stock?.vaccinelist?.vac_name || "Unknown",
          batch_number: record.vaccine_stock?.batch_number || "N/A",
          vaccine_details: {
            no_of_doses: record.vaccine_stock?.vaccinelist?.no_of_doses || 0,
            age_group: record.vaccine_stock?.vaccinelist?.age_group || "N/A",
            vac_type: record.vaccine_stock?.vaccinelist?.vac_type_choices || "N/A",
          },
          follow_up_visit: {
            followv_id: record.follow_up_visit?.followv_id,
            followv_date: record.follow_up_visit?.followv_date || "No Schedule",
            followv_status: record.follow_up_visit?.followv_status || "N/A",
          },
        };
      }).sort(
        (a: VaccinationRecord, b: VaccinationRecord) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },

    staleTime: 2 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
    refetchOnMount: false, // Prevent refetch when component mounts
    enabled: !!patientId, // Only run query if patientId exists
  });
};




export const useIndivPatientVaccinationRecords = (patientId?: string) => {
    return useQuery({
      queryKey: ['patientVaccinationRecords', patientId],
      queryFn: async (): Promise<VaccinationRecord[]> => {
        if (!patientId) return [];
        
        const response = await getVaccinationRecordById(patientId);
  
        if (!response || response.length === 0) {
          return [];
        }
  
        return response.map((record: any) => {
          console.log(
            "Vaccine Type Choice:",
            record?.vaccine_stock?.vaccinelist?.vac_type_choices
          );
          
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
            vacStck: record.vacStck,
            vacrec_totaldose: record.vacrec_totaldose,
            vacrec_status: record.vacrec_details?.vacrec_status,
            vaccination_count: record.vaccination_count || 0,
            created_at: record.created_at || "N/A",
            vital_signs: record.vital_signs || {
              vital_bp_systolic: "N/A",
              vital_bp_diastolic: "N/A",
              vital_temp: "N/A",
              vital_RR: "N/A",
              vital_o2: "N/A",
              created_at: "N/A",
            },
            vaccine_stock: record.vaccine_stock || null,
            vaccine_name: record.vaccine_stock?.vaccinelist?.vac_name || "Unknown",
            batch_number: record.vaccine_stock?.batch_number || "N/A",
            vaccine_details: {
              no_of_doses: record.vaccine_stock?.vaccinelist?.no_of_doses || 0,
              age_group: record.vaccine_stock?.vaccinelist?.age_group || "N/A",
              vac_type: record.vaccine_stock?.vaccinelist?.vac_type_choices || "N/A",
            },
            follow_up_visit: {
              followv_id: record.follow_up_visit?.followv_id,
              followv_date: record.follow_up_visit?.followv_date || "No Schedule",
              followv_status: record.follow_up_visit?.followv_status || "N/A",
            },
          };
        }).sort(
          (a: VaccinationRecord, b: VaccinationRecord) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      },
  
      staleTime: 2 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false, // Prevent refetch on tab focus
      refetchOnMount: false, // Prevent refetch when component mounts
      enabled: !!patientId, // Only run query if patientId exists
    });
  };
  


// src/queries/vaccination.ts
export const useFollowupVaccines = (patientId?: string) => {
    return useQuery({
      queryKey: ['followupVaccines', patientId],
      queryFn: async () => {
        if (!patientId) return [];
        
        const res = await api2.get(`/vaccination/patient-vaccine-followups/${patientId}/`);
        return res.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      enabled: !!patientId,
    });
  };

// src/queries/fetch.ts
import { getAgeInUnit } from "@/helpers/ageCalculator";

export const useUnvaccinatedVaccines = (patientId?: string, patientDob?: string) => {
  return useQuery({
    queryKey: ['unvaccinatedVaccines', patientId, patientDob],
    queryFn: async () => {
      if (!patientId) return [];
      
      // 1. First get ALL vaccines the patient hasn't received
      const allUnvaccinated = await getUnvaccinatedVaccines(patientId);
      if (!allUnvaccinated) return [];
      
      // 2. If no DOB provided, return basic unvaccinated list
      if (!patientDob) {
        return allUnvaccinated.map((vaccine:any) => ({
          vac_name: vaccine?.vac_name || "Unknown Vaccine",
          vac_type_choices: vaccine?.vac_type_choices || "Unknown Type"
        }));
      }
      
      // 3. Filter by age group
      return allUnvaccinated.filter((vaccine:any) => {
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
      }).map((vaccine:any) => ({
        vac_name: vaccine?.vac_name || "Unknown Vaccine",
        vac_type_choices: vaccine?.vac_type_choices || "Unknown Type",
        // Include age group info for display
        age_group: vaccine.age_group ? {
          name: vaccine.age_group.agegroup_name,
          range: `${vaccine.age_group.min_age}-${vaccine.age_group.max_age} ${vaccine.age_group.time_unit}`
        } : null
      }));
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!patientId,
  });
};