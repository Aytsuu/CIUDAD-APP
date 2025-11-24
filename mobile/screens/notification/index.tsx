import React, { useState, useRef } from "react";
import { TouchableOpacity, View, Text, FlatList, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { Bell, MoreVertical, Check, CheckCheck, ChevronLeft, FileText, Info, Clock  } from "lucide-react-native";
import GetNotification from "./queries/getNotification";
import { DrawerView } from "@/components/ui/drawer";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useMarkAsRead, useMarkAllAsRead } from "./queries/updateNotification";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingState } from "@/components/ui/loading-state";

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
        <View className={`${baseClass} bg-blue-100 ${className}`}>
          <FileText className="w-5 h-5 text-blue-600" />
        </View>
      );
    case "REMINDER":
      return (
        <View className={`${baseClass} bg-amber-100 ${className}`}>
          <Clock className="w-5 h-5 text-amber-600" />
        </View>
      );
    case "INFO":
      return (
        <View className={`${baseClass} bg-indigo-100 ${className}`}>
          <Info className="w-5 h-5 text-indigo-600" />
        </View>
      );
    case "REPORT":
      return (
        <View className={`${baseClass} bg-red-100 ${className}`}>
          <Info className="w-5 h-5 text-red-600" />
        </View>
      );
    default:
      return (
        <View className={`${baseClass} bg-gray-100 ${className}`}>
          <Bell className="w-5 h-5 text-gray-600" />
        </View>
      );
  }
};

