import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { Calendar, DateData } from "react-native-calendars";

export default function CalendarPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("2025-02-20");

  const events = [
    { id: 1, title: "4Rs Seminar", time: "10:00 AM" },
    { id: 2, title: "Lorem ipsum", time: "1:00 PM" },
    { id: 3, title: "Lorem ipsum", time: "3:00 PM" },
    { id: 4, title: "Lorem ipsum", time: "3:00 PM" },
    { id: 5, title: "Lorem ipsum", time: "3:00 PM" },
  ];

  const Goback = () => {
    router.push("/Gad_home");
  };

  const handleDayPress = (day: DateData) => {
    setSelected(day.dateString);
  };

  return (
    <View className="flex-1 bg-[#ECF8FF] p-4 mt-11">
      <TouchableOpacity onPress={Goback} className="flex-row items-center mb-4">
        <AntDesign name="arrowleft" size={24} color="black" />
        <Text className="text-black text-lg ml-2">Back</Text>
      </TouchableOpacity>

      {/* calendar */}
      <Calendar
        current={"2025-02-01"}
        hideExtraDays
        theme={{
          calendarBackground: "#ECF8FF",
          textSectionTitleColor: "#A1A1A1",
          selectedDayBackgroundColor: "#5B43EA",
          selectedDayTextColor: "white",
          todayTextColor: "#5B43EA",
          dayTextColor: "black",
          textDisabledColor: "#D3D3D3",
          arrowColor: "black",
          monthTextColor: "black",
          textDayFontSize: 16,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 12,
        }}
        markedDates={{
          [selected]: { selected: true, disableTouchEvent: true },
          "2025-02-29": { selected: true, selectedColor: "#C5B3FF" },
        }}
        onDayPress={handleDayPress}
      />

      <View className="mt-8 items-center">
        <Text className="text-[#07143F] text-xl font-bold">
          Upcoming Events
        </Text>
      </View>

      {/* list of events */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            className="bg-[#08113A] flex-row items-center justify-between rounded-lg px-6 py-7 mx-4 mt-4 h-23"
          >
            <Text className="text-[#FAB440] text-lg ml-10 font-semibold">
              {event.title}
            </Text>
            <Text className="text-white">|</Text>
            <Text className="text-white text-lg">{event.time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
