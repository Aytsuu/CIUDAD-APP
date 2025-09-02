// import { Text, View, TouchableOpacity } from "react-native";
// import { ChevronRight } from "lucide-react-native";
// import { useState } from "react";
// import RatesPage1 from "./rates-page-1";
// import RatesPage2 from "./rates-page-2";
// import RatesPage3 from "./rates-page-3";
// import RatesPage4 from "./rates-page-4";
// // import RatesPage5 from "./rates-page-5";
// import PageLayout from "@/screens/_PageLayout";
// import {ChevronLeft} from "@/lib/icons/ChevronLeft"
// import { useRouter } from "expo-router";
// import React from "react";

// export default function PurposeAndRatesMain() {
//     const router = useRouter();
//     const [currentPage, setCurrentPage] = useState(1);
//     const [searchQuery, setSearchQuery] = React.useState<string>("")
//     const [showSearch, setShowSearch] = React.useState<boolean>(false)

//     const handleNext = () => {
//         setCurrentPage(prev => Math.min(prev + 1, 5));
//     };

//     const handlePrevious = () => {
//         setCurrentPage(prev => Math.max(prev - 1, 1));
//     };

//     return (
//        <PageLayout
//             leftAction={
//                 <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
//                     <ChevronLeft size={24} className="text-gray-700" />
//                 </TouchableOpacity>
//             }
//             headerTitle={<Text className="text-gray-900 text-[13px]">Rates</Text>}
//             rightAction={
//                 <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
//             }
//        >
//             {/* Main Content Container */}
//             <View className="flex-1">
//                 <View className="flex-1 px-4">
//                     {currentPage === 1 && <RatesPage1 />}
//                     {currentPage === 2 && <RatesPage2 />}
//                     {currentPage === 3 && <RatesPage3 />}
//                     {currentPage === 4 && <RatesPage4 />}
//                     {/* {currentPage === 5 && <RatesPage5 />} */}
//                 </View>
        
//                 {/* Fixed Bottom Navigation */}
//                 <View className="bg-white border-t border-gray-200 p-4">
//                     <View className="flex-row justify-between items-center">
//                         <TouchableOpacity
//                             onPress={handlePrevious}
//                             disabled={currentPage === 1}
//                             className={`flex-row items-center px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 opacity-50' : 'bg-primaryBlue'}`}
//                         >
//                             <ChevronLeft size={20} color={currentPage === 1 ? "#6b7280" : "white"} />
//                         </TouchableOpacity>

//                         <View className="flex-row items-center">
//                             {[1, 2, 3, 4].map((page) => (
//                                 <View
//                                     key={page}
//                                     className={`w-2 h-2 mx-1 rounded-full ${currentPage === page ? 'bg-[#2a3a61]' : 'bg-gray-300'}`}
//                                 />
//                             ))}
//                         </View>

//                         <TouchableOpacity
//                             onPress={handleNext}
//                             disabled={currentPage === 4}
//                             className={`flex-row items-center px-4 py-2 rounded-md ${currentPage === 5 ? 'bg-gray-200 opacity-50' : 'bg-primaryBlue'}`}
//                         >

//                             <ChevronRight size={20} color={currentPage === 5 ? "#6b7280" : "white"} />
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </View>
//         </PageLayout>
//     );
// }

import PageLayout from "@/screens/_PageLayout";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { Search } from "@/lib/icons/Search";
import { useRouter } from "expo-router";
import { useState } from "react";
import RatesPage1 from "./rates-page-1";
import RatesPage2 from "./rates-page-2";
import RatesPage3 from "./rates-page-3";
import RatesPage4 from "./rates-page-4";

type TabType = "annual-gross-sales" | "personal" | "service-charges" | "business-permits";

export default function PurposeAndRatesMain() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("annual-gross-sales");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const tabs = [
    { key: "annual-gross-sales" as TabType, label: "Annual Gross Sales" },
    { key: "personal" as TabType, label: "Personal" },
    { key: "service-charges" as TabType, label: "Service Charges" },
    { key: "business-permits" as TabType, label: "Business Permits" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "annual-gross-sales":
        return <RatesPage1 />;
      case "personal":
        return <RatesPage2 />;
      case "service-charges":
        return <RatesPage3 />;
      case "business-permits":
        return <RatesPage4 />;
      default:
        return <RatesPage1 />;
    }
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Rates</Text>}
      rightAction={
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          onPress={() => setShowSearch(!showSearch)}
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1">
        {/* Horizontally scrollable tabs - Fixed spacing */}
        <View className="bg-white border-b border-gray-200">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`px-3 py-4 mx-1 items-center border-b-2 ${
                  activeTab === tab.key ? "border-blue-500" : "border-transparent"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === tab.key ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="flex-1 bg-gray-50">
          {renderTabContent()}
        </View>
      </View>
    </PageLayout>
  );
}