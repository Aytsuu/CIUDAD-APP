// src/hooks/useRealtime.ts
import { useEffect } from 'react';
import supabase from '@/supabase/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeSubscription(
  channelName: string,
  callback: (payload: any) => void,
  table?: string,
  filter?: string
) {
  useEffect(() => {
    let channel: RealtimeChannel;

    if (table) {
      // Database changes subscription
      channel = supabase
        .channel('notification')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter
          },
          callback
          
        )
        .subscribe();
    } else {
      // Custom event subscription
      channel = supabase
        .channel(channelName)
        .on('broadcast', { event: 'message' }, callback)
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [channelName, callback, table, filter]);
}