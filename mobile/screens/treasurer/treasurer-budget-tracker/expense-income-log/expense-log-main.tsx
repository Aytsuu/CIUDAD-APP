// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   FlatList,
//   Modal,
//   Image,
//   ScrollView,
//   ActivityIndicator
// } from 'react-native';
// import {
//   Search,
//   ChevronLeft,
//   FileInput,
//   CircleAlert,
//   ArrowUpDown,
//   X
// } from 'lucide-react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import PageLayout from '@/screens/_PageLayout';
// // import { useIncomeExpense } from '../queries/treasurerIncomeExpenseFetchQueries';
// import { useIncomeExpense } from '../queries/income-expense-FetchQueries';
// import { useIncomeExpenseMainCard } from '../queries/income-expense-FetchQueries';


// const ExpenseLogMain = () => {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const year = params.LogYear as string;

//   console.log("LOGYEAR: ", year)

//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedMonth, setSelectedMonth] = useState('All');
//   const [viewFilesModalVisible, setViewFilesModalVisible] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState<{ ief_url: string; ief_name: string }[]>([]);
//   const [currentZoomScale, setCurrentZoomScale] = useState(1);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Month filter options
//   const monthOptions = [
//     { label: 'All', value: 'All' },
//     { label: 'January', value: '01' },
//     { label: 'February', value: '02' },
//     { label: 'March', value: '03' },
//     { label: 'April', value: '04' },
//     { label: 'May', value: '05' },
//     { label: 'June', value: '06' },
//     { label: 'July', value: '07' },
//     { label: 'August', value: '08' },
//     { label: 'September', value: '09' },
//     { label: 'October', value: '10' },
//     { label: 'November', value: '11' },
//     { label: 'December', value: '12' }
//   ];

//   // Fetch data
//   const { data: fetchedData = [], isLoading } = useIncomeExpense(year ? parseInt(year) : new Date().getFullYear());
//   const { data: _fetchIncData = [] } = useIncomeExpenseMainCard();

//   // Filter data - only show non-archived entries
//   const filteredData = React.useMemo(() => {
//     let result = fetchedData.filter(row => 
//       row.iet_is_archive === false && 
//       Number(row.iet_amount) > Number(row.iet_actual_amount) &&
//       Number(row.iet_actual_amount) !== 0
//     );
  
//     if (selectedMonth !== "All") {
//       result = result.filter(item => {
//         const month = item.iet_datetime?.slice(5, 7);
//         return month === selectedMonth;
//       });
//     }
  
//     if (searchQuery) {
//       result = result.filter(item =>
//         Object.values(item)
//           .join(" ")
//           .toLowerCase()
//           .includes(searchQuery.toLowerCase())
//       );
//     }
//     return result;
//   }, [fetchedData, selectedMonth, searchQuery]);

//   const handleViewFiles = (files: { ief_url: string; ief_name: string }[]) => {
//     setSelectedFiles(files);
//     setCurrentIndex(0);
//     setViewFilesModalVisible(true);
//   };

//   const handleBack = () => {
//     router.back();
//   };

//   const renderItem = ({ item }: { item: any }) => {
//     const amount = Number(item.iet_amount);
//     const actualAmount = Number(item.iet_actual_amount);
//     const difference = amount - actualAmount;
    
