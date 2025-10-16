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
import {
  useDeleteAnnouncement,
  useGetCreatedReceivedAnnouncements,
} from "./queries";
import PageLayout from "@/screens/_PageLayout";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { FileText } from "@/lib/icons/FileText";
import { Calendar } from "@/lib/icons/Calendar";
import { Clock } from "@/lib/icons/Clock";
import { Eye } from "@/lib/icons/Eye";
import { Trash } from "@/lib/icons/Trash";
import { Mail } from "@/lib/icons/Mail";
import { MessageCircleWarning } from "@/lib/icons/MessageCircleWarning";
import { getDateTimeFormat } from "@/helpers/dateHelpers";
import { useAuth } from "@/contexts/AuthContext";


export default () => {
  const router = useRouter();
  const { user } = useAuth();

  const staff_id = user?.staff?.staff_id

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [activeTab, setActiveTab] = React.useState<"created" | "received">("created");

  const { data, isLoading, refetch } = useGetCreatedReceivedAnnouncements(staff_id || "");
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();

  const createdAnnouncements = data?.created || [];
  const receivedAnnouncements = data?.received || [];

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

  const filterAnnouncements = (arr: any[]) =>
    arr.filter((a) => {
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

  const filteredCreated = filterAnnouncements(createdAnnouncements);
  const filteredReceived = filterAnnouncements(receivedAnnouncements);

  const activeData = activeTab === "created" ? filteredCreated : filteredReceived;


const RenderAnnouncementCard = React.memo(({ item }: { item: any }) => {
  let badgeBg = "bg-gray-300";
  let badgeText = "text-gray-700";

  if (item.ann_type?.toLowerCase() === "event") {
    badgeBg = "bg-blue-100";
    badgeText = "text-blue-600";
  } else if (item.ann_type?.toLowerCase() === "public") {
    badgeBg = "bg-red-100";
    badgeText = "text-red-600";
  }

  return (
    <View className="mb-4 mx-5">
      <Card className="p-5 rounded-2xl shadow bg-white">
        {/* Title + Type Badge */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-semibold text-lg text-gray-900" numberOfLines={1}>
            {item.ann_title}
          </Text>
          <View className={`px-3 py-1 rounded-full ${badgeBg}`}>
            <Text className={`text-xs font-bold ${badgeText}`}>
              {item.ann_type?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Created On */}
{item.ann_created_at && (
  <View className="flex-row items-center mb-3">
    <Calendar size={16} color="#555" />
    <Text className="ml-2 text-sm text-gray-600">
      Created on {getDateTimeFormat(item.ann_created_at, true)}
    </Text>
  </View>
)}

{/* Event Announcement */}
{item.ann_type?.toLowerCase() === "event" && (
  <View className="ml-1 mb-4">
    {/* Posted On (event only) */}
    {item.ann_start_at && (
      <View className="flex-row items-center mb-3">
        <Clock size={16} color="#000" />
        <Text className="ml-2 text-sm text-gray-600">
          Posted on {getDateTimeFormat(item.ann_start_at, true)}
        </Text>
      </View>
    )}
    {item.ann_event_start && (
      <View className="flex-row items-center mb-3">
        <Clock size={16} color="green" />
        <Text className="ml-2 text-sm text-gray-700">
          Start At {getDateTimeFormat(item.ann_event_start, true)}
        </Text>
      </View>
    )}
    {item.ann_end_at && (
      <View className="flex-row items-center mb-3">
        <Clock size={16} color="red" />
        <Text className="ml-2 text-sm text-gray-700">
          End At {getDateTimeFormat(item.ann_end_at, true)}
        </Text>
      </View>
    )}
  </View>
)}

{/* General & Public */}
{(item.ann_type?.toLowerCase() === "general" ||
  item.ann_type?.toLowerCase() === "public") && (
  <View className="ml-1 mb-4">
    {item.ann_start_at && (
      <View className="flex-row items-center mb-3">
        <Clock size={16} color="green" />
        <Text className="ml-2 text-sm text-gray-700">
          Start At {getDateTimeFormat(item.ann_start_at, true)}
        </Text>
      </View>
    )}
    {item.ann_end_at && (
      <View className="flex-row items-center mb-3">
        <Clock size={16} color="red" />
        <Text className="ml-2 text-sm text-gray-700">
          End At {getDateTimeFormat(item.ann_end_at, true)}
        </Text>
      </View>
    )}
  </View>
)}

        {/* Notification Status */}
        {(item.ann_to_sms || item.ann_to_email) && (
          <View className="ml-1 mb-3">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Notification Status
            </Text>
            {item.ann_to_sms && (
              <View className="flex-row items-center mb-2">
                <MessageCircleWarning size={16} color="#16a34a" />
                <Text className="ml-2 text-sm text-gray-600">SMS</Text>
              </View>
            )}
            {item.ann_to_email && (
              <View className="flex-row items-center">
                <Mail size={16} color="#2563eb" />
                <Text className="ml-2 text-sm text-gray-600">Email</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer Actions */}
        <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(announcement)/announcementview",
                params: { ann_id: item.ann_id },
              })
            }
            className="flex-row items-center px-3 py-2 rounded-lg bg-gray-100"
          >
            <Eye size={16} color="#333" />
            <Text className="ml-2 text-sm font-semibold text-gray-700">
              View Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => deleteAnnouncement(String(item.ann_id))}
            className="flex-row items-center px-3 py-2 rounded-lg bg-red-100"
          >
            <Trash size={16} color="red" />
            <Text className="ml-2 text-sm font-semibold text-red-600">
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );
});


  if (isLoading) return renderLoadingState();

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
            <Text className="text-white text-2xl font-bold">
              {createdAnnouncements.length + receivedAnnouncements.length}
            </Text>
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

        {/* Tabs */}
<View className="px-5 mb-4">
  <View className="flex-row rounded-lg overflow-hidden border border-gray-200 bg-white">
    <TouchableOpacity
      onPress={() => setActiveTab("created")}
      className={`w-1/2 py-3 items-center ${
        activeTab === "created" ? "bg-blue-500" : "bg-white"
      }`}
    >
      <Text
        className={`font-medium ${
          activeTab === "created" ? "text-white" : "text-gray-700"
        }`}
      >
        Created ({filteredCreated.length})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab("received")}
      className={`w-1/2 py-3 items-center ${
        activeTab === "received" ? "bg-blue-500" : "bg-white"
      }`}
    >
      <Text
        className={`font-medium ${
          activeTab === "received" ? "text-white" : "text-gray-700"
        }`}
      >
        Received ({filteredReceived.length})
      </Text>
    </TouchableOpacity>
  </View>
</View>


        {/* List */}
        <FlatList
          data={activeData}
          renderItem={({ item }) => <RenderAnnouncementCard item={item} />}
          keyExtractor={(item) => item.ann_id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#3B82F6"]}
            />
          }
          ListEmptyComponent={renderEmptyState(
            activeTab === "created"
              ? "No Created Announcements"
              : "No Received Announcements"
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </PageLayout>
  );
}
