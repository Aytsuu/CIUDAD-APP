import React, { useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { ChevronLeft, Bell, MoreVertical, Check, BookCopy } from "lucide-react-native";
import GetNotification from "./queries/getNotification";
import { Drawer } from "@/components/ui/drawer";
import { useRouter } from "expo-router";
import { useMarkAsRead, useMarkAllAsRead } from "./queries/updateNotification";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";

interface notificationIcon {
  notif_type: string;
}
const NotificationType: React.FC<notificationIcon> = ({notif_type}) => {
  switch(notif_type) {
    case "REQUEST":
      return (
       <View className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-2 border-white shadow-md p-1">
          <BookCopy size={16} color="#fff" />
        </View>
      )
    default: 
     return null;
  }
}

export default function NotificationScreen() {
  const router = useRouter();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [notifDrawerVisible, setNotifDrawerVisible] = useState(false);
  const [headerDrawerVisible, setHeaderDrawerVisible] = useState(false);

  const {data: notifications, isLoading, isError, error, refetch, isFetching} = GetNotification();
  
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

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
        let parsedParams = {};
        if (params) {
          parsedParams = typeof params === 'string' ? JSON.parse(params) : params;
        }
        
        const queryString = Object.entries(parsedParams)
          .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
          .join('&');
        
        const href = queryString ? `${screen}?${queryString}` : screen;
        
        router.push(href as any);
        
      } catch (error) {
        console.error('❌ [NotificationScreen] Navigation error:', error);
      }
    } else {
      console.log('⚠️ [NotificationScreen] No mobile route found for notification');
    }
  };
  const handleAcceptRequest = (id: string) => {

  }

  const handleDeclineRequest = (id: string) => {

  }
  const handleMorePress = (item: any) => {
    console.log('⚙️ [NotificationScreen] More options pressed for:', item.notif_id);
    setSelectedNotification(item);
    setNotifDrawerVisible(true);
  };

  const handleNotifAction = (action: string) => {
    if (!selectedNotification) return;
    
    console.log('🎬 [NotificationScreen] Action:', action, 'for:', selectedNotification.notif_id);
    
    switch (action) {
      case "mark_read":
        markAsRead(selectedNotification.notif_id);
        break;
      case "view":
        handleNotificationPress(selectedNotification);
        break;
    }
    
    setNotifDrawerVisible(false);
  };

  const handleHeaderAction = (action: string) => {
    console.log('🎬 [NotificationScreen] Header action:', action);
    
    if (action === "mark_all_read") {
      const unreadIds = notifications
        ?.filter((n: any) => !n.is_read)
        .map((n: any) => n.notif_id) || [];
      
      console.log('📖 [NotificationScreen] Marking all as read. Count:', unreadIds.length);
      
      if (unreadIds.length > 0) {
        markAllAsRead(unreadIds);
      }
    }
    
    setHeaderDrawerVisible(false);
  };

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
          
          <Text className="text-xl font-PoppinsSemiBold text-gray-900">Notifications</Text>
        </View>
        
        <TouchableOpacity
          onPress={() => setHeaderDrawerVisible(true)}
          className="p-1"
        >
          <MoreVertical size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListEmptyComponent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="text-gray-500 mt-2 font-PoppinsRegular">
            Loading notifications...
          </Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View className="flex-1 justify-center items-center px-4 py-20">
          <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
            <Bell size={32} color="#EF4444" />
          </View>
          <Text className="text-gray-900 font-PoppinsSemiBold text-lg mt-2">
            Failed to load notifications
          </Text>
          <Text className="text-gray-500 font-PoppinsRegular text-center mt-2 px-8">
            {error?.message || "Something went wrong. Please try again."}
          </Text>
          <TouchableOpacity
            onPress={() => {
              console.log('🔄 [NotificationScreen] Retrying...');
              refetch();
            }}
            className="mt-6 bg-blue-500 px-8 py-3 rounded-xl shadow-sm"
            activeOpacity={0.8}
          >
            <Text className="text-white font-PoppinsSemiBold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center px-4 py-20">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Bell size={40} color="#9CA3AF" />
        </View>
        <Text className="text-gray-900 font-PoppinsSemiBold text-lg mt-2">
          No notifications yet
        </Text>
        <Text className="text-gray-500 font-PoppinsRegular text-center mt-2 px-8">
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
        keyExtractor={(item, index) => `section-${item.title}-${index}`}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{ 
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => {
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
              <Text className="text-xs font-PoppinsSemiBold text-gray-500 uppercase tracking-wider">
                {section.title}
              </Text>
            </View>

            {/* Section Items */}
            {section.data.map((item: any, index: number) => (
              <TouchableOpacity
                key={item.notif_id}
                onPress={() => handleNotificationPress(item)}
                className={`px-5 py-4 border-b border-gray-100 ${
                  !item.is_read ? "bg-blue-50" : "bg-white"
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-start">
                  {/* Avatar/Icon */}
                  <View className="relative">
                    <Image
                      source={
                        item.sender_profile
                          ? { uri: item.sender_profile }
                          : require("@/assets/images/Logo.png")
                      }
                      className="w-16 h-16 rounded-full mr-4"
                      style={{ backgroundColor: '#f3f4f6' }}
                    />

                    <View className="absolute -bottom-2 right-2">
                      <NotificationType notif_type={item.notif_type}/>
                    </View>
                  </View>
                  
                  {/* Content */}
                  <View className="flex-1 pr-8 relative">
                    <Text className="text-sm text-gray-900 font-PoppinsMedium leading-5 mb-1">
                      {item.notif_title}
                    </Text>
                    <Text
                      className="text-sm text-gray-700 font-PoppinsRegular leading-5 mb-1"
                      numberOfLines={2}
                      >
                      {item.notif_message || "No message"}
                    </Text>

                    <Text className="text-xs text-gray-500 font-PoppinsRegular">
                      {formatDate(item.notif_created_at)}
                    </Text>
                    
                    {item.notif_type === "REQUEST" && (
                      <View className="flex-row gap-2 mt-2">
                        <Button
                          onPress={() => handleAcceptRequest(item.notif_id)}
                          className="flex-1 py-1 px-2 bg-blue-500 "
                        >
                          <Text className="text-white text-sm font-PoppinsSemiBold">Accept</Text>
                        </Button>
                        <Button
                          onPress={() => handleDeclineRequest(item.notif_id)}
                          className="flex-1 py-1 px-2 bg-gray-500"
                        >
                          <Text className="text-white text-sm font-PoppinsSemiBold">Decline</Text>
                        </Button>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => setNotifDrawerVisible(true)}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                      <MoreVertical size={20} color="#000" />
                    </TouchableOpacity>
                    </View>
                    {/* Unread Indicator */}
                    {!item.is_read && (
                    <View className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Notification Options Drawer */}
      <Drawer
        visible={notifDrawerVisible}
        onClose={() => setNotifDrawerVisible(false)}
      >
        <View className="px-6 pb-6">
          {!selectedNotification?.is_read && (
            <TouchableOpacity
              onPress={() => handleNotifAction("mark_read")}
              className="flex-row items-center p-4 rounded-xl mb-3 bg-gray-50"
              activeOpacity={0.7}
            >
              <View className="w-10 h-8 rounded-full items-center justify-center mr-3">
                <Check size={20} className="text-gray-500" />
              </View>
              <Text className="text-base font-PoppinsRegular text-gray-900">
                Mark as Read
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Drawer>

      {/* Header Options Drawer */}
      <Drawer
        visible={headerDrawerVisible}
        onClose={() => setHeaderDrawerVisible(false)}
        header="Notification Settings"
        description="Manage your notifications"
      >
        <View className="px-6 pb-6">
          <TouchableOpacity
            onPress={() => handleHeaderAction("mark_all_read")}
            className="flex-row items-center p-4 bg-gray-50 rounded-xl mb-3"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3">
              <Check size={20} className="text-gray-500" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-PoppinsRegular text-gray-900">
                Mark All as Read
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Drawer>
    </SafeAreaView>
  );
}