import { api } from "@/api/api";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

export const useOwnedBusinesses = (data: Record<string, any>) => {
  return useQuery({
    queryKey: ['ownedBusinesses', data],
    queryFn: async () => {
      try {
        const res = await api.get('profiling/business/specific/ownership', {
          params: data
        });

        return res.data;
      } catch (err){
        throw err;
      }
    },
    staleTime: Infinity
  })
}

export const useBusinessInfo = (busId: number) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["businessInfo", busId],
    queryFn: async () => {
      if (!busId) return null;
      try {
        const res = await api.get(`profiling/business/${busId}/info/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    enabled: !!busId
  });

  React.useEffect(() => {
    if(!busId) return;

    const channel = supabase
      .channel(`business-update-${busId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "business",
          filter: `bus_id=eq.${busId}`
        },
        () => {
          queryClient.invalidateQueries({queryKey: ['businessInfo', busId]})
        }
      ).subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
  }, [busId, queryClient])

  return query
}

export const useModificationRequests = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['modificationRequests'],
    queryFn: async () => {
      try {
        const res = await api.get('profiling/business/modification/request-list/');
        return res.data
      } catch (err) {
        console.error(err);
        throw(err);
      }
    },
    staleTime: Infinity
  })

  React.useEffect(() => {
    const channel = supabase
      .channel('business-modification')
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "business_modification"
        },
        () => {
          queryClient.invalidateQueries({queryKey: ['modificationRequests']})
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return query
} 