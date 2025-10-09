import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl, 
  ScrollView,
  TextInput
} from 'react-native';
import { Calendar, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useGetGADYearBudgets } from './queries/btracker-yearqueries';
import PageLayout from '@/screens/_PageLayout';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from '@/components/ui/loading-state';

const GADBudgetTrackerMain = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const {
    data: yearsData = { results: [], count: 0 },
    isLoading,
    isError,
    isFetching,
    refetch
  } = useGetGADYearBudgets(currentPage, pageSize, debouncedSearchQuery);
  const isSearching = isFetching && searchQuery !== debouncedSearchQuery;
  const years = yearsData.results || [];
  const sortedData = [...years].sort(
    (a, b) => Number(b.gbudy_year) - Number(a.gbudy_year)
  );

  const handleCardClick = (year: string, totalBud: number, totalExp: number) => {
    router.push({
      pathname: '/(gad)/budget-tracker/budget-tracker-record',
      params: {
        type: 'viewing',
        budYear: year,
        totalBud: totalBud.toString(),
        totalExp: totalExp.toString(),
      }
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} className="text-black" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-[13px]">GAD Budget Tracker</Text>}
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center mb-4">
            Failed to load expense data.
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
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
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerTitle={<Text>GAD Budget Tracker</Text>}
      rightAction={<View />}
    >
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="flex-1 px-6"
      >
        {/* Search Bar */}
        <View className="mb-8">
          <View className="relative">
            <TextInput
              placeholder="Search"
              className="pl-2 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Loading state for initial load */}
        {isLoading ? (
          <View className="h-64 justify-center items-center">
            <LoadingState/>
          </View>
        ) : (
          /* Content area */
          <View>
            {/* Loading state for search operations */}
            {isSearching ? (
              <View className="h-32 justify-center items-center">
                <LoadingState/>
              </View>
            ) : (
              /* Budget Cards */
              <View className="space-y-4 pb-4">
                {sortedData.map((tracker) => {
                  const budget = Number(tracker.gbudy_budget);
                  const expense = Number(tracker.gbudy_expenses);
                  const remainingBal = Number(tracker.gbudy_budget - tracker.gbudy_expenses);
                  const progress = budget > 0 ? (expense / budget) * 100 : 0;

                  return (
                    <TouchableOpacity
                      key={tracker.gbudy_year}
                      onPress={() => handleCardClick(
                        tracker.gbudy_year,
                        budget,
                        expense,
                      )}
                      activeOpacity={0.8}
                    >
                      <View className="bg-white rounded-lg p-4 border border-gray-200 mb-2 shadow">
                        {/* Card Header */}
                        <View className="flex-row justify-between items-center mb-4">
                          <View className="flex-row items-center">
                            <View className="rounded-full border-2 border-[#2a3a61] p-2 mr-3">
                              <Calendar size={20} color="#2a3a61" />
                            </View>
                            <Text className="font-semibold text-lg text-[#2a3a61]">
                              {tracker.gbudy_year} Budget Overview
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
                
                {sortedData.length === 0 && (
                  <Text className="text-center text-gray-500 text-sm mt-4">
                    {searchQuery ? 'No matching budget records found' : 'No budget records found'}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
};

export default GADBudgetTrackerMain;