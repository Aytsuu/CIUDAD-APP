import { SafeAreaView, Text, ScrollView, View, TouchableOpacity } from "react-native";
import { Search, ChevronRight, ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import RatesPage1 from "./rates-page-1";
import RatesPage2 from "./rates-page-2";
import RatesPage3 from "./rates-page-3";
import RatesPage4 from "./rates-page-4";
import RatesPage5 from "./rates-page-5";

export default function PurposeAndRatesMain() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const handleNext = () => {
        setCurrentPage(prev => Math.min(prev + 1, 5));
    };

    const handlePrevious = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header Section */}
            <View className="px-4 py-4 mt-4">
                <Text className="font-semibold text-xl text-[#2a3a61] mt-5">
                    Rates
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                    Manage and configure rates for business permits, personal clearances, service charges, and other barangay fees.
                </Text>
            </View>

            {/* Main Content */}
            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ 
                    paddingBottom: 80, // Extra padding for fixed navigation
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Page Content */}
                <View className="px-4">
                    {currentPage === 1 && <RatesPage1 />}
                    {currentPage === 2 && <RatesPage2 />}
                    {currentPage === 3 && <RatesPage3 />}
                    {currentPage === 4 && <RatesPage4 />}
                    {currentPage === 5 && <RatesPage5 />}
                </View>
            </ScrollView>

            {/* Fixed Bottom Navigation */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <View className="flex-row justify-between items-center">
                    <TouchableOpacity
                        onPress={handlePrevious}
                        disabled={currentPage === 1}
                        className={`flex-row items-center px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 opacity-50' : 'bg-primaryBlue'}`}
                    >
                        <ChevronLeft size={20} color={currentPage === 1 ? "#6b7280" : "white"} />
                        <Text className={`ml-1 ${currentPage === 1 ? 'text-gray-500' : 'text-white'}`}>
                            
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center">
                        {[1, 2, 3, 4, 5].map((page) => (
                            <View
                                key={page}
                                className={`w-2 h-2 mx-1 rounded-full ${currentPage === page ? 'bg-[#2a3a61]' : 'bg-gray-300'}`}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleNext}
                        disabled={currentPage === 5}
                        className={`flex-row items-center px-4 py-2 rounded-md ${currentPage === 5 ? 'bg-gray-200 opacity-50' : 'bg-primaryBlue'}`}
                    >
                        <Text className={`mr-1 ${currentPage === 5 ? 'text-gray-500' : 'text-white'}`}>
                            
                        </Text>
                        <ChevronRight size={20} color={currentPage === 5 ? "#6b7280" : "white"} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}