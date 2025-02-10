import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { Calendar, DateData } from "react-native-calendars";

export default function CalendarPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("2025-02-20");

  // get todays date
  const getDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getDate();

  const events = [
    { id: 1, title: "4Rs Seminar", time: "10:00 AM" },
    { id: 2, title: "Lorem ipsum", time: "1:00 PM" },
    { id: 3, title: "Lorem ipsum", time: "3:00 PM" },
    { id: 4, title: "Lorem ipsum", time: "3:00 PM" },
    { id: 5, title: "Lorem ipsum", time: "3:00 PM" },
  ];

  const Goback = () => {
    router.push("/GAD_services");
  };

  const calendarEvents = (date: string) => {
     router.push({
      pathname: "/Calendar-multiple-events",
      params: { selectedDate: date },
    });
  };

  const DAY = (day: DateData) => {
    setSelected(day.dateString);
    calendarEvents(day.dateString);
  };

 
  return (
    // backbutton
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
            [today]: {
            selected: true,
            customStyles: {
              container: {
                backgroundColor: "#5B43EA", 
                borderRadius: 5,
                width: 32,
                height: 32,
                justifyContent: "center",
                alignItems: "center",
              },
              text: {
                color: "white",
                fontWeight: "bold",
              },
            },
          },
           [selected]: {
            selected: true,
            customStyles: {
              container: {
                borderWidth: 2, 
                borderColor: "#5B43EA", 
                borderRadius: 5,
                width: 32,
                height: 32,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: 'transparent',
              },
              text: {
                color: "black",
                fontWeight: "bold",
              },
            },
          },
        }}
        markingType={"custom"}
        onDayPress={DAY}
      />
      {/* list of events contents */}
      <View className="mt-8 items-center">
        <Text className="text-[#07143F] text-xl font-bold">
          Upcoming Events
        </Text>
      </View>

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
