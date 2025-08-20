// src/screens/FirstAidListScreen.tsx
import React from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";

import type { FirstAidRecords, ApiItemWithStaff } from "../types"; // Adjust path if needed
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirstAidTransactions } from "../restful-api/transaction/fetchqueries";

export default function FirstAidListScreen() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data: firstAidData, isLoading: isLoadingFirstAid } = useFirstAidTransactions();

  const formatFirstAidData = React.useCallback((): FirstAidRecords[] => {
    if (!firstAidData) return [];
    return firstAidData.map((firstAid: ApiItemWithStaff) => {
      const staffFirstName = firstAid.staff_detail?.rp?.per?.per_fname || "";
      const staffLastName = firstAid.staff_detail?.rp?.per?.per_lname || "";
      const staffFullName = `${staffFirstName} ${staffLastName}`.trim();

      return {
        inv_id: firstAid.finv_details?.inv_detail?.inv_id,
        fat_id: firstAid.fat_id,
        fa_name: firstAid.fa_name,
        fdt_qty: firstAid.fat_qty,
        fat_action: firstAid.fat_action,
        staff: staffFullName || String(firstAid.staff),
        created_at: firstAid.created_at,
      } as FirstAidRecords;
    });
  }, [firstAidData]);

  const filteredFirstAid = React.useMemo(() => {
    const formattedData = formatFirstAidData();
    return formattedData.filter((record) => {
      const searchText = `
        ${record.fa_name || ""}
        ${record.fat_action || ""}
        ${record.staff || ""}
        ${record.inv_id || ""}
      `.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatFirstAidData]);

  const totalPages = Math.ceil(filteredFirstAid.length / pageSize);
  const paginatedFirstAid = filteredFirstAid.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportColumns = [
    { key: "fat_id", header: "ID" },
    { key: "fa_name", header: "First Aid Name" },
    {
      key: "fdt_qty",
      header: "Quantity",
      format: (value: number) => value || 0,
    },
    { key: "fat_action", header: "Action" },
    { key: "staff", header: "Staff" },
    { key: "created_at", header: "Date" },
  ];

  // --- LOADING SKELETON LOGIC ---
  if (isLoadingFirstAid) {
    return (
      <View className="w-full h-full p-4">
        <Skeleton className="h-10 w-1/2 mb-3" />
        <Skeleton className="h-7 w-3/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </View>
    );
  }
  // --- END LOADING SKELETON LOGIC ---

  const renderFirstAidCard = ({ item }: { item: FirstAidRecords }) => (
    <TouchableOpacity
      className="bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-200"
      // onPress={() => navigation.navigate('FirstAidDetail', { firstAidId: item.fat_id })}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-semibold text-lg text-gray-800 flex-1 pr-2">
          {item.fa_name}
        </Text>
        <View className="bg-blue-100 px-2 py-1 rounded-full">
          <Text className="text-blue-700 text-xs font-medium">ID: {item.inv_id}</Text>
        </View>
      </View>

      <View className="mb-2">
        <Text className="text-gray-600 text-sm">
          <Text className="font-medium">Quantity:</Text> {item.fdt_qty}
        </Text>
        <Text className="text-gray-600 text-sm">
          <Text className="font-medium">Action:</Text> {item.fat_action}
        </Text>
        <Text className="text-gray-600 text-sm">
          <Text className="font-medium">Staff:</Text> {item.staff}
        </Text>
      </View>

      <View className="flex-row justify-between items-center border-t border-gray-100 pt-2">
        <Text className="text-gray-500 text-xs">
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <View className="mb-4">
        {/* <SearchInput
          placeholder="Search by first aid name, action, or staff..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        /> */}
      </View>

      <View className="bg-white rounded-md shadow-sm p-4">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-xs sm:text-sm">Show</Text>
            <TextInput
              keyboardType="numeric"
              className="w-14 h-10 border border-gray-300 rounded-md text-center"
              value={String(pageSize)}
              onChangeText={(text) => {
                const value = parseInt(text);
                setPageSize(value >= 1 ? value : 0);
              }}
              // min="1"
            />
            <Text className="text-xs sm:text-sm">Entries</Text>
          </View>
          {/* <ExportButton
            data={filteredFirstAid}
            filename="firstaid-transactions"
            columns={exportColumns}
          /> */}
        </View>

        <FlatList
          data={paginatedFirstAid}
          keyExtractor={(item, index) => `firstaid-${item.fat_id || index}`}
          renderItem={renderFirstAidCard}
          ListEmptyComponent={() => (
            <View className="py-8 items-center">
              <Text className="text-gray-500 text-base">No results found.</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 10 }}
        />

        <View className="flex-col sm:flex-row justify-between items-center p-3 gap-3 border-t border-gray-200 mt-3">
          {filteredFirstAid.length > 0 ? (
            <>
              <Text className="text-xs sm:text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredFirstAid.length)} of{" "}
                {filteredFirstAid.length} rows
              </Text>
              <View className="flex-row items-center justify-center">
                <TouchableOpacity
                  onPress={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${currentPage === 1 ? 'opacity-50' : ''}`}
                >
                  <Text className="text-blue-500 font-bold">Previous</Text>
                </TouchableOpacity>

                <Text className="mx-3 text-gray-700">
                  Page {currentPage} of {totalPages}
                </Text>

                <TouchableOpacity
                  onPress={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${currentPage === totalPages ? 'opacity-50' : ''}`}
                >
                  <Text className="text-blue-500 font-bold">Next</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text className="text-xs sm:text-sm text-gray-600">
              No results found
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
