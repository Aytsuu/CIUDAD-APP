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
  X,
  Search,
  ChevronLeft,
  Plus,
  Archive,
  Pencil,
  CircleAlert,
  ArchiveRestore,
  Trash,
  ClipboardCheck    
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SelectLayout } from '@/components/ui/select-layout';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { useIncomeExpenseMainCard, type IncomeExpenseCard } from './queries/income-expense-FetchQueries';
import { useIncomeExpense } from './queries/income-expense-FetchQueries';
import { useBudgetItems } from './queries/income-expense-FetchQueries';
import { useArchiveOrRestoreExpense } from './queries/income-expense-DeleteQueries';
import { useDeleteIncomeExpense } from './queries/income-expense-DeleteQueries';
import PageLayout from '@/screens/_PageLayout';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from "@/components/ui/loading-state";


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


const ExpenseTracking = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;
  const totInc = parseFloat(params.totalInc as string) || 0;

  const [activeTab, setActiveTab] = useState('active');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [viewFilesModalVisible, setViewFilesModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ ief_url: string; ief_name: string }[]>([]);
  const [currentZoomScale, setCurrentZoomScale] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState('expense');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { 
    data: responseData = { results: [], count: 0 }, 
    isLoading, 
    isError, 
    refetch 
  } = useIncomeExpense(
    1, // page
    1000, // pageSize - large number to get all data
    year ? parseInt(year) : new Date().getFullYear(),
    debouncedSearchQuery,
    selectedMonth,
    activeTab === 'archive' // Send archive status to backend
  );


  // Extract the actual data array (backend already filtered it)
  const fetchedData = responseData.results || [];


  const { data: budgetItems = [] } = useBudgetItems(Number(year));
  const { data: fetchedMain = { results: [], count: 0 } } = useIncomeExpenseMainCard();
  const { mutate: archiveRestore, isPending: isArchivePending } = useArchiveOrRestoreExpense();
  const { mutate: deleteEntry, isPending: isDeletePending } = useDeleteIncomeExpense();

  const matchedYearData = fetchedMain.results.find((item: IncomeExpenseCard) => Number(item.ie_main_year) === Number(year));
  const totBud = matchedYearData?.ie_remaining_bal ?? 0;
  const totExp = matchedYearData?.ie_main_exp ?? 0;


  const trackingOptions = [
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
  ];

  const monthFilterOptions = monthOptions.map(month => ({
    label: month.name,
    value: month.id
  }));


  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Handle month change
  const handleMonthChange = (option: { label: string; value: string }) => {
    setSelectedMonth(option.value);
  };

  const handleTabSelect = (option: { label: string; value: string }) => {
    setSelectedTab(option.value);
    if (option.value === 'income') {
      router.push({
        pathname: '/(treasurer)/budget-tracker/budget-income-main',
        params: {
          budYear: year,
          totalInc: totInc.toString(),
        },
      });
    }
  };

  const handleEdit = (item: any) => {
    router.push({
      pathname: '/(treasurer)/budget-tracker/budget-expense-edit',
      params: {
        iet_num: Number(item.iet_num),
        iet_serial_num: item.iet_serial_num || '',
        iet_check_num: item.iet_check_num || '',
        iet_datetime: item.iet_datetime || '',
        iet_entryType: item.iet_entryType || 'Expense',
        iet_particular_id: String(item.exp_id),
        iet_particulars_name: String(item.exp_budget_item),
        iet_amount: item.iet_amount || '0',
        iet_actual_amount: item.iet_actual_amount || '0',
        iet_additional_notes: item.iet_additional_notes || '',
        iet_receipt_image: item.iet_receipt_image || '',
        inv_num: item.inv_num || 'None',
        year: String(year),
        files: JSON.stringify(item.files || [])
      }
    });
  };

  const handleViewFiles = (files: { ief_url: string; ief_name: string }[]) => {
    setSelectedFiles(files);
    setCurrentIndex(0);
    setViewFilesModalVisible(true);
  };

  const handleCreate = () => {
    router.push({
      pathname: '/(treasurer)/budget-tracker/budget-expense-create',
      params: {
        budYear: year,
        totalBud: totBud.toString(),
        totalExp: totExp.toString(),
      },
    });
  };

  const handleDelete = async (item: any) => {
    await deleteEntry(Number(item.iet_num));
  };

  const handleArchive = async (item: any) => {
    const matchingBudgetItem = budgetItems.find(budget => budget.id === item.exp_id.toString());
    let totalBudget = 0.00;
    let totalExpense = 0.00;
    let proposedBud = 0.00;

    const amount = Number(item.iet_amount);
    const actual_amount = Number(item.iet_actual_amount);
    const propBudget = matchingBudgetItem?.proposedBudget || 0;
    const totEXP = Number(totExp);
    const totBUDGET = Number(totBud);   
    
    if(!actual_amount){
      totalBudget = totBUDGET + amount;
      totalExpense = totEXP - amount;
      proposedBud = propBudget + amount;
    } else {
      totalBudget = totBUDGET + actual_amount;
      totalExpense = totEXP - actual_amount;
      proposedBud = propBudget + actual_amount;            
    }

    const allValues = {
      iet_num: item.iet_num,
      iet_is_archive: true,
      exp_id: item.exp_id,
      year: Number(year),
      totalBudget, 
      totalExpense, 
      proposedBud    
    };

    await archiveRestore(allValues);
  };

  const handleRestore = async (item: any) => {
    const matchingBudgetItem = budgetItems.find(budget => budget.id === item.exp_id.toString());
    let totalBudget = 0.00;
    let totalExpense = 0.00;
    let proposedBud = 0.00;

    const amount = Number(item.iet_amount);
    const actual_amount = Number(item.iet_actual_amount);
    const propBudget = matchingBudgetItem?.proposedBudget || 0;
    const totEXP = Number(totExp);
    const totBUDGET = Number(totBud);   
    
    if(!actual_amount){
      totalBudget = totBUDGET - amount;
      totalExpense = totEXP + amount;
      proposedBud = propBudget - amount;
    } else {
      totalBudget = totBUDGET - actual_amount;
      totalExpense = totEXP + actual_amount;
      proposedBud = propBudget - actual_amount;            
    }

    const allValues = {
      iet_num: item.iet_num,
      iet_is_archive: false,
      exp_id: item.exp_id,
      year: Number(year),
      totalBudget, 
      totalExpense, 
      proposedBud    
    };
    
    await archiveRestore(allValues);
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

  const renderItem = ({ item }: { item: any }) => (
    <Card className="mb-4 border border-gray-200 bg-white">
      <CardHeader className="flex-row justify-between items-center">
        <CardTitle className="text-lg text-[#2a3a61]">
          {new Date(item.iet_datetime).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
          })}             
        </CardTitle>
        {activeTab === 'active' ? (
          <View className="flex-row gap-1">
            <TouchableOpacity onPress={() => handleEdit(item)} className="bg-blue-50 rounded py-1 px-1.5">
              <Pencil size={16} color="#00A8F0"/>
            </TouchableOpacity>
            <ConfirmationModal
              trigger={
                <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
                  <Archive size={16} color="#dc2626"/>
                </TouchableOpacity>
              }
              title="Archive Entry"
              description="Are you sure you want to archive this entry?"
              actionLabel="Archive"
              onPress={() => handleArchive(item)}
            />
          </View>
        ) : (
          <View className="flex-row gap-1">
            <ConfirmationModal
              trigger={
                <TouchableOpacity className="bg-green-50 rounded py-1 px-1.5">
                  <ArchiveRestore size={16} color="#15803d"/>
                </TouchableOpacity>
              }
              title="Restore Entry"
              description="Are you sure you want to restore this entry?"
              actionLabel="Restore"
              onPress={() => handleRestore(item)}
            />
            <ConfirmationModal
              trigger={
                <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
                  <Trash size={16} color="#dc2626"/>
                </TouchableOpacity>
              }
              title="Delete Entry"
              description="Are you sure you want to delete this entry?"
              actionLabel="Delete"
              onPress={() => handleDelete(item)}
            />
          </View>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <View className="flex-row justify-between pb-2">
          <Text className="text-gray-600">Particulars:</Text>
          <Text>{item.exp_budget_item}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Proposed Budget:</Text>
          <Text className="font-semibold">
            ₱{Number(item.iet_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        {item.iet_actual_amount && (
          <View className="flex-row justify-between pb-2">
            <Text className="text-gray-600">Actual Expense:</Text>
            <Text className="font-semibold">
              ₱{Number(item.iet_actual_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        )}
        <View className="flex-row justify-between pb-2">
          <Text className="text-gray-600">Assigned Staff:</Text>
          <Text>{item.staff_name}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Documents:</Text>
          {item.files?.length > 0 ? (
            <TouchableOpacity onPress={() => handleViewFiles(item.files)}>
              <Text className="text-blue-600 underline">{item.files.length} attached</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center">
              <CircleAlert size={16} color="#ff2c2c" />
              <Text className="text-red-500 ml-1">No document</Text>
            </View>
          )}
        </View>
      </CardContent>
    </Card>
  );

  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Expense Tracking</Text>}
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center mb-4">
            Failed to load expense data.
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
        <TouchableOpacity onPress={() => router.push('/(treasurer)/budget-tracker/budget-income-expense-main')} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">
          {year} Expense Tracking
        </Text>
      }
      rightAction={
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
      wrapScroll={false} 
    >
      <View className="flex-1">
        {showSearch && (
          <SearchInput 
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={() => {}} // Can leave empty since you're using debounce
          />
        )}

        {/* Search and Filters */}
        <View className="px-6 pb-4">
          <View className="flex-row justify-between items-center gap-2 pb-6">
            <View className="flex-1">
              <SelectLayout
                options={monthFilterOptions}
                className="h-8 w-full"
                selectedValue={selectedMonth}
                onSelect={handleMonthChange}
                placeholder="Select Month"
                isInModal={false}
              />
            </View>
            
            <View className="flex-1">
              <SelectLayout
                options={trackingOptions}
                className="h-8 w-full"
                selectedValue={selectedTab}
                onSelect={handleTabSelect}
                placeholder="Type"
                isInModal={false}
              />
            </View>
          </View>

          <Button
            onPress={handleCreate}
            className="bg-primaryBlue mt-2 rounded-xl"
          >
            <Text className="text-white text-[17px]">  Create </Text>
          </Button>
        </View>

        {/* Tabs */}
        <View className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-blue-50 mb-3 mt-5 flex-row justify-between">
              <TabsTrigger 
                  value="active" 
                  className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
                >
                  <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                    Active
                  </Text>
                </TabsTrigger>
                <TabsTrigger 
                  value="archive"
                  className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
                >
                  <View className="flex-row items-center justify-center">
                    <Archive 
                      size={16} 
                      className="mr-1" 
                      color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'} 
                    />
                    <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
                      Archive
                    </Text>
                  </View>
                </TabsTrigger>
            </TabsList>

            <View className="flex-row justify-end mb-3">
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: '/(treasurer)/budget-tracker/budget-expense-log', // Update this path to your actual route
                    params: {
                      LogYear: year, // Pass any parameters you need
                    }
                  });
                }}
                className="bg-primaryBlue px-3 py-2 rounded-md" // Different color to distinguish from Create
              >
                <Text className="text-white text-[17px]">
                  <ClipboardCheck size={14} color="white"/>   Logs
                </Text>
              </TouchableOpacity>
            </View>         

            {/* Active Entries */}
            <TabsContent value="active">
              {isLoading || isArchivePending || isDeletePending ? (
                // <View className="h-64 justify-center items-center">
                //   <ActivityIndicator size="large" color="#2a3a61" />
                //   <Text className="text-sm text-gray-500 mt-2">
                //     {isArchivePending ? "Updating entry records..." : 
                //     isDeletePending ? "Deleting entry..." : 
                //     "Loading..."}
                //   </Text>
                // </View>
                renderLoadingState() 
              ) : (
                <FlatList
                  data={fetchedData} // No filtering needed - backend already sent active records
                  renderItem={renderItem}
                  keyExtractor={item => item.iet_num.toString()}
                  contentContainerStyle={{ paddingBottom: 500 }}
                  showsVerticalScrollIndicator={false} 
                  ListEmptyComponent={
                    <Text className="text-center text-gray-500 py-4">
                      No active entries found
                    </Text>
                  }               
                />
              )}
            </TabsContent>

            {/* Archived Entries */}
            <TabsContent value="archive">
              {isLoading || isArchivePending || isDeletePending ? (
                // <View className="h-64 justify-center items-center">
                //   <ActivityIndicator size="large" color="#2a3a61" />
                //   <Text className="text-sm text-gray-500 mt-2">
                //     {isArchivePending ? "Updating entry records..." : 
                //     isDeletePending ? "Deleting entry..." : 
                //     "Loading..."}
                //   </Text>
                // </View>
                renderLoadingState() 
              ) : (
                <FlatList
                  data={fetchedData} // No filtering needed - backend already sent archived records
                  renderItem={renderItem}
                  keyExtractor={item => item.iet_num.toString()}
                  contentContainerStyle={{ paddingBottom: 500 }}
                  showsVerticalScrollIndicator={false}                   
                  ListEmptyComponent={
                    <Text className="text-center text-gray-500 py-4">
                      No archived entries found
                    </Text>
                  }
                />
              )}              
            </TabsContent>
          </Tabs>
        </View>

        <Modal
          visible={viewFilesModalVisible}
          transparent={true}
          onRequestClose={() => {
            setViewFilesModalVisible(false);
            setCurrentZoomScale(1); // Reset zoom when closing
          }}
        >
          <View className="flex-1 bg-black/90">
            {/* Header with close button and file name */}
            <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-between items-center">
              <Text className="text-white text-lg font-medium w-[90%]">
                {selectedFiles[currentIndex]?.ief_name || 'Document'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setViewFilesModalVisible(false);
                  setCurrentZoomScale(1);
                }}
              >
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Image with zoom capability */}
            <ScrollView
              className="flex-1"
              maximumZoomScale={3}
              minimumZoomScale={1}
              zoomScale={currentZoomScale}
              onScrollEndDrag={(e) => setCurrentZoomScale(e.nativeEvent.zoomScale)}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            >
              <Image
                source={{ uri: selectedFiles[currentIndex]?.ief_url }}
                style={{ width: '100%', height: 400 }}
                resizeMode="contain"
              />
            </ScrollView>

            {/* Pagination indicators at the bottom */}
            {selectedFiles.length > 1 && (
              <View className="absolute bottom-4 left-0 right-0 items-center">
                <View className="flex-row bg-black/50 rounded-full px-3 py-1">
                  {selectedFiles.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setCurrentIndex(index);
                        setCurrentZoomScale(1);
                      }}
                      className="p-1"
                    >
                      <View 
                        className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Navigation arrows for multiple files */}
            {selectedFiles.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <TouchableOpacity
                    className="absolute left-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
                    onPress={() => {
                      setCurrentIndex(prev => prev - 1);
                      setCurrentZoomScale(1);
                    }}
                  >
                    <ChevronLeft size={24} color="white" />
                  </TouchableOpacity>
                )}
                {currentIndex < selectedFiles.length - 1 && (
                  <TouchableOpacity
                    className="absolute right-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
                    onPress={() => {
                      setCurrentIndex(prev => prev + 1);
                      setCurrentZoomScale(1);
                    }}
                  >
                    <ChevronLeft size={24} color="white" className="rotate-180" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </Modal>
      </View>
    </PageLayout>
  );
};

export default ExpenseTracking;