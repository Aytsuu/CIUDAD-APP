
// W/O navaigating to income
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   FlatList,
//   Modal,
//   Image
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import {
//   X,
//   Search,
//   Calendar,
//   ChevronLeft,
//   Plus,
//   Archive,
//   Eye,
//   Pencil,
//   CircleAlert,
//   ArchiveRestore,
//   Trash  
// } from 'lucide-react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
// import { useIncomeExpense } from './queries/income-expense-FetchQueries';
// import { useBudgetItems } from './queries/income-expense-FetchQueries';
// import { useArchiveOrRestoreExpense } from './queries/income-expense-DeleteQueries';
// import { useDeleteIncomeExpense } from './queries/income-expense-DeleteQueries';


// const ExpenseTracking = () => {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const year = params.budYear as string;
//   // const totBud = parseFloat(params.totalBud as string) || 0;
//   // const totExp = parseFloat(params.totalExp as string) || 0;
//   const totInc = parseFloat(params.totalInc as string) || 0;

//   const [activeTab, setActiveTab] = React.useState('active');
//   const [searchQuery, setSearchQuery] = React.useState('');
//   const [viewFilesModalVisible, setViewFilesModalVisible] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState<{ ief_url: string; ief_name: string }[]>([]);
//   const [currentZoomScale, setCurrentZoomScale] = useState(1);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPendingAction, setIsPendingAction] = useState(false);
//   const [pendingMessage, setPendingMessage] = useState('');

//   const { data: fetchedData = [], isLoading, refetch } = useIncomeExpense(year ? parseInt(year) : new Date().getFullYear());
//   const { data: budgetItems = [] } = useBudgetItems(Number(year));
//   const {  data: fetchedMain = [] } = useIncomeExpenseMainCard();
//   const { mutate: archiveRestore, isPending } = useArchiveOrRestoreExpense();
//   const { mutate: deleteEntry } = useDeleteIncomeExpense();


//   const matchedYearData = fetchedMain.find(item => Number(item.ie_main_year) === Number(year));
//   const totBud = matchedYearData?.ie_remaining_bal ?? 0;
//   const totExp = matchedYearData?.ie_main_exp ?? 0;

//   console.log("Expense Tod Bud: ", typeof totBud)
//   console.log("Expense Tod Bud: ", totBud)
//   console.log("Expense Tod Exp: ", typeof totExp)
//   console.log("Expense Tod Exp: ", totExp)

//   const filteredData = fetchedData.filter(row => {
//     if (activeTab === 'active' ? row.iet_is_archive === false : row.iet_is_archive === true) {
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

//   const handleEdit = (item: any) => {
//     router.push({
//         pathname: '/treasurer/budget-expense-edit',
//         params: {
//           iet_num: Number(item.iet_num),
//           iet_serial_num: item.iet_serial_num || '',
//           iet_datetime: item.iet_datetime || '',
//           iet_entryType: item.iet_entryType || 'Expense',
//           iet_particular_id: String(item.dtl_id),
//           iet_particulars_name: String(item.dtl_budget_item),
//           iet_amount: item.iet_amount || '0',
//           iet_actual_amount: item.iet_actual_amount || '0',
//           iet_additional_notes: item.iet_additional_notes || '',
//           iet_receipt_image: item.iet_receipt_image || '',
//           inv_num: item.inv_num || 'None',
//           year: String(year),
//           files: JSON.stringify(item.files || [])
//         }
//       });
//   };


//   const handleViewFiles = (files: { ief_url: string; ief_name: string }[]) => {
//     setSelectedFiles(files);
//     setCurrentIndex(0); // sets to first page everytime it opens the image modal
//     setViewFilesModalVisible(true);
//   };


//   const handleCreate = () => {
//     router.push({
//       pathname: '/treasurer/budget-expense-create',
//       params: {
//         budYear: year,
//         totalBud: totBud.toString(),
//         totalExp: totExp.toString(),
//       },
//     });
//   };

//   const handleDelete = async (item: any) => {
//     setIsPendingAction(true);
//     setPendingMessage('Deleting entry...');

//     try {
//       await deleteEntry(Number(item.iet_num));
//     } finally {
//       setIsPendingAction(false);
//     }

//     // console.log("DELETING: ", Number(item.iet_num))
//   }


//   const handleArchive = async (item: any) => {
//     setIsPendingAction(true);
//     setPendingMessage('Archiving entry...');

//     try {
//       const matchingBudgetItem = budgetItems.find(budget => budget.id === item.dtl_id.toString());
//       let totalBudget = 0.00;
//       let totalExpense = 0.00;
//       let proposedBud = 0.00;

//       const amount = Number(item.iet_amount)
//       const actual_amount = Number(item.iet_actual_amount)

//       const propBudget = matchingBudgetItem?.proposedBudget || 0;
//       const totEXP = Number(totExp);
//       const totBUDGET = Number(totBud);   
      
//       if(!actual_amount){
//           totalBudget = totBUDGET + amount;
//           totalExpense = totEXP - amount;
//           proposedBud = propBudget + amount;
//       }
//       else{
//           totalBudget = totBUDGET + actual_amount;
//           totalExpense = totEXP - actual_amount;
//           proposedBud = propBudget + actual_amount;            
//       }

//       const allValues = {
//           iet_num: item.iet_num,
//           iet_is_archive: true,
//           dtl_id: item.dtl_id,
//           year: Number(year),
//           totalBudget, 
//           totalExpense, 
//           proposedBud    
//       }

//       await archiveRestore(allValues);

//     } finally {
//       setIsPendingAction(false);
//     }

//   }


//   const handleRestore = async (item: any) => {
//     setIsPendingAction(true);
//     setPendingMessage('Restoring entry...');

//     try {

//       console.log("NI SUD SA ARCHIVEEEEEEEEEE")

//       const matchingBudgetItem = budgetItems.find(budget => budget.id === item.dtl_id.toString());
//       let totalBudget = 0.00;
//       let totalExpense = 0.00;
//       let proposedBud = 0.00;

//       const amount = Number(item.iet_amount)
//       const actual_amount = Number(item.iet_actual_amount)

//       const propBudget = matchingBudgetItem?.proposedBudget || 0;
//       const totEXP = Number(totExp);
//       const totBUDGET = Number(totBud);   
      
//       if(!actual_amount){
//           totalBudget = totBUDGET - amount;
//           totalExpense = totEXP + amount;
//           proposedBud = propBudget - amount;
//       }
//       else{
//           totalBudget = totBUDGET - actual_amount;
//           totalExpense = totEXP + actual_amount;
//           proposedBud = propBudget - actual_amount;            
//       }

//       const allValues = {
//         iet_num: item.iet_num,
//         iet_is_archive: false,
//         dtl_id: item.dtl_id,
//         year: Number(year),
//         totalBudget, 
//         totalExpense, 
//         proposedBud    
//       }
      
//       await archiveRestore(allValues);

//     } finally {
//       setIsPendingAction(false);
//     }

//   }

//   const renderItem = ({ item }: { item: any }) => (
//     <Card className="mb-4 border border-gray-200">
//       <CardHeader className="flex-row justify-between items-center">
//         <CardTitle className="text-lg text-[#2a3a61]">
//           {new Date(item.iet_datetime).toLocaleDateString()}
//         </CardTitle>
//         {activeTab === 'active' ? (
//             <View className="flex-row gap-1">
//               <TouchableOpacity onPress={() => handleEdit(item)} className="bg-blue-50  rounded py-1 px-1.5">
//                 <Pencil size={16} color="#00A8F0"/>
//               </TouchableOpacity>
//               <ConfirmationModal
//                 trigger={
//                   <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                     <Archive size={16} color="#dc2626"/>
//                   </TouchableOpacity>
//                 }
//                 title="Archive Entry"
//                 description="Are you sure you want to archive this entry?"
//                 actionLabel="Archive"
//                 onPress={() => handleArchive(item)}
//               />
//             </View>
//           ) : (
//             <View className="flex-row gap-1">
//               <ConfirmationModal
//                 trigger={
//                   <TouchableOpacity className="bg-green-50 rounded py-1 px-1.5">
//                     <ArchiveRestore size={16} color="#15803d"/>
//                   </TouchableOpacity>
//                 }
//                 title="Restore Entry"
//                 description="Are you sure you want to restore this entry?"
//                 actionLabel="Restore"
//                 onPress={() => handleRestore(item)}
//               />
//               <ConfirmationModal
//                 trigger={
//                 <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                   <Trash size={16} color="#dc2626"/>
//                 </TouchableOpacity>
//                 }
//                 title="Delete Enrty"
//                 description="Are you sure you want to delete this entry?"
//                 actionLabel="Delete"
//                 onPress={() => handleDelete(item)}
//               />
//             </View>
//         )}
//       </CardHeader>
//       <CardContent className="space-y-2">
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Particulars:</Text>
//           <Text>{item.dtl_budget_item}</Text>
//         </View>

//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Amount:</Text>
//           <Text className="font-semibold">
//             ₱{Number(item.iet_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
//           </Text>
//         </View>

//         {item.iet_actual_amount && (
//           <View className="flex-row justify-between">
//             <Text className="text-gray-600">Actual Amount:</Text>
//             <Text className="font-semibold">
//               ₱{Number(item.iet_actual_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
//             </Text>
//           </View>
//         )}

//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Documents:</Text>
//           {item.files?.length > 0 ? (
//             <TouchableOpacity onPress={() => handleViewFiles(item.files)}>
//               <Text className="text-blue-600 underline">{item.files.length} attached</Text>
//             </TouchableOpacity>
//           ) : (
//             <View className="flex-row items-center">
//               <CircleAlert size={16} color="#ff2c2c" />
//               <Text className="text-red-500 ml-1">No document</Text>
//             </View>
//           )}
//         </View>
//       </CardContent>
//     </Card>
//   );

//   if (isLoading) {
//     return (
//       <SafeAreaView className="flex-1 bg-[#E0F2FF] p-4 justify-center items-center">
//         <ActivityIndicator size="large" color="#2a3a61" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-lightBlue-1">

//       {/* Loading Overlay */}
//       {isPendingAction && (
//         <View className="absolute inset-0 z-50 bg-black/50 justify-center items-center">
//           <View className="bg-white p-6 rounded-lg items-center">
//             <ActivityIndicator size="large" color="#2a3a61" />
//             <Text className="mt-4 text-lg">{pendingMessage}</Text>
//           </View>
//         </View>
//       )}

//       <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 60 }}>
//         {/* Header */}
//         <View className="flex-row items-center mb-4">
//           <TouchableOpacity onPress={() => router.back()}>
//             <ChevronLeft size={24} color="#2a3a61" />
//           </TouchableOpacity>
//           <View className="rounded-full border-2 border-[#2a3a61] p-2 ml-2">
//             <Calendar size={20} color="#2a3a61" />
//           </View>
//           <Text className="text-xl text-[#2a3a61] ml-2">{year}</Text>
//         </View>
//         <Text className="text-sm text-gray-500 mb-6">
//           Manage and view income and expense records for this year.
//         </Text>

//         {/* Search and Filters */}
//         <View className="mb-4">
//           <View className="relative mb-4">
//             <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//             <TextInput
//               placeholder="Search..."
//               className="pl-10 w-full h-10 bg-white text-base rounded-lg p-2 border border-gray-300"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//           </View>
//           <Button
//             onPress={handleCreate}
//             className="bg-primaryBlue"
//           >
//             <Text className="text-white text-[17px]">
//               <Plus size={16} color="white" className="mr-2" /> Create
//             </Text>
//           </Button>
//         </View>

//         {/* Tabs */}
//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className="bg-white mb-5 mt-5 flex-row justify-between">
//             <TabsTrigger 
//               value="active" 
//               className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-blue-50 border-b-2 border-primaryBlue' : ''}`}
//             >
//               <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
//                 Active
//               </Text>
//             </TabsTrigger>
//             <TabsTrigger 
//               value="archive"
//               className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-blue-50 border-b-2 border-primaryBlue' : ''}`}
//             >
//               <View className="flex-row items-center justify-center">
//                 <Archive 
//                   size={16} 
//                   className="mr-1" 
//                   color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'} 
//                 />
//                 <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
//                   Archive
//                 </Text>
//               </View>
//             </TabsTrigger>
//           </TabsList>

//           {/* Active Entries */}
//           <TabsContent value="active">
//             <FlatList
//               data={filteredData.filter(item => !item.iet_is_archive)}
//               renderItem={renderItem}
//               keyExtractor={item => item.iet_num.toString()}
//               scrollEnabled={false}
//               ListEmptyComponent={
//                 <Text className="text-center text-gray-500 py-4">
//                   No active entries found
//                 </Text>
//               }
//             />
//           </TabsContent>

//           {/* Archived Entries */}
//           <TabsContent value="archive">
//             <FlatList
//               data={filteredData.filter(item => item.iet_is_archive)}
//               renderItem={renderItem}
//               keyExtractor={item => item.iet_num.toString()}
//               scrollEnabled={false}
//               ListEmptyComponent={
//                 <Text className="text-center text-gray-500 py-4">
//                   No archived entries found
//                 </Text>
//               }
//             />
//           </TabsContent>
//         </Tabs>
//         <Modal
//           visible={viewFilesModalVisible}
//           transparent={true}
//           onRequestClose={() => {
//             setViewFilesModalVisible(false);
//             setCurrentZoomScale(1); // Reset zoom when closing
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
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default ExpenseTracking;





// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   FlatList,
//   Modal,
//   Image
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import {
//   X,
//   Search,
//   Calendar,
//   ChevronLeft,
//   Plus,
//   Archive,
//   Eye,
//   Pencil,
//   CircleAlert,
//   ArchiveRestore,
//   Trash  
// } from 'lucide-react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { SelectLayout } from '@/components/ui/select-layout';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
// import { useIncomeExpense } from './queries/income-expense-FetchQueries';
// import { useBudgetItems } from './queries/income-expense-FetchQueries';
// import { useArchiveOrRestoreExpense } from './queries/income-expense-DeleteQueries';
// import { useDeleteIncomeExpense } from './queries/income-expense-DeleteQueries';


// const ExpenseTracking = () => {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const year = params.budYear as string;
//   // const totBud = parseFloat(params.totalBud as string) || 0;
//   // const totExp = parseFloat(params.totalExp as string) || 0;
//   const totInc = parseFloat(params.totalInc as string) || 0;

//   const [activeTab, setActiveTab] = React.useState('active');
//   const [searchQuery, setSearchQuery] = React.useState('');
//   const [viewFilesModalVisible, setViewFilesModalVisible] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState<{ ief_url: string; ief_name: string }[]>([]);
//   const [currentZoomScale, setCurrentZoomScale] = useState(1);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPendingAction, setIsPendingAction] = useState(false);
//   const [pendingMessage, setPendingMessage] = useState('');
//   const [selectedTab, setSelectedTab] = React.useState('expense');

//   const { data: fetchedData = [], isLoading, refetch } = useIncomeExpense(year ? parseInt(year) : new Date().getFullYear());
//   const { data: budgetItems = [] } = useBudgetItems(Number(year));
//   const {  data: fetchedMain = [] } = useIncomeExpenseMainCard();
//   const { mutate: archiveRestore, isPending } = useArchiveOrRestoreExpense();
//   const { mutate: deleteEntry } = useDeleteIncomeExpense();


//   const matchedYearData = fetchedMain.find(item => Number(item.ie_main_year) === Number(year));
//   const totBud = matchedYearData?.ie_remaining_bal ?? 0;
//   const totExp = matchedYearData?.ie_main_exp ?? 0;

//   console.log("Expense Tod Bud: ", typeof totBud)
//   console.log("Expense Tod Bud: ", totBud)
//   console.log("Expense Tod Exp: ", typeof totExp)
//   console.log("Expense Tod Exp: ", totExp)

//   const trackingOptions = [
//     { label: 'Income', value: 'income' },
//     { label: 'Expense', value: 'expense' },
//   ];

//   const filteredData = fetchedData.filter(row => {
//     if (activeTab === 'active' ? row.iet_is_archive === false : row.iet_is_archive === true) {
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

//   const handleEdit = (item: any) => {
//     router.push({
//         pathname: '/treasurer/budget-expense-edit',
//         params: {
//           iet_num: Number(item.iet_num),
//           iet_serial_num: item.iet_serial_num || '',
//           iet_datetime: item.iet_datetime || '',
//           iet_entryType: item.iet_entryType || 'Expense',
//           iet_particular_id: String(item.dtl_id),
//           iet_particulars_name: String(item.dtl_budget_item),
//           iet_amount: item.iet_amount || '0',
//           iet_actual_amount: item.iet_actual_amount || '0',
//           iet_additional_notes: item.iet_additional_notes || '',
//           iet_receipt_image: item.iet_receipt_image || '',
//           inv_num: item.inv_num || 'None',
//           year: String(year),
//           files: JSON.stringify(item.files || [])
//         }
//       });
//   };


//   const handleViewFiles = (files: { ief_url: string; ief_name: string }[]) => {
//     setSelectedFiles(files);
//     setCurrentIndex(0); // sets to first page everytime it opens the image modal
//     setViewFilesModalVisible(true);
//   };


//   const handleCreate = () => {
//     router.push({
//       pathname: '/treasurer/budget-expense-create',
//       params: {
//         budYear: year,
//         totalBud: totBud.toString(),
//         totalExp: totExp.toString(),
//       },
//     });
//   };

//   const handleDelete = async (item: any) => {
//     setIsPendingAction(true);
//     setPendingMessage('Deleting entry...');

//     try {
//       await deleteEntry(Number(item.iet_num));
//     } finally {
//       setIsPendingAction(false);
//     }

//     // console.log("DELETING: ", Number(item.iet_num))
//   }


//   const handleArchive = async (item: any) => {
//     setIsPendingAction(true);
//     setPendingMessage('Archiving entry...');

//     try {
//       const matchingBudgetItem = budgetItems.find(budget => budget.id === item.dtl_id.toString());
//       let totalBudget = 0.00;
//       let totalExpense = 0.00;
//       let proposedBud = 0.00;

//       const amount = Number(item.iet_amount)
//       const actual_amount = Number(item.iet_actual_amount)

//       const propBudget = matchingBudgetItem?.proposedBudget || 0;
//       const totEXP = Number(totExp);
//       const totBUDGET = Number(totBud);   
      
//       if(!actual_amount){
//           totalBudget = totBUDGET + amount;
//           totalExpense = totEXP - amount;
//           proposedBud = propBudget + amount;
//       }
//       else{
//           totalBudget = totBUDGET + actual_amount;
//           totalExpense = totEXP - actual_amount;
//           proposedBud = propBudget + actual_amount;            
//       }

//       const allValues = {
//           iet_num: item.iet_num,
//           iet_is_archive: true,
//           dtl_id: item.dtl_id,
//           year: Number(year),
//           totalBudget, 
//           totalExpense, 
//           proposedBud    
//       }

//       await archiveRestore(allValues);

//     } finally {
//       setIsPendingAction(false);
//     }

//   }


//   const handleRestore = async (item: any) => {
//     setIsPendingAction(true);
//     setPendingMessage('Restoring entry...');

//     try {

//       console.log("NI SUD SA ARCHIVEEEEEEEEEE")

//       const matchingBudgetItem = budgetItems.find(budget => budget.id === item.dtl_id.toString());
//       let totalBudget = 0.00;
//       let totalExpense = 0.00;
//       let proposedBud = 0.00;

//       const amount = Number(item.iet_amount)
//       const actual_amount = Number(item.iet_actual_amount)

//       const propBudget = matchingBudgetItem?.proposedBudget || 0;
//       const totEXP = Number(totExp);
//       const totBUDGET = Number(totBud);   
      
//       if(!actual_amount){
//           totalBudget = totBUDGET - amount;
//           totalExpense = totEXP + amount;
//           proposedBud = propBudget - amount;
//       }
//       else{
//           totalBudget = totBUDGET - actual_amount;
//           totalExpense = totEXP + actual_amount;
//           proposedBud = propBudget - actual_amount;            
//       }

//       const allValues = {
//         iet_num: item.iet_num,
//         iet_is_archive: false,
//         dtl_id: item.dtl_id,
//         year: Number(year),
//         totalBudget, 
//         totalExpense, 
//         proposedBud    
//       }
      
//       await archiveRestore(allValues);

//     } finally {
//       setIsPendingAction(false);
//     }

//   }

//   const renderItem = ({ item }: { item: any }) => (
//     <Card className="mb-4 border border-gray-200">
//       <CardHeader className="flex-row justify-between items-center">
//         <CardTitle className="text-lg text-[#2a3a61]">
//           {new Date(item.iet_datetime).toLocaleDateString()}
//         </CardTitle>
//         {activeTab === 'active' ? (
//             <View className="flex-row gap-1">
//               <TouchableOpacity onPress={() => handleEdit(item)} className="bg-blue-50  rounded py-1 px-1.5">
//                 <Pencil size={16} color="#00A8F0"/>
//               </TouchableOpacity>
//               <ConfirmationModal
//                 trigger={
//                   <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                     <Archive size={16} color="#dc2626"/>
//                   </TouchableOpacity>
//                 }
//                 title="Archive Entry"
//                 description="Are you sure you want to archive this entry?"
//                 actionLabel="Archive"
//                 onPress={() => handleArchive(item)}
//               />
//             </View>
//           ) : (
//             <View className="flex-row gap-1">
//               <ConfirmationModal
//                 trigger={
//                   <TouchableOpacity className="bg-green-50 rounded py-1 px-1.5">
//                     <ArchiveRestore size={16} color="#15803d"/>
//                   </TouchableOpacity>
//                 }
//                 title="Restore Entry"
//                 description="Are you sure you want to restore this entry?"
//                 actionLabel="Restore"
//                 onPress={() => handleRestore(item)}
//               />
//               <ConfirmationModal
//                 trigger={
//                 <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
//                   <Trash size={16} color="#dc2626"/>
//                 </TouchableOpacity>
//                 }
//                 title="Delete Enrty"
//                 description="Are you sure you want to delete this entry?"
//                 actionLabel="Delete"
//                 onPress={() => handleDelete(item)}
//               />
//             </View>
//         )}
//       </CardHeader>
//       <CardContent className="space-y-2">
//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Particulars:</Text>
//           <Text>{item.dtl_budget_item}</Text>
//         </View>

//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Amount:</Text>
//           <Text className="font-semibold">
//             ₱{Number(item.iet_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
//           </Text>
//         </View>

//         {item.iet_actual_amount && (
//           <View className="flex-row justify-between">
//             <Text className="text-gray-600">Actual Amount:</Text>
//             <Text className="font-semibold">
//               ₱{Number(item.iet_actual_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
//             </Text>
//           </View>
//         )}

//         <View className="flex-row justify-between">
//           <Text className="text-gray-600">Documents:</Text>
//           {item.files?.length > 0 ? (
//             <TouchableOpacity onPress={() => handleViewFiles(item.files)}>
//               <Text className="text-blue-600 underline">{item.files.length} attached</Text>
//             </TouchableOpacity>
//           ) : (
//             <View className="flex-row items-center">
//               <CircleAlert size={16} color="#ff2c2c" />
//               <Text className="text-red-500 ml-1">No document</Text>
//             </View>
//           )}
//         </View>
//       </CardContent>
//     </Card>
//   );

//   if (isLoading) {
//     return (
//       <SafeAreaView className="flex-1 bg-[#E0F2FF] p-4 justify-center items-center">
//         <ActivityIndicator size="large" color="#2a3a61" />
//       </SafeAreaView>
//     );
//   }

//   const handleTabSelect = (option: { label: string; value: string }) => {
//     setSelectedTab(option.value);
//     if (option.value === 'income') {
//       router.push({
//         pathname: '/treasurer/budget-income-main',
//         params: {
//           budYear: year,
//           totalInc: totInc.toString(),
//         },
//       });
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-lightBlue-1">

//       {/* Loading Overlay */}
//       {isPendingAction && (
//         <View className="absolute inset-0 z-50 bg-black/50 justify-center items-center">
//           <View className="bg-white p-6 rounded-lg items-center">
//             <ActivityIndicator size="large" color="#2a3a61" />
//             <Text className="mt-4 text-lg">{pendingMessage}</Text>
//           </View>
//         </View>
//       )}

//       <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 60 }}>
//         {/* Header */}
//         <View className="flex-row items-center mb-4">
//           <TouchableOpacity onPress={() => router.push('/')}>
//             <ChevronLeft size={24} color="#2a3a61" />
//           </TouchableOpacity>
//           <View className="rounded-full border-2 border-[#2a3a61] p-2 ml-2">
//             <Calendar size={20} color="#2a3a61" />
//           </View>
//           <Text className="text-xl text-[#2a3a61] ml-2">{year}</Text>
//         </View>
//         <Text className="text-sm text-gray-500 mb-6">
//           Manage and view expense record for this year.
//         </Text>

//         {/* Modified Search and Filters section */}
//         <View className="mb-4">
//           <View className="flex-row items-center gap-2">
//             {/* Search - made smaller to fit beside selector */}
//             <View className="relative flex-1">
//               <Search className="absolute left-3 top-3 text-gray-500" size={17} />
//               <TextInput
//                 placeholder="Search..."
//                 className="pl-4 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
//                 value={searchQuery}
//                 onChangeText={setSearchQuery}
//               />
//             </View>
            
//             {/* SelectLayout for switching between income/expense */}
//             <View className="w-[120px]">
//               <SelectLayout
//                 options={trackingOptions}
//                 className="h-8"
//                 selectedValue={selectedTab}
//                 onSelect={handleTabSelect}
//                 placeholder="Type"
//                 isInModal={false}
//               />
//             </View>
//           </View>
          
//           {/* Create button - moved below the search row */}
//           <Button
//             onPress={handleCreate}
//             className="bg-primaryBlue mt-3"
//           >
//             <Text className="text-white text-[17px]">
//               <Plus size={16} color="white" className="mr-2" /> Create
//             </Text>
//           </Button>
//         </View>

//         {/* Tabs */}
//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className="bg-white mb-5 mt-5 flex-row justify-between">
//             <TabsTrigger 
//               value="active" 
//               className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-blue-50 border-b-2 border-primaryBlue' : ''}`}
//             >
//               <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
//                 Active
//               </Text>
//             </TabsTrigger>
//             <TabsTrigger 
//               value="archive"
//               className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-blue-50 border-b-2 border-primaryBlue' : ''}`}
//             >
//               <View className="flex-row items-center justify-center">
//                 <Archive 
//                   size={16} 
//                   className="mr-1" 
//                   color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'} 
//                 />
//                 <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
//                   Archive
//                 </Text>
//               </View>
//             </TabsTrigger>
//           </TabsList>

//           {/* Active Entries */}
//           <TabsContent value="active">
//             <FlatList
//               data={filteredData.filter(item => !item.iet_is_archive)}
//               renderItem={renderItem}
//               keyExtractor={item => item.iet_num.toString()}
//               scrollEnabled={false}
//               ListEmptyComponent={
//                 <Text className="text-center text-gray-500 py-4">
//                   No active entries found
//                 </Text>
//               }
//             />
//           </TabsContent>

//           {/* Archived Entries */}
//           <TabsContent value="archive">
//             <FlatList
//               data={filteredData.filter(item => item.iet_is_archive)}
//               renderItem={renderItem}
//               keyExtractor={item => item.iet_num.toString()}
//               scrollEnabled={false}
//               ListEmptyComponent={
//                 <Text className="text-center text-gray-500 py-4">
//                   No archived entries found
//                 </Text>
//               }
//             />
//           </TabsContent>
//         </Tabs>
//         <Modal
//           visible={viewFilesModalVisible}
//           transparent={true}
//           onRequestClose={() => {
//             setViewFilesModalVisible(false);
//             setCurrentZoomScale(1); // Reset zoom when closing
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
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default ExpenseTracking;





import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Image,
  ScrollView
} from 'react-native';
import {
  X,
  Search,
  Calendar,
  ChevronLeft,
  Plus,
  Archive,
  Pencil,
  CircleAlert,
  ArchiveRestore,
  Trash  
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SelectLayout } from '@/components/ui/select-layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
import { useIncomeExpense } from './queries/income-expense-FetchQueries';
import { useBudgetItems } from './queries/income-expense-FetchQueries';
import { useArchiveOrRestoreExpense } from './queries/income-expense-DeleteQueries';
import { useDeleteIncomeExpense } from './queries/income-expense-DeleteQueries';
import _ScreenLayout from '@/screens/_ScreenLayout';

const ExpenseTracking = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;
  const totInc = parseFloat(params.totalInc as string) || 0;

  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilesModalVisible, setViewFilesModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ ief_url: string; ief_name: string }[]>([]);
  const [currentZoomScale, setCurrentZoomScale] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState('expense');

  const { data: fetchedData = [], isLoading, refetch } = useIncomeExpense(year ? parseInt(year) : new Date().getFullYear());
  const { data: budgetItems = [] } = useBudgetItems(Number(year));
  const { data: fetchedMain = [] } = useIncomeExpenseMainCard();
  const { mutate: archiveRestore, isPending: isArchivePending } = useArchiveOrRestoreExpense();
  const { mutate: deleteEntry, isPending: isDeletePending } = useDeleteIncomeExpense();

  const matchedYearData = fetchedMain.find(item => Number(item.ie_main_year) === Number(year));
  const totBud = matchedYearData?.ie_remaining_bal ?? 0;
  const totExp = matchedYearData?.ie_main_exp ?? 0;

  const trackingOptions = [
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
  ];

  const filteredData = fetchedData.filter(row => {
    if (activeTab === 'active' ? row.iet_is_archive === false : row.iet_is_archive === true) {
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
    if (option.value === 'income') {
      router.push({
        pathname: '/treasurer/budget-tracker/budget-income-main',
        params: {
          budYear: year,
          totalInc: totInc.toString(),
        },
      });
    }
  };

  const handleEdit = (item: any) => {
    router.push({
      pathname: '/treasurer/budget-tracker/budget-expense-edit',
      params: {
        iet_num: Number(item.iet_num),
        iet_serial_num: item.iet_serial_num || '',
        iet_datetime: item.iet_datetime || '',
        iet_entryType: item.iet_entryType || 'Expense',
        iet_particular_id: String(item.dtl_id),
        iet_particulars_name: String(item.dtl_budget_item),
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
      pathname: '/treasurer/budget-tracker/budget-expense-create',
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
    const matchingBudgetItem = budgetItems.find(budget => budget.id === item.dtl_id.toString());
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
      dtl_id: item.dtl_id,
      year: Number(year),
      totalBudget, 
      totalExpense, 
      proposedBud    
    };

    await archiveRestore(allValues);
  };

  const handleRestore = async (item: any) => {
    const matchingBudgetItem = budgetItems.find(budget => budget.id === item.dtl_id.toString());
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
      dtl_id: item.dtl_id,
      year: Number(year),
      totalBudget, 
      totalExpense, 
      proposedBud    
    };
    
    await archiveRestore(allValues);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card className="mb-4 border border-gray-200">
      <CardHeader className="flex-row justify-between items-center">
        <CardTitle className="text-lg text-[#2a3a61]">
          {new Date(item.iet_datetime).toLocaleDateString()}
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
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Particulars:</Text>
          <Text>{item.dtl_budget_item}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Amount:</Text>
          <Text className="font-semibold">
            ₱{Number(item.iet_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        {item.iet_actual_amount && (
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Actual Amount:</Text>
            <Text className="font-semibold">
              ₱{Number(item.iet_actual_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        )}
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

  return (
    <_ScreenLayout
      header={
        <View>
          <View className="flex-row items-center mb-4">
            <View className="rounded-full border-2 border-[#2a3a61] p-2 ml-2">
              <Calendar size={20} color="#2a3a61" />
            </View>
            <Text className="text-xl text-[#2a3a61] ml-2">{year}</Text>
          </View>
          <Text className="text-xl text-gray-500 mb-6">
            Manage and view expense records for this year.
          </Text>          
        </View>        
      }
      headerAlign="left"
      showBackButton={true}
      showExitButton={false}
      customLeftAction={
        <TouchableOpacity onPress={() => router.push('/treasurer/budget-tracker/budget-income-expense-main')}>
          <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
      }
      scrollable={true}
      keyboardAvoiding={true}
      contentPadding="medium"
      loading={isLoading || isArchivePending || isDeletePending}
      loadingMessage={
        isArchivePending ? "Updating entry..." : 
        isDeletePending ? "Deleting entry..." : 
        "Loading..."
      }
    >

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
          
          <View className="w-[120px]">
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
            data={filteredData.filter(item => !item.iet_is_archive)}
            renderItem={renderItem}
            keyExtractor={item => item.iet_num.toString()}
            scrollEnabled={false}
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
            data={filteredData.filter(item => item.iet_is_archive)}
            renderItem={renderItem}
            keyExtractor={item => item.iet_num.toString()}
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
    </_ScreenLayout>
  );
};

export default ExpenseTracking;