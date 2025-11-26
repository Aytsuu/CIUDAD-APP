import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  Eye,
  ExternalLink,
  Bell,
  CheckCheck,
  Settings,
  FileText,
  Clock,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { fetchNotification } from "../../queries/fetchNotificationQueries";
import {
  useUpdateBulkNotification,
  useUpdateNotification,
} from "../../queries/updateNotificationQueries";

// ======================
// Interfaces
// ======================
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
  resident?: {
    rp_id: string;
    name?: string;
  };
}

interface NotificationTypeIconProps {
  notif_type?: string;
  className?: string;
}

// Icon component based on notification type
const NotificationTypeIcon: React.FC<NotificationTypeIconProps> = ({ notif_type, className = "" }) => {
  const baseClass = "w-10 h-10 rounded-full flex items-center justify-center";
  
  switch (notif_type) {
    case "REQUEST":
      return (
        <div className={`${baseClass} bg-blue-100 ${className}`}>
          <FileText className="w-7 h-7 text-blue-600" />
        </div>
      );
    case "REMINDER":
      return (
        <div className={`${baseClass} bg-amber-100 ${className}`}>
          <Clock className="w-7 h-7 text-amber-600" />
        </div>
      );
    case "INFO":
      return (
        <div className={`${baseClass} bg-indigo-100 ${className}`}>
          <Info className="w-7 h-7 text-indigo-600" />
        </div>
      );
    default:
      return (
        <div className={`${baseClass} bg-gray-100 ${className}`}>
          <Bell className="w-7 h-7 text-gray-600" />
        </div>
      );
  }
};

// ======================
// Main Component
// ======================
export default function Notification() {
  const navigate = useNavigate();
  const { mutate: bulkMarkAsRead } = useUpdateBulkNotification();
  const { mutate: markAsReadMutation } = useUpdateNotification();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [_unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState<"all" | "unread">("all");

  const { data, isLoading, isError, refetch } = fetchNotification();

  // ======================
  // Data Fetching
  // ======================
  useEffect(() => {
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    }
  }, [data]);

  // ======================
  // Helpers
  // ======================
  const buildRedirectUrl = (redirectUrl?: {
    path: string;
    params: Record<string, any>;
  }) => {
    if (!redirectUrl?.path) return null;

    const { path, params } = redirectUrl;
    const searchParams = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return searchParams ? `/${path}?${searchParams}` : `/${path}`;
  };

  const markAsRead = (notif_id: string) => {
    markAsReadMutation(notif_id, {
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

  // ======================
  // Handlers
  // ======================
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) markAsRead(notification.notif_id);
    const url = buildRedirectUrl(notification.redirect_url);
    if (url) navigate(url);
  };

  const handleNotificationMenuAction = (action: string, notif_id: string) => {
    const notification = notifications.find((n) => n.notif_id === notif_id);
    if (!notification) return;

    switch (action) {
      case "view":
        const url = buildRedirectUrl(notification.redirect_url);
        if (url) navigate(url);
        break;
      case "mark_read":
        markAsRead(notif_id);
        break;
    }
  };

  const handleHeaderMenuAction = (action: string) => {
    if (action === "mark_all_read") markAllAsRead();
  };

  // ======================
  // Menu Options
  // ======================
  const headerMenuOptions = [
    {
      id: "mark_all_read",
      name: "Mark All as Read",
      icon: <CheckCheck className="h-4 w-4" />,
    },
    {
      id: "notification_settings",
      name: "Notification Settings",
      icon: <Settings className="h-4 w-4" />,
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
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const filteredNotifications = notifications.filter((n) =>
    filterType === "unread" ? !n.is_read : true
  );

  // ======================
  // Render
  // ======================
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-2xl text-darkBlue2">Notifications</h2>
            <DropdownLayout
              trigger={
                <button
                  className="p-1.5 hover:bg-gray-100 rounded-md"
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

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 text-sm font-medium rounded-full ${
                filterType === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-black/90 hover:bg-gray-200"
              }`}
            >
              All
            </Button>
            <Button
              onClick={() => setFilterType("unread")}
              className={`px-4 py-2 text-sm font-medium rounded-full ${
                filterType === "unread"
                  ? "bg-blue-100 text-blue-700"
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
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-red-500 font-medium mb-2">
                Failed to load notifications
              </p>
              <button
                onClick={() => refetch()}
                className="text-sm text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                {filterType === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
              {filterType === "all" && (
                <p className="text-gray-400 text-sm mt-2">
                  We’ll let you know when something happens.
                </p>
              )}
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.notif_id}
                onClick={() => handleNotificationClick(item)}
                className={`cursor-pointer px-6 py-4 border-b border-gray-100 hover:bg-gray-50 ${
                  !item.is_read ? "bg-blue-50" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <NotificationTypeIcon notif_type={item.notif_type} />
                    {!item.is_read && (
                      <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-blue-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.notif_title}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {item.notif_message || "No message content"}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(item.notif_created_at)}
                        </span>
                      </div>

                      <div
                        className="flex items-start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownLayout
                          trigger={
                            <button className="p-1 hover:bg-gray-200 rounded-md">
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}