//     return (
//       <Card className="mb-4 border border-gray-200">
//         <CardHeader>
//           <CardTitle className="text-lg text-[#2a3a61]">
//             {new Date(item.iet_datetime).toLocaleString("en-US", {
//                 timeZone: "UTC",
//                 dateStyle: "medium",
//                 timeStyle: "short"
//             })}
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-2">
//           <View className="flex-row justify-between pb-2">
//             <Text className="text-gray-600">Particulars:</Text>
//             <Text className="font-semibold">{item.exp_budget_item}</Text>
//           </View>
//           <View className="flex-row justify-between">
//             <Text className="text-gray-600">Proposed Budget:</Text>
//             <Text>₱{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
//           </View>
//           <View className="flex-row justify-between">
//             <Text className="text-gray-600">Actual Expense:</Text>
//             <Text>₱{actualAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
//           </View>
//           <View className="flex-row justify-between pb-2">
//             <Text className="text-gray-600">Return Amount:</Text>
//             <Text className="font-semibold">
//               ₱{difference.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//             </Text>
//           </View>
//           <View className="flex-row justify-between pb-2">
//             <Text className="text-gray-600">Assigned Staff:</Text>
//             <Text>{item.staff_name}</Text>
//           </View>
//           <View className="flex-row justify-between">
//             <Text className="text-gray-600">Documents:</Text>
//             {item.files?.length > 0 ? (
//               <TouchableOpacity onPress={() => handleViewFiles(item.files)}>
//                 <Text className="text-blue-600 underline">({item.files.length}) attached</Text>
//               </TouchableOpacity>
//             ) : (
//               <View className="flex-row items-center">
//                 <CircleAlert size={16} color="#ff2c2c" />
//                 <Text className="text-red-500 ml-1">No document</Text>
//               </View>
//             )}
//           </View>
//         </CardContent>
//       </Card>
//     );
//   };

//   if (isLoading) {
//     return (
//       <PageLayout
//         leftAction={
//           <TouchableOpacity onPress={handleBack} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
//             <ChevronLeft size={24} className="text-gray-700" />
//           </TouchableOpacity>
//         }
//         headerTitle={<Text className="text-gray-900 text-[13px]">Expense Log</Text>}
//       >
//         <View className="flex-1 justify-center items-center">
//           <ActivityIndicator size="large" color="#2a3a61" />
//           <Text className="text-sm text-gray-500 mt-2">Loading expense log...</Text>
//         </View>
//       </PageLayout>
//     );
//   }

//   return (
//     <PageLayout
//         leftAction={
//             <TouchableOpacity onPress={handleBack} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
//             <ChevronLeft size={24} className="text-gray-700" />
//             </TouchableOpacity>
//         }
//         headerTitle={
//             <View>
//             <Text className="font-semibold text-lg text-[#2a3a61]">Expense Log</Text>
//             </View>
//         }
//         rightAction={
//             <View className="w-10 h-10 rounded-full items-center justify-center"></View>
//         }    
//     >
//       <View className="flex-1 px-4">
//         {/* Search and Filters */}
//         <View className="mb-4">
//           <View className="flex-row items-center gap-2 mb-3">
//             <View className="relative flex-1">
//               <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//               <TextInput
//                 placeholder="Search..."
//                 className="pl-4 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//                 value={searchQuery}
//                 onChangeText={(text) => setSearchQuery(text)}
//               />
//             </View>
            
//             <View className="w-[120px] pb-3">
//                 <SelectLayout
//                 options={monthOptions}
//                 className="h-10"
//                 selectedValue={selectedMonth}
//                 onSelect={(option) => setSelectedMonth(option.value)}
//                 placeholder="Month"
//                 isInModal={false}
//                 />
//             </View>
//           </View>
//         </View>

//         {/* Data List */}
//         {filteredData.length > 0 ? (
//           <FlatList
//             data={filteredData}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.iet_num.toString()}
//             contentContainerStyle={{ paddingBottom: 20 }}
//             ListFooterComponent={<View className="h-20" />}
//             showsVerticalScrollIndicator={false}
//           />
//         ) : (
//           <View className="flex-1 justify-center items-center">
//             <Text className="text-gray-500">No expense log records found</Text>
//           </View>
//         )}

