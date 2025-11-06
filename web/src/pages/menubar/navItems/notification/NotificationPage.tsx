import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  Eye,
  ExternalLink,
  BookCopy,
  Bell,
  CheckCheck,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button/button";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { fetchNotification } from "../../queries/fetchNotificationQueries";
import {
  useUpdateBulkNotification,
  useUpdateNotification,
} from "../../queries/updateNotificationQueries";

interface Notification {
  notif_id: string;
  notif_title: string;
  notif_message: string;
  notif_type: string;
  is_read: boolean;
  notif_created_at: string;
  redirect_url?: {
    path: string;
    params: Record<string, any>;
  };
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

const NotificationIconType: React.FC<NotificationTypeIconProps> = ({
  notif_type,
}) => {
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

export default function Notification() {
  const navigate = useNavigate();
  const { mutate: bulkMarkAsRead } = useUpdateBulkNotification();
  const { mutate: MarkAsRead } = useUpdateNotification();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [_unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState<"all" | "unread">("all");
  const { data, isLoading, isError, refetch } = fetchNotification();

  useEffect(() => {
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    }
  }, [data]);

  const buildRedirectUrl = (redirectUrl?: {
    path: string;
    params: Record<string, any>;
  }) => {
    if (!redirectUrl || !redirectUrl.path) return null;

    const { path, params } = redirectUrl;
    if (!params || Object.keys(params).length === 0) {
      return path;
    }

    const searchParams = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return `${path}?${searchParams}`;
  };

  const markAsRead = (notif_id: string) => {
    MarkAsRead(notif_id, {
      onSuccess: () => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notif_id === notif_id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      },
    });
  };

  const markAllAsRead = () => {
    const unreadIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.notif_id);

    if (unreadIds.length === 0) return;

    bulkMarkAsRead(unreadIds, {
      onSuccess: () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      },
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.notif_id);
    }

    if (notification.redirect_url) {
      const url = buildRedirectUrl(notification.redirect_url);
      if (url) {
        navigate(url);
      }
    }
  };

  const handleNotificationMenuAction = (action: string, notif_id: string) => {
    const notification = notifications.find((n) => n.notif_id === notif_id);

    switch (action) {
      case "view":
        if (notification?.redirect_url) {
          const url = buildRedirectUrl(notification.redirect_url);
          if (url) {
            navigate(url);
          }
        }
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
        id: "notification_settings",
        name: "Notification Settings",
        icon: <Settings className="h-4 w-4"/>
    },
  ];

  const getNotificationMenuOptions = (notification: Notification) => {
    const options = [];
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
        icon: <Eye className="h-4 w-4" />,
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
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "unread") return !n.is_read;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-2xl sm:text-2xl text-darkBlue2">
                Notifications
              </h2>
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

          {/* Filter Tabs */}
          <div className="flex justify-start gap-2">
            <Button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 text-sm font-medium shadow-none rounded-full transition-colors duration-200 ${
                filterType === "all"
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                  : "bg-gray-100 text-black/90 hover:bg-gray-200"
              }`}
            >
              All
            </Button>
            <Button
              onClick={() => setFilterType("unread")}
              className={`px-4 py-2 text-sm font-medium shadow-none rounded-full transition-colors duration-200 ${
                filterType === "unread"
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                  : "bg-gray-100 text-black/90 hover:bg-gray-200"
              }`}
            >
              Unread
            </Button>
          </div>
        </div>

        {/* Content */}
        <div>
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-base">
                Loading notifications...
              </p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-red-500 text-base font-medium mb-2">
                Failed to load notifications
              </p>
              <button
                onClick={() => refetch()}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-base">
                {filterType === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {filterType === "all" &&
                  "We'll let you know when something happens"}
              </p>
            </div>
          ) : (
            <>
              {filteredNotifications.map((item) => (
                <div
                  key={item.notif_id}
                  onClick={() => handleNotificationClick(item)}
                  className={`cursor-pointer px-6 py-4 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
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

                      <div className="absolute -bottom-2 -right-1">
                        <NotificationIconType notif_type={item.notif_type} />
                      </div>
                      {!item.is_read && (
                        <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-blue-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 mb-0.5">
                            <span className="font-semibold">
                              {item.notif_title}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-1">
                            {item.notif_message || "No message content"}
                          </p>
                          <span className="text-xs text-gray-400 w-full">
                            {formatTimeAgo(item.notif_created_at)}
                          </span>
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
                              handleNotificationMenuAction(
                                action,
                                item.notif_id
                              )
                            }
                            contentClassName="w-48"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}