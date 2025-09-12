import React, { useState } from 'react';
import { View,Text,TouchableOpacity,ScrollView,ActivityIndicator,RefreshControl,Alert,Modal,TextInput,} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft,XCircle,Package,Calendar,FileText,Trash2,RefreshCw,} from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api2 } from '@/api/api';
import PageLayout from '@/screens/_PageLayout';

// Types
interface MedicineRequestItem {
  med_details: any;
  medreqitem_id: number;
  medreqitem_qty: number;
  reason: string;
  status: string;
  med: {
    med_id: string;
    med_name: string;
    med_type: string;
  };
  minv_id?: {
    minv_id: number;
    med_id: {
      med_id: string;
      med_name: string;
      med_type: string;
    };
  };
  medreq_id: {
    medreq_id: string;
    requested_at: string;
    status: string;
    mode: 'app' | 'walk-in';
  };
}

// API Functions
const fetchUserPendingMedicineItems = async (patId: string): Promise<MedicineRequestItem[]> => {
  const response = await api2.get(`/medicine/user-pending-items/?pat_id=${patId}`);
  const results = response.data.results || [];
  return results.map((item: any) => ({
    medreqitem_id: item.medreqitem_id,
    medreqitem_qty: item.medreqitem_qty,
    reason: item.reason,
    status: item.status,
    med_details: item.med_details,
    medreq_id: {
      medreq_id: item.medreq_id || item.medreq_details.medreq_id,
      requested_at: item.medreq_details.requested_at,
      status: item.medreq_details.status || item.status,
      mode: item.medreq_details.mode || 'walk-in',
    },
  }));
};

const cancelMedicineRequestItem = async (medreqitem_id: number, reason: string): Promise<void> => {
  try {
    await api2.patch(`/medicine/cancel-medicine-request-item/${medreqitem_id}/`, {
      archive_reason: reason,
    });
  } catch (error) {
    console.error('Error canceling medicine request item:', error);
    throw error;
  }
};

// Utility Functions
const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        label: 'Pending',
      };
    case 'confirmed':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        label: 'Confirmed',
      };
    case 'referred':
    case 'referred_to_doctor':
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200',
        label: 'Referred to Doctor',
      };
    case 'declined':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        label: 'Declined',
      };
    case 'fulfilled':
    case 'completed':
      return {
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-200',
        label: 'Fulfilled',
      };
    case 'ready_for_pickup':
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-200',
        label: 'Ready for Pickup',
      };
    case 'cancelled':
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        label: 'Cancelled',
      };
    default:
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        label: status,
      };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = getStatusConfig(status);
  return (
    <View className={`flex-row items-center px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
      <Text className={`ml-1 text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </Text>
    </View>
  );
};

