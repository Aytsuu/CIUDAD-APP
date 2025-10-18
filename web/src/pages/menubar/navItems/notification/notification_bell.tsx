import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Bell, MoreHorizontal, Eye, CheckCheck, ExternalLink, BookCopy  } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { fetchNotification } from "../../queries/fetchNotificationQueries";
import { listenForMessages } from "@/firebase";
import { toast } from "sonner";
import { useUpdateBulkNotification, useUpdateNotification } from "../../queries/updateNotificationQueries";
import { MdNotificationAdd } from "react-icons/md";
import { Button } from "@/components/ui/button/button";

interface Notification {
  notif_id: string;
  notif_title: string;
  notif_message: string;
  notif_type: string;
  is_read: boolean;
  notif_created_at: string;
  redirect_url?: string;
  sender_name?: string;
  sender_profile?: string;
  resident?: {
    rp_id: string;
    name?: string;
  };
}

interface NotificationTypeIconProps {
  notif_type?: string;
}

const NotificationIconType: React.FC<NotificationTypeIconProps> = ({ notif_type }) => {
  switch (notif_type) {
    case "REQUEST":
      return (
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-2 border-white shadow-md">
          <BookCopy className="w-5 h-5 text-white" />
        </div>
      );
    default:
      return null;
  }
};


