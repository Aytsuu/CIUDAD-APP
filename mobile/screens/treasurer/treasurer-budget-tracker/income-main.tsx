//LATEST GYUD NI SIYA
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   FlatList
// } from 'react-native';
// import {
//   ArrowUpDown,
//   Trash,
//   Eye,
//   Search,
//   FileInput,
//   Plus,
//   Pencil,
//   Edit3,
//   ChevronLeft,
//   Calendar,
//   Archive,
//   ArchiveRestore
// } from 'lucide-react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { Button } from '@/components/ui/button';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import { useIncomeData } from './queries/income-expense-FetchQueries';
// import { useArchiveOrRestoreIncome, useDeleteIncome } from './queries/income-expense-DeleteQueries';
// import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
// import _ScreenLayout from '@/screens/_ScreenLayout';

// const IncomeTracking = () => {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const year = params.budYear as string;
//   const [activeTab, setActiveTab] = useState('active');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedMonth, setSelectedMonth] = useState('All');
//   const [selectedTab, setSelectedTab] = React.useState('income');

//   const { data: fetchedData = [], isLoading } = useIncomeData(year ? parseInt(year) : new Date().getFullYear());
//   const { mutate: archiveRestore, isPending: isArchivePending } = useArchiveOrRestoreIncome();
//   const { mutate: deleteIncome, isPending: isDeletePending } = useDeleteIncome();
//   const { data: mainCardData = [] } = useIncomeExpenseMainCard();
  
//   const matchedYearData = mainCardData.find(item => Number(item.ie_main_year) === Number(year));
//   const totInc = matchedYearData?.ie_main_inc ?? 0;
  
//   console.log("INCOME TOTAL: ", totInc)
//   const trackingOptions = [
//     { label: 'Income', value: 'income' },
//     { label: 'Expense', value: 'expense' },
//   ];

//   const filteredData = fetchedData.filter(row => {
//     if (activeTab === 'active' ? row.inc_is_archive === false : row.inc_is_archive === true) {
//       if (searchQuery) {
//         return Object.values(row)
//           .join(' ')
//           .toLowerCase()
//           .includes(searchQuery.toLowerCase());
//       }
//       return true;
//     }
//     return false;
//   });

//   const handleTabSelect = (option: { label: string; value: string }) => {
//     setSelectedTab(option.value);
//     if (option.value === 'expense') {
//       router.push({
//         pathname: '/(treasurer)/budget-tracker/budget-expense-main',
//         params: { budYear: year },
//       });
//     }
//   };

//   const handleDelete = async (inc_num: number) => {
//     await deleteIncome(inc_num);
//   };

//   const handleArchive = async (inc_num: number, inc_amount: number) => {
//     const totalIncome = Number(totInc) - Number(inc_amount);
//     const allValues = {
//       inc_num,
//       inc_is_archive: true,
//       totalIncome,
//       year: Number(year)
//     };
//     await archiveRestore(allValues);
//   };

//   const handleRestore = async (inc_num: number, inc_amount: number) => {
//     const totalIncome = Number(totInc) + Number(inc_amount);
//     const allValues = {
//       inc_num,
//       inc_is_archive: false,
//       totalIncome,
//       year: Number(year)
//     };
//     await archiveRestore(allValues);
//   };

//   const handleEdit = (item: any) => {
//     router.push({
//       pathname: '/(treasurer)/budget-tracker/budget-income-edit',
//       params: {
//         inc_num: item.inc_num,
//         inc_datetime: item.inc_datetime,
//         inc_serial_num: item.inc_serial_num,
//         inc_transac_num: item.inc_transac_num,
//         incp_id: item.incp_id,
//         inc_particulars: item.incp_item,
//         inc_amount: item.inc_amount,
//         inc_additional_notes: item.inc_additional_notes,
//         inc_receipt_image: item.inc_receipt_image,
//         year
//       }
//     });
//   };

//   const handleCreate = () => {
//     router.push({
//       pathname: '/(treasurer)/budget-tracker/budget-income-create',
//       params: {
//         budYear: year,
//         totIncome: totInc.toString()
//       }
//     });
//   };

