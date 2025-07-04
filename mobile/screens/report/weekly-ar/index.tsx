import PageLayout from "@/screens/_PageLayout"
import { useRouter } from "expo-router"
import { TouchableOpacity, View, Text, FlatList, ActivityIndicator, Alert } from "react-native"
import { useGetWeeklyAR } from "../queries/reportFetch";
import { ChevronLeft, Search, FileText, Calendar, Users, Paperclip, Eye } from "lucide-react-native";

const StatusBadge = ({ status }:{status: any}) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <View className={`px-2 py-1 rounded-full ${getStatusColor()}`}>
      <Text className={`text-xs font-medium ${getStatusColor().split(' ')[1]}`}>
        {status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
      </Text>
    </View>
  );
};

const WARCard = ({ item, onPress } : {item: any, onPress: (item: any) => void}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <TouchableOpacity 
      onPress={() => onPress(item)}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base mb-1">
            WAR #{item.id}
          </Text>
          <StatusBadge status={item.status} />
        </View>
        <View className="items-end">
          <Text className="text-gray-500 text-xs">Created</Text>
          <Text className="text-gray-900 text-sm font-medium">
            {formatDate(item.created_at)}
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-100 pt-3">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <Text className="text-gray-600 text-sm">
              For: {formatDate(item.created_for)}
            </Text>
          </View>
          {item.war_files && item.war_files.length > 0 && (
            <View className="flex-row items-center">
              <Paperclip size={14} className="text-gray-400 mr-1" />
              <Text className="text-gray-500 text-xs">
                {item.war_files.length} file{item.war_files.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {item.war_composition && item.war_composition.length > 0 && (
          <View className="flex-row items-center">
            <Users size={16} className="text-gray-400 mr-2" />
            <Text className="text-gray-500 text-sm">
              {item.war_composition.length} composition{item.war_composition.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const EmptyState = () => (
  <View className="flex-1 justify-center items-center py-16">
    <FileText size={48} className="text-gray-300 mb-4" />
    <Text className="text-gray-500 text-lg font-medium mb-2">
      No Reports Found
    </Text>
    <Text className="text-gray-400 text-sm text-center px-8">
      There are no weekly acknowledgement reports available at the moment.
    </Text>
  </View>
);

const LoadingState = () => (
  <View className="flex-1 justify-center items-center py-16">
    <ActivityIndicator size="large" className="text-blue-600 mb-4" />
    <Text className="text-gray-500 text-base">
      Loading reports...
    </Text>
  </View>
);

export default () => {
  const router = useRouter();
  const { data: weeklyAR, isLoading, error } = useGetWeeklyAR();

  const handleWARPress = (war: any) => {
    // Navigate to detailed view or show options
    Alert.alert(
      'WAR Options',
      `What would you like to do with WAR #${war.id}?`,
      [
        { text: 'View Details', onPress: () => console.log('View WAR:', war.id) },
        { text: 'Edit', onPress: () => console.log('Edit WAR:', war.id) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderWARItem = ({ item }: {item: any}) => (
    <WARCard item={item} onPress={handleWARPress} />
  );

  if (error) {
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
        headerTitle={
          <Text className="text-gray-900 text-[13px]">
            Acknowledgement Reports
          </Text>
        }
      >
        <View className="flex-1 justify-center items-center py-16">
          <Text className="text-red-500 text-lg font-medium mb-2">
            Error Loading Reports
          </Text>
          <Text className="text-gray-500 text-sm text-center px-8">
            Unable to load weekly acknowledgement reports. Please try again.
          </Text>
        </View>
      </PageLayout>
    );
  }

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
      headerTitle={
        <Text className="text-gray-900 text-[13px]">
          Acknowledgement Reports
        </Text>
      }
      rightAction={
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <Search size={20} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-gray-50">
        {/* Header Stats */}
        {weeklyAR && weeklyAR.length > 0 && (
          <View className="bg-white px-4 py-3 border-b border-gray-100">
            <Text className="text-gray-600 text-sm">
              Total Reports: <Text className="font-semibold text-gray-900">{weeklyAR.length}</Text>
            </Text>
          </View>
        )}

        {/* Content */}
        <View className="flex-1 px-4 pt-4">
          {isLoading ? (
            <LoadingState />
          ) : !weeklyAR || weeklyAR.length === 0 ? (
            <EmptyState />
          ) : (
            <FlatList
              data={weeklyAR}
              renderItem={renderWARItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </View>
    </PageLayout>
  );
};