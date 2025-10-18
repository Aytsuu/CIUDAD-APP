import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Search, Calendar, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
import PageLayout from '@/screens/_PageLayout';
import { SearchInput } from '@/components/ui/search-input';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from "@/components/ui/loading-state";

const IncomeExpenseMain = () => {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add debouncing for search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data: responseData = { results: [], count: 0 }, // Default to paginated structure
    isLoading,
    isError,
    refetch
  } = useIncomeExpenseMainCard(debouncedSearchQuery);

  // Extract the actual data array from the paginated response
  const fetchedData = responseData.results || [];

  const handleCardClick = (year: string, totalBud: number, totalExp: number, totalInc: number) => {
    router.push({
      pathname: '/(treasurer)/budget-tracker/budget-expense-main',
      params: {
        type: 'viewing',
        budYear: year,
        totalBud: totalBud.toString(),
        totalExp: totalExp.toString(),
        totalInc: totalInc.toString(),
      }
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );  


  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Income & Expense Tracking</Text>}
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center mb-4">
            Failed to load income/expense data.
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-[#2a3a61] px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Income & Expense Tracking</Text>}
      rightAction={
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      {showSearch && (
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={() => {}} // Can leave empty since you're using debounce
        />
      )}      

      <View className="flex-1 px-2">

        {/* Optional: Show total count - placeholder for future pagination */}
        {fetchedData.length > 0 && (
          <View className="px-4 mb-2 pt-2">
            <Text className="text-xs text-gray-500">
              Showing {fetchedData.length} of {responseData.count} records
            </Text>
          </View>
        )}

        {/* Budget Cards */}
        <View className="px-4 space-y-4 pb-4">
          {isLoading ? (
            renderLoadingState() 
          ) : (
            <>
              {[...fetchedData]
                .sort((a, b) => Number(b.ie_main_year) - Number(a.ie_main_year))
                .map((tracker: any) => {

                const budget = Number(tracker.ie_main_tot_budget);
                const income = Number(tracker.ie_main_inc);
                const expense = Number(tracker.ie_main_exp);
                const remainingBal = Number(tracker.ie_remaining_bal);
                const progress = budget > 0 ? (expense / budget) * 100 : 0;

                return (
                  <TouchableOpacity
                    key={tracker.ie_main_year}
                    onPress={() => handleCardClick(
                      tracker.ie_main_year,
                      budget,
                      expense,
                      income
                    )}
                    activeOpacity={0.8}
                  >
                    <View className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
                      {/* Card Header */}
                      <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center">
                          <View className="rounded-full border-2 border-[#2a3a61] p-2 mr-3">
                            <Calendar size={20} color="#2a3a61" />
                          </View>
                          <Text className="font-semibold text-lg text-[#2a3a61]">
                            {tracker.ie_main_year} Budget Overview
                          </Text>
                        </View>
                      </View>

                      {/* Card Content */}
                      <View className="space-y-3">
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600">Total Budget:</Text>
                          <Text className="text-blue-600">
                            Php {budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600">Total Income:</Text>
                          <Text className="text-green-600">
                            Php {income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600">Total Expenses:</Text>
                          <Text className="text-red-600">
                            Php {expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600">Remaining Balance:</Text>
                          <Text className="text-yellow-600">
                            Php {remainingBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View className="mt-4">
                        <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <View
                            className="h-full bg-[#2a3a61]"
                            style={{ width: `${progress}%` }}
                          />
                        </View>
                        <Text className="text-xs text-gray-500 mt-1 text-center">
                          {progress.toFixed(2)}% of budget spent
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {fetchedData.length === 0 && (
                <Text className="text-center text-gray-500 text-sm mt-4">
                  No matching records found
                </Text>
              )}
            </>
          )}
        </View>
      </View>

    </PageLayout>
  );
};

export default IncomeExpenseMain;