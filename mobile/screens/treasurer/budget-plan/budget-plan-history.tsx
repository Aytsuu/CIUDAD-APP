import { SafeAreaView, Text, ScrollView, View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Search } from 'lucide-react-native';
import { useGetBudgetPlanHistory, type BudgetPlanHistory } from "./queries/budgetPlanFetchQueries";
// import { formatNumber } from "@/helpers/currencynumberformatter";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function BudgetPlanHistory({ planId }: { planId: string }) {
  const router = useRouter();
  const { data: fetchedData = [], isLoading } = useGetBudgetPlanHistory(planId);
  const [searchTerm, setSearchTerm] = useState("");

  const filterData = (rows: BudgetPlanHistory[], search: string) => {
    return rows.filter(row => {
      const text = `${row.bph_source_item} ${row.bph_to_item} ${row.bph_transfer_amount} ${formatTimestamp(row.bph_date_updated)}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  };

  const filteredData = filterData(fetchedData, searchTerm);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2a3a61" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Budget Plan History</Text>
        <View className="w-6" /> {/* Spacer for alignment */}
      </View>

      {/* Search */}
      <View className="p-4 bg-white">
        <View className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <TextInput
            placeholder="Search transactions..."
            className="pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {/* History Cards */}
      <ScrollView className="flex-1 p-4">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <Card key={item.bph_id} className="mb-4 bg-white rounded-lg shadow-sm">
              <CardHeader className="pb-2">
                <Text className="text-sm text-gray-500">
                  {formatTimestamp(item.bph_date_updated)}
                </Text>
              </CardHeader>
              
              <CardContent className="pt-0">
                <View className="space-y-4">
                  {/* From Section */}
                  <View className="border-b border-gray-100 pb-3">
                    <Text className="text-sm font-medium text-gray-600 mb-1">From Item</Text>
                    <Text className="text-base font-medium text-gray-800">{item.bph_source_item}</Text>
                    
                    <View className="flex-row justify-between mt-2">
                      <Text className="text-sm text-gray-500">Previous Balance:</Text>
                      <Text className="text-sm text-gray-700">
                        {item.bph_from_prev_balance}
                      </Text>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-500">New Balance:</Text>
                      <Text className="text-sm font-medium text-red-600">
                        {item.bph_from_new_balance}
                      </Text>
                    </View>
                  </View>

                  {/* To Section */}
                  <View className="border-b border-gray-100 pb-3">
                    <Text className="text-sm font-medium text-gray-600 mb-1">To Item</Text>
                    <Text className="text-base font-medium text-gray-800">{item.bph_to_item}</Text>
                    
                    <View className="flex-row justify-between mt-2">
                      <Text className="text-sm text-gray-500">Previous Balance:</Text>
                      <Text className="text-sm text-gray-700">
                        {item.bph_to_prev_balance}
                      </Text>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-500">New Balance:</Text>
                      <Text className="text-sm font-medium text-green-600">
                        {item.bph_to_new_balance}
                      </Text>
                    </View>
                  </View>

                  {/* Transfer Amount */}
                  <View className="flex-row justify-between items-center pt-2">
                    <Text className="text-sm font-medium text-gray-600">Transferred Amount:</Text>
                    <Text className="text-base font-bold text-blue-600">
                      {item.bph_transfer_amount}
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          ))
        ) : (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-500">No transactions found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}