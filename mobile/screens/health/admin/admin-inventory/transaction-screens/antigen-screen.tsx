import React from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
// import { Skeleton } from "@/components/ui/skeleton";
import { useAntigenTransactions } from "../restful-api/transaction/fetchqueries";

// Define types based on API response
interface AntigenTransaction {
  antt_id: string;
  itemName: string;
  itemType: string;
  inv_id: string;
  antt_qty: string;
  antt_action: string;
  staff: string;
  created_at: string;
}

export default function AntigenListScreen() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // Fetch transactions with page, pageSize, and searchQuery
  const { data: antigenData, isLoading, error } = useAntigenTransactions(
    currentPage,
    pageSize,
    searchQuery
  );

  // Format data (simplified since API fields are direct)
  const formattedAntigen = React.useMemo((): AntigenTransaction[] => {
    if (!antigenData?.results) return [];
    return antigenData.results.map((transaction: any) => ({
      antt_id: transaction.antt_id || "N/A",
      itemName: transaction.item_name || "N/A",
      itemType: transaction.item_type || "N/A",
      inv_id: transaction.inv_id || "N/A",
      antt_qty: transaction.antt_qty || "0",
      antt_action: transaction.antt_action || "N/A",
      staff: transaction.staff || "Unknown",
      created_at: transaction.created_at || "N/A",
    }));
  }, [antigenData]);

  // Calculate total pages from API count
  const totalPages = Math.ceil((antigenData?.count || 0) / pageSize);

  const exportColumns = [
    { key: "antt_id", header: "ID" },
    { key: "itemName", header: "Item Name" },
    { key: "antt_qty", header: "Quantity" },
    { key: "antt_action", header: "Action" },
    { key: "staff", header: "Staff" },
    { key: "created_at", header: "Date", format: (value: string) => new Date(value).toLocaleDateString() },
  ];

  // Loading state
  if (isLoading) {
    return (
      <View className="w-full h-full p-4">
        <Text>Loading...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="w-full h-full p-4 justify-center items-center">
        <Text className="text-red-500">Error loading transactions: {error.message}</Text>
      </View>
    );
  }

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
          <Text className="text-blue-700 text-xs font-medium">ID: {item.antt_id}</Text>
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
        <Text className="text-gray-600 text-sm">
          <Text className="font-medium">Type:</Text> {item.itemType}
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
        <TextInput
          className="w-full h-10 border border-gray-300 rounded-md px-3"
          placeholder="Search by item name, action, or staff..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
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
                setPageSize(value >= 1 ? value : 1);
              }}
            />
            <Text className="text-xs sm:text-sm">Entries</Text>
          </View>
        </View>

        <FlatList
          data={formattedAntigen}
          keyExtractor={(item) => `antigen-${item.antt_id}`}
          renderItem={renderAntigenCard}
          ListEmptyComponent={() => (
            <View className="py-8 items-center">
              <Text className="text-gray-500 text-base">No results found.</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 10 }}
        />

        <View className="flex-col sm:flex-row justify-between items-center p-3 gap-3 border-t border-gray-200 mt-3">
          {formattedAntigen.length > 0 ? (
            <>
              <Text className="text-xs sm:text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, antigenData?.count || 0)} of{" "}
                {antigenData?.count || 0} rows
              </Text>
              <View className="flex-row items-center justify-center">
                <TouchableOpacity
                  onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || !antigenData?.previous}
                  className={`p-2 rounded-md ${currentPage === 1 || !antigenData?.previous ? 'opacity-50' : ''}`}
                >
                  <Text className="text-blue-500 font-bold">Previous</Text>
                </TouchableOpacity>

                <Text className="mx-3 text-gray-700">
                  Page {currentPage} of {totalPages}
                </Text>

                <TouchableOpacity
                  onPress={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages || !antigenData?.next}
                  className={`p-2 rounded-md ${currentPage === totalPages || !antigenData?.next ? 'opacity-50' : ''}`}
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