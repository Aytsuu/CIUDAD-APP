// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Search, Calendar, X } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';

// const IncomeExpenseMain = () => {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // Query hook
//   const { 
//     data: fetchedData = [], 
//     isLoading, 
//     isError, 
//     refetch 
//   } = useIncomeExpenseMainCard();

//   console.log("MAIN DATA: ", fetchedData)

//   // Filter data based on search query
//   const filteredData = fetchedData.filter(tracker =>
//     tracker.ie_main_year.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleCardClick = (year: string, totalBud: number, totalExp: number, totalInc: number) => {
//     router.push({
//       pathname: '/treasurer/budget-tracker/budget-expense-main',
//       params: {
//         type: 'viewing',
//         budYear: year,
//         totalBud: totalBud.toString(),
//         totalExp: totalExp.toString(),
//         totalInc: totalInc.toString(),
//       }
//     });
//   };

//   const handleRefresh = () => {
//     refetch();
//   };

//   if (isLoading) {
//     return (
//       <SafeAreaView className="flex-1 bg-[#ECF8FF] p-4 justify-center items-center">
//         <ActivityIndicator size="large" color="#2a3a61" />
//       </SafeAreaView>
//     );
//   }

//   if (isError) {
//     return (
//       <SafeAreaView className="flex-1 bg-[#ECF8FF] p-4 justify-center items-center">
//         <Text className="text-red-500 text-center mb-4">
//           Failed to load income/expense data. Please check your connection.
//         </Text>
//         <TouchableOpacity
//           onPress={handleRefresh}
//           className="bg-[#2a3a61] px-4 py-2 rounded-lg"
//         >
//           <Text className="text-white">Try Again</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-[#ffffff]">
//       <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 60 }}>
//         {/* Header */}
//         <View className="mb-6">
//           <Text className="font-semibold text-xl text-[#2a3a61] mt-4">
//             Income & Expense Tracking
//           </Text>
//           <Text className="text-sm text-gray-500 mt-1">
//             Gain clear insights into your finances by tracking income and expenses in real time.
//           </Text>
//         </View>

//         {/* Search Bar */}
//         <View className="mb-6">
//           <View className="relative">
//             <Search className="absolute left-3 top-3.5 text-gray-500" size={17} />
//             <TextInput
//               placeholder="Search by year"
//               className="pl-10 w-full bg-white text-sm rounded-lg p-2 border border-gray-300"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//             />
//           </View>
//         </View>

//         {/* Budget Cards */}
//         <View className="space-y-4 pb-4">
//           {filteredData.map((tracker) => {
//             const budget = Number(tracker.ie_main_tot_budget);
//             const income = Number(tracker.ie_main_inc);
//             const expense = Number(tracker.ie_main_exp);
//             const remainingBal = Number(tracker.ie_remaining_bal);
//             const progress = budget > 0 ? (expense / budget) * 100 : 0;

//             return (
//               <TouchableOpacity
//                 key={tracker.ie_main_year}
//                 onPress={() => handleCardClick(
//                   tracker.ie_main_year,
//                   budget,
//                   expense,
//                   income
//                 )}
//                 activeOpacity={0.8}
//               >
//                 <View className="bg-white rounded-lg p-4 border border-gray-200">
//                   {/* Card Header */}
//                   <View className="flex-row justify-between items-center mb-4">
//                     <View className="flex-row items-center">
//                       <View className="rounded-full border-2 border-[#2a3a61] p-2 mr-3">
//                         <Calendar size={20} color="#2a3a61" />
//                       </View>
//                       <Text className="font-semibold text-lg text-[#2a3a61]">
//                         {tracker.ie_main_year} Budget Overview
//                       </Text>
//                     </View>
//                     <X size={20} color="#6b7280" />
//                   </View>

