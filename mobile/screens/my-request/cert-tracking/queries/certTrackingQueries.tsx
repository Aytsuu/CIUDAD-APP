import { useQuery } from "@tanstack/react-query";
import { getPersonalCertifications, getBusinessPermitRequests, cancelCertificate } from "../restful-API/certTrackingGetAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCertTracking = (residentId: string) => {
    return useQuery({
        queryKey: ["cert-tracking", residentId],
        queryFn: async () => {
            const [personal, business] = await Promise.all([
                getPersonalCertifications(residentId),
                getBusinessPermitRequests(residentId)
            ]);

            const byResident = (item: any) => {
                const rp = String(item?.rp_id ?? item?.rp ?? "").trim();
                return rp === String(residentId).trim();
            };

            return {
                personal: Array.isArray(personal) ? personal.filter(byResident) : [],
                business: Array.isArray(business) ? business.filter(byResident) : []
            } as { personal: any[]; business: any[] };
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
  })
}