//         {/* Files Modal */}
//         <Modal
//           visible={viewFilesModalVisible}
//           transparent={true}
//           onRequestClose={() => {
//             setViewFilesModalVisible(false);
//             setCurrentZoomScale(1);
//           }}
//         >
//           <View className="flex-1 bg-black/90">
//             {/* Header with close button and file name */}
//             <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-between items-center">
//               <Text className="text-white text-lg font-medium w-[90%]">
//                 {selectedFiles[currentIndex]?.ief_name || 'Document'}
//               </Text>
//               <TouchableOpacity 
//                 onPress={() => {
//                   setViewFilesModalVisible(false);
//                   setCurrentZoomScale(1);
//                 }}
//               >
//                 <X size={24} color="white" />
//               </TouchableOpacity>
//             </View>

//             {/* Image with zoom capability */}
//             <ScrollView
//               className="flex-1"
//               maximumZoomScale={3}
//               minimumZoomScale={1}
//               zoomScale={currentZoomScale}
//               onScrollEndDrag={(e) => setCurrentZoomScale(e.nativeEvent.zoomScale)}
//               contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
//             >
//               <Image
//                 source={{ uri: selectedFiles[currentIndex]?.ief_url }}
//                 style={{ width: '100%', height: 400 }}
//                 resizeMode="contain"
//               />
//             </ScrollView>

//             {/* Pagination indicators at the bottom */}
//             {selectedFiles.length > 1 && (
//               <View className="absolute bottom-4 left-0 right-0 items-center">
//                 <View className="flex-row bg-black/50 rounded-full px-3 py-1">
//                   {selectedFiles.map((_, index) => (
//                     <TouchableOpacity
//                       key={index}
//                       onPress={() => {
//                         setCurrentIndex(index);
//                         setCurrentZoomScale(1);
//                       }}
//                       className="p-1"
//                     >
//                       <View 
//                         className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
//                       />
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>
//             )}

//             {/* Navigation arrows for multiple files */}
//             {selectedFiles.length > 1 && (
//               <>
//                 {currentIndex > 0 && (
//                   <TouchableOpacity
//                     className="absolute left-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                     onPress={() => {
//                       setCurrentIndex(prev => prev - 1);
//                       setCurrentZoomScale(1);
//                     }}
//                   >
//                     <ChevronLeft size={24} color="white" />
//                   </TouchableOpacity>
//                 )}
//                 {currentIndex < selectedFiles.length - 1 && (
//                   <TouchableOpacity
//                     className="absolute right-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
//                     onPress={() => {
//                       setCurrentIndex(prev => prev + 1);
//                       setCurrentZoomScale(1);
//                     }}
//                   >
//                     <ChevronLeft size={24} color="white" className="rotate-180" />
//                   </TouchableOpacity>
//                 )}
//               </>
//             )}
//           </View>
//         </Modal>
//       </View>
//     </PageLayout>
//   );
// };

// export default ExpenseLogMain;







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

  // Month filter options
  const monthOptions = [
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
    { label: 'December', value: '12' }
  ];

  // Fetch data
  const { data: fetchedData = [], isLoading } = useExpenseLog(year ? parseInt(year) : new Date().getFullYear());
  

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

  // Filter data - only show non-archived entries
  const filteredData = React.useMemo(() => {
    let result = fetchedData.filter(row => row.el_is_archive === false);
  
    if (selectedMonth !== "All") {
      result = result.filter(item => {
        const month = item.el_datetime?.slice(5, 7);
        return month === selectedMonth;
      });
    }
  
    if (searchQuery) {
      result = result.filter(item =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [fetchedData, selectedMonth, searchQuery]);

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

  if (isLoading) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={handleBack} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Expense Log</Text>}
        wrapScroll={false}
      >
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2a3a61" />
          <Text className="text-sm text-gray-500 mt-2">Loading expense log...</Text>
        </View>
      </PageLayout>
    );
  }

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
                className="pl-4 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
              />
            </View>
            
            <View className="w-[120px] pb-3">
                <SelectLayout
                options={monthOptions}
                className="h-10"
                selectedValue={selectedMonth}
                onSelect={(option) => setSelectedMonth(option.value)}
                placeholder="Month"
                isInModal={false}
                />
            </View>
          </View>
        </View>

        {/* Data List */}
        {filteredData.length > 0 ? (
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