export const NotificationBell: React.FC = () => {
  const navigate = useNavigate(); 
  const {mutate: bulkMarkAsRead} = useUpdateBulkNotification();
  const {mutate: MarkAsRead} = useUpdateNotification();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, refetch } = fetchNotification();
  console.log(JSON.stringify(notifications, null, 2));
  useEffect(() => {
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    }
  }, [data]);

  // Listen for live FCM push notifications in foreground
  useEffect(() => {
    const unsubscribe = listenForMessages((payload) => {
      const newNotif: Notification = {
        notif_id: payload.data?.notification_id || Date.now().toString(),
        notif_title: payload.notification?.title || "No title",
        notif_message: payload.notification?.body || "No message",
        notif_type: payload.data?.notif_type || "",
        is_read: false,
        notif_created_at: new Date().toISOString(),
        redirect_url: payload.data?.redirect_url,
        sender_name: payload.data?.sender_name,
        sender_profile: payload.data?.sender_profile,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast(
        <div className="flex items-center gap-3 w-full">
          <Avatar className="h-16 w-16 ring-2 ring-white shadow-md flex-shrink-0">
            <AvatarImage
              src={newNotif.sender_profile}
              alt={newNotif.sender_name || "System"}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-medium text-sm">
              {newNotif.sender_name?.charAt(0) || "S"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 pr-4">
            <p className="font-semibold text-sm text-gray-900 mb-0.5">
              {newNotif.notif_title}
            </p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {newNotif.notif_message}
            </p>
          </div>
        </div>,
        {
          duration: 5000,
        }
      );
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleAcceptRequest = (id: string) => {

  }

  const handleDeclineRequest = (id: string) => {

  }

  const markAsRead = (notif_id: string) => {
    MarkAsRead(notif_id, {
      onSuccess: () => {
        setNotifications((prev) => 
          prev.map((n) => n.notif_id === notif_id ? {...n, is_read: true} : n)
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    });
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n)=> n.notif_id);

    if (unreadIds.length === 0) return;

    bulkMarkAsRead(unreadIds, {
      onSuccess: () => {
        setNotifications((prev) => prev.map((n) => ({...n, is_read: true})));
        setUnreadCount(0);
      }
    })
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsRead(notification.notif_id);
    }
    
    if (notification.redirect_url) {
      navigate(notification.redirect_url);
    }
    
    setOpen(false);
  };

  const handleNotificationMenuAction = (
    action: string,
    notif_id: string
  ) => {
    const notification = notifications.find((n) => n.notif_id === notif_id);
    
    switch (action) {
      case "view":
        if (notification?.redirect_url) {
          navigate(notification.redirect_url);
        }
        setOpen(false);
        break;
      case "mark_read":
        markAsRead(notif_id);
        break;
    }
  };

  const handleHeaderMenuAction = (action: string) => {
    if (action === "mark_all_read") {
      markAllAsRead();
    }
  };

  const headerMenuOptions = [
    {
      id: "mark_all_read",
      name: "Mark All as Read",
      icon: <CheckCheck className="h-4 w-4" />,
    },
    {
      id: "view_notification",
      name: "Open Notification",
      icon: <MdNotificationAdd className="h-4 w-4" />,
    }
  ];

  const getNotificationMenuOptions = (notification: Notification) => {
    const options = [];
    // Show "View Notification" if there's a redirect URL
    if (notification.redirect_url) {
      options.push({
        id: "view",
        name: "View Notification",
        icon: <ExternalLink className="h-4 w-4" />,
      });
    }

    if (!notification.is_read) {
      options.push({
        id: "mark_read",
        name: "Mark as Read",
        icon: <Eye className="h-4 w-4 " />,
      });
    }

    return options;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer p-3 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <Bell
            className={`h-6 w-6 transition-colors duration-200 ${
              unreadCount > 0 ? "text-gray-700" : "text-gray-600"
            }`}
          />
          {unreadCount > 0 && (
           <Badge className="absolute -top-0.5 -right-1 h-5 w-5 rounded-full bg-red-500 hover:bg-red-400 text-white text-xs flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>

          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 shadow-lg border border-gray-200 bg-white rounded-lg overflow-hidden"
        align="end"
        side="bottom"
        sideOffset={8}
        alignOffset={-50}
      >
        <div className="w-full">
          <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 text-base">Notifications</h4>
            </div>
            <div className="flex items-center gap-1">
              <DropdownLayout
                trigger={
                  <button
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors duration-200"
                    title="Options"
                  >
                    <MoreHorizontal className="h-5 w-5 text-gray-600" />
                  </button>
                }
                options={headerMenuOptions}
                onSelect={handleHeaderMenuAction}
                contentClassName="w-48"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  Loading notifications...
                </p>
              </div>
            ) : isError ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-6 w-6 text-red-400" />
                </div>
                <p className="text-red-500 text-sm font-medium">
                  Failed to load notifications
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  We'll let you know when something happens
                </p>
              </div>
            ) : (
              <div>
                {notifications.slice(0, 10).map((item) => (
                  <div
                    key={item.notif_id}
                    onClick={() => handleNotificationClick(item)}
                    className={`cursor-pointer px-4 py-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                      !item.is_read ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-16 w-16">
                          <AvatarImage
                            src={item.sender_profile}
                            alt={item.sender_name || "System"}
                          />
                          <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                            {item.sender_name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>

                        {/** Icons for specific type notifications */}
                        <div className="absolute -bottom-2 -right-1">
                          <NotificationIconType notif_type={item.notif_type}/>
                        </div>
                        {!item.is_read && (
                          <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-blue-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 mb-0.5">
                              <span className="font-semibold">{item.notif_title}</span>
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-1">
                              {item.notif_message || "No message content"}
                            </p>
                            <span className="text-xs text-gray-400 w-full">
                              {formatTimeAgo(item.notif_created_at)}
                            </span>
                           {/* <div className="flex flex-col gap-2 mt-2">
                              {item.notif_type === "REQUEST" && (
                              <div className="flex gap-2">
                                <Button
                                  className="flex-1 py-1 px-2 "
                                  onClick={(e) => { e.stopPropagation(); handleAcceptRequest(item.notif_id); }}
                                >
                                  Accept
                                </Button>
                                <Button
                                  className="flex-1 py-1 px-2 bg-gray-500 hover:bg-gray-400"
                                  onClick={(e) => { e.stopPropagation(); handleDeclineRequest(item.notif_id); }}
                                >
                                  Decline
                                </Button>
                              </div>
                              )}
                            </div> */}
                          </div>
                          <div
                            className="flex items-start"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownLayout
                              trigger={
                                <button
                                  className="p-1 hover:bg-gray-200 rounded-md transition-colors duration-200"
                                  title="More options"
                                >
                                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                </button>
                              }
                              options={getNotificationMenuOptions(item)}
                              onSelect={(action) =>
                                handleNotificationMenuAction(action, item.notif_id)
                              }
                              contentClassName="w-48"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 10 && (
            <div className="p-3 text-center text-sm border-t border-gray-100 bg-white">
              <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline">
                View all notifications
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}