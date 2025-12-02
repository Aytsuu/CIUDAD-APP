import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetCertificateCardAnalytics = () => {
  return useQuery({
    queryKey: ['certificateCardAnalytics'],
    queryFn: async () => {
      try {
        const res = await api.get("clerk/analytics/certificates/");
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  });
};

export const useGetCertificatePurposeTrending = (months: number = 12) => {
  return useQuery({
    queryKey: ['certificatePurposeTrending', months],
    queryFn: async () => {
      try {
        const res = await api.get(`clerk/analytics/certificates/purpose-trending/?months=${months}`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  });
};

export const useGetBusinessPermitAnalytics = () => {
  return useQuery({
    queryKey: ['businessPermitAnalytics'],
    queryFn: async () => {
      try {
        const res = await api.get("clerk/analytics/business-permits/");
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  });
};

export const useGetBusinessPermitSidebar = () => {
  return useQuery({
    queryKey: ['businessPermitSidebar'],
    queryFn: async () => {
      try {
        const res = await api.get("clerk/analytics/business-permits/sidebar/");
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  });
};
