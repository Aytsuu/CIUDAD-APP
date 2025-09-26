import React, { useState, useMemo } from 'react';
import { View,Text,TouchableOpacity,RefreshControl,Alert,Modal,TextInput,FlatList} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft,XCircle,Package,RefreshCw,Trash2,Search,Pill,Calendar,FileText,AlertCircle, } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api2 } from '@/api/api';
import PageLayout from '@/screens/_PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/ui/loading-state';

// Types
interface MedicineRequestItem {
  medreqitem_id: number;
  medreqitem_qty: number;
  reason: string | null;
  status: string;
  archive_reason?: string | null;
  med_details?: {
    med_id: string;
    med_name: string;
    med_type: string;
  };
  medreq_id: string;
  requested_at: string;
  mode: 'app' | 'walk-in';
}

interface User {
  rp_id?: string;
  pat_id?: string;
}

type TabType = "pending" | "cancelled" | "ready_for_pickup" | "completed";

// API Functions
const fetchUserAllMedicineItems = async (userId: string, isResident: boolean = true): Promise<MedicineRequestItem[]> => {

  const param = isResident ? `rp_id=${userId}&include_archived=true` : `pat_id=${userId}&include_archived=true`;
  const endpoint = isResident ? '/medicine/user-all-items/' : '/medicine/user-pending-items/';
  
  const response = await api2.get(`${endpoint}?${param}`);
  const results = response.data.results || [];
  console.log('API Response (All Items):', results); // Debug: Check all statuses
  return results.map((item: any) => ({
    medreqitem_id: item.medreqitem_id,
    medreqitem_qty: item.medreqitem_qty,
    reason: item.reason,
    status: item.status,
    archive_reason: item.archive_reason || null,
    med_details: item.med_details || (item.med?.med_name ? { 
      med_id: item.med?.med_id, 
      med_name: item.med?.med_name || item.med_details?.med_name, 
      med_type: item.med?.med_type 
    } : undefined),
    medreq_id: item.medreq_id || item.medreq_details?.medreq_id,
    requested_at: item.medreq_details?.requested_at || item.requested_at,
    mode: item.medreq_details?.mode || 'walk-in',
  }));
};

const cancelMedicineRequestItem = async (medreqitem_id: number, reason: string): Promise<void> => {
  try {
    await api2.patch(`/medicine/cancel-medicine-request-item/${medreqitem_id}/`, { archive_reason: reason });
  } catch (error) {
    console.error('Error canceling medicine request item:', error);
    throw error;
  }
};

// Utility Functions
const getStatusConfig = (status: string) => {
  const lowerStatus = status.toLowerCase();
  switch (lowerStatus) {
    case 'pending':
      return { 
        color: 'text-yellow-700', 
        bgColor: 'bg-yellow-100', 
        borderColor: 'border-yellow-200', 
        label: 'Pending' 
      };
    case 'confirmed':
      return { 
        color: 'text-orange-700', 
        bgColor: 'bg-orange-100', 
        borderColor: 'border-orange-200', 
        label: 'Ready for Pickup' 
      };
    case 'referred_to_doctor':
      return { 
        color: 'text-blue-700', 
        bgColor: 'bg-blue-100', 
        borderColor: 'border-blue-200', 
        label: 'Referred to Doctor' 
      };
    case 'declined':
    case 'cancelled':
      return { 
        color: 'text-red-700', 
        bgColor: 'bg-red-100', 
        borderColor: 'border-red-200', 
        label: 'Cancelled' 
      };
    case 'ready_for_pickup':
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

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return "Invalid Date";
  }
};

