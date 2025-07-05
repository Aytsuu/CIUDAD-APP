import supabase from "@/supabase/supabase";
import { Notification } from "@/context/auth-types";

export class NotificationService {
  private static instance: NotificationService;
  private channels: Record<string, any> = {};

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async getUserNotifications(acc_id: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notification_users")
      .select(
        `
            is_read,
            notifications(
            id,
            title,
            message,
            notification_type,
            created_at,
            metadata
            )`
      )
      .eq("acc_id", acc_id)
      .order("created_at", { foreignTable: "notification", ascending: false });

    if (error) throw error;

    return data.map((item) => {
      const notification = Array.isArray(item.notifications)
        ? item.notifications[0]
        : item.notifications;
      return {
        ...notification,
        is_read: item.is_read,
        type: notification.notification_type,
      };
    });
  }

  public subscribeToRealtime(
    acc_id: string,
    callback: (payload: Notification) => void
  ) {
    this.unsubscribeAll();

    this.channels.user = supabase
      .channel(`${acc_id}_notifications`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification_users",
          filter: `acc_id=eq.${acc_id}`,
        },
        async (payload) => {
          const { data: notification } = await supabase
            .from("notification")
            .select("*")
            .eq("id", payload.new.notification_id)
            .single();

          callback({
            ...notification,
            type: notification.notificatio_type,
            is_read: false,
          });
        }
      )
      .subscribe();
  }

  public unsubscribeAll(){
    Object.values(this.channels).forEach(channel => {
        supabase.removeChannel(channel);
    });
    this.channels={};
  }

  public async markAsRead(notificationId: string, acc_id: string) {
    const {error} = await supabase  
        .from('notification_users')
        .update({is_read: true, read_at: new Date().toISOString() })
        .eq('noticiation_id', acc_id);
    
    if(error) throw error;
  }
}
