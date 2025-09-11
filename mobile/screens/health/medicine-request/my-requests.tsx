import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Clock, CheckCircle, XCircle, AlertTriangle, Package, Calendar, FileText, Trash2, RefreshCw } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api2 } from '@/api/api'; // Assuming api2 is correctly configured
import PageLayout from '@/screens/_PageLayout'; // Assuming PageLayout is a common layout component

// Types based on your backend models
interface MedicineRequestItem {
  med_details: any;
  medreqitem_id: number;
  medreqitem_qty: number;
  reason: string;
  status: 'pending' | 'confirmed' | 'referred' | 'declined' | 'fulfilled';
  med: { // Direct medicine details from Medicinelist
    med_id: string;
    med_name: string;
    med_type: string;
  };
  minv_id?: { // Medicine Inventory details (if linked via inventory)
    minv_id: number;
    med_id: {
      med_id: string;
      med_name: string;
      med_type: string;
    };
  };
  medreq_id: { // Parent MedicineRequest details
    medreq_id: string;
    requested_at: string;
    status: string; // Status of the overall request
    mode: 'app' | 'walk-in';
  };
}

const fetchUserPendingMedicineItems = async (patId: string): Promise<MedicineRequestItem[]> => {
  const response = await api2.get(`/medicine/user-pending-items/?pat_id=${patId}`);
  const results = response.data.results || [];
  return results.map((item: any) => ({
    medreqitem_id: item.medreqitem_id,
    medreqitem_qty: item.medreqitem_qty,
    reason: item.reason,
    status: item.status,
    med_details: item.med_details, // Directly use med_details for medicine info
    medreq_id: {
      medreq_id: item.medreq_id || item.medreq_details.medreq_id,
      requested_at: item.medreq_details.requested_at,
      status: item.medreq_details.status || item.status,
      mode: item.medreq_details.mode || 'walk-in',
    },
  }));
};


const cancelMedicineRequestItem = async (medreqitem_id: number): Promise<void> => {
  try {
    // Use the correct endpoint for deleting a specific request item
    await api2.delete(`/medicine/delete-medicine-request-item/${medreqitem_id}/`);
  } catch (error) {
    console.error('Error canceling medicine request item:', error);
    throw error;
  }
};

// Status configuration for UI display
const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        label: 'Pending'
      };
    case 'confirmed':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        label: 'Confirmed'
      };
    case 'referred': // This status is for individual items referred to doctor
    case 'referred_to_doctor': // This status is for the overall request referred to doctor
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200',
        label: 'Referred to Doctor'
      };
    case 'declined':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        label: 'Declined'
      };
    case 'fulfilled': // This status is for individual items that have been given
    case 'completed': // This status is for the overall request that has been fulfilled
      return {
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-200',
        label: 'Fulfilled'
      };
    case 'ready_for_pickup':
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-200',
        label: 'Ready for Pickup'
      };
    default:
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        label: status
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
    minute: '2-digit'
  });
};

export const MedicineRequestTracker: React.FC = () => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'in-progress' | 'completed' | 'all'>('pending');
  // TODO: Replace with actual user ID from authentication context
  const userId = "PT20230001"; // Example Patient ID


