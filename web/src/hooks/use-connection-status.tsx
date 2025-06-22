import { useEffect, useState } from "react";
import supabase from "@/supabase/supabase";
import { WebSocketStatus } from "@/services/web-socket-service";

export function useConnectionStatus() {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  
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