const RequestItemDetails: React.FC<{ item: MedicineRequestItem; onCancel: () => void; isCancelPending: boolean }> = ({
  item,
  onCancel,
  isCancelPending,
}) => {
  const medicineName = item.med_details?.med_name || 'Unknown Medicine';
  const canCancel = item.status.toLowerCase() === 'pending';

  return (
    <View className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden shadow-sm">
      {/* Header */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-lg font-semibold text-gray-900 mb-1">{medicineName}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
      </View>

      {/* Details */}
      <View className="p-4 space-y-3">
        <View className="flex-row items-center">
          <Calendar size={16} color="#6B7280" />
          <Text className="ml-2 text-sm text-gray-700">
            Requested: {formatDate(item.medreq_id.requested_at)}
          </Text>
        </View>
        {item.reason && (
          <View className="flex-row items-start">
            <FileText size={16} color="#6B7280" className="mt-0.5" />
            <Text className="ml-2 text-sm text-gray-700 flex-1">Reason: {item.reason}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      {canCancel && (
        <View className="px-4 pb-4">
          <TouchableOpacity
            onPress={onCancel}
            disabled={isCancelPending}
            className="flex-row items-center justify-center bg-red-50 border border-red-200 rounded-lg py-3 px-4"
          >
            {isCancelPending ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <Trash2 size={16} color="#DC2626" />
                <Text className="ml-2 text-red-600 font-medium">Cancel Request Item</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const CancelModal: React.FC<{
  visible: boolean;
  item: MedicineRequestItem | null;
  cancellationReason: string;
  setCancellationReason: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}> = ({ visible, item, cancellationReason, setCancellationReason, onConfirm, onClose, isPending }) => (
  <Modal
    visible={visible}
    transparent={true}
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="bg-white rounded-lg p-6 w-5/6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Cancel Request</Text>
        <Text className="text-gray-700 mb-2">
          Please provide a reason for cancelling your request. Remember this cannot be undone.
          {/* <Text className="font-semibold">{item?.med_details?.med_name || 'Unknown Medicine'}</Text> */}
        </Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-800 bg-white"
          placeholder="Enter cancellation reason..."
          placeholderTextColor="#9CA3AF"
          multiline={true}
          numberOfLines={4}
          value={cancellationReason}
          onChangeText={setCancellationReason}
          textAlignVertical="top"
        />
        <View className="flex-row justify-end gap-3">
          <TouchableOpacity onPress={onClose} className="px-4 py-2 rounded-lg border border-gray-300">
            <Text className="text-gray-700">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-red-600"
          >
            {isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Cancel</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const TabBar: React.FC<{
  activeTab: 'pending' | 'to-pickup' | 'completed' | 'cancelled';
  setActiveTab: (tab: 'pending' | 'to-pickup' | 'completed' | 'cancelled') => void;
  counts: { pending: number; inProgress: number; completed: number; cancelled: number };
}> = ({ activeTab, setActiveTab, counts }) => (
  <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
    <TouchableOpacity
      onPress={() => setActiveTab('pending')}
      className={`flex-1 items-center py-2 ${activeTab === 'pending' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'pending' ? 'text-blue-600' : 'text-gray-600'}`}>
        Pending ({counts.pending})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('to-pickup')}
      className={`flex-1 items-center py-2 ${activeTab === 'to-pickup' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'to-pickup' ? 'text-blue-600' : 'text-gray-600'}`}>
        To pick-up ({counts.inProgress})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('completed')}
      className={`flex-1 items-center py-2 ${activeTab === 'completed' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'completed' ? 'text-blue-600' : 'text-gray-600'}`}>
        Completed ({counts.completed})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('cancelled')}
      className={`flex-1 items-center py-2 ${activeTab === 'cancelled' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'cancelled' ? 'text-blue-600' : 'text-gray-600'}`}>
        Cancelled ({counts.cancelled})
      </Text>
    </TouchableOpacity>
  </View>
);

// Main Component
export const MedicineRequestTracker: React.FC = () => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'to-pickup' | 'completed' | 'cancelled'>('pending');
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MedicineRequestItem | null>(null);
  const userId = 'PT20230001';

  const { data: requests, isLoading, error, refetch } = useQuery({
    queryKey: ['userPendingMedicineItems', userId],
    queryFn: () => fetchUserPendingMedicineItems(userId),
    enabled: !!userId,
  });

  const filteredRequests = requests?.filter((item) => {
    const status = item.status.toLowerCase();
    if (activeTab === 'pending') return status === 'pending';
    if (activeTab === 'to-pickup') return ['confirmed', 'referred', 'referred_to_doctor', 'ready_for_pickup'].includes(status);
    if (activeTab === 'completed') return ['fulfilled', 'completed'].includes(status);
    if (activeTab === 'cancelled') return ['cancelled', 'declined'].includes(status);
    return false;
  }) || [];

  const cancelMutation = useMutation({
    mutationFn: ({ medreqitem_id, reason }: { medreqitem_id: number; reason: string }) =>
      cancelMedicineRequestItem(medreqitem_id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPendingMedicineItems', userId] });
      setCancellationReason('');
      setShowCancelModal(false);
      setSelectedItem(null);
      Alert.alert('Success', 'Medicine request item cancelled successfully.');
    },
    onError: (error: any) => {
      console.error('Cancellation error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to cancel request item. Please try again.');
    },
  });

  const handleCancelRequest = (item: MedicineRequestItem) => {
    setSelectedItem(item);
    setShowCancelModal(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const counts = {
    pending: requests?.filter((r) => r.status.toLowerCase() === 'pending').length || 0,
    inProgress:
      requests?.filter((r) =>
        ['confirmed', 'referred', 'referred_to_doctor', 'ready_for_pickup'].includes(r.status.toLowerCase())
      ).length || 0,
    completed: requests?.filter((r) => ['fulfilled', 'completed'].includes(r.status.toLowerCase())).length || 0,
    cancelled: requests?.filter((r) => ['cancelled', 'declined'].includes(r.status.toLowerCase())).length || 0,
  };

  if (isLoading) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">My Medicine Requests</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading your requests...</Text>
        </View>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">My Medicine Requests</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <XCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading requests</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">
            Failed to fetch your medicine requests. Please check your connection and try again.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg"
          >
            <RefreshCw size={18} color="white" />
            <Text className="ml-2 text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">My Medicine Requests</Text>}
      rightAction={
        <TouchableOpacity onPress={onRefresh} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <RefreshCw size={20} color="#374151" />
        </TouchableOpacity>
      }
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
        showsVerticalScrollIndicator={false}
      >
        {!requests || requests.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6 py-20">
            <Package size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No requests found</Text>
            <Text className="text-gray-600 text-center mt-2 mb-8">
              You haven't made any medicine requests yet. Start by requesting the medicines you need.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/medicine-request/med-request')}
              className="bg-blue-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Request Medicine</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-4">
            <TabBar activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />
            <View className="space-y-4 mt-4">
              {filteredRequests.length === 0 ? (
                <View className="flex-1 justify-center items-center py-10">
                  <Text className="text-gray-600 text-center">No requests in this category.</Text>
                </View>
              ) : (
                filteredRequests.map((item) => (
                  <RequestItemDetails
                    key={item.medreqitem_id}
                    item={item}
                    onCancel={() => handleCancelRequest(item)}
                    isCancelPending={cancelMutation.isPending}
                  />
                ))
              )}
            </View>
            <View className="h-6" />
          </View>
        )}
      </ScrollView>
      <CancelModal
        visible={showCancelModal}
        item={selectedItem}
        cancellationReason={cancellationReason}
        setCancellationReason={setCancellationReason}
        onConfirm={() => {
          if (!cancellationReason.trim()) {
            Alert.alert('Error', 'Please provide a cancellation reason.');
            return;
          }
          if (selectedItem) {
            cancelMutation.mutate({
              medreqitem_id: selectedItem.medreqitem_id,
              reason: cancellationReason.trim(),
            });
          }
        }}
        onClose={() => {
          setShowCancelModal(false);
          setCancellationReason('');
          setSelectedItem(null);
        }}
        isPending={cancelMutation.isPending}
      />
    </PageLayout>
  );
};

export default MedicineRequestTracker;