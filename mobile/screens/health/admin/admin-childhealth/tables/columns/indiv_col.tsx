
// import React from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import type { ColumnDef } from "@tanstack/react-table";
// import { router } from 'expo-router';

// export const getChildHealthColumns = (
//   childData: any,
// ): ColumnDef<any>[] => [
//     {
//       accessorKey: "id",
//       header: "#",
//       cell: ({ row }) => (
//         <View className="flex justify-center">
//           <View className="bg-blue-100 px-3 py-1 rounded-md w-8 items-center">
//             <Text className="text-blue-800 font-semibold text-center">
//               {row.original.id}
//             </Text>
//           </View>
//         </View>
//       ),
//     },
//     {
//       accessorKey: "age",
//       header: "Age",
//     },
//     {
//       accessorKey: "wt",
//       header: "WT (kg)",
//     },
//     {
//       accessorKey: "ht",
//       header: "HT (cm)",
//     },
//     {
//       accessorKey: "temp",
//       header: "Temp (°C)",
//     },
//     {
//       accessorKey: "nutritionStatus.wfa",
//       header: "WFA",
//       cell: ({ row }) => (
//         <Text>{row.original.nutritionStatus.wfa || "N/A"}</Text>
//       ),
//     },
//     {
//       accessorKey: "nutritionStatus.lhfa",
//       header: "LFA",
//       cell: ({ row }) => (
//         <Text>{row.original.nutritionStatus.lhfa || "N/A"}</Text>
//       ),
//     },
//     {
//       accessorKey: "nutritionStatus.wfl",
//       header: "WFL",
//       cell: ({ row }) => (
//         <Text>{row.original.nutritionStatus.wfl || "N/A"}</Text>
//       ),
//     },
//     {
//       accessorKey: "nutritionStatus.muac",
//       header: "MUAC",
//       cell: ({ row }) => (
//         <Text>{row.original.nutritionStatus.muac || "N/A"}</Text>
//       ),
//     },
//     {
//       accessorKey: "nutritionStatus.edemaSeverity",
//       header: "Edema",
//       cell: ({ row }) => (
//         <Text>
//           {row.original.nutritionStatus.edemaSeverity === "none"
//             ? "None"
//             : row.original.nutritionStatus.edemaSeverity}
//         </Text>
//       ),
//     },
//     {
//       accessorKey: "latestNote",
//       header: "Notes & Follow-up",
//       cell: ({ row }) => {
//         const record = row.original;
//         return (
//           <View className="min-w-[200px] max-w-[300px]">
//             {record.latestNote ? (
//               <Text className="text-sm mb-2">{record.latestNote}</Text>
//             ) : (
//               <Text className="text-gray-500 text-sm mb-2">No notes</Text>
//             )}

//             {(record.followUpDescription || record.followUpDate) && (
//               <View className="border-t border-gray-200 pt-2 mt-2">
//                 <View className="flex-row items-center gap-2 mb-1">
//                   <Text className="text-xs font-medium text-gray-600">Follow-up:</Text>
//                   <View
//                     className={`px-2 py-1 rounded ${record.followUpStatus === 'completed'
//                         ? 'bg-green-100'
//                         : record.followUpStatus === 'missed'
//                           ? 'bg-red-100'
//                           : 'bg-blue-100'
//                       }`}
//                   >
//                     <Text className={`text-xs ${record.followUpStatus === 'completed'
//                         ? 'text-green-800'
//                         : record.followUpStatus === 'missed'
//                           ? 'text-red-800'
//                           : 'text-blue-800'
//                       }`}>
//                       {record.followUpStatus || 'pending'}
//                     </Text>
//                   </View>
//                 </View>

//                 {record.followUpDescription && (
//                   <Text className="text-xs text-gray-600">
//                     {record.followUpDescription.split('|').map((part: any, i: any) => (
//                       <Text key={i}>
//                         {part.trim()}
//                         {i < record.followUpDescription.split('|').length - 1 && '\n'}
//                       </Text>
//                     ))}
//                   </Text>
//                 )}

//                 {record.followUpDate && (
//                   <Text className="text-xs text-gray-600 mt-1">
//                     <Text className="font-medium">Date:</Text> {record.followUpDate}
//                   </Text>
//                 )}
//               </View>
//             )}
//           </View>
//         );
//       },
//     },
//     {
//       accessorKey: "updatedAt",
//       header: "Updated At",
//     },
//     {
//       accessorKey: "action",
//       header: "Action",
//       cell: ({ row }) => {
//         return (
//           <View className="flex justify-center">
//             <TouchableOpacity
//               className='bg-transparent border border-gray-300 rounded-md px-4 py-1 active:opacity-80'
//               onPress={() => {
//                 const params = {
//                   chhistId: row.original.chhist_id,
//                   patId: childData?.pat_id,
//                   originalRecord: row.original,
//                   patientData: childData,
//                   chrecId: childData?.chrec_id,
//                 };
//                 console.log('View clicked for record:', params);
//                 router.push({
//                   pathname: '/admin/childhealth/history',
//                   params,
//                 });
//               }}
//             >
//               <Text className='text-sm text-blue-700 font-medium'>View</Text>
//             </TouchableOpacity>
//           </View>
//         );
//       },
//     },
//   ];