//   const renderItem = ({ item }: { item: any }) => (
//     <Card className="mb-4 border border-gray-200">
//       <CardHeader className="flex-row justify-between items-center">
//         <CardTitle className="text-lg text-[#2a3a61]">
//           {new Date(item.inc_datetime).toLocaleDateString()}
//         </CardTitle>
//         {activeTab === 'active' ? (
//           <View className="flex-row gap-1">
//             <TouchableOpacity onPress={() => handleEdit(item)} className="bg-blue-50 rounded py-1 px-1.5">
//               <Edit3 size={16} color="#00A8F0"/>
//             </TouchableOpacity>
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                   <Archive size={16} color="#dc2626"/>
//                 </TouchableOpacity>
//               }
//               title="Archive Entry"
//               description="Are you sure you want to archive this entry?"
//               actionLabel="Archive"
//               onPress={() => handleArchive(item.inc_num, item.inc_amount)}
//             />
//           </View>
//         ) : (
//           <View className="flex-row gap-1">
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-green-50 rounded py-1 px-1.5">
//                   <ArchiveRestore size={16} color="#15803d"/>
//                 </TouchableOpacity>
//               }
//               title="Restore Entry"
//               description="Are you sure you want to restore this entry?"
//               actionLabel="Restore"
//               onPress={() => handleRestore(item.inc_num, item.inc_amount)}
//             />
//             <ConfirmationModal
//               trigger={
//                 <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                   <Trash size={16} color="#dc2626"/>
//                 </TouchableOpacity>
//               }
//               title="Delete Entry"
//               description="Are you sure you want to delete this entry?"
//               actionLabel="Delete"
//               onPress={() => handleDelete(item.inc_num)}
//             />
//           </View>
//         )}
//       </CardHeader>
//       <CardContent className="space-y-2">
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Particulars:</Text>
//           <Text>{item.incp_item}</Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Amount:</Text>
//           <Text className="font-semibold">
//             ₱{Number(item.inc_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
//           </Text>
//         </View>
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Additional Notes:</Text>
//           <Text>{item.inc_additional_notes || 'None'}</Text>
//         </View>
//       </CardContent>
//     </Card>
//   );

//   return (
//     <_ScreenLayout
//       header={
//         <View>
//             <View className="flex-row items-center mb-4">
//                 <View className="rounded-full border-2 border-[#2a3a61] p-2 ml-2">
//                     <Calendar size={20} color="#2a3a61" />
//                 </View>
//                 <Text className="text-xl text-[#2a3a61] ml-2">{year}</Text>
//             </View>
//             <Text className="text-xl text-gray-500 mb-6">
//                 Manage and view income records for this year.
//             </Text>
//         </View>
//       }
//       headerAlign="left"
//       showBackButton={true}
//       showExitButton={false}
//       customLeftAction={
//         <TouchableOpacity onPress={() => router.push('/(treasurer)/budget-tracker/budget-income-expense-main')}>
//           <ChevronLeft size={24} color="black" />
//         </TouchableOpacity>
//       }
//       scrollable={true}
//       keyboardAvoiding={true}
//       contentPadding="medium"
//       loading={isLoading || isArchivePending || isDeletePending}
//       loadingMessage={isArchivePending ? "Updating entry..." : isDeletePending ? "Deleting entry..." : "Loading..."}
//     >

//       {/* Search and Filters */}
//       <View className="mb-4">
//         <View className="flex-row items-center gap-2">
//           <View className="relative flex-1">
//             <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//             <TextInput
//               placeholder="Search..."
//               className="pl-4 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//           </View>
          
//           <View className="w-[120px]">
//             <SelectLayout
//               options={trackingOptions}
//               className="h-8"
//               selectedValue={selectedTab}
//               onSelect={handleTabSelect}
//               placeholder="Type"
//               isInModal={false}
//             />
//           </View>
//         </View>
        
