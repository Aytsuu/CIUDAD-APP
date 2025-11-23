import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format, parseISO, isSameMonth, isSameDay, addMonths } from "date-fns";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { getAnnualDevPlansByYear } from "../annual-dev-plan/restful-api/annualDevPlanGetAPI";
import { ChevronLeft } from "lucide-react-native";
import { useGetProjectProposals } from "../project-proposal/queries/projprop-fetchqueries";
import { useResolution } from "@/screens/council/resolution/queries/resolution-fetch-queries";

const { width } = Dimensions.get("window");
const DAY_SIZE = width / 7 - 10;

interface GADEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  place: string;
  description: string;
  project: string;
  activity: string;
  indicator: string;
  responsible_person: string;
  staff: string;
  total: string;
  type: string;
}

const GADActivityCalendar = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allEvents, setAllEvents] = useState<GADEvent[]>([]);

  // Fetch project proposals and resolutions for filtering
  const { data: projectProposalsData = { results: [], count: 0 } } = useGetProjectProposals(1, 1000, undefined, false, undefined);
  const { data: resolutionsData = { results: [], count: 0 } } = useResolution(1, 1000);

  // Create set of devIds that have project proposals with resolutions (like web version)
  const devIdsWithProposals = useMemo(() => {
    const proposalsList = Array.isArray(projectProposalsData) 
      ? projectProposalsData 
      : Array.isArray(projectProposalsData?.results) 
      ? projectProposalsData.results 
      : [];
    
    const resolutionsList = Array.isArray(resolutionsData)
      ? resolutionsData
      : Array.isArray(resolutionsData?.results)
      ? resolutionsData.results
      : [];

    // Get set of gpr_ids from resolutions
    const resolutionGprIds = new Set(
      resolutionsList
        .map((r: any) => r.gpr_id)
        .filter((id: any) => id !== null && id !== undefined)
    );

    // Filter project proposals that have matching resolutions and extract devIds
    return new Set(
      proposalsList
        .filter((p: any) => {
          const devId = p.devId ?? p.dev_id ?? p.devDetails?.dev_id ?? p.dev?.dev_id;
          const gprId = p.gprId ?? p.gpr_id;
          return devId && gprId && resolutionGprIds.has(gprId);
        })
        .map((p: any) => p.devId ?? p.dev_id ?? p.devDetails?.dev_id ?? p.dev?.dev_id)
        .filter((id: any) => id !== null && id !== undefined)
    );
  }, [projectProposalsData, resolutionsData]);

  // Fetch data for multiple years
  const yearsToFetch = [2024, 2025, 2026, 2027, 2028, 2029];

  useEffect(() => {
    fetchAllEvents();
  }, [devIdsWithProposals]);

  const fetchAllEvents = async () => {
    setIsLoading(true);
    try {
      const allEventsData: GADEvent[] = [];
      
      // Fetch events for multiple years
      for (const year of yearsToFetch) {
        try {
          const yearData = await getAnnualDevPlansByYear(year);
          const eventsData = Array.isArray(yearData) ? yearData : yearData?.results || [];
          
          // Filter events: only include mandated OR those with project proposals and resolutions (like web version)
          const filteredEvents = eventsData.filter((plan: any) => {
            // Check if archived
            const archivedValue = plan?.dev_archived;
            if (archivedValue === true || archivedValue === "true" || archivedValue === "True" || archivedValue === "TRUE" || archivedValue === 1) {
              return false; // Exclude archived
            }
            
            // Check if past date
            if (plan?.dev_date) {
              const planDate = new Date(plan.dev_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              planDate.setHours(0, 0, 0, 0);
              if (planDate < today) {
                return false; // Exclude past dates
              }
            }
            
            // Filter: include if mandated OR has proposal with resolution
            const isMandated = Boolean(plan?.dev_mandated);
            const hasProposal = devIdsWithProposals.has(plan.dev_id);
            return isMandated || hasProposal;
          });
          
          // Transform the filtered data to match our interface
          const transformedEvents = filteredEvents.map((plan: any) => ({
            id: plan.dev_id,
            title: plan.dev_client,
            date: plan.dev_date,
            time: "09:00", // Default time
            place: "Municipal Office", // Default place
            description: plan.dev_issue,
            project: plan.dev_project,
            activity: plan.dev_activity,
            indicator: plan.dev_indicator,
            responsible_person: plan.dev_res_person,
            staff: plan.staff,
            total: plan.total,
            type: "annual_development_plan"
          }));
          
          allEventsData.push(...transformedEvents);
        } catch (error) {
          // Silently handle errors for individual years
        }
      }
      
      setAllEvents(allEventsData);
    } catch (error) {
      // Silently handle errors
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllEvents();
    setRefreshing(false);
  };

  // All events are active (no filtering needed)
  const filteredEvents = allEvents;

  // Get events for the selected date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, date);
    });
  };

  // Get events for the selected date
  const selectedDateEvents = getEventsForDate(selectedDate);

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
    const hasEvent = filteredEvents.some((event) => {
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, dateObj);
    });
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

  const renderEventItem = ({ item }: { item: GADEvent }) => (
    <View className="mb-3">
      <View className="bg-white shadow-sm rounded-lg p-4 mx-2 border-2 border-gray-200">
        <View className="flex-row justify-between items-start">
          <Text className="text-[#1a2332] text-lg font-semibold flex-1">
            {item.title}
          </Text>
        </View>
        <Text className="text-gray-600 mt-2">{item.description}</Text>
        {item.project && (
          <View className="mt-2">
            <Text className="text-xs font-medium text-gray-500">Project:</Text>
            <Text className="text-sm text-gray-700">{item.project}</Text>
          </View>
        )}
        {item.responsible_person && (
          <View className="mt-2">
            <Text className="text-xs font-medium text-gray-500">Responsible Person:</Text>
            <Text className="text-sm text-gray-700">{item.responsible_person}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">GAD Activity Calendar</Text>
      }
      rightAction={<View />}
    >
      {/* Calendar Header */}
      <View className="bg-white shadow-sm py-4 px-6">
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
      <View className="flex-1 px-6 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">
            {format(selectedDate, "EEEE, MMMM d")}
          </Text>
          <View className="flex-row items-center gap-5 space-x-2">
            <Text className="text-primaryBlue">
              {selectedDateEvents.length}{" "}
              {selectedDateEvents.length === 1 ? "Event" : "Events"}
            </Text>
          </View>
        </View>

        {selectedDateEvents.length > 0 ? (
          <FlatList
            data={selectedDateEvents}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id.toString()}
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
              No events scheduled for this date
            </Text>
          </View>
        )}
      </View>
    </PageLayout>
  );
};

export default GADActivityCalendar;
