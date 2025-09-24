// import React from 'react';
// import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';

// const { width: screenWidth } = Dimensions.get('window');
// const CARD_WIDTH = screenWidth * 0.8; // 80% of screen width

// interface DataTableProps<TData, TValue> {
//   isLoading?: boolean;
//   columns: ColumnDef<TData, TValue>[];
//   data: TData[];
//   onSelectedRowsChange?: (rows: TData[]) => void;
// }

// const HorizontalDataTable = <TData, TValue>({
//   isLoading = false,
//   columns,
//   data,
//   onSelectedRowsChange
// }: DataTableProps<TData, TValue>) => {

//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
//   const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});

//   const table = useReactTable({
//     data,
//     columns,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     onRowSelectionChange: setRowSelection,
//     state: {
//       sorting,
//       columnFilters,
//       rowSelection,
//     },
//   });

//   if (isLoading) {
//     return (
//       <View className="flex-1 items-center justify-center">
//         <ActivityIndicator size="large" color="#3b82f6" />
//       </View>
//     );
//   }

//   if (!table.getRowModel().rows?.length) {
//     return (
//       <View className="flex-1 items-center justify-center">
//         <Text className="text-gray-500">No data available</Text>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1">
//       {/* Horizontal Scroll Container */}
//       <ScrollView 
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ paddingHorizontal: 16 }}
//         className="pt-4"
//       >
//         {table.getRowModel().rows.map((row) => (
//           <TouchableOpacity
//             key={row.id}
//             onPress={() => row.toggleSelected()}
//             className={`mr-4 p-4 rounded-xl shadow-sm ${row.getIsSelected() ? 'bg-blue-50 border-2 border-blue-300' : 'bg-white border border-gray-100'}`}
//             style={{ width: CARD_WIDTH }}
//           >
//             {/* Compact Data Display */}
//             <View className="flex-row flex-wrap">
//               {row.getVisibleCells().map((cell) => (
//                 <View key={cell.id} className="w-1/2 mb-3">
//                   <Text className="text-xs text-gray-500 font-medium">
//                     {String(cell.column.columnDef.header)}:
//                   </Text>
//                   <Text className="text-sm mt-1" numberOfLines={1}>
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </Text>
//                 </View>
//               ))}
//             </View>
            
//             {/* Status Indicator */}
//             <View className={`absolute top-2 right-2 w-3 h-3 rounded-full ${row.getIsSelected() ? 'bg-blue-500' : 'bg-gray-200'}`} />
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {/* Pagination/Info Bar */}
//       <View className="px-4 py-2 border-t border-gray-100 bg-white">
//         <Text className="text-sm text-gray-500">
//           Showing {table.getRowModel().rows.length} items
//         </Text>
//       </View>
//     </View>
//   );
// };

// export { HorizontalDataTable };