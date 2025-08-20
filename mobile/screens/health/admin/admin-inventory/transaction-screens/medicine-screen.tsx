// src/screens/MedicineListScreen.tsx (Card-Based View)
import React from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import type { MedicineRecords, ApiItemWithStaff } from "../types";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMedicineTransactions } from "../restful-api/transaction/fetchqueries";
// import { useNavigation } from '@react-navigation/native'; // If using React Navigation

export default function MedicineListScreen() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10); // Still useful for pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  // const navigation = useNavigation(); // If using React Navigation

  const { data: medicines, isLoading: isLoadingMedicines } = useMedicineTransactions();

  const formatMedicineData = React.useCallback((): MedicineRecords[] => {
    if (!medicines) return [];
    return medicines.map((medicine: ApiItemWithStaff) => {
      const staffFirstName = medicine.staff_detail?.rp?.per?.per_fname || "";
      const staffLastName = medicine.staff_detail?.rp?.per?.per_lname || "";
      const staffFullName = `${staffFirstName} ${staffLastName}`.trim();

      return {
        mdt_id: medicine.mdt_id,
        med_detail: {
          med_name: medicine.med_name,
          minv_dsg: medicine.minv_detail?.minv_dsg,
          minv_dsg_unit: medicine.minv_detail?.minv_dsg_unit,
          minv_form: medicine.minv_detail?.minv_form,
        },
        inv_id: medicine.minv_detail?.inv_detail?.inv_id,
        mdt_qty: medicine.mdt_qty,
        mdt_action: medicine.mdt_action,
        staff: staffFullName || String(medicine.staff),
        created_at: medicine.created_at,
      };
    });
  }, [medicines]);

  const filteredMedicines = React.useMemo(() => {
    const formattedData = formatMedicineData();
    return formattedData.filter((record) => {
      const searchText = `
        ${record.med_detail.med_name || ""}
        ${record.mdt_action || ""}
        ${record.staff || ""}
        ${record.inv_id || ""}
      `.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatMedicineData]);

  const totalPages = Math.ceil(filteredMedicines.length / pageSize);
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoadingMedicines) {
    return (
      <View className="w-full h-full p-4">
        <Skeleton className="h-10 w-1/2 mb-3" />
        <Skeleton className="h-7 w-3/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </View>
    );
  }

  // Function to render each medicine item as a card
  const renderMedicineCard = ({ item }: { item: MedicineRecords }) => (
    <TouchableOpacity
      className="bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-200"
      // onPress={() => navigation.navigate('MedicineDetail', { medicineId: item.mdt_id })} // Example navigation
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-semibold text-lg text-gray-800 flex-1 pr-2">
          {item.med_detail.med_name}
        </Text>
        <View className="bg-blue-100 px-2 py-1 rounded-full">
          <Text className="text-blue-700 text-xs font-medium">ID: {item.inv_id}</Text>
        </View>
      </View>

      <View className="mb-2">
        <Text className="text-gray-600 text-sm">
          <Text className="font-medium">Quantity:</Text> {item.mdt_qty}
        </Text>
        <Text className="text-gray-600 text-sm">
          <Text className="font-medium">Action:</Text> {item.mdt_action}
        </Text>
        <Text className="text-gray-600 text-sm">
          <Text className="font-medium">Staff:</Text> {item.staff} 
        </Text>
      </View>

      <View className="flex-row justify-between items-center border-t border-gray-100 pt-2">
        <Text className="text-gray-500 text-xs">Date created: {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <Text className="text-gray-500 text-xs">
          {item.med_detail.minv_dsg} {item.med_detail.minv_dsg_unit} ({item.med_detail.minv_form})
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <View className="mb-4">
        {/* <SearchInput
          placeholder="Search by medicine name, action, or staff..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        /> */}
      </View>

      <View className="bg-white rounded-md shadow-sm p-4"> {/* Added padding to the main container */}
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
          {/* ExportButton can remain, but might need to be styled differently for a card view */}
          {/* <ExportButton
            data={filteredMedicines}
            filename="medicine-transactions"
            columns={exportColumns}
          /> */}
        </View>

        <FlatList
          data={paginatedMedicines}
          keyExtractor={(item, index) => `med-${item.mdt_id || index}`}
          renderItem={renderMedicineCard}
          ListEmptyComponent={() => (
            <View className="py-8 items-center">
              <Text className="text-gray-500 text-base">No results found.</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 10 }} // Add some padding at the bottom
        />

        {/* Pagination Controls */}
        <View className="flex-col sm:flex-row justify-between items-center p-3 gap-3 border-t border-gray-200 mt-3">
          {filteredMedicines.length > 0 ? (
            <>
              <Text className="text-xs sm:text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredMedicines.length)} of{" "}
                {filteredMedicines.length} rows
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