//         <Button
//           onPress={handleCreate}
//           className="bg-primaryBlue mt-3"
//         >
//           <Text className="text-white text-[17px]">
//             <Plus size={16} color="white" className="mr-2" /> Create
//           </Text>
//         </Button>
//       </View>

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="bg-blue-50 mb-5 mt-5 flex-row justify-between">
//           <TabsTrigger 
//             value="active" 
//             className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//           >
//             <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
//               Active
//             </Text>
//           </TabsTrigger>
//           <TabsTrigger 
//             value="archive"
//             className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
//           >
//             <View className="flex-row items-center justify-center">
//               <Archive 
//                 size={16} 
//                 className="mr-1" 
//                 color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'} 
//               />
//               <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
//                 Archive
//               </Text>
//             </View>
//           </TabsTrigger>
//         </TabsList>

//         {/* Active Entries */}
//         <TabsContent value="active">
//           <FlatList
//             data={filteredData.filter(item => !item.inc_is_archive)}
//             renderItem={renderItem}
//             keyExtractor={item => item.inc_num.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <Text className="text-center text-gray-500 py-4">
//                 No active entries found
//               </Text>
//             }
//           />
//         </TabsContent>

//         {/* Archived Entries */}
//         <TabsContent value="archive">
//           <FlatList
//             data={filteredData.filter(item => item.inc_is_archive)}
//             renderItem={renderItem}
//             keyExtractor={item => item.inc_num.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <Text className="text-center text-gray-500 py-4">
//                 No archived entries found
//               </Text>
//             }
//           />
//         </TabsContent>
//       </Tabs>
//     </_ScreenLayout>
//   );
// };

// export default IncomeTracking;






