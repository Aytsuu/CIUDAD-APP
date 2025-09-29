import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import {
  Search,
  ChevronLeft,
  FileInput,
  CircleAlert,
  ArrowUpDown,
  X
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SelectLayout } from '@/components/ui/select-layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PageLayout from '@/screens/_PageLayout';
import { useExpenseLog, type ExpenseLog } from '../queries/income-expense-FetchQueries';
import { useDebounce } from '@/hooks/use-debounce';

const monthOptions = [
  { id: "All", name: "All" },
  { id: "01", name: "January" },
  { id: "02", name: "February" },
  { id: "03", name: "March" },
  { id: "04", name: "April" },
  { id: "05", name: "May" },
  { id: "06", name: "June" },
  { id: "07", name: "July" },
  { id: "08", name: "August" },
  { id: "09", name: "September" },
  { id: "10", name: "October" },
  { id: "11", name: "November" },
  { id: "12", name: "December" }
];

const ExpenseLogMain = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.LogYear as string;

  console.log("LOGYEAR: ", year)

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [viewFilesModalVisible, setViewFilesModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ ief_url: string; ief_name: string }[]>([]);
  const [currentZoomScale, setCurrentZoomScale] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Add debouncing for search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Month filter options
  const monthFilterOptions = monthOptions.map(month => ({
    label: month.name,
    value: month.id
  }));

  // Fetch data with search and filter parameters
  const { data: fetchedData = [], isLoading } = useExpenseLog(
    year ? parseInt(year) : new Date().getFullYear(),
    debouncedSearchQuery,
    selectedMonth
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true
    });
  };

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Handle month change
  const handleMonthChange = (option: { label: string; value: string }) => {
    setSelectedMonth(option.value);
  };

  // Filter data - only show non-archived entries (archive filtering still done on frontend)
  const filteredData = fetchedData.filter(row => row.el_is_archive === false);

  const handleViewFiles = (files: { ief_url: string; ief_name: string }[]) => {
    setSelectedFiles(files);
    setCurrentIndex(0);
    setViewFilesModalVisible(true);
  };

  const handleBack = () => {
    router.back();
  };

  const renderItem = ({ item }: { item: any }) => {
    const amount = Number(item.el_proposed_budget);
    const actualAmount = Number(item.el_actual_expense);
    const returnAmount = Number(item.el_return_amount);

    // Determine text color based on comparison (matching web version)
    const textColor = amount > actualAmount ? 'text-green-600' : 'text-red-600';
    
    return (
      <Card className="mb-4 border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-[#2a3a61]">
            {formatDate(item.el_datetime)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <View className="flex-row justify-between pb-2">
            <Text className="text-gray-600">Particulars:</Text>
            <Text className="font-semibold">{item.el_particular}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Proposed Budget:</Text>
            <Text>₱{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Actual Expense:</Text>
            <Text>₱{actualAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View className="flex-row justify-between pb-2">
            <Text className="text-gray-600">Return/Excess Amount:</Text>
            <Text className={`font-semibold ${textColor}`}>
              ₱{returnAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View className="flex-row justify-between pb-2">
            <Text className="text-gray-600">Assigned Staff:</Text>
            <Text>{item.staff_name}</Text>
          </View>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageLayout
        leftAction={
            <TouchableOpacity onPress={handleBack} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
            </TouchableOpacity>
        }
        headerTitle={
            <View>
            <Text className="font-semibold text-lg text-[#2a3a61]">Expense Log</Text>
            </View>
        }
        rightAction={
            <View className="w-10 h-10 rounded-full items-center justify-center"></View>
        }    
        wrapScroll={false}
    >
      <View className="flex-1 px-4">
        {/* Search and Filters */}
        <View className="mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-500" size={17} />
              <TextInput
                placeholder="Search..."
                className="pl-5 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
                value={searchQuery}
                onChangeText={handleSearchChange}
              />
            </View>
            
            <View className="w-[120px] pb-3">
                <SelectLayout
                  options={monthFilterOptions}
                  className="h-10"
                  selectedValue={selectedMonth}
                  onSelect={handleMonthChange}
                  placeholder="Month"
                  isInModal={false}
                />
            </View>
          </View>
        </View>

        {/* Data List */}
        {isLoading ? (
          <View className="h-64 justify-center items-center">
            <ActivityIndicator size="large" color="#2a3a61" />
            <Text className="text-sm text-gray-500 mt-2">Loading...</Text>
          </View>
        ) : filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item) => item.el_id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListFooterComponent={<View className="h-20" />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">No expense log records found</Text>
          </View>
        )}
      </View>
    </PageLayout>
  );
};

export default ExpenseLogMain;