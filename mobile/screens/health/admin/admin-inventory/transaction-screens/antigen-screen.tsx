// src/screens/AntigenListScreen.tsx
import React from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import type { AntigenTransaction, ApiItemWithStaff } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { useAntigenTransactions } from "../restful-api/transaction/fetchqueries";

export default function AntigenListScreen() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data: antigenData, isLoading } = useAntigenTransactions();

  const formatAntigenData = React.useCallback((): AntigenTransaction[] => {
    if (!antigenData) return [];
    return antigenData.map((transaction: ApiItemWithStaff) => {
      const staffFirstName = transaction.staff_detail?.rp?.per?.per_fname || "";
      const staffLastName = transaction.staff_detail?.rp?.per?.per_lname || "";
      const staffFullName = `${staffFirstName} ${staffLastName}`.trim();

      return {
        ...transaction,
        staff: staffFullName || String(transaction.staff),
        itemName:
          transaction.vac_stock?.vaccinelist?.vac_name ||
          transaction.imz_stock?.imz_detail?.imz_name ||
          "N/A",
      } as AntigenTransaction;
    });
  }, [antigenData]);

  const filteredAntigen = React.useMemo(() => {
    const formattedData = formatAntigenData();
    return formattedData.filter((record) => {
      const searchText = `
        ${record.itemName || ""}
        ${record.antt_action || ""}
        ${record.staff || ""}
        ${record.vac_stock?.inv_details?.inv_id || record.imz_stock?.inv_detail?.inv_id || ""}
      `.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatAntigenData]);

  const totalPages = Math.ceil(filteredAntigen.length / pageSize);
  const paginatedAntigen = filteredAntigen.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportColumns = [
    { key: "antt_id", header: "ID" },
    { key: "itemName", header: "Item Name" },
    {
      key: "antt_qty",
      header: "Quantity",
      format: (value: number) => value || 0,
    },
    { key: "antt_action", header: "Action" },
    { key: "staff", header: "Staff" },
    { key: "created_at", header: "Date" },
  ];

  // --- LOADING SKELETON LOGIC ---
  if (isLoading) {
    return (
      <View className="w-full h-full p-4 ">
        {/* <Skeleton className="h-10 w-1/2 mb-3 bg-black"  />
        <Skeleton className="h-7 w-3/4 bg-black mb-6" />
        <Skeleton className="h-10 w-full bg-black  mb-4" />
        <Skeleton className="h-4/5 w-full bg-black mb-4" /> */}
        <Text>Loading...</Text>
      </View>
    );
  }
  // --- END LOADING SKELETON LOGIC ---

  const renderAntigenCard = ({ item }: { item: AntigenTransaction }) => (
    <TouchableOpacity
      className="bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-200"
      // onPress={() => navigation.navigate('AntigenDetail', { antigenId: item.antt_id })}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-semibold text-lg text-gray-800 flex-1 pr-2">
          {item.itemName}
        </Text>
        <View className="bg-blue-100 px-2 py-1 rounded-full">
          <Text className="text-blue-700 text-xs font-medium">
            ID: {item.vac_stock?.inv_details?.inv_id || item.imz_stock?.inv_detail?.inv_id || "N/A"}
          </Text>
        </View>
      </View>

      <View className="mb-2">
        <Text className="text-gray-600 text-sm">
          <Text className="font-medium">Quantity:</Text> {item.antt_qty}
        </Text>
        <Text className="text-gray-600 text-sm capitalize">
          <Text className="font-medium">Action:</Text> {item.antt_action.toLowerCase()}
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
          placeholder="Search by item name, action, or staff..."
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
            data={filteredAntigen}
            filename="antigen-transactions"
            columns={exportColumns}
          /> */}
        </View>

        <FlatList
          data={paginatedAntigen}
          keyExtractor={(item, index) => `antigen-${item.antt_id || index}`}
          renderItem={renderAntigenCard}
          ListEmptyComponent={() => (
            <View className="py-8 items-center">
              <Text className="text-gray-500 text-base">No results found.</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 10 }}
        />

        <View className="flex-col sm:flex-row justify-between items-center p-3 gap-3 border-t border-gray-200 mt-3">
          {filteredAntigen.length > 0 ? (
            <>
              <Text className="text-xs sm:text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredAntigen.length)} of{" "}
                {filteredAntigen.length} rows
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
