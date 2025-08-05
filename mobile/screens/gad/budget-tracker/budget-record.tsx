import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Modal,
  ScrollView,
  RefreshControl
} from 'react-native';
import {
  Search,
  Plus,
  Archive,
  ArchiveRestore,
  Trash,
  ChevronLeft,
  Calendar,
  X,
  CircleAlert
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { SelectLayout } from '@/components/ui/select-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import ScreenLayout from '@/screens/_ScreenLayout';
import { useGADBudgets} from './queries/fetch';
import { useArchiveGADBudget, useRestoreGADBudget, usePermanentDeleteGADBudget } from './queries/del';
import { useGetGADYearBudgets } from './queries/yearqueries';
import { Input } from '@/components/ui/input';
import PageLayout from '@/screens/_PageLayout';
import { GADBudgetEntryUI, DropdownOption, BudgetFile } from './bt-types';

const BudgetTrackerRecords = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;
  
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedType, setSelectedType] = useState<'All' | 'Income' | 'Expense'>('All');
  const [viewFilesModalVisible, setViewFilesModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<BudgetFile[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const { data: entries = [], isLoading, refetch } = useGADBudgets(year); //imong fetch na query
  const { data: yearBudgets = [] } = useGetGADYearBudgets();
  const { mutate: archiveEntry } = useArchiveGADBudget();
  const { mutate: restoreEntry } = useRestoreGADBudget();
  const { mutate: deleteEntry } = usePermanentDeleteGADBudget();
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const currentYearBudget = yearBudgets.find(
    budget => budget.gbudy_year === year
  )?.gbudy_budget || 0;

  const filteredData = entries.filter((entry: GADBudgetEntryUI) => {
    if (activeTab === 'active' && entry.gbud_is_archive) return false;
    if (activeTab === 'archive' && !entry.gbud_is_archive) return false;
    if (selectedType !== 'All' && entry.gbud_type !== selectedType) return false;

    if (selectedMonth !== 'All' && entry.gbud_datetime) {
      const entryDate = new Date(entry.gbud_datetime);
      const entryMonth = (entryDate.getMonth() + 1).toString().padStart(2, '0');
      if (entryMonth !== selectedMonth) return false;
    }
    
    if (searchQuery) {
      const searchContent = `${entry.gbud_inc_particulars} ${entry.gbud_exp_particulars} ${entry.gbud_type} ${entry.gbud_amount} ${entry.gbud_add_notes}`.toLowerCase();
      return searchContent.includes(searchQuery.toLowerCase());
    }
    
    return true;
  });

  const handleArchive = (gbud_num: number) => {
    if (gbud_num) {
      archiveEntry(gbud_num);
    }
  };

  const handleRestore = (gbud_num: number) => {
    if (gbud_num) {
      restoreEntry(gbud_num);
    }
  };

  const handleDelete = (gbud_num: number) => {
    if (gbud_num) {
      deleteEntry(gbud_num);
    }
  };

  const handleViewFiles = (files: BudgetFile[] | null | undefined) => {
    if (files && files.length > 0) {
      setSelectedFiles(files);
      setViewFilesModalVisible(true);
    }
  };

  const handleCreate = () => {
    router.push({
      pathname: '/gad/budget-tracker/budget-tracker-create-form',
      params: { budYear: year }
    });
  };

  const handleEdit = (entry: GADBudgetEntryUI) => {
    if (!entry.gbud_num || !year) {
      return;
    }
    const params: Record<string, string | number> = {
      gbud_num: entry.gbud_num.toString(),
      budYear: year,
      gbud_datetime: entry.gbud_datetime || '',
      gbud_type: entry.gbud_type || '',
      gbud_add_notes: entry.gbud_add_notes || '',
      gbud_particulars: entry.gbud_particulars || '',
      gbud_amount: entry.gbud_amount != null ? entry.gbud_amount.toString() : '',
      gbud_proposed_budget: entry.gbud_proposed_budget != null ? entry.gbud_proposed_budget.toString() : '',
      gbud_actual_expense: entry.gbud_actual_expense != null ? entry.gbud_actual_expense.toString() : '',
      gbud_reference_num: entry.gbud_reference_num || '',
      gbud_inc_amt: entry.gbud_inc_amt != null ? entry.gbud_inc_amt.toString() : '',
      ...(entry.files && entry.files.length > 0 && { files: JSON.stringify(entry.files) }),
    };

    router.push({
      pathname: '/gad/budget-tracker/budget-tracker-edit-form',
      params
    });
  };

  const handleTypeSelect = (option: DropdownOption) => {
    setSelectedType(option.value as 'All' | 'Income' | 'Expense');
  };

  const handleMonthSelect = (option: DropdownOption) => {
    setSelectedMonth(option.value);
  };

  const handleTabChange = (value: string) => {
    if (value === 'active' || value === 'archive') {
      setActiveTab(value);
    }
  };

  const getLatestRemainingBalance = (): number => {
  // If no entries, return the initial budget
  if (!entries || entries.length === 0) {
    return currentYearBudget ? Number(currentYearBudget) : 0;
  }

  // Filter active (unarchived) entries
  const activeEntries = entries.filter((entry) => !entry.gbud_is_archive);

  // If no active entries, return initial budget
  if (activeEntries.length === 0) {
    return currentYearBudget ? Number(currentYearBudget) : 0;
  }

  // Calculate balance from scratch using only gbud_actual_expense
  let balance = currentYearBudget ? Number(currentYearBudget) : 0;

  activeEntries.forEach((entry) => {
    if (entry.gbud_type === "Expense" && entry.gbud_actual_expense !== null) {
      const amount = Number(entry.gbud_actual_expense) || 0;
      balance -= amount;
    }
  });

  return balance;
};

  const calculateTotalProposedWithoutActual = () => {
    if (!entries || entries.length === 0) return 0;

    return entries.reduce((total, entry) => {
      // Skip archived or non-expense entries
      if (entry.gbud_is_archive || entry.gbud_type !== "Expense") return total;

      // Convert all values to numbers safely (handles strings like "0.00")
      const toNum = (val: any) => {
        if (val === undefined || val === null) return undefined;
        const num = +val; // Convert to number
        return isNaN(num) ? undefined : num;
      };

      const actual = toNum(entry.gbud_actual_expense);
      const proposed = toNum(entry.gbud_proposed_budget);

      // Include if:
      // 1. Actual is either undefined/null OR equals 0 (as number)
      // 2. Proposed exists and is not 0
      const shouldInclude =
        (actual === undefined || actual === null || actual === 0) &&
        proposed !== undefined &&
        proposed !== null &&
        proposed !== 0;

      if (shouldInclude) {
        return total + proposed;
      }
      return total;
    }, 0);
  };

  const renderItem = ({ item }: { item: GADBudgetEntryUI }) => (
    <TouchableOpacity onPress={() => handleEdit(item)}>
      <Card className="mb-4 border border-gray-200">
        <CardHeader className="flex-row justify-between items-center">
          <CardTitle className="text-lg text-[#2a3a61]">
            {item.gbud_datetime ? new Date(item.gbud_datetime).toLocaleDateString() : 'No date'}
          </CardTitle>
          {activeTab === 'active' ? (
            <View className="flex-row gap-1">
              <ConfirmationModal
                trigger={
                  <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
                    <Archive size={16} color="#dc2626"/>
                  </TouchableOpacity>
                }
                title="Archive Entry"
                description="Are you sure you want to archive this entry?"
                actionLabel="Archive"
                onPress={() => item.gbud_num && handleArchive(item.gbud_num)}
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
                onPress={() => item.gbud_num && handleRestore(item.gbud_num)}
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
                onPress={() => item.gbud_num && handleDelete(item.gbud_num)}
              />
            </View>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Type:</Text>
            <Text className="font-medium">{item.gbud_type}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Particulars:</Text>
            <Text>{item.gbud_particulars || 'None'}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Amount:</Text>
            <Text className="font-semibold">
              ₱{
                item.gbud_type === 'Expense' 
                  ? (item.gbud_actual_expense || item.gbud_proposed_budget || 0)
                      .toLocaleString('en-US', { minimumFractionDigits: 2 })
                  : (item.gbud_amount || 0)
                      .toLocaleString('en-US', { minimumFractionDigits: 2 })
              }
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Documents:</Text>
            {item.files && item.files.length > 0 ? (
              <TouchableOpacity onPress={() => handleViewFiles(item.files)}>
                <Text className="text-blue-600 underline">
                  {item.files.length} attached
                </Text>
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
    </TouchableOpacity>
  );

  return (
    <PageLayout
      leftAction={
        <View className="flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color="#2a3a61" />
            </TouchableOpacity>
            {/* <View className="rounded-full border-2 border-[#2a3a61] p-2 ml-2">
              <Calendar size={20} color="#2a3a61" />
            </View> */}
            
            </View>
      }
      headerTitle={<Text>{year} Budget Records</Text>}
      rightAction={
        <TouchableOpacity>
          <ChevronLeft size={30} color="black" className="text-white" />
        </TouchableOpacity>
      }
    >
       <View className="flex p-2">
          <View className="flex-row items-center">
            <Text className="text-gray-600">Budget:</Text>
            <Text className="text-red-500 font-bold ml-2">
              ₱{Number(currentYearBudget).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-600">Remaining Balance:</Text>
            <Text className="text-green-600 font-bold ml-2">
              ₱{getLatestRemainingBalance().toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-600">Pending Expenses:</Text>
            <Text className="text-blue-600 font-bold ml-2">
              ₱{calculateTotalProposedWithoutActual().toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="mb-4 flex-row gap-2 p-2">
        <SelectLayout
          options={[
            { label: 'All', value: 'All' },
            { label: 'Income', value: 'Income' },
            { label: 'Expense', value: 'Expense' }
          ]}
          selectedValue={selectedType}
          onSelect={handleTypeSelect}
          placeholder="Type"
          className="flex-1"
        />
        <SelectLayout
          options={[
            { label: 'All', value: 'All' },
            { label: 'January', value: '01' },
            { label: 'February', value: '02' },
            { label: 'March', value: '03' },
            { label: 'April', value: '04' },
            { label: 'May', value: '05' },
            { label: 'June', value: '06' },
            { label: 'July', value: '07' },
            { label: 'August', value: '08' },
            { label: 'September', value: '09' },
            { label: 'October', value: '10' },
            { label: 'November', value: '11' },
            { label: 'December', value: '12' },
          ]}
          selectedValue={selectedMonth}
          onSelect={handleMonthSelect}
          placeholder="Month"
          className="flex-1"
        />
      </View>

      <View className="mb-4 p-2">
        <View className="relative">
          <Search className="absolute left-3 top-3 text-gray-500" size={17} />
          <Input
            placeholder="Search..."
            className="pl-10 w-full bg-white text-sm rounded-lg p-2 border border-gray-300"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Button
          onPress={handleCreate}
          className="bg-primaryBlue mt-3"
        >
          <Text className="text-white">
            <Plus size={16} color="white" className="mr-2" /> New Entry
          </Text>
        </Button>
      </View>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-blue-50 mb-5 mt-5 flex-row justify-between">
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
              <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                Archive
              </Text>
            </View>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <FlatList
            data={filteredData.filter(item => !item.gbud_is_archive)}
            renderItem={renderItem}
            keyExtractor={item => item.gbud_num?.toString() || Math.random().toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text className="text-center text-gray-500 py-4">
                No active entries found
              </Text>
            }
          />
        </TabsContent>
        
        <TabsContent value="archive">
          <FlatList
            data={filteredData.filter(item => item.gbud_is_archive)}
            renderItem={renderItem}
            keyExtractor={item => item.gbud_num?.toString() || Math.random().toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text className="text-center text-gray-500 py-4">
                No archived entries found
              </Text>
            }
          />
        </TabsContent>
      </Tabs>

      <Modal
        visible={viewFilesModalVisible}
        transparent={true}
        onRequestClose={() => setViewFilesModalVisible(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center">
          <TouchableOpacity 
            className="absolute top-4 right-4 z-10"
            onPress={() => setViewFilesModalVisible(false)}
          >
            <X size={24} color="white" />
          </TouchableOpacity>
          
          {selectedFiles.length > 0 && (
            <>
              <Image
                source={{ uri: selectedFiles[currentFileIndex]?.gbf_url }}
                className="w-full h-4/5"
                resizeMode="contain"
              />
              <Text className="text-white mt-2">
                {selectedFiles[currentFileIndex]?.gbf_name}
              </Text>
              
              {selectedFiles.length > 1 && (
                <View className="flex-row mt-4">
                  <TouchableOpacity
                    onPress={() => setCurrentFileIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentFileIndex === 0}
                    className="p-2"
                  >
                    <ChevronLeft 
                      size={24} 
                      color={currentFileIndex === 0 ? 'gray' : 'white'} 
                    />
                  </TouchableOpacity>
                  <Text className="text-white mx-4">
                    {currentFileIndex + 1} / {selectedFiles.length}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCurrentFileIndex(prev => Math.min(selectedFiles.length - 1, prev + 1))}
                    disabled={currentFileIndex === selectedFiles.length - 1}
                    className="p-2"
                  >
                    <ChevronLeft 
                      size={24} 
                      color={currentFileIndex === selectedFiles.length - 1 ? 'gray' : 'white'} 
                      className="rotate-180"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </Modal>
      </ScrollView>
    </PageLayout>
  );
};

export default BudgetTrackerRecords;