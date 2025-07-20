import { NotificationType } from "@/context/notif-types"
import { User } from "@/context/auth-types";

interface NotificationConfig {
  title: string;
  message: string;
  recipient_ids: (string | number)[];
  metadata: {
    action_url: string;
    sender_name: string;
    sender_avatar: string;
  };
}

export const getNotificationConfig = ( type: NotificationType,
    user: User,
    additionalData?: Record<string,any>
): NotificationConfig => {
    const BASE_CONFIG = {
        recipient_ids: [user?.acc_id || ""],
        metadata:{
            sender_avatar: user?.profile_image || ""
        },
    };

    switch(type) { 

        // Add another type of notification here
        case "REPORT_FILED":
            return {
                ...BASE_CONFIG,
                title: "New Report Filed",
                message: "Your request has been processed",
                metadata: {
                    ...BASE_CONFIG.metadata,
                    action_url: "/reports",
                    sender_name: `${additionalData?.name}`
                },
            };
        
        default:
            return {
                ...BASE_CONFIG,
                title: "System Notification",
                message: "You have a new notification",
                metadata: {
                    ...BASE_CONFIG.metadata,
                    action_url: "/notifications",
                    sender_name: `${additionalData?.name}`
                },
            };
    }
}