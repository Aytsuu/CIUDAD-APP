export type Notification = {
  notif_id: number;
  notif_title: string;
  notif_message: string;
  created_at: string;
  action_url?: string;
  is_read: boolean;
}
