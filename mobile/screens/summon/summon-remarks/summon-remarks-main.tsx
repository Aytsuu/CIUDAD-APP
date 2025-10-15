import PageLayout from "@/screens/_PageLayout";
import { TouchableOpacity, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { Search } from "@/lib/icons/Search"
import React from "react";
import { SearchInput } from "@/components/ui/search-input";
import { LoadingModal } from "@/components/ui/loading-modal";


export default function SummonRemarksMain(){
    const router = useRouter();
    const [showSearch, setShowSearch] = React.useState<boolean>(false);
    const [searchInputVal, setSearchInputVal] = React.useState<string>('');
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);


    const handleRefresh = async () => {
        setIsRefreshing(true);
        // if (activeTab === 'active') {
        //   await refetchActive();
        // } else {
        //   await refetchInactive();
        // }
        // setIsRefreshing(false);
      };
    
      const handleSearch = React.useCallback(() => {
        setSearchQuery(searchInputVal);
        // setCurrentPage(1);
      }, [searchInputVal]);

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
            wrapScroll={false}
            headerTitle={<Text className="text-gray-900 text-[13px]">Summon Remarks</Text>}
            rightAction={
              <TouchableOpacity 
                onPress={() => setShowSearch(!showSearch)} 
                className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
              >
                <Search size={22} className="text-gray-700" />
              </TouchableOpacity>
            }
          >
            <View className="flex-1 bg-gray-50">
              {/* Search Bar */}
              {showSearch && (
                <SearchInput 
                  value={searchInputVal}
                  onChange={setSearchInputVal}
                  onSubmit={handleSearch} 
                />
              )}
    
           
              </View>
          </PageLayout>
          
      );
}