// Components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = getStatusConfig(status);
  return (
    <View className={`px-3 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
      <Text className={`text-xs font-semibold ${statusConfig.color}`}>
        {statusConfig.label}
      </Text>
    </View>
  );
};

const TabBar: React.FC<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  counts: { pending: number; cancelled: number; ready_for_pickup: number; completed: number };
}> = ({ activeTab, setActiveTab, counts }) => (
  <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
    <TouchableOpacity
      onPress={() => setActiveTab('pending')}
      className={`flex-1 items-center py-3 ${activeTab === 'pending' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'pending' ? 'text-blue-600' : 'text-gray-600'}`}>
        Pending ({counts.pending})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('ready_for_pickup')}
      className={`flex-1 items-center py-3 ${activeTab === 'ready_for_pickup' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'ready_for_pickup' ? 'text-blue-600' : 'text-gray-600'}`}>
        To Pick Up ({counts.ready_for_pickup})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('completed')}
      className={`flex-1 items-center py-3 ${activeTab === 'completed' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'completed' ? 'text-blue-600' : 'text-gray-600'}`}>
        Completed ({counts.completed})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('cancelled')}
      className={`flex-1 items-center py-3 ${activeTab === 'cancelled' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'cancelled' ? 'text-blue-600' : 'text-gray-600'}`}>
        Cancelled ({counts.cancelled})
      </Text>
    </TouchableOpacity>
  </View>
);

const MedicineRequestCard: React.FC<{
  item: MedicineRequestItem;
  onCancel: () => void;
  isCancelPending: boolean;
}> = ({ item, onCancel, isCancelPending }) => {
  const medicineName = item.med_details?.med_name || 'Unknown Medicine';
  const canCancel = item.status.toLowerCase() === 'pending';

  return (
    <View className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden shadow-sm">
      {/* Header */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
                <Pill color="white" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-lg text-gray-900">
                  {medicineName}
                </Text>
                {/* <Text className="text-gray-500 text-sm">Qty: {item.medreqitem_qty}</Text> */}
              </View>
            </View>
          </View>
          <View className="items-end">
            <StatusBadge status={item.status} />
            {/* <View className="bg-blue-100 px-2 py-1 rounded-lg mt-2">
              <Text className="text-blue-700 font-bold text-xs">#{item.medreqitem_id}</Text>
            </View> */}
          </View>
        </View>
      </View>

      {/* Details */}
      <View className="p-4 space-y-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Calendar size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-700">
              {formatDate(item.requested_at)}
            </Text>
          </View>
          <Text className="text-sm text-gray-600 capitalize">
            {/* {item.mode} */}
          </Text>
        </View>
        
        {item.reason && (
          <View className="flex-row items-start">
            <FileText size={16} color="#6B7280" className="mt-0.5" />
            <Text className="ml-2 text-sm text-gray-700 flex-1">
              {item.reason}
            </Text>
          </View>
        )}

        {item.archive_reason && (
          <View className="flex-row items-start">
            <AlertCircle size={16} color="#EF4444" className="mt-0.5" />
            <Text className="ml-2 text-sm text-red-600 flex-1">
              Cancellation: {item.archive_reason}
            </Text>
          </View>
        )}
      </View>

      {/* Action Button */}
      {canCancel && (
        <View className="p-4 bg-red-50 border-t border-red-100">
          <TouchableOpacity
            onPress={onCancel}
            disabled={isCancelPending}
            className="flex-row items-center justify-center bg-red-500 px-4 py-3 rounded-lg"
            activeOpacity={0.8}
          >
            <Trash2 size={16} color="white" />
            <Text className="ml-2 text-white font-medium">
              {isCancelPending ? 'Cancelling...' : 'Cancel Request'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Cancel Modal Component
const CancelModal: React.FC<{
  visible: boolean;
  item: MedicineRequestItem | null;
  cancellationReason: string;
  setCancellationReason: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}> = ({ visible, item, cancellationReason, setCancellationReason, onConfirm, onClose, isPending }) => {
  return (
    <Modal visible={visible} transparent>
      <View className="flex-1 justify-center items-center bg-black/50 p-4">
        <View className="bg-white rounded-lg w-full max-w-md p-6">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Cancel Request</Text>
          <Text className="text-sm text-gray-600 mb-4">
            Are you sure you want to cancel? 
            <Text className="font-bold text-red-700"> This cannot be undone.</Text>
          </Text>
          <TextInput
            value={cancellationReason}
            onChangeText={setCancellationReason}
            placeholder="Enter cancellation reason..."
            multiline
            className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4 text-sm"
            style={{ height: 80, textAlignVertical: 'top' }}
          />
          <View className="flex-row justify-end space-x-2">
            <TouchableOpacity onPress={onClose} className="px-4 py-2">
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={!cancellationReason.trim() || isPending}
              className="bg-red-500 px-4 py-2 rounded-md disabled:opacity-50"
            >
              <Text className="text-white font-medium">{isPending ? 'Cancelling...' : 'Confirm'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main Component
const MedicineRequestTracker: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MedicineRequestItem | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine user type and ID
  const isResident = !!user?.rp;
  const userId = user?.rp || null;
  const isUserReady = isAuthenticated && !!userId;

  // Debug log
  // console.log('Auth State:', { isAuthenticated, userId, isUserReady, isResident });
 
  // Query for all user items
  const {
    data: requests = [],
    isLoading: dataLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userMedicineRequests', userId, isResident],
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is missing - cannot fetch requests');
      }
      return fetchUserAllMedicineItems(userId, isResident);
    },
    enabled: isUserReady,
    staleTime: 5 * 60 * 1000,
  });


    // Mutation for cancel
  const cancelMutation = useMutation({
    mutationFn: ({ medreqitem_id, reason }: { medreqitem_id: number; reason: string }) =>
      cancelMedicineRequestItem(medreqitem_id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMedicineRequests'] });
      setShowCancelModal(false);
      setCancellationReason('');
      setSelectedItem(null);
      Alert.alert('Success', 'Request cancelled successfully.');
    },
    onError: (err: any) => Alert.alert('Error', `Failed to cancel: ${err.message}`),
  });

  // Filter requests by tab and search query
  const filteredRequests = useMemo(() => {
    let result = requests;

    // Filter by search query first
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.med_details?.med_name?.toLowerCase().includes(lowerCaseQuery) ||
          item.reason?.toLowerCase().includes(lowerCaseQuery) ||
          item.medreqitem_id.toString().includes(lowerCaseQuery)
      );
    }

    // Filter by active tab
    result = result.filter((item) => {
      const lowerStatus = item.status.toLowerCase();
      switch (activeTab) {
        case 'pending':
          return lowerStatus === 'pending';
        case 'cancelled':
          return ['rejected', 'cancelled','referred'].includes(lowerStatus);
        case 'ready_for_pickup':
          return ['confirmed', 'ready_for_pickup'].includes(lowerStatus);
        case 'completed':
          return ['completed', 'fulfilled'].includes(lowerStatus);
        default:
          return true;
      }
    });

    // Sort by date (most recent first)
    result.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());

    return result;
  }, [requests, searchQuery, activeTab]);

  // Counts for tabs
  const counts = useMemo(() => ({
    pending: requests.filter((r) => r.status.toLowerCase() === 'pending').length,
    cancelled: requests.filter((r) => ['declined', 'cancelled'].includes(r.status.toLowerCase())).length,
    ready_for_pickup: requests.filter((r) => ['confirmed', 'ready_for_pickup'].includes(r.status.toLowerCase())).length,
    completed: requests.filter((r) => ['completed', 'fulfilled'].includes(r.status.toLowerCase())).length,
  }), [requests]);

  // Refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error('Refetch error:', e);
    }
    setRefreshing(false);
  }, [refetch]);

  // Auth Guard
  if (!isAuthenticated || !user) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">My Medicine Requests</Text>}
      >
        <View className="flex-1 justify-center items-center mt-10">
          <Text className="text-gray-600">Please log in to view your medicine requests</Text>
        </View>
      </PageLayout>
    );
  }

  // Combined Loading
  if (authLoading || dataLoading) {
    return <LoadingState/>
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
            Failed to load your medicine requests. Please check your connection and try again.
          </Text>
          <TouchableOpacity onPress={onRefresh} className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg">
            <RefreshCw size={18} color="white" />
            <Text className="ml-2 text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  // Main Render
  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">My Medicine Requests</Text>}
        rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center p-3 border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search medicine requests..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

        {/* Requests List */}
        {requests.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Package size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No requests found</Text>
            <Text className="text-gray-600 text-center mt-2 mb-8">
              Start by requesting medicines you need.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/medicine-request/med-request')} 
              className="bg-blue-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Request Medicine</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredRequests}
            keyExtractor={(item) => `medicine-request-${item.medreqitem_id}`}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={21}
            renderItem={({ item }) => (
              <MedicineRequestCard
                item={item}
                onCancel={() => {
                  setSelectedItem(item);
                  setShowCancelModal(true);
                }}
                isCancelPending={cancelMutation.isPending}
              />
            )}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-20">
                <Package size={48} color="#D1D5DB" />
                <Text className="text-gray-600 text-lg font-semibold mb-2 mt-4">No requests in this category</Text>
                <Text className="text-gray-500 text-center">
                  {searchQuery
                    ? `No ${activeTab} requests match your search.`
                    : `No ${activeTab} requests found.`}
                </Text>
              </View>
            )}
          />
        )}
      </View>

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