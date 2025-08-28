import { useQuery } from "@tanstack/react-query";
import { getPersonalCertifications, getBusinessPermitRequests } from "../restful-API/certTrackingGetAPI";

export const useCertTracking = (residentId: string) => {
    return useQuery({
        queryKey: ["cert-tracking", residentId],
        queryFn: async () => {
            const [personal, business] = await Promise.all([
                getPersonalCertifications(residentId),
                getBusinessPermitRequests(residentId)
            ]);

            return { personal, business } as { personal: any[]; business: any[] };
        },
        enabled: !!residentId,
    });
};


