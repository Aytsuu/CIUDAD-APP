import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Bell, MoreHorizontal, Eye, CheckCheck, ExternalLink, BookCopy, Settings  } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { fetchNotification } from "../../queries/fetchNotificationQueries";
import { listenForMessages } from "@/firebase";
import { showNotificationToast } from "@/components/ui/toast";
import { useUpdateBulkNotification, useUpdateNotification } from "../../queries/updateNotificationQueries";
import { MdNotificationAdd } from "react-icons/md";
import { Button } from "@/components/ui/button/button";
import ciudadLogo from "@/assets/images/ciudad_logo.svg";

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
    acc_id: string;
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
  const [displayCount, setDisplayCount] = useState(10);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState<"all" | "read" | "unread">("all");
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, refetch } = fetchNotification();
  
  // Auto-refetch notifications every 30 seconds as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);
  
  useEffect(() => {
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    }
  }, [data]);

  const buildRedirectUrl = (redirectUrl?: { path: string; params: Record<string, any> }) => {
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

  // Listen for live FCM push notifications in foreground
  useEffect(() => {
    console.log('Setting up FCM listener...');
    
    const unsubscribe = listenForMessages((payload) => {
      console.log('📩 FCM message received:', JSON.stringify(payload, null, 2));
      
      try {
        // IMPORTANT: Backend sends 'web_route' but we need to map it to 'redirect_path'
        let redirectUrl = undefined;
        
        // Check if data exists and has web_route
        if (payload.data?.web_route) {
          try {
            // Parse web_params if it's a JSON string
            let params = {};
            if (payload.data.web_params) {
              params = typeof payload.data.web_params === 'string' 
                ? JSON.parse(payload.data.web_params)
                : payload.data.web_params;
            }
            
            redirectUrl = {
              path: payload.data.web_route,
              params: params
            };
            
            console.log('📍 Parsed redirect URL:', redirectUrl);
          } catch (e) {
            console.error("Failed to parse web params:", e);
          }
        }

        const newNotif: Notification = {
          notif_id: payload.data?.notification_id || Date.now().toString(),
          notif_title: payload.notification?.title || "No title",
          notif_message: payload.notification?.body || "No message",
          notif_type: payload.data?.notif_type || "",
          is_read: false,
          notif_created_at: new Date().toISOString(),
          redirect_url: redirectUrl,
        };

        console.log('✅ Created notification object:', newNotif);

        // Update state first
        setNotifications((prev) => {
          console.log('📝 Adding notification to state. Current count:', prev.length);
          return [newNotif, ...prev];
        });
        setUnreadCount((prev) => prev + 1);

        // Show toast notification
        console.log('🔔 Showing toast notification...');
        showNotificationToast({
          title: newNotif.notif_title,
          description: newNotif.notif_message,
          avatarSrc: ciudadLogo,
          timestamp: "just now",
          onClick: redirectUrl ? () => {
            const url = buildRedirectUrl(redirectUrl);
            if (url) navigate(url);
          } : undefined,
        });
        
        // Also refetch to ensure we're in sync with backend
        console.log('🔄 Refetching notifications from backend...');
        setTimeout(() => refetch(), 1000);
        
      } catch (error) {
        console.error('❌ Error processing notification:', error);
      }
    });

    return () => {
      console.log('Cleaning up FCM listener');
      unsubscribe();
    };
  }, [navigate, refetch]);

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
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsRead(notification.notif_id);
    }
    
    // Navigate using the redirect_url
    if (notification.redirect_url) {
      const url = buildRedirectUrl(notification.redirect_url);
      if (url) {
        navigate(url);
      }
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
          const url = buildRedirectUrl(notification.redirect_url);
          if (url) {
            navigate(url);
          }
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
    if(action === "view_notification") {
      navigate("/notification");
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
    },
    {
      id: "notification_settings",
      name: "Notification Settings",
      icon: <Settings className="h-4 w-4" />,
    }
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

  const loadMoreNotifications = () => {
    setDisplayCount((prev) => prev + 10);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "unread") return !n.is_read;
    return true;
  });

  const displayedNotifications = filteredNotifications.slice(0, displayCount);
  const hasMore = displayCount < filteredNotifications.length;

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
          <div className="px-4 py-3 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-darkBlue2">Notifications</h1>
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
            
            <div className="flex-1 justify-start">
              <Button
                onClick={() => {
                  setFilterType("all");
                  setDisplayCount(10);
                }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium shadow-none rounded-full transition-colors duration-200 mr-2 ${
                  filterType === "all" 
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-100" 
                    : "bg-gray-100 text-black/90 hover:bg-gray-200"
                }`}
              >
                All
              </Button>
              <Button
                onClick={() => {
                  setFilterType("unread");
                  setDisplayCount(10);
                }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium shadow-none rounded-full transition-colors duration-200 ${
                  filterType === "unread" 
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-100" 
                    : "bg-gray-100 text-black/90 hover:bg-gray-200"
                }`}
              >
                Unread
              </Button>
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
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {filterType === "all" && "We'll let you know when something happens"}
                </p>
              </div>
            ) : (
              <div>
                {displayedNotifications.map((item) => (
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
                          <AvatarImage />
                          <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                            S
                          </AvatarFallback>
                        </Avatar>
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

                {hasMore && (
                  <div className="p-3 text-center border-t border-gray-100 bg-gray-50">
                    <Button
                      onClick={loadMoreNotifications}
                      variant="ghost"
                      className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      See Previous Notifications
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};