const { data: requests, isLoading, error, refetch } = useQuery({
  queryKey: ['userPendingMedicineItems', userId],
  queryFn: () => fetchUserPendingMedicineItems(userId),
  enabled: !!userId,
});

  const filteredRequests = requests?.filter((item) => {
    const status = item.status.toLowerCase();
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return status === 'pending';
    if (activeTab === 'in-progress') return ['confirmed', 'referred', 'referred_to_doctor', 'ready_for_pickup'].includes(status);
    if (activeTab === 'completed') return ['fulfilled', 'completed', 'declined'].includes(status);
    return false;
  }) || [];


  const cancelMutation = useMutation({
  mutationFn: cancelMedicineRequestItem,
  onSuccess: () => {
    // Invalidate the correct query key for pending items
    queryClient.invalidateQueries({ queryKey: ['userPendingMedicineItems', userId] });
    Alert.alert('Success', 'Medicine request item cancelled successfully.');
  },
  onError: (error: any) => {
    console.error('Cancellation error:', error.response?.data || error.message);
    Alert.alert('Error', error.response?.data?.error || 'Failed to cancel request item. Please try again.');
  },
});

  const handleCancelRequest = (item: MedicineRequestItem) => {
  console.log('Canceling item:', {
    medreqitem_id: item.medreqitem_id,
    medreq_id: item.medreq_id.medreq_id,
    medicineName: item.med_details?.med_name,
    status: item.status,
  });
  const medicineName = item.med_details?.med_name || 'Unknown Medicine';
  Alert.alert(
    'Cancel Request Item',
    `Are you sure you want to cancel your request for ${medicineName}? This action cannot be undone.`,
    [
      { text: 'No', style: 'cancel' },
      { 
        text: 'Yes', 
        style: 'destructive',
        onPress: () => cancelMutation.mutate(item.medreqitem_id) 
      },
    ]
  );
};

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const renderRequestItem = (item: MedicineRequestItem) => {
    // Prioritize 'med' for name and type, fallback to 'minv_id.med_id'
    const medicineName = item.med_details?.med_name || 'Unknown Medicine';
    // const medicineType = item.med?.med_type || item.minv_id?.med_id?.med_type || 'Unknown Type';
    
    // Use the individual item's status for its display
    const statusConfig = getStatusConfig(item.status);
    // const StatusIcon = statusConfig.icon;
    
    // Allow cancellation only if the individual item status is 'pending'
    const canCancel = item.status === 'pending';

    return (
      <View key={item.medreqitem_id} className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden shadow-sm">
        {/* Header */}
        <View className="p-4 border-b border-gray-100">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-lg font-semibold text-gray-900 mb-1">{medicineName}</Text>
              {/* <Text className="text-sm text-gray-600">{medicineType}</Text> */}
            </View>
            <View className={`flex-row items-center px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
              {/* <StatusIcon size={14} color={statusConfig.color.replace('text-', '')} /> */}
              <Text className={`ml-1 text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View className="p-4 space-y-3">
          {/* Quantity and Request Info */}
          {/* <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Package size={16} color="#6B7280" />
              <Text className="ml-2 text-sm text-gray-700">Quantity: {item.medreqitem_qty}</Text>
            </View>
            <Text className="text-xs text-gray-500">Request ID: #{item.medreq_id.medreq_id}</Text>
          </View> */}

          {/* Date */}
          <View className="flex-row items-center">
            <Calendar size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-700">
              Requested: {formatDate(item.medreq_id.requested_at)}
            </Text>
          </View>

          {/* Reason */}
          {item.reason && (
            <View className="flex-row items-start">
              <FileText size={16} color="#6B7280" className="mt-0.5" />
              <Text className="ml-2 text-sm text-gray-700 flex-1">
                Reason: {item.reason}
              </Text>
            </View>
          )}

          {/* Mode */}
          {/* <View className="flex-row items-center">
            <View className={`px-2 py-1 rounded text-xs ${
              item.medreq_id.mode === 'app' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              <Text className="text-xs font-medium">
                {item.medreq_id.mode === 'app' ? 'Mobile App' : 'Walk-in'}
              </Text>
            </View>
          </View> */}
        </View>

        {/* Actions */}
        {canCancel && (
          <View className="px-4 pb-4">
            <TouchableOpacity
              onPress={() => handleCancelRequest(item)}
              disabled={cancelMutation.isPending}
              className="flex-row items-center justify-center bg-red-50 border border-red-200 rounded-lg py-3 px-4"
            >
              {cancelMutation.isPending ? (
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

  // Calculate summary stats based on individual item statuses
const pendingCount = requests?.filter(r => r.status.toLowerCase() === 'pending').length || 0;
  const inProgressCount = requests?.filter(r => ['confirmed', 'referred', 'referred_to_doctor', 'ready_for_pickup'].includes(r.status.toLowerCase())).length || 0;
  const completedCount = requests?.filter(r => ['fulfilled', 'completed', 'declined'].includes(r.status.toLowerCase())).length || 0;
  const totalCount = requests?.length || 0;

  const renderTabBar = () => (
    <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
       <TouchableOpacity
        onPress={() => setActiveTab('all')}
        className={`flex-1 items-center py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600' : ''}`}
      >
        <Text className={`text-sm font-medium ${activeTab === 'all' ? 'text-blue-600' : 'text-gray-600'}`}>
          All ({totalCount})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setActiveTab('pending')}
        className={`flex-1 items-center py-2 ${activeTab === 'pending' ? 'border-b-2 border-blue-600' : ''}`}
      >
        <Text className={`text-sm font-medium ${activeTab === 'pending' ? 'text-blue-600' : 'text-gray-600'}`}>
          Pending ({pendingCount})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setActiveTab('in-progress')}
        className={`flex-1 items-center py-2 ${activeTab === 'in-progress' ? 'border-b-2 border-blue-600' : ''}`}
      >
        <Text className={`text-sm font-medium ${activeTab === 'in-progress' ? 'text-blue-600' : 'text-gray-600'}`}>
          To pick-up ({inProgressCount})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setActiveTab('completed')}
        className={`flex-1 items-center py-2 ${activeTab === 'completed' ? 'border-b-2 border-blue-600' : ''}`}
      >
        <Text className={`text-sm font-medium ${activeTab === 'completed' ? 'text-blue-600' : 'text-gray-600'}`}>
          Completed ({completedCount})
        </Text>
      </TouchableOpacity>
     
    </View>
  );

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {!requests || requests.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6 py-20">
            <Package size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No requests found</Text>
            <Text className="text-gray-600 text-center mt-2 mb-8">
              You haven't made any medicine requests yet. Start by requesting the medicines you need.
            </Text>
            {/* Optional: Button to navigate to medicine request form */}
            <TouchableOpacity
              onPress={() => router.push('/medicine-request/med-request')}
              className="bg-blue-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Request Medicine</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-4">
            {/* Summary Stats */}
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Request Summary</Text>
              <View className="flex-row justify-between">
                <TouchableOpacity onPress={() => setActiveTab('pending')} className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-yellow-600">{pendingCount}</Text>
                  <Text className="text-sm text-gray-600">Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('in-progress')} className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-green-600">{inProgressCount}</Text>
                  <Text className="text-sm text-gray-600">To pick-up</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('completed')} className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-purple-600">{completedCount}</Text>
                  <Text className="text-sm text-gray-600">Completed</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* New Tab Bar */}
            {renderTabBar()}

        <View className="space-y-4 mt-4">
              {filteredRequests.length === 0 ? (
                <View className="flex-1 justify-center items-center py-10">
                  <Text className="text-gray-600 text-center">No requests in this category.</Text>
                </View>
              ) : (
                filteredRequests.map(renderRequestItem)
              )}
            </View>
            {/* Bottom padding */}
            <View className="h-6" />
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
};

export default MedicineRequestTracker;