export default function NotificationScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  
  // Refs for bottom sheets
  const notifDrawerRef = useRef<BottomSheet>(null);
  const headerDrawerRef = useRef<BottomSheet>(null);

  const {data: notifications, isLoading, isError, error, refetch, isFetching} = GetNotification();
  
  const { mutate: markAsRead, isPending: isMarkingAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAllAsRead } = useMarkAllAsRead();

  // Refresh notifications when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 NotificationScreen focused, invalidating query...');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }, [queryClient])
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
      }
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Unknown';
    }
  };

  const getDateSection = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInHours < 24) {
        return "Today";
      } else if (diffInDays === 1) {
        return "Yesterday";
      } else if (diffInDays < 7) {
        return "This Week";
      } else if (diffInDays < 30) {
        return "This Month";
      } else {
        return "Older";
      }
    } catch (err) {
      return "Unknown";
    }
  };

  const groupNotificationsByDate = (notifications: any[]) => {
    if (!notifications) return [];
    
    const grouped: { [key: string]: any[] } = {};
    const sections = ["Today", "Yesterday", "This Week", "This Month", "Older"];
    
    notifications.forEach((notif) => {
      const section = getDateSection(notif.notif_created_at);
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(notif);
    });

    return sections
      .filter((section) => grouped[section] && grouped[section].length > 0)
      .map((section) => ({
        title: section,
        data: grouped[section],
      }));
  };

  const handleNotificationPress = (item: any) => {
    if (!item.is_read) {
      markAsRead(item.notif_id);
    }
    
    if (item.mobile_route?.screen) {
      const { screen, params } = item.mobile_route;
      
      try {
        router.push({
          pathname: screen,
          params: params
        })
        
      } catch (error) {
        console.error('❌ [NotificationScreen] Navigation error:', error);
      }
    } else {
      console.log('⚠️ [NotificationScreen] No mobile route found for notification');
    }
  };

  const handleMorePress = (item: any) => {
    console.log('⚙️ [NotificationScreen] More options pressed for:', item.notif_id);
    setSelectedNotification(item);
    notifDrawerRef.current?.expand();
  };

  const handleNotifAction = (action: string) => {
    if (!selectedNotification) return;
    
    console.log('🎬 [NotificationScreen] Action:', action, 'for:', selectedNotification.notif_id);
    
    switch (action) {
      case "mark_read":
        markAsRead(selectedNotification.notif_id);
        notifDrawerRef.current?.close();
        break;
      case "view":
        handleNotificationPress(selectedNotification);
        notifDrawerRef.current?.close();
        break;
    }
  };

  const handleHeaderAction = (action: string) => {
    if (action === "mark_all_read") {
      const unreadIds = notifications
        ?.filter((n: any) => !n.is_read)
        .map((n: any) => n.notif_id) || [];
      
      if (unreadIds.length > 0) {
        markAllAsRead(unreadIds);
      } else {
        Alert.alert("Info", "All notifications are already marked as read.");
      }
    }
    
    headerDrawerRef.current?.close();
  };

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

  const ListHeaderComponent = () => (
    <View className="bg-white px-5 py-4 border-b border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4"
          >
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">Notifications</Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => headerDrawerRef.current?.expand()}
          className="p-1"
          disabled={isMarkingAllAsRead}
        >
          {isMarkingAllAsRead ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <MoreVertical size={20} color="#000" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListEmptyComponent = () => {
    if (isLoading) {
      return (
        <LoadingState />
      );
    }

    if (isError) {
      return (
        <View className="flex-1 justify-center items-center px-4 py-20">
          <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
            <Bell size={32} color="#EF4444" />
          </View>
          <Text className="text-gray-900 font-semibold text-lg mt-2">
            Failed to load notifications
          </Text>
          <Text className="text-gray-500 text-center mt-2 px-8">
            {error?.message || "Something went wrong. Please try again."}
          </Text>
          <TouchableOpacity
            onPress={() => {
              refetch();
            }}
            className="mt-6 bg-blue-500 px-8 py-3 rounded-xl shadow-sm"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center px-4 py-20">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Bell size={40} color="#9CA3AF" />
        </View>
        <Text className="text-gray-900 font-semibold text-lg mt-2">
          No notifications yet
        </Text>
        <Text className="text-gray-500 text-center mt-2 px-8">
          You're all caught up! We'll notify you when something new arrives.
        </Text>
      </View>
    );
  };

  const groupedNotifications = groupNotificationsByDate(notifications || []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <FlatList
        data={groupedNotifications}
        keyExtractor={(item, index) => String(index)}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{ 
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => {
              console.log('🔄 Manual refresh triggered');
              refetch();
            }}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        renderItem={({ item: section }) => (
          <View>
            {/* Section Header */}
            <View className="px-5 py-3 bg-gray-50">
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {section.title}
              </Text>
            </View>

            {/* Section Items */}
            {section.data.map((item: any, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleNotificationPress(item)}
                className={`px-5 py-4 border-b border-gray-100 ${
                  !item.is_read ? "bg-blue-50" : "bg-white"
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-start">
                  {/* Avatar/Icon */}
                  <View className="relative pr-4">
                    <NotificationTypeIcon notif_type={item.notif_type} />

                    {!item.is_read && (
                      <View className="absolute top-0.5 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full" />
                    )}
                  </View>
                  
                  {/* Content */}
                  <View className="flex-1 pr-8">
                    <Text className="text-sm text-gray-900 font-medium leading-5 mb-1">
                      {item.notif_title}
                    </Text>
                    <Text
                      className="text-sm text-gray-700 leading-5 mb-1"
                      numberOfLines={2}
                    >
                      {item.notif_message || "No message"}
                    </Text>

                    <Text className="text-xs text-gray-500">
                      {formatDate(item.notif_created_at)}
                    </Text>
                  </View>

                  {/* More Options Button */}
                  <TouchableOpacity
                    onPress={() => handleMorePress(item)}
                    className="p-2"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MoreVertical size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Notification Options Drawer */}
      <DrawerView
        bottomSheetRef={notifDrawerRef}
        snapPoints={["30%"]}
        title="Notification Options"
        description="Manage this notification"
      >
        <View className="pb-6">
          {!selectedNotification?.is_read && (
            <TouchableOpacity
              onPress={() => handleNotifAction("mark_read")}
              className="flex-row items-center p-4 rounded-xl mb-3 bg-gray-50"
              activeOpacity={0.7}
              disabled={isMarkingAsRead}
            >
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3">
                {isMarkingAsRead ? (
                  <ActivityIndicator size="small" color="#6B7280" />
                ) : (
                  <Check size={20} color="#6B7280" />
                )}
              </View>
              <Text className="text-base font-normal text-gray-900">
                {isMarkingAsRead ? "Marking..." : "Mark as Read"}
              </Text>
            </TouchableOpacity>
          )}
          
          {selectedNotification?.is_read && (
            <View className="p-4 bg-green-50 rounded-xl">
              <View className="flex-row items-center">
                <CheckCheck size={20} color="#10B981" />
                <Text className="text-base font-normal text-green-700 ml-3">
                  Already read
                </Text>
              </View>
            </View>
          )}
        </View>
      </DrawerView>

      {/* Header Options Drawer */}
      <DrawerView
        bottomSheetRef={headerDrawerRef}
        snapPoints={["30%"]}
        title="Notification Settings"
        description="Manage your notifications"
      >
        <View className="pb-6">
          <TouchableOpacity
            onPress={() => handleHeaderAction("mark_all_read")}
            className="flex-row items-center p-4 bg-gray-50 rounded-xl mb-3"
            activeOpacity={0.7}
            disabled={isMarkingAllAsRead || unreadCount === 0}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3">
              {isMarkingAllAsRead ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                <CheckCheck size={20} color={unreadCount === 0 ? "#D1D5DB" : "#6B7280"} />
              )}
            </View>
            <View className="flex-1">
              <Text className={`text-base ${unreadCount === 0 ? "text-gray-400" : "text-gray-900"}`}>
                {isMarkingAllAsRead ? "Marking all..." : "Mark All as Read"}
              </Text>
              {unreadCount > 0 && (
                <Text className="text-xs text-gray-500 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </DrawerView>
    </SafeAreaView>
  );
}