//                   {/* Card Content */}
//                   <View className="space-y-3">
//                     <View className="flex-row justify-between">
//                       <Text className="text-gray-600">Total Budget:</Text>
//                       <Text className="text-blue-600">
//                         Php {budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//                       </Text>
//                     </View>
//                     <View className="flex-row justify-between">
//                       <Text className="text-gray-600">Total Income:</Text>
//                       <Text className="text-green-600">
//                         Php {income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//                       </Text>
//                     </View>
//                     <View className="flex-row justify-between">
//                       <Text className="text-gray-600">Total Expenses:</Text>
//                       <Text className="text-red-600">
//                         Php {expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//                       </Text>
//                     </View>
//                     <View className="flex-row justify-between">
//                       <Text className="text-gray-600">Remaining Balance:</Text>
//                       <Text className="text-yellow-600">
//                         Php {remainingBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//                       </Text>
//                     </View>
//                   </View>

//                   {/* Progress Bar */}
//                   <View className="mt-4">
//                     <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//                       <View
//                         className="h-full bg-[#2a3a61]"
//                         style={{ width: `${progress}%` }}
//                       />
//                     </View>
//                     <Text className="text-xs text-gray-500 mt-1 text-center">
//                       {progress.toFixed(2)}% of budget spent
//                     </Text>
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             );
//           })}
          
//           {filteredData.length === 0 && (
//             <Text className="text-center text-gray-500 text-sm mt-4">
//               No matching records found
//             </Text>
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default IncomeExpenseMain;







// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import { Search, Calendar, X, ChevronLeft } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
// import _ScreenLayout from '@/screens/_ScreenLayout';

// const IncomeExpenseMain = () => {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // Query hook
//   const { 
//     data: fetchedData = [], 
//     isLoading, 
//     isError, 
//     refetch 
//   } = useIncomeExpenseMainCard();

//   // Filter data based on search query
//   const filteredData = fetchedData.filter(tracker =>
//     tracker.ie_main_year.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleCardClick = (year: string, totalBud: number, totalExp: number, totalInc: number) => {
//     router.push({
//       pathname: '/(treasurer)/budget-tracker/budget-expense-main',
//       params: {
//         type: 'viewing',
//         budYear: year,
//         totalBud: totalBud.toString(),
//         totalExp: totalExp.toString(),
//         totalInc: totalInc.toString(),
//       }
//     });
//   };

//   const handleRefresh = () => {
//     refetch();
//   };


//   if (isError) {
//     return (
//       <_ScreenLayout
//         header={
//           <View>
//             <Text className="text-xl text-[#2a3a61]">Income & Expense Tracking</Text>
//             <Text className="text-sm text-gray-500 mt-1">
//               Failed to load data. Please check your connection.
//             </Text>
//           </View>
//         }
//       >
//         <View className="flex-1 justify-center items-center">
//           <Text className="text-red-500 text-center mb-4">
//             Failed to load income/expense data.
//           </Text>
//           <TouchableOpacity
//             onPress={handleRefresh}
//             className="bg-[#2a3a61] px-4 py-2 rounded-lg"
//           >
//             <Text className="text-white">Try Again</Text>
//           </TouchableOpacity>
//         </View>
//       </_ScreenLayout>
//     );
//   }

//   return (
//     <_ScreenLayout
//       header={
//         <View>
//           <Text className="text-xl text-[#2a3a61]">Income & Expense Tracking</Text>
//           <Text className="text-sm text-gray-500 mt-1">
//             Gain clear insights into your finances by tracking income and expenses in real time.
//           </Text>
//         </View>
//       }
//       showBackButton={true}
//       showExitButton={false}
//       customLeftAction={
//         <TouchableOpacity onPress={() => router.back()}>
//           <ChevronLeft size={24} color="black" />
//         </TouchableOpacity>
//       }
//       scrollable={true}
//       contentPadding="medium"
//       loading={isLoading}
//       loadingMessage="Loading data..."
//     >
//       {/* Search Bar */}
//       <View className="mb-4">
//         <View className="relative">
//           <Search className="absolute left-3 top-3.5 text-gray-500" size={17} />
//           <TextInput
//             placeholder="Search by year"
//             className="pl-10 w-full bg-white text-sm rounded-lg p-2 border border-gray-300"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//         </View>
//       </View>

//       {/* Budget Cards */}
//       <View className="space-y-4 pb-4">
//         {filteredData.map((tracker) => {
//           const budget = Number(tracker.ie_main_tot_budget);
//           const income = Number(tracker.ie_main_inc);
//           const expense = Number(tracker.ie_main_exp);
//           const remainingBal = Number(tracker.ie_remaining_bal);
//           const progress = budget > 0 ? (expense / budget) * 100 : 0;

