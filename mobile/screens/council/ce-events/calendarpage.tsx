import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useGetCouncilEvents,
  useDeleteCouncilEvent,
  useRestoreCouncilEvent,
} from "@/screens/council/ce-events/ce-att-queries";
import { format, parseISO, isSameMonth, isSameDay, addMonths } from "date-fns";
import { Plus } from "lucide-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import ScreenLayout from "@/screens/_ScreenLayout";
import {
  Archive,
  ArchiveRestore,
  Trash,
  ChevronLeft,
} from "lucide-react-native";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { FormattedCouncilEvent } from "./ce-att-typeFile";

const { width } = Dimensions.get("window");
const DAY_SIZE = width / 7 - 10;

const CouncilCalendarPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [eventViewMode, setEventViewMode] = useState<"active" | "archive">(
    "active"
  );
  const isArchived = eventViewMode === "archive";
  const {
    data: events = [],
    isLoading,
    error,
    refetch,
  } = useGetCouncilEvents(isArchived);
  const [refreshing, setRefreshing] = useState(false);
  const deleteEventMutation = useDeleteCouncilEvent();
  const restoreEventMutation = useRestoreCouncilEvent();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Format and filter events
  const formattedEvents: FormattedCouncilEvent[] = events
    .filter((event) => {
      const matchesArchiveStatus = event.ce_is_archive === isArchived;
      return matchesArchiveStatus;
    })
    .map((event) => ({
      id: event.ce_id.toString(),
      title: event.ce_title,
      date: format(parseISO(event.ce_date), "MM-dd"),
      time: format(parseISO(`${event.ce_date}T${event.ce_time}`), "h:mm a"),
      day: format(parseISO(event.ce_date), "EEEE"),
      rawDate: parseISO(event.ce_date),
      place: event.ce_place,
      description: event.ce_description,
      is_archive: event.ce_is_archive,
      ce_id: event.ce_id,
      ce_date: event.ce_date,
      ce_time: event.ce_time,
      ce_rows: event.ce_rows,
    }));

  // Filter events for current month
  const currentMonthEvents = formattedEvents.filter((event) =>
    isSameMonth(event.rawDate, currentMonth)
  );

  // Generate days for the current month
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);

  const handleMonthChange = (increment: number) => {
    setCurrentMonth(addMonths(currentMonth, increment));
    setSelectedDate(addMonths(selectedDate, increment));
  };

  const handleDateSelect = (date: number) => {
    setSelectedDate(new Date(year, month, date));
  };

  const renderDayHeader = (day: string) => (
    <View key={day} className="items-center py-2">
      <Text className="text-gray-500 text-sm font-medium">{day}</Text>
    </View>
  );

  const renderDateCell = (date: number | null, index: number) => {
    if (date === null) {
      return (
        <View
          key={`blank-${index}`}
          style={{ width: DAY_SIZE, height: DAY_SIZE }}
        />
      );
    }

    const dateObj = new Date(year, month, date);
    const hasEvent = currentMonthEvents.some((event) =>
      isSameDay(event.rawDate, dateObj)
    );
    const isSelected = isSameDay(selectedDate, dateObj);
    const isToday = isSameDay(dateObj, new Date());

    return (
      <TouchableOpacity
        key={date}
        className={`items-center justify-center rounded-full m-1 ${
          isSelected
            ? "bg-primaryBlue"
            : hasEvent
            ? "bg-blue-100"
            : isToday
            ? "bg-gray-200"
            : "bg-white"
        }`}
        style={{ width: DAY_SIZE, height: DAY_SIZE }}
        onPress={() => handleDateSelect(date)}
      >
        <Text
          className={`text-lg ${
            isSelected
              ? "text-white font-bold"
              : isToday
              ? "text-primaryBlue font-bold"
              : "text-gray-800"
          }`}
        >
          {date}
        </Text>
        {hasEvent && !isSelected && (
          <View className="w-1 h-1 rounded-full bg-primaryBlue mt-1" />
        )}
      </TouchableOpacity>
    );
  };

  const renderEventItem = ({ item }: { item: FormattedCouncilEvent }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(council)/council-events/editEvent",
          params: { event: JSON.stringify(item), isReadOnly: "true" },
        })
      }
      activeOpacity={0.7}
      className="mb-3"
    >
      <View
        className={`bg-white shadow-sm rounded-lg p-4 mx-2 ${
          item.is_archive ? "bg-gray-50" : ""
        }`}
      >
        <View className="flex-row justify-between items-start">
          <Text className="text-primaryBlue text-lg font-semibold flex-1">
            {item.title}
          </Text>
        </View>
        <Text className="text-gray-600 mt-2">{item.description}</Text>
        <View className="flex-row items-center mt-3">
          <MaterialIcons name="location-on" size={16} color="#6b7280" />
          <Text className="text-gray-500 ml-1 text-sm">{item.place}</Text>
        </View>
        <View className="flex-row items-center mt-1">
          <MaterialIcons name="access-time" size={16} color="#6b7280" />
          <Text className="text-gray-500 ml-1 text-sm">
            {item.day}, {item.date} at {item.time}
          </Text>
        </View>
        <View className="flex-row justify-end space-x-2 mt-2">
          {item.is_archive ? (
            <ConfirmationModal
              trigger={
                <TouchableOpacity
                  disabled={restoreEventMutation.isPending}
                  className="p-1"
                >
                  {restoreEventMutation.isPending ? (
                    <ActivityIndicator size="small" color="#10b981" />
                  ) : (
                    <ArchiveRestore size={20} color="#10b981" />
                  )}
                </TouchableOpacity>
              }
              title="Confirm Restore"
              description={`Restore event ${item.title}?`}
              actionLabel="Restore"
              onPress={() => restoreEventMutation.mutate(item.ce_id)}
              loading={restoreEventMutation.isPending}
            />
          ) : (
            <ConfirmationModal
              trigger={
                <TouchableOpacity
                  disabled={deleteEventMutation.isPending}
                  className="p-1"
                >
                  {deleteEventMutation.isPending ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Archive size={20} color="#ef4444" />
                  )}
                </TouchableOpacity>
              }
              title="Confirm Archive"
              description={`Archive event ${item.title}?`}
              actionLabel="Archive"
              onPress={() =>
                deleteEventMutation.mutate({
                  ce_id: item.ce_id,
                  permanent: false,
                })
              }
              loading={deleteEventMutation.isPending}
            />
          )}
          {eventViewMode === "archive" && (
            <ConfirmationModal
              trigger={
                <TouchableOpacity
                  disabled={deleteEventMutation.isPending}
                  className="p-1"
                >
                  {deleteEventMutation.isPending ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Trash size={20} color="#ef4444" />
                  )}
                </TouchableOpacity>
              }
              title="Confirm Permanent Delete"
              description={`Permanently delete event ${item.title}? This cannot be undone.`}
              actionLabel="Delete"
              variant="destructive"
              onPress={() =>
                deleteEventMutation.mutate({
                  ce_id: item.ce_id,
                  permanent: true,
                })
              }
              loading={deleteEventMutation.isPending}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredEvents = currentMonthEvents.filter((event) =>
    isSameDay(event.rawDate, selectedDate)
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-red-500 text-lg">
          Failed to load events: {error.message}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Council Events</Text>}
      showExitButton={false}
      headerAlign="left"
      keyboardAvoiding={true}
      contentPadding="medium"
      scrollable={false}
    >
      {/* View Mode Toggle */}
      <View className="flex-row justify-center my-3">
        <View className="flex-row border border-gray-300 rounded-full bg-gray-100 overflow-hidden">
          <TouchableOpacity
            className={`px-4 py-2 ${
              eventViewMode === "active" ? "bg-white" : ""
            }`}
            onPress={() => {
              setEventViewMode("active");
              queryClient.invalidateQueries({
                queryKey: ["councilEvents", false],
              });
            }}
          >
            <Text className="text-sm font-medium">Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 ${
              eventViewMode === "archive" ? "bg-white" : ""
            }`}
            onPress={() => {
              setEventViewMode("archive");
              queryClient.invalidateQueries({
                queryKey: ["councilEvents", true],
              });
            }}
          >
            <Text className="text-sm font-medium">Archived</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Header */}
      <View className="bg-white shadow-sm py-4 px-2">
        <View className="flex-row justify-between items-center mb-4 px-2">
          <TouchableOpacity
            onPress={() => handleMonthChange(-1)}
            className="p-2"
          >
            <MaterialIcons name="chevron-left" size={24} color="#3B82F6" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-gray-800">
            {format(currentMonth, "MMMM yyyy")}
          </Text>

          <TouchableOpacity
            onPress={() => handleMonthChange(1)}
            className="p-2"
          >
            <MaterialIcons name="chevron-right" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-around mb-2">
          {days.map(renderDayHeader)}
        </View>

        <View className="flex-row flex-wrap justify-around">
          {blankDays.map((date, index) => renderDateCell(date, index))}
          {dates.map(renderDateCell)}
        </View>
      </View>

      {/* Events Section */}
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">
            {format(selectedDate, "EEEE, MMMM d")}
          </Text>
          <View className="flex-row items-center gap-5 space-x-2">
            <Text className="text-primaryBlue">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "Event" : "Events"}
            </Text>
            <TouchableOpacity
              className="bg-primaryBlue p-2 rounded-full"
              onPress={() =>
                router.push("/(council)/council-events/schedule?isAdding=true")
              }
            >
              <Plus size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {filteredEvents.length > 0 ? (
          <FlatList
            data={filteredEvents}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <MaterialIcons name="event-busy" size={48} color="#d1d5db" />
            <Text className="text-gray-400 mt-4 text-lg">
              No events scheduled
            </Text>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
};

export default CouncilCalendarPage;