import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator
} from 'react-native';
import {
  Trash,
  Search,
  Plus,
  Pencil,
  ChevronLeft,
  Archive,
  ArchiveRestore,
  CircleAlert
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { SelectLayout } from '@/components/ui/select-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { useIncomeData } from './queries/income-expense-FetchQueries';
import { useArchiveOrRestoreIncome, useDeleteIncome } from './queries/income-expense-DeleteQueries';
import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
import PageLayout from '@/screens/_PageLayout';

const IncomeTracking = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('income');

  const { data: fetchedData = [], isLoading, isError, refetch } = useIncomeData(year ? parseInt(year) : new Date().getFullYear());
  const { mutate: archiveRestore, isPending: isArchivePending } = useArchiveOrRestoreIncome();
  const { mutate: deleteIncome, isPending: isDeletePending } = useDeleteIncome();
  const { data: mainCardData = [] } = useIncomeExpenseMainCard();
  
  const matchedYearData = mainCardData.find(item => Number(item.ie_main_year) === Number(year));
  const totInc = matchedYearData?.ie_main_inc ?? 0;
  
  const trackingOptions = [
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
  ];

  const filteredData = fetchedData.filter(row => {
    if (activeTab === 'active' ? row.inc_is_archive === false : row.inc_is_archive === true) {
      if (searchQuery) {
        return Object.values(row)
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
      return true;
    }
    return false;
  });

  const handleTabSelect = (option: { label: string; value: string }) => {
    setSelectedTab(option.value);
    if (option.value === 'expense') {
      router.push({
        pathname: '/(treasurer)/budget-tracker/budget-expense-main',
        params: { budYear: year },
      });
    }
  };

  const handleDelete = async (inc_num: number) => {
    await deleteIncome(inc_num);
  };

  const handleArchive = async (inc_num: number, inc_amount: number) => {
    const totalIncome = Number(totInc) - Number(inc_amount);
    const allValues = {
      inc_num,
      inc_is_archive: true,
      totalIncome,
      year: Number(year)
    };
    await archiveRestore(allValues);
  };

  const handleRestore = async (inc_num: number, inc_amount: number) => {
    const totalIncome = Number(totInc) + Number(inc_amount);
    const allValues = {
      inc_num,
      inc_is_archive: false,
      totalIncome,
      year: Number(year)
    };
    await archiveRestore(allValues);
  };

  const handleEdit = (item: any) => {
    router.push({
      pathname: '/(treasurer)/budget-tracker/budget-income-edit',
      params: {
        inc_num: item.inc_num,
        inc_datetime: item.inc_datetime,
        inc_serial_num: item.inc_serial_num,
        inc_transac_num: item.inc_transac_num,
        incp_id: item.incp_id,
        inc_particulars: item.incp_item,
        inc_amount: item.inc_amount,
        inc_additional_notes: item.inc_additional_notes,
        inc_receipt_image: item.inc_receipt_image,
        year
      }
    });
  };

  const handleCreate = () => {
    router.push({
      pathname: '/(treasurer)/budget-tracker/budget-income-create',
      params: {
        budYear: year,
        totIncome: totInc.toString()
      }
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card className="mb-4 border border-gray-200">
      <CardHeader className="flex-row justify-between items-center">
        <CardTitle className="text-lg text-[#2a3a61]">
          {new Date(item.inc_datetime).toLocaleDateString()}
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
              onPress={() => handleArchive(item.inc_num, item.inc_amount)}
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
              onPress={() => handleRestore(item.inc_num, item.inc_amount)}
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
              onPress={() => handleDelete(item.inc_num)}
            />
          </View>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Particulars:</Text>
          <Text>{item.incp_item}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Amount:</Text>
          <Text className="font-semibold">
            ₱{Number(item.inc_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Assigned Staff:</Text>
          <Text>{item.staff_name || 'None'}</Text>
        </View>        
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Additional Notes:</Text>
          <Text>{item.inc_additional_notes || 'None'}</Text>
        </View>
        {item.inc_receipt_image && (
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Receipt:</Text>
            {item.inc_receipt_image ? (
              <TouchableOpacity onPress={() => console.log('View receipt')}>
                <Text className="text-blue-600 underline">View receipt</Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center">
                <CircleAlert size={16} color="#ff2c2c" />
                <Text className="text-red-500 ml-1">No receipt</Text>
              </View>
            )}
          </View>
        )}
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
        headerTitle={<Text className="text-gray-900 text-[13px]">Income Tracking</Text>}
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center mb-4">
            Failed to load income data.
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
        <Text className="font-semibold text-lg text-[#2a3a61]">
          {year} Income Tracking
        </Text>
      }
      rightAction={
        <View className="w-10 h-10 rounded-full items-center justify-center"></View>
      }
    >
      {isLoading || isArchivePending || isDeletePending ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2a3a61" />
          <Text className="text-sm text-gray-500 mt-2">
            {isArchivePending ? "Updating entry..." : 
             isDeletePending ? "Deleting entry..." : 
             "Loading..."}
          </Text>
        </View>
      ) : (
        <View className="flex-1 px-4">
          {/* Search and Filters */}
          <View className="mb-4">
            <View className="flex-row items-center gap-2">
              <View className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-500" size={17} />
                <TextInput
                  placeholder="Search..."
                  className="pl-4 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              
              <View className="w-[120px] pb-5">
                <SelectLayout
                  options={trackingOptions}
                  className="h-8"
                  selectedValue={selectedTab}
                  onSelect={handleTabSelect}
                  placeholder="Type"
                  isInModal={false}
                />
              </View>
            </View>
            
            <Button
              onPress={handleCreate}
              className="bg-primaryBlue mt-3"
            >
              <Text className="text-white text-[17px]">
                <Plus size={16} color="white" className="mr-2" /> Create
              </Text>
            </Button>
          </View>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                  <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
                    Archive
                  </Text>
                </View>
              </TabsTrigger>
            </TabsList>

            {/* Active Entries */}
            <TabsContent value="active">
              <FlatList
                data={filteredData.filter(item => !item.inc_is_archive)}
                renderItem={renderItem}
                keyExtractor={item => item.inc_num.toString()}
                contentContainerStyle={{ paddingBottom: 500 }}
                ListEmptyComponent={
                  <Text className="text-center text-gray-500 py-4">
                    No active entries found
                  </Text>
                }
              />
            </TabsContent>

            {/* Archived Entries */}
            <TabsContent value="archive">
              <FlatList
                data={filteredData.filter(item => item.inc_is_archive)}
                renderItem={renderItem}
                keyExtractor={item => item.inc_num.toString()}
                contentContainerStyle={{ paddingBottom: 500 }}
                ListEmptyComponent={
                  <Text className="text-center text-gray-500 py-4">
                    No archived entries found
                  </Text>
                }
              />
            </TabsContent>
          </Tabs>
        </View>
      )}
    </PageLayout>
  );
};

export default IncomeTracking;