//           return (
//             <TouchableOpacity
//               key={tracker.ie_main_year}
//               onPress={() => handleCardClick(
//                 tracker.ie_main_year,
//                 budget,
//                 expense,
//                 income
//               )}
//               activeOpacity={0.8}
//             >
//               <View className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
//                 {/* Card Header */}
//                 <View className="flex-row justify-between items-center mb-4">
//                   <View className="flex-row items-center">
//                     <View className="rounded-full border-2 border-[#2a3a61] p-2 mr-3">
//                       <Calendar size={20} color="#2a3a61" />
//                     </View>
//                     <Text className="font-semibold text-lg text-[#2a3a61]">
//                       {tracker.ie_main_year} Budget Overview
//                     </Text>
//                   </View>
//                   <X size={20} color="#6b7280" />
//                 </View>

//                 {/* Card Content */}
//                 <View className="space-y-3">
//                   <View className="flex-row justify-between">
//                     <Text className="text-gray-600">Total Budget:</Text>
//                     <Text className="text-blue-600">
//                       Php {budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//                     </Text>
//                   </View>
//                   <View className="flex-row justify-between">
//                     <Text className="text-gray-600">Total Income:</Text>
//                     <Text className="text-green-600">
//                       Php {income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//                     </Text>
//                   </View>
//                   <View className="flex-row justify-between">
//                     <Text className="text-gray-600">Total Expenses:</Text>
//                     <Text className="text-red-600">
//                       Php {expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//                     </Text>
//                   </View>
//                   <View className="flex-row justify-between">
//                     <Text className="text-gray-600">Remaining Balance:</Text>
//                     <Text className="text-yellow-600">
//                       Php {remainingBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//                     </Text>
//                   </View>
//                 </View>

//                 {/* Progress Bar */}
//                 <View className="mt-4">
//                   <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//                     <View
//                       className="h-full bg-[#2a3a61]"
//                       style={{ width: `${progress}%` }}
//                     />
//                   </View>
//                   <Text className="text-xs text-gray-500 mt-1 text-center">
//                     {progress.toFixed(2)}% of budget spent
//                   </Text>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           );
//         })}
        
//         {filteredData.length === 0 && (
//           <Text className="text-center text-gray-500 text-sm mt-4">
//             No matching records found
//           </Text>
//         )}
//       </View>
//     </_ScreenLayout>
//   );
// };

// export default IncomeExpenseMain;






import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Search, Calendar, X, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
import PageLayout from '@/screens/_PageLayout';

const IncomeExpenseMain = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: fetchedData = [],
    isLoading,
    isError,
    refetch
  } = useIncomeExpenseMainCard();

  const filteredData = fetchedData.filter(tracker =>
    tracker.ie_main_year.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (isError) {
    return (
      <PageLayout
            leftAction={
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                    <ChevronLeft size={24} className="text-gray-700" />
                </TouchableOpacity>
            }
            headerTitle={<Text className="text-gray-900 text-[13px]">Garbage Pickup Requests</Text>}
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
          <View className="w-10 h-10 rounded-full items-center justify-center"></View>
      }
    >
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2a3a61" />
          <Text className="text-sm text-gray-500 mt-2">Loading data...</Text>
        </View>
      ) : (
        <View className="flex-1">
          {/* Search Bar */}
          <View className="px-4 mb-8">
            <View className="relative">
              <Search className="absolute left-3 top-3.5 text-gray-500" size={17} />
              <TextInput
                placeholder="Search..."
                className="pl-4 w-full h-[45px] bg-white text-base rounded-lg p-2 border border-gray-300"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Budget Cards */}
          <View className="px-4 space-y-4 pb-4">
            {[...filteredData]
              .sort((a, b) => Number(b.ie_main_year) - Number(a.ie_main_year))
              .map((tracker: any, index: any) => {

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

            {filteredData.length === 0 && (
              <Text className="text-center text-gray-500 text-sm mt-4">
                No matching records found
              </Text>
            )}
          </View>
        </View>
      )}
    </PageLayout>
  );
};

export default IncomeExpenseMain;