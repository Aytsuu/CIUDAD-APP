import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { format, parseISO, isSameMonth, isSameDay, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import PageLayout from "@/screens/_PageLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/ui/loading-state";
import { getAnnualDevPlansByYear } from "../annual-dev-plan/restful-api/annualDevPlanGetAPI";

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
  const [eventViewMode, setEventViewMode] = useState<"active" | "archive">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allEvents, setAllEvents] = useState<GADEvent[]>([]);

  // Fetch data for multiple years
  const yearsToFetch = [2024, 2025, 2026, 2027, 2028, 2029];

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    setIsLoading(true);
    try {
      const allEventsData: GADEvent[] = [];
      
      // Fetch events for multiple years
      for (const year of yearsToFetch) {
        try {
          const yearData = await getAnnualDevPlansByYear(year);
          const eventsData = Array.isArray(yearData) ? yearData : yearData?.results || [];
          
          // Transform the data to match our interface
          const transformedEvents = eventsData.map((plan: any) => ({
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
          console.error(`Error fetching events for year ${year}:`, error);
        }
      }
      
      setAllEvents(allEventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllEvents();
    setRefreshing(false);
  };

  // Filter events by archive status (for now, all events are active)
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      if (eventViewMode === "archive") {
        return false; // No archived events for now
      }
      return true; // All events are active
    });
  }, [allEvents, eventViewMode]);

  // Get events for the selected date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, date);
    });
  };

  // Get events for the selected date
  const selectedDateEvents = getEventsForDate(selectedDate);

  // Calendar generation
  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = getDay(start);
    const emptyDays = Array(firstDayOfWeek).fill(null);
    
    return [...emptyDays, ...days];
  };

  const calendarDays = generateCalendarDays();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => addMonths(prev, direction === 'next' ? 1 : -1));
  };

  const renderCalendarDay = (day: Date | null, index: number) => {
    if (!day) {
      return <View key={index} style={{ width: DAY_SIZE, height: DAY_SIZE }} />;
    }

    const dayEvents = getEventsForDate(day);
    const isSelected = isSameDay(day, selectedDate);
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isToday = isSameDay(day, new Date());

    return (
      <TouchableOpacity
        key={index}
        onPress={() => setSelectedDate(day)}
        className={`w-${DAY_SIZE} h-${DAY_SIZE} items-center justify-center rounded-lg mx-1 my-1 ${
          isSelected ? 'bg-blue-500' : isToday ? 'bg-blue-100' : ''
        }`}
        style={{ width: DAY_SIZE, height: DAY_SIZE }}
      >
        <Text className={`text-sm font-medium ${
          isSelected ? 'text-white' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
        }`}>
          {format(day, 'd')}
        </Text>
        {dayEvents.length > 0 && (
          <View className="w-2 h-2 bg-orange-500 rounded-full mt-1" />
        )}
      </TouchableOpacity>
    );
  };

  const renderEventItem = ({ item }: { item: GADEvent }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-800 flex-1">
          {item.title}
        </Text>
        <View className="bg-blue-100 px-2 py-1 rounded">
          <Text className="text-xs text-blue-600 font-medium">
            {item.type.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View className="space-y-2">
        <View className="flex-row items-center">
          <MaterialIcons name="schedule" size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-2">
            {format(parseISO(item.date), 'MMM d, yyyy')} at {item.time}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <MaterialIcons name="location-on" size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-2">{item.place}</Text>
        </View>
        
        {item.description && (
          <Text className="text-sm text-gray-600 mt-2">{item.description}</Text>
        )}
        
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
      <PageLayout
        leftAction={
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-[13px]">GAD Activity Calendar</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 p-6 justify-center items-center">
          <LoadingState />
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-[13px]">GAD Activity Calendar</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 p-6">
        {/* Calendar Header */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <ChevronRight size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Calendar Grid */}
          <View className="flex-row justify-between mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} className="text-xs font-medium text-gray-500 text-center" style={{ width: DAY_SIZE }}>
                {day}
              </Text>
            ))}
          </View>
          
          <View className="flex-row flex-wrap">
            {calendarDays.map((day, index) => renderCalendarDay(day, index))}
          </View>
        </View>

        {/* Events Section */}
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">
              {format(selectedDate, "EEEE, MMMM d")}
            </Text>
            <View className="flex-row items-center gap-2">
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
      </View>
    </PageLayout>
  );
};

export default GADActivityCalendar;
