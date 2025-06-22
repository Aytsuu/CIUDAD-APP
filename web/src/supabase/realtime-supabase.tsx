import { RealtimeChannel } from "@supabase/supabase-js";
import supabase from "./supabase";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

/* Purpose: 
        ◉  Tracks all active WebSocket connections
        ◉  Prevents duplicate subscriptions for the same user
        ◉  Enables centralized management    
*/

let activeChannels = new Map<string, RealtimeChannel>();

export const manageNotificationChannel = (user_id: string) => {
    
    // creates a channel if it does not exists
    if (!activeChannels.has(user_id)) {
    const channel = supabase
      .channel(`notification_${user_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notification",
          filter: `acc_id=eq.${user_id}`,
        },
        (payload) => console.log("Changes: ", payload)
      )
      .subscribe();
      activeChannels.set(user_id, channel);
  }


  return () => {
    const channel = activeChannels.get(user_id);
    if (channel) {
        supabase.removeChannel(channel)
        activeChannels.delete(user_id);
    }
  };
};

export const AuthAwareNotifier = () => {
    const { user } = useAuth();

    useEffect(() => {
        if(!user?.id) return;
        console.log(user?.djangoUser?.email)
        const cleanup = manageNotificationChannel(user.id);

        return cleanup;
    }, [user?.id])
}
