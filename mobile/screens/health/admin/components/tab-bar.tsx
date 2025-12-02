import { View, TouchableOpacity, Text } from "react-native";

export type TabType = "all" | "resident" | "transient"
export type MedTabType = "pending" | "cancelled" | "confirmed" | "completed" | "rejected";


const getStatusConfig = (status: string) => {
  const lowerStatus = status.toLowerCase();
  switch (lowerStatus) {
    case 'pending':
    case 'referred_to_doctor': // Group these together
      return {
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        label: lowerStatus === 'referred_to_doctor' ? 'Referred to Doctor' : 'Pending'
      };
    case 'rejected':
      return {
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        label: 'Rejected'
      };
    case 'declined':
    case 'cancelled':
      return {
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        label: 'Cancelled'
      };
    case 'confirmed':
      return {
        color: 'text-orange-700',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-200',
        label: 'Ready for Pickup'
      };
    case 'completed':
      return {
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        label: 'Completed'
      };
    default:
      return {
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        label: status
      };
  }
};



export const MedStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = getStatusConfig(status);
  return (
    <View className={`px-3 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
      <Text className={`text-xs font-semibold ${statusConfig.color}`}>
        {statusConfig.label}
      </Text>
    </View>
  );
};

export const MedTabBar: React.FC<{
  activeTab: MedTabType;
  setActiveTab: (tab: MedTabType) => void;
}> = ({ activeTab, setActiveTab }) => (  // Removed counts as per request
  <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
    <TouchableOpacity
      onPress={() => setActiveTab('pending')}
      className={`flex-1 items-center py-3 ${activeTab === 'pending' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'pending' ? 'text-blue-600' : 'text-gray-600'}`}>
        Pending
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('confirmed')}
      className={`flex-1 items-center py-3 ${activeTab === 'confirmed' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'confirmed' ? 'text-blue-600' : 'text-gray-600'}`}>
        To Pick Up
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('completed')}
      className={`flex-1 items-center py-3 ${activeTab === 'completed' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'completed' ? 'text-blue-600' : 'text-gray-600'}`}>
        Completed
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('cancelled')}
      className={`flex-1 items-center py-3 ${activeTab === 'cancelled' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'cancelled' ? 'text-blue-600' : 'text-gray-600'}`}>
        Cancelled
      </Text>
    </TouchableOpacity>
     <TouchableOpacity
      onPress={() => setActiveTab('rejected')}
      className={`flex-1 items-center py-3 ${activeTab === 'rejected' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'rejected' ? 'text-blue-600' : 'text-gray-600'}`}>
        Rejected
      </Text>
    </TouchableOpacity>
  </View>
);


export const TabBar: React.FC<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}> = ({ activeTab, setActiveTab }) => (
  <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
    <TouchableOpacity
      onPress={() => setActiveTab('all')}
      className={`flex-1 items-center py-3 ${activeTab === 'all' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'all' ? 'text-blue-600' : 'text-gray-600'}`}>
        All
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('resident')}
      className={`flex-1 items-center py-3 ${activeTab === 'resident' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'resident' ? 'text-blue-600' : 'text-gray-600'}`}>
        Residents 
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('transient')}
      className={`flex-1 items-center py-3 ${activeTab === 'transient' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'transient' ? 'text-blue-600' : 'text-gray-600'}`}>
        Transients
      </Text>
    </TouchableOpacity>
  </View>
);