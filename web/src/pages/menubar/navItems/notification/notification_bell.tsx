import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Bell, MoreHorizontal, Eye, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { fetchNotification } from "../../queries/fetchNotificationQueries";
import { listenForMessages } from "@/firebase";

interface Notification {
  notif_id: string;
  notif_title: string;
  notif_message: string;
  is_read: boolean;
  notif_created_at: string;
  redirect_url?: string;
  sender_name?: string;
  sender_avatar?: string;
  resident?: {
    rp_id: string;
    name?: string;
  };
}

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate(); // Add this hook
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Fetch notifications via query
  const { data, isLoading, isError, refetch } = fetchNotification();

  // Update local state when data is fetched
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
        is_read: false,
        notif_created_at: new Date().toISOString(),
        redirect_url: payload.data?.redirect_url,
        sender_name: payload.data?.sender_name,
        sender_avatar: payload.data?.sender_avatar,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (notif_id: string) => {
    try {
      const response = await fetch(`/api/notifications/mark-read/${notif_id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to mark as read");

      setNotifications((prev) =>
        prev.map((n) => (n.notif_id === notif_id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const deleteNotification = async (notif_id: string) => {
    try {
      const response = await fetch(`/api/notifications/${notif_id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete notification");

      setNotifications((prev) => {
        const notif = prev.find((n) => n.notif_id === notif_id);
        if (notif && !notif.is_read) {
          setUnreadCount((count) => Math.max(count - 1, 0));
        }
        return prev.filter((n) => n.notif_id !== notif_id);
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.notif_id);

      if (unreadIds.length === 0) return;

      const response = await fetch(`/api/notifications/mark-all-read/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ notification_ids: unreadIds }),
      });

      if (!response.ok) throw new Error("Failed to mark all as read");

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      notifications.forEach((n) => {
        if (!n.is_read) markAsRead(n.notif_id);
      });
    }
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
          if (notification.redirect_url.startsWith('http://') || notification.redirect_url.startsWith('https://')) {
            window.open(notification.redirect_url, '_blank');
          } else {
            navigate(notification.redirect_url);
          }
        }
        setOpen(false);
        break;
      case "mark_read":
        markAsRead(notif_id);
        break;
      case "delete":
        deleteNotification(notif_id);
        break;
    }
  };

  const handleHeaderMenuAction = (action: string) => {
    if (action === "mark_all_read") {
      markAllAsRead();
    }
  };

  const headerMenuOptions = [
    ...(unreadCount > 0
      ? [
          {
            id: "mark_all_read",
            name: "Mark All as Read",
            icon: <CheckCheck className="h-4 w-4" />,
          },
        ]
      : []),
  ];

  const getNotificationMenuOptions = (notification: Notification) => {
    const options = [];

    // Show "View Notification" if there's a redirect URL
    if (notification.redirect_url) {
      options.push({
        id: "view",
        name: "View Notification",
        icon: <ExternalLink className="h-4 w-4 text-blue-500" />,
      });
    }

    if (!notification.is_read) {
      options.push({
        id: "mark_read",
        name: "Mark as Read",
        icon: <Eye className="h-4 w-4 text-green-500" />,
      });
    }

    options.push({
      id: "delete",
      name: "Delete",
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
    });

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
        <div className="relative cursor-pointer p-3 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300">
          <Bell
            className={`h-6 w-6 transition-all duration-300 ${
              unreadCount > 0 ? "text-blue-600" : "text-gray-600"
            }`}
          />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden"
        align="end"
        side="bottom"
        sideOffset={8}
        alignOffset={-50}
      >
        <div className="w-full">
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Notifications</h4>
                {unreadCount > 0 && (
                  <p className="text-xs text-gray-600">{unreadCount} unread</p>
                )}
              </div>
            </div>
            {headerMenuOptions.length > 0 && (
              <div className="flex items-center gap-1">
                <DropdownLayout
                  trigger={
                    <button
                      className="p-2 hover:bg-white/70 rounded-xl transition-all duration-200"
                      title="Options"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-600" />
                    </button>
                  }
                  options={headerMenuOptions}
                  onSelect={handleHeaderMenuAction}
                  contentClassName="w-48"
                />
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  Loading notifications...
                </p>
              </div>
            ) : isError ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-red-400" />
                </div>
                <p className="text-red-500 font-medium">
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
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No notifications yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  We'll let you know when something happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((item) => (
                  <div
                    key={item.notif_id}
                    onClick={() => handleNotificationClick(item)}
                    className={`group cursor-pointer px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${
                      !item.is_read
                        ? "bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-l-4 border-blue-400"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-11 w-11 ring-2 ring-white shadow-lg">
                        <AvatarImage
                          src={item.sender_avatar}
                          alt={item.sender_name || "System"}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-medium">
                          {item.sender_name?.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p
                                className={`font-semibold text-sm ${
                                  !item.is_read ? "text-gray-900" : "text-gray-700"
                                }`}
                              >
                                {item.notif_title || "Notification"}
                              </p>
                              {!item.is_read && (
                                <div className="h-2 w-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                              {item.notif_message || "No message content"}
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 font-medium">
                                {formatTimeAgo(item.notif_created_at)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {item.sender_name || "System"}
                              </span>
                              {item.redirect_url && (
                                <span className="text-xs text-blue-500 flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  Click to view
                                </span>
                              )}
                            </div>
                          </div>
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownLayout
                              trigger={
                                <button
                                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200"
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
            <div className="p-3 text-center text-sm text-gray-500 border-t bg-gradient-to-r from-gray-50 to-blue-50">
              <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline">
                View all {notifications.length} notifications
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}