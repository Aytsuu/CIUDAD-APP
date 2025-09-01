// // ScheduleTabMobile.tsx
// import React, { useState } from "react";
// import { View, Text, TouchableOpacity } from "react-native";

// interface Props {
//   onTimeFrameChange: (timeFrame: string) => void;
// }

// export default function ScheduleTab({ onTimeFrameChange }: Props) {
//   const [selected, setSelected] = useState("today");

//   const tabs = [
//     { id: "today", label: "Today" },
//     { id: "thisWeek", label: "This Week" },
//     { id: "thisMonth", label: "This Month" },
//     { id: "all", label: "All" },
//   ];

//   return (
//     <View className="flex-row bg-gray-100 p-1 rounded-lg">
//       {tabs.map((tab) => (
//         <TouchableOpacity
//           key={tab.id}
//           className={`flex-1 px-3 py-2 rounded-md items-center ${
//             selected === tab.id ? "bg-white border text-blue-500" : "bg-gray-100 text-gray-600"
//           }`}
//           onPress={() => {
//             setSelected(tab.id);
//             onTimeFrameChange(tab.id);
//           }}
//         >
//           <Text className="text-sm font-semibold">{tab.label}</Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// }
