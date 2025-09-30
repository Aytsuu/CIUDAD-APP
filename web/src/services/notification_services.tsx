// import supabase from "@/supabase/supabase";
// import { Notification, CreateNotificationPayload } from "@/context/auth-types";

// export class NotificationService {
//   private static instance: NotificationService;
//   private channels: Record<string, any> = {};

//   private constructor() {}

//   public static getInstance(): NotificationService {
//     if (!NotificationService.instance) {
//       NotificationService.instance = new NotificationService();
//     }
//     return NotificationService.instance;
//   }

//   public async getUserNotifications(acc_id: string): Promise<Notification[]> {
//     console.log('Fetching notifications for acc_id:', acc_id);
    
//     const { data, error } = await supabase
//       .from("recipient")
//       .select(
//         `
//             is_read,
//             notification:notif_id(
//                 notif_id,
//                 notif_title,
//                 notif_message,
//                 sender_id,
//                 notif_created_at,
//                 metadata
//             )
//         `
//       )
//       .eq("acc_id", acc_id)
//       .order("notif_created_at", { foreignTable: "notification", ascending: false });

//     console.log('Query result:', { data, error });

//     if (error) throw error;

//     if (!data || data.length === 0) {
//       console.log('No recipient records found for acc_id:', acc_id);
//       return [];
//     }

//     const notifications = data.map((item) => {
//       const notif = Array.isArray(item.notification) ? item.notification[0] : item.notification;
//       return {
//         id: notif?.notif_id,
//         title: notif?.notif_title,
//         message: notif?.notif_message,
//         sender_id: notif?.sender_id,
//         created_at: notif?.notif_created_at,
//         metadata: notif?.metadata,
//         is_read: item.is_read,
//       };
//     });

//     console.log('Mapped notifications:', notifications);
//     return notifications;
//   }

//   async create(
//     payload: CreateNotificationPayload,
//     sender_id: string
//   ): Promise<Notification> {
//     // Create Notification
//     const { data: notification, error: notifError } = await supabase
//       .from('notification')
//       .insert({
//         notif_title: payload.title,
//         notif_message: payload.message,
//         sender_id: sender_id,
//         notif_created_at: new Date().toISOString(),
//         metadata: payload.metadata || {}
//       })
//       .select('*')
//       .single();

//     if (notifError) throw notifError;

//     const { error: recipientError } = await supabase
//       .from('recipient')
//       .insert(
//         payload.recipient_ids.map(acc_id => ({
//           notif_id: notification.notif_id,
//           acc_id,
//           is_read: false
//         }))
//       )
//       .select('notif_id, acc_id');
    
//     if (recipientError) throw recipientError;

//     return {
//       id: notification.notif_id,
//       title: notification.notif_title,
//       message: notification.notif_message,
//       sender_id: notification.sender_id,
//       created_at: notification.notif_created_at,
//       metadata: notification.metadata,
//       is_read: false,
//     };
//   }

//   public async markAsRead(
//     notificationId: string,
//     acc_id: string
//   ): Promise<void> {
//     const { error } = await supabase
//       .from("recipient")
//       .update({ is_read: true })
//       .eq("notif_id", notificationId)
//       .eq("acc_id", acc_id);

//     if (error) throw error;
//   }

//   public subscribeToUserNotifications(
//     acc_id: string,
//     callback: (payload: Notification) => void
//   ) {
//     this.unsubscribeAll();

//     this.channels.user = supabase
//       .channel(`${acc_id}_notifications`)
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "recipient",
//           filter: `acc_id=eq.${acc_id}`,
//         },
//         async (payload) => {
//           const { data: notification } = await supabase
//             .from("notification")
//             .select("*")
//             .eq("notif_id", payload.new.notif_id)
//             .single();

//           if (notification) {
//             callback({
//               id: notification.notif_id,
//               title: notification.notif_title,
//               message: notification.notif_message,
//               sender_id: notification.sender_id,
//               created_at: notification.notif_created_at,
//               metadata: notification.metadata,
//               is_read: false,
//             });
//           }
//         }
//       )
//       .subscribe();
//   }

//   public unsubscribeAll() {
//     Object.values(this.channels).forEach((channel) => {
//       supabase.removeChannel(channel);
//     });
//     this.channels = {};
//   }
// }