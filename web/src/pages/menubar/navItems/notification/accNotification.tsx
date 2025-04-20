import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { CheckCheck, MailOpen, Ellipsis } from "lucide-react";
import CardLayout from "../../../../components/ui/card/card-layout";
import DropdownLayout from "../../../../components/ui/dropdown/dropdown-layout";
import type { Notification } from "./types-notification";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function AccNotification(): JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([]); // Initialize as empty array
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications/global-notifications/');
        // Ensure we're working with an array
        const notificationsData = Array.isArray(response.data) ? response.data : [];
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]); // Fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const notificationPopover = (
    <div className="max-h-96 overflow-y-auto">
      <hr className="mb-2" />
      {loading ? (
        <div className="p-4 text-center">Loading notifications...</div>
      ) : notifications.length > 0 ? (
        notifications.map((notif) => (
          <div
            key={notif.notif_id}
            className="flex items-start p-3 hover:bg-lightBlue hover:rounded-md cursor-pointer"
          >
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{notif.notif_title}</p>
                {!notif.is_read && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {notif.notif_message}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {dayjs(notif.created_at).fromNow()}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          No notifications available
        </div>
      )}
    </div>
  );

  const notificationPopoverHeader = (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-x-2">
        <p className="text-base font-medium text-black">Notifications</p>
        <p className="flex items-center justify-center text-xs font-semibold text-white bg-red-500 w-5 h-5 rounded-full">
          {notifications.filter((n) => !n.is_read).length}
        </p>
      </div>
      <DropdownLayout
        trigger={
          <div className="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 cursor-pointer hover:text-white hover:bg-darkBlue2">
            <Ellipsis size={16} />
          </div>
        }
        contentClassName="p-2"
        options={[
          {
            id: "mark-as-read",
            name: "Mark all as Read",
            icon: <CheckCheck size={16} />,
          },
        ]}
        onSelect={(id) => {
          if (id === "mark-as-read") markAsRead();
        }}
      />
    </div>
  );

  return (
    <Popover>
      <PopoverTrigger className="relative flex items-center">
        <MailOpen size={22} />
        {notifications.some((n) => !n.is_read) && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </PopoverTrigger>
      <PopoverContent className="absolute right-0 top-2 p-0 w-80 z-50 bg-white rounded-md shadow-lg">
        <CardLayout
          cardClassName="px-2"
          headerClassName="p-2"
          description={notificationPopoverHeader}
          contentClassName="p-0"
          content={notificationPopover}
        />
      </PopoverContent>
    </Popover>
  );
}
function markAsRead() {
  throw new Error("Function not implemented.");
}

