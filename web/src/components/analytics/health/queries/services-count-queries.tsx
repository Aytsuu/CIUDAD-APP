import { api2 } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetChildHealthTotalRecords = () => {
    return useQuery({
      queryKey: ['childHealthTotalRecords'],
      queryFn: async () => {
        try {
          const res = await api2.get('child-health/childhealth-totalrecords/');
          return res.data;
        } catch (err) {
          throw err;
        }
      },
      staleTime: 5000
    });
  };

  export const useGetFirstAidTotalRecords = () => {
    return useQuery({
      queryKey: ['firstAidTotalRecords'],
      queryFn: async () => {
        try {
          const res = await api2.get('firstaid/firstaid-totalrecords/');
          return res.data;
        } catch (err) {
          throw err;
        }
      },
      staleTime: 5000
    });
  };

  export const useGetMedicineTotalRecords = () => {
    return useQuery({
      queryKey: ['medicineTotalRecords'],
      queryFn: async () => {
        try {
          const res = await api2.get('medicine/medrec-totalrecords/');
          return res.data;
        } catch (err) {
          throw err;
        }
      },
      staleTime: 5000
    });
  };

  export const useGetVaccinationTotalRecords = () => {
    return useQuery({
      queryKey: ['vaccinationTotalRecords'],
      queryFn: async () => {
        try {
          const res = await api2.get('vaccination/vaccination-totalrecords/');
          return res.data;
        } catch (err) {
          throw err;
        }
      },
      staleTime: 5000
    });
  };

  export const useGetMedicalConsultationTotalRecords = () => {
    return useQuery({
      queryKey: ['medicalConsultationTotalRecords'],
      queryFn: async () => {
        try {
          const res = await api2.get('medical-consultation/medcon-totalrecords/');
          return res.data;
        } catch (err) {
          throw err;
        }
      },
      staleTime: 5000
    });
  };