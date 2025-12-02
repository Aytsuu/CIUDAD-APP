import { useQuery } from "@tanstack/react-query";
import { getPersonalCertifications, getBusinessPermitRequests, getServiceChargeRequests, cancelCertificate, cancelBusinessPermit, cancelServiceCharge } from "../restful-API/certTrackingGetAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCertTracking = (residentId: string) => {
    return useQuery({
        queryKey: ["cert-tracking", residentId],
        queryFn: async () => {
            const [personal, business, serviceCharge] = await Promise.all([
                getPersonalCertifications(residentId),
                getBusinessPermitRequests(residentId),
                getServiceChargeRequests(residentId)
            ]);

            const byResident = (item: any) => {
                const rp = String(item?.rp_id ?? item?.rp ?? "").trim();
                return rp === String(residentId).trim();
            };

            return {
                personal: Array.isArray(personal) ? personal.filter(byResident) : [],
                business: Array.isArray(business) ? business.filter(byResident) : [],
                serviceCharge: Array.isArray(serviceCharge) ? serviceCharge : []
            } as { personal: any[]; business: any[]; serviceCharge: any[] };
        },
        enabled: !!residentId,
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always',
        refetchOnReconnect: 'always'
    });
};

export const useCancelCertificate = (residentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cr_id: string) => cancelCertificate(cr_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cert-tracking", residentId] });
    }
  });
}

export const useCancelBusinessPermit = (residentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bpr_id: string) => cancelBusinessPermit(bpr_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cert-tracking", residentId] });
    }
  });
}

export const useCancelServiceCharge = (residentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pay_id: string) => cancelServiceCharge(pay_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cert-tracking", residentId] });
    }
  });
}


