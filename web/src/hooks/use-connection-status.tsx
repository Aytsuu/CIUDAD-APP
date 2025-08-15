import { useEffect, useState } from "react";
import supabase from "@/supabase/supabase";

export function useConnectionStatus() {
  const [status, setStatus] = useState<any>('disconnected');
  
  useEffect(() => {
    const subscription = supabase
      .channel('any')
      .on('system' as any, { event: '*' }, (payload) => {
        if (payload.event === 'DISCONNECTED') setStatus('disconnected');
        if (payload.event === 'CONNECTED') setStatus('connected');
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return status;
}