import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/screens/_PageLayout";
import { FlatList, RefreshControl, TouchableOpacity, View, Text } from "react-native";
import { useGetIRHistory } from "./queries/reportFetch";
import React from "react";
import { formatDate } from "@/helpers/dateHelpers";

// Icon component (you can replace with your preferred icon library)
const ClockIcon = () => (
  <View className="w-4 h-4 rounded-full border border-gray-400 items-center justify-center">
    <View className="w-1 h-1 bg-gray-400 rounded-full" />
  </View>
);

const LocationIcon = () => (
  <View className="w-4 h-4">
    <View className="w-3 h-3 border-2 border-gray-400 rounded-full ml-0.5" />
    <View className="w-1 h-1 bg-gray-400 rounded-full ml-1.5 -mt-2" />
  </View>
);

const PersonIcon = () => (
  <View className="w-4 h-4 border border-gray-400 rounded-full items-center justify-center">
    <View className="w-2 h-2 border border-gray-400 rounded-full" />
  </View>
);

const TypeIcon = () => (
  <View className="w-4 h-4 border border-gray-400 rounded items-center justify-center">
    <View className="w-2 h-0.5 bg-gray-400" />
    <View className="w-2 h-0.5 bg-gray-400 mt-0.5" />
    <View className="w-2 h-0.5 bg-gray-400 mt-0.5" />
  </View>
);

export default function ReportHistory() {
  // ============== STATE INITIALIZATION ==============
  const { user } = useAuth();
  const [searchInputVal, setSearchInputVal] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  
  // Queries
  const { data: myIRs, isLoading, refetch } = useGetIRHistory(
    currentPage,
    pageSize,
    searchQuery,
    false,
    user?.resident?.rp_id
  )
  
  const history = myIRs?.results || []
  const totalCount = myIRs?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)
  
  // ============== SIDE EFFECTS ==============
  
  // ============== HANDLERS ==============
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  }, [searchInputVal]);

  // Helper function to get incident type color
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'emergency': 'bg-red-100 text-red-800',
      'maintenance': 'bg-blue-100 text-blue-800',
      'security': 'bg-yellow-100 text-yellow-800',
      'noise': 'bg-purple-100 text-purple-800',
      'other': 'bg-gray-100 text-gray-800',
    };
    
    const lowerType = type?.toLowerCase() || '';
    return typeColors[lowerType] || 'bg-gray-100 text-gray-800';
  };

  // Helper function to create narrative text
  const createNarrative = (item: Record<string, any>) => {
    const type = item.ir_type || 'incident';
    const area = item.ir_area || 'an unspecified area';
    const date = item.ir_date ? formatDate(item.ir_date, 'long') : 'an unknown date';
    const time = item.ir_time || 'an unspecified time';
    const involved = item.ir_involved || 'unknown parties';
    
    return `Incident occurred in ${area} on ${date} at ${time}. The incident involved ${involved}.`;
  };

  // ============== RENDER HELPERS ==============
  const RenderCard = React.memo(({item, index} : {item: Record<string, any>, index: number}) => (
    <View className={`mx-4 mb-3 bg-white rounded-xl shadow-sm border border-gray-100`}>
      <TouchableOpacity
        className="p-4"
        activeOpacity={0.7}
        onPress={() => {
          // Handle card press - navigate to detail screen
          console.log('Pressed IR:', item.ir_id);
        }}
      >
        {/* Header with IR Type Badge and ID */}
        <View className="flex-row justify-between items-start mb-3">
          <View className={`px-3 py-1 rounded-full ${getTypeColor(item.ir_type)}`}> 
            <Text className="text-xs font-medium capitalize">
              {item.ir_type || 'N/A'}
            </Text>
          </View>
          <Text className="text-xs text-gray-500 font-medium">
            #{index + 1}
          </Text>
        </View>

        {/* Narrative Content */}
        <View className="mb-4">
          <Text className="text-gray-800 text-sm leading-relaxed">
            {createNarrative(item)}
          </Text>
        </View>

        {/* Report Submission Info */}
        <View className="pt-3 border-t border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <ClockIcon />
              <Text className="ml-2 text-gray-500 text-xs">
                Report submitted:
              </Text>
            </View>
            <Text className="text-gray-600 text-xs font-medium">
              {item.ir_created_at ? formatDate(item.ir_created_at, 'short') : 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Subtle indicator for interactivity */}
        <View className="absolute right-4 top-1/2 transform -translate-y-1">
          <View className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <View className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1" />
          <View className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1" />
        </View>
      </TouchableOpacity>
    </View>
  ));

  // ============== MAIN RENDER ==============
  return (
    <View className="flex-1">
      <FlatList
        overScrollMode="never"
        data={history}
        renderItem={({item, index}) => <RenderCard item={item} index={index} />}
        keyExtractor={(item) => item.ir_id?.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#00a8f0']}
          />
        }
        contentContainerStyle={{ 
          paddingTop: 16,
          paddingBottom: 20,
          flexGrow: history.length === 0 ? 1 : 0
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center px-6">
            <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
              <TypeIcon />
            </View>
            <Text className="text-gray-600 text-lg font-medium mb-2">
              No Reports Found
            </Text>
            <Text className="text-gray-500 text-center">
              You haven't submitted any incident reports yet.
            </Text>
          </View>
        )}
      />
    </View>
  );
}