import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl, ScrollView
} from 'react-native';
import { Search, Calendar, X, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useGetGADYearBudgets } from './queries/yearqueries';
import ScreenLayout from '@/screens/_ScreenLayout';
import { Input } from '@/components/ui/input';

const GADBudgetTrackerMain = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Query hook
  const { 
    data: fetchedData = [], 
    isLoading, 
    isError, 
    refetch 
  } = useGetGADYearBudgets();

  // Filter data based on search query
  const filteredData = fetchedData.filter(tracker =>
    tracker.gbudy_year.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (year: string, totalBud: number, totalExp: number, totalInc: number) => {
    router.push({
      pathname: '/gad/budget-tracker/budget-tracker-record',
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

  const [refreshing, setRefreshing] = useState(false)
  
    const onRefresh = async () => {
      setRefreshing(true)
      await refetch()
      setRefreshing(false)
    }


  if (isError) {
    return (
      <ScreenLayout
        customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Budget Tracker</Text>}
      showExitButton={false}
      loading={isLoading}
      loadingMessage='Loading...'
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
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
        customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Budget Tracker</Text>}
      showExitButton={false}
      loading={isLoading}
      loadingMessage='Loading...'
      scrollable={false}
      >
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Search Bar */}
      <View className="mb-4">
        <View className="relative">
          <Search className="absolute left-3 top-3.5 text-gray-500" size={17} />
          <Input
            placeholder="Search by year"
            className="pl-10 w-full bg-white text-sm rounded-lg p-2 border border-gray-300"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Budget Cards */}
      <View className="space-y-4 pb-4">
        {filteredData.map((tracker) => {
          const budget = Number(tracker.gbudy_budget);
          const income = Number(tracker.gbudy_income);
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
                income
              )}
              activeOpacity={0.8}
            >
              <View className="bg-white rounded-lg p-4 border border-gray-200">
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
        
        {filteredData.length === 0 && (
          <Text className="text-center text-gray-500 text-sm mt-4">
            No matching records found
          </Text>
        )}
      </View>
      </ScrollView>
    </ScreenLayout>
  );
};

export default GADBudgetTrackerMain;