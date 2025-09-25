import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useGetAnnouncement, useDeleteAnnouncement } from "./queries";
import PageLayout from "@/screens/_PageLayout";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { FileText } from "@/lib/icons/FileText";
import { Calendar } from "@/lib/icons/Calendar";
import { Clock, Bell, Mail, MessageSquare } from "lucide-react-native";
import { getDateTimeFormat } from "@/helpers/dateHelpers";
import { useAuth } from "@/contexts/AuthContext";

export default function AnnouncementListPage() {
  const router = useRouter();
  const { user } = useAuth(); 
  const currentUserId = user?.staff?.id; 

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");

  const { data: announcements = [], isLoading, refetch } = useGetAnnouncement();
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const renderEmptyState = (label: string) => (
    <View className="flex-1 items-center justify-center py-10">
      <Text className="text-gray-500 text-lg font-medium mb-2">{label}</Text>
      <Text className="text-gray-400 text-center px-8">
        Announcements will appear here once added.
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-10">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-500 mt-4">Loading announcements...</Text>
    </View>
  );

  const RenderAnnouncementCard = React.memo(
    ({ item, index }: { item: any; index: number }) => (
      <View key={index} className="mb-3 mx-5">
        <Card className="p-4 bg-white shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 font-semibold text-lg" numberOfLines={1}>
              {item.ann_title}
            </Text>
            <View className="bg-blue-500 px-3 py-1 rounded">
              <Text className="text-white text-xs font-medium">
                {item.ann_type?.toUpperCase()}
              </Text>
            </View>
          </View>

          {item.ann_created_at && (
            <View className="mb-3">
              <View className="flex-row items-center">
                <Calendar size={16} className="text-gray-500 mr-2" />
                <Text className="text-gray-700 text-sm font-medium">Created At</Text>
              </View>
              <Text className="ml-6 text-gray-600 text-sm">
                {getDateTimeFormat(item.ann_created_at, true)}
              </Text>
            </View>
          )}

          {/* Event / General display */}
          {item.ann_type?.toLowerCase() === "general" && (
            <View className="mb-3">
              {item.ann_start_at && (
                <View className="flex-row items-center mb-2 ml-6">
                  <Clock size={14} className="text-gray-500 mr-2" />
                  <Text className="text-gray-600 text-xs">Start At</Text>
                  <Text className="text-gray-800 text-sm ml-2">
                    {getDateTimeFormat(item.ann_start_at, true)}
                  </Text>
                </View>
              )}
              {item.ann_end_at && (
                <View className="flex-row items-center ml-6">
                  <Clock size={14} className="text-gray-500 mr-2" />
                  <Text className="text-gray-600 text-xs">End At</Text>
                  <Text className="text-gray-800 text-sm ml-2">
                    {getDateTimeFormat(item.ann_end_at, true)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {item.ann_type?.toLowerCase() === "event" && (
            <View className="mb-3">
              {item.ann_start_at && (
                <View className="flex-row items-center mb-2">
                  <Clock size={14} className="text-blue-500 mr-2" />
                  <Text className="text-gray-700 text-sm font-medium">
                    Posted On {getDateTimeFormat(item.ann_start_at, true)}
                  </Text>
                </View>
              )}
              {(item.ann_event_start || item.ann_event_end) && (
                <>
                  <View className="flex-row items-center mb-2">
                    <Clock size={16} className="text-gray-500 mr-2" />
                    <Text className="text-gray-700 text-sm font-medium">Event Period</Text>
                  </View>
                  {item.ann_event_start && (
                    <View className="flex-row items-center mb-2 ml-6">
                      <Clock size={14} className="text-green-500 mr-2" />
                      <Text className="text-gray-600 text-xs">Start At</Text>
                      <Text className="text-gray-800 text-sm ml-2">
                        {getDateTimeFormat(item.ann_event_start, true)}
                      </Text>
                    </View>
                  )}
                  {item.ann_event_end && (
                    <View className="flex-row items-center ml-6">
                      <Clock size={14} className="text-red-500 mr-2" />
                      <Text className="text-gray-600 text-xs">End At</Text>
                      <Text className="text-gray-800 text-sm ml-2">
                        {getDateTimeFormat(item.ann_event_end, true)}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {(item.ann_to_sms || item.ann_to_email) && (
            <View className="mb-3">
              <View className="flex-row items-center mb-2">
                <Bell size={16} className="text-gray-500 mr-2" />
                <Text className="text-gray-700 text-sm font-medium">Notification Status</Text>
              </View>
              <View className="ml-6 space-y-2">
                {item.ann_to_sms && (
                  <View className="flex-row items-center">
                    <MessageSquare size={16} className="text-green-600 mr-2" />
                    <Text className="text-gray-600 text-sm">SMS</Text>
                  </View>
                )}
                {item.ann_to_email && (
                  <View className="flex-row items-center">
                    <Mail size={16} className="text-blue-600 mr-2" />
                    <Text className="text-gray-600 text-sm">Email</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(announcement)/announcementview",
                  params: { ann_id: item.ann_id },
                })
              }
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white text-sm font-medium">View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteAnnouncement(String(item.ann_id))}
              className="bg-red-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white text-sm font-medium">Delete</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    )
  );

  // Search + Filter
  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.ann_title?.toLowerCase().includes(search.toLowerCase()) ||
      a.ann_details?.toLowerCase().includes(search.toLowerCase());

    let matchesFilter = true;
    if (filter === "general") matchesFilter = a.ann_type?.toLowerCase() === "general";
    else if (filter === "event") matchesFilter = a.ann_type?.toLowerCase() === "event";
    else if (filter === "public") matchesFilter = a.ann_type?.toLowerCase() === "public";
    else if (filter === "email") matchesFilter = a.ann_to_email === true;
    else if (filter === "sms") matchesFilter = a.ann_to_sms === true;

    return matchesSearch && matchesFilter;
  });

  // Split Created vs Received using user ID
  const createdAnnouncements = filteredAnnouncements.filter(
    (a) => a.ann_created_by === currentUserId
  );
  const receivedAnnouncements = filteredAnnouncements.filter(
    (a) => a.ann_created_by !== currentUserId
  );

  return (
    <PageLayout
      wrapScroll={false}
      leftAction={
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.push("/");
          }}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Announcements</Text>}
      rightAction={
        <TouchableOpacity
          onPress={() => router.push("/(announcement)/announcementcreate")}
          className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
        >
          <Text className="text-white text-xl font-bold">+</Text>
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-gray-50 py-4">
        {/* Stats Card */}
        <Card className="flex-row items-center p-4 mb-4 bg-primaryBlue shadow-lg mx-5">
          <View className="p-3 bg-white/20 rounded-full mr-4">
            <FileText size={24} className="text-white" />
          </View>
          <View className="flex-1">
            <Text className="text-white/80 text-sm font-medium">Total Announcements</Text>
            <Text className="text-white text-2xl font-bold">{announcements.length}</Text>
          </View>
        </Card>

        {/* Search + Filter */}
        <View className="px-5 mb-4">
          <TextInput
            placeholder="Search announcements..."
            value={search}
            onChangeText={setSearch}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 mb-2"
          />
          <View className="bg-white border border-gray-200 rounded-lg">
            <Picker selectedValue={filter} onValueChange={(v) => setFilter(v)}>
              <Picker.Item label="All" value="all" />
              <Picker.Item label="General" value="general" />
              <Picker.Item label="Event" value="event" />
              <Picker.Item label="Public" value="public" />
              <Picker.Item label="Email" value="email" />
              <Picker.Item label="SMS" value="sms" />
            </Picker>
          </View>
        </View>

        {/* Created Announcements */}
        <FlatList
          data={createdAnnouncements}
          ListHeaderComponent={() => <Text className="text-gray-700 font-semibold px-5 mb-2">Created Announcements</Text>}
          renderItem={({ item, index }) => <RenderAnnouncementCard item={item} index={index} />}
          keyExtractor={(item) => item.ann_id.toString()}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={["#3B82F6"]} />}
          ListEmptyComponent={renderEmptyState("No Created Announcements")}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        {/* Received Announcements */}
        <FlatList
          data={receivedAnnouncements}
          ListHeaderComponent={() => <Text className="text-gray-700 font-semibold px-5 mb-2">Received Announcements</Text>}
          renderItem={({ item, index }) => <RenderAnnouncementCard item={item} index={index} />}
          keyExtractor={(item) => item.ann_id.toString()}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={["#3B82F6"]} />}
          ListEmptyComponent={renderEmptyState("No Received Announcements")}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </PageLayout>
  );
}
