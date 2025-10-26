// src/screens/CommodityListScreen.tsx
import React from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import type { CommodityRecords, ApiItemWithStaff } from "../types"; // Adjust path if needed
// import { Skeleton } from "@/components/ui/skeleton";
import { useCommodityTransactions } from "../restful-api/transaction/fetchqueries";
import { formatDate } from "@/helpers/dateHelpers";
import { LoadingState } from "@/components/ui/loading-state";

export default function CommodityListScreen() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data: commodities, isLoading: isLoadingCommodities } = useCommodityTransactions(
    currentPage,
    pageSize,
    searchQuery
  );

  const formatCommodityData = React.useCallback((): CommodityRecords[] => {
    if (!commodities) return [];
    return commodities.results.map((commodity: ApiItemWithStaff) => {
      const staffFirstName = commodity.staff_detail?.rp?.per?.per_fname || "";
      const staffLastName = commodity.staff_detail?.rp?.per?.per_lname || "";
      const staffFullName = `${staffFirstName} ${staffLastName}`.trim();

      return {
        // inv_id: commodity?.cinv_detail?.inv_detail?.inv_id,
        comt_id: commodity.comt_id,
        com_name: commodity.com_name,
        comt_qty: commodity.comt_qty,
        comt_action: commodity.comt_action,
        staff: staffFullName || String(commodity.staff),
        created_at: formatDate(commodity.created_at),
      } as CommodityRecords;
    });
  }, [commodities]);

  const filteredCommodities = React.useMemo(() => {
    const formattedData = formatCommodityData();
    return formattedData.filter((record) => {
      const searchText = `
        ${record.com_name || ""}
        ${record.comt_action || ""}
        ${record.staff || ""}
        ${record.inv_id || ""}
      `.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatCommodityData]);

  const totalPages = Math.ceil(filteredCommodities.length / pageSize);
  const paginatedCommodities = filteredCommodities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportColumns = [
    { key: "comt_id", header: "ID" },
    { key: "com_name", header: "Commodity Name" },
    {
      key: "comt_qty",
      header: "Quantity",
      format: (value: number) => value || 0,
    },
    { key: "comt_action", header: "Action" },
    { key: "staff", header: "Staff" },
    { key: "created_at", header: "Date" },
  ];

  // --- LOADING SKELETON LOGIC ---
  if (isLoadingCommodities) {
    return 
       <LoadingState/>
  }
      
  
  // --- END LOADING SKELETON LOGIC ---

  const renderCommodityCard = ({ item }: { item: CommodityRecords }) => (
    <TouchableOpacity
      className="bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-200"
      // onPress={() => navigation.navigate('CommodityDetail', { commodityId: item.comt_id })}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-semibold text-lg text-gray-800 flex-1 pr-2">
          {item.com_name}
        </Text>
        <View className="bg-blue-100 px-2 py-1 rounded-full">
          <Text className="text-blue-700 text-xs font-medium">ID: {item.inv_id}</Text>
        </View>
      </View>

      <View className="mb-2">
        <Text className="text-gray-600 text-sm">
          <Text className="font-medium">Quantity:</Text> {item.comt_qty}
        </Text>
        <Text className="text-gray-600 text-sm">
          <Text className="font-medium">Action:</Text> {item.comt_action}
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
          placeholder="Search by commodity name, action, or staff..."
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
            data={filteredCommodities}
            filename="commodity-transactions"
            columns={exportColumns}
          /> */}
        </View>

        <FlatList
          data={paginatedCommodities}
          keyExtractor={(item, index) => `commodity-${item.comt_id || index}`}
          renderItem={renderCommodityCard}
          ListEmptyComponent={() => (
            <View className="py-8 items-center">
              <Text className="text-gray-500 text-base">No results found.</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 10 }}
        />

        <View className="flex-col sm:flex-row justify-between items-center p-3 gap-3 border-t border-gray-200 mt-3">
          {filteredCommodities.length > 0 ? (
            <>
              <Text className="text-xs sm:text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredCommodities.length)} of{" "}
                {filteredCommodities.length} rows
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
