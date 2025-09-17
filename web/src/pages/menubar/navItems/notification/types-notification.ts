export type Notification = {
  id: string;               
  user?: number;             
  notif_title: string;      
  notif_message: string;    
  sender?: string;         
  notification_type?: string; 
  created_at: string;      
  action_url?: string;      
  is_read: boolean;         
  related_object_id?: number; 
  related_object_type?: string; 
};