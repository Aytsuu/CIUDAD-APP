import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, RefreshControl, Alert, Modal, TextInput, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, XCircle, Package, RefreshCw, Trash2, Search, Pill, Calendar, FileText, AlertCircle } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api2 } from '@/api/api';
import PageLayout from '@/screens/_PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/ui/loading-state';
import { formatDate } from '@/helpers/dateHelpers';
import { useDebounce } from '@/hooks/use-debounce';
import { PaginationControls } from '../admin/components/pagination-layout';

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

type TabType = "pending" | "cancelled" | "confirmed" | "completed";

const getUserMedicineRequests = async (
  userId: string,
  isResident: boolean,
  params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
  }
): Promise<{ count: number; next: string | null; previous: string | null; results: MedicineRequestItem[] }> => {
  const endpoint = isResident ? '/medicine/user-all-items/' : '/medicine/user-pending-items/';
  const userParam = isResident ? `rp_id=${userId}` : `pat_id=${userId}`;

  const response = await api2.get(`${endpoint}?${userParam}`, {
    params: { ...params, include_archived: true }
  });

  const results = response.data.results || [];

  // More robust data transformation
  return {
    count: response.data.count || 0,
    next: response.data.next || null,
    previous: response.data.previous || null,
    results: results.map((item: any) => {
      let normalizedStatus = item.status?.toLowerCase() || 'pending';

      if (['rejected', 'declined', 'cancelled'].includes(normalizedStatus)) normalizedStatus = 'cancelled';
      if (['fulfilled', 'completed'].includes(normalizedStatus)) normalizedStatus = 'completed';
      if (['confirmed', 'ready_for_pickup'].includes(normalizedStatus)) normalizedStatus = 'confirmed';
      if (['pending', 'referred_to_doctor'].includes(normalizedStatus)) normalizedStatus = 'pending';

      return {
        medreqitem_id: item.medreqitem_id,
        medreqitem_qty: item.medreqitem_qty,
        reason: item.reason,
        status: normalizedStatus, // Use normalized status
        archive_reason: item.archive_reason || null,
        med_details: item.med_details || (item.med?.med_name ? {
          med_id: item.med?.med_id,
          med_name: item.med?.med_name || item.med_details?.med_name,
          med_type: item.med?.med_type
        } : undefined),
        medreq_id: item.medreq_id || item.medreq_details?.medreq_id,
        requested_at: item.medreq_details?.requested_at || item.requested_at,
        mode: item.medreq_details?.mode || 'walk-in',
      }
    })
  };
};

const cancelMedicineRequestItem = async (medreqitem_id: number, reason: string): Promise<void> => {
  try {
    await api2.patch(`/medicine/cancel-medicine-request-item/${medreqitem_id}/`, { archive_reason: reason });
  } catch (error) {
    console.error('Error canceling medicine request item:', error);
    throw error;
  }
};

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
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center mr-3">
                <Pill color="white" size={14} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-lg text-gray-900">
                  {medicineName}
                </Text>
              </View>
            </View>
          </View>
          <View className="items-end">
            <StatusBadge status={item.status} />
          </View>
        </View>
      </View>

      {/* Details */}
      <View className="p-4 space-y-3">
        <View className="flex-row items-center">
          <Calendar size={16} color="#6B7280" />
          <Text className="ml-2 text-sm text-gray-600">
            Requested on {formatDate(item.requested_at)}
          </Text>
        </View>

        {item.reason && (
          <View className="flex-row items-start">
            <FileText size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600 flex-1">
              Reason: {item.reason}
            </Text>
          </View>
        )}
        {item.archive_reason && (
          <View className="flex-row items-start">
            <AlertCircle size={16} color="#EF4444" />
            <Text className="ml-2 text-sm text-red-600 flex-1">
              Cancel Reason: {item.archive_reason}
            </Text>
          </View>
        )}
      </View>

      {/* Footer for Cancellable Items */}
      {canCancel && (
        <View className="border-t border-gray-100">
          <TouchableOpacity
            onPress={onCancel}
            disabled={isCancelPending}
            className="flex-row items-center justify-center py-3"
          >
            <Trash2 size={16} color="#EF4444" />
            <Text className="ml-2 text-sm font-medium text-red-600">
              Cancel Request
            </Text>
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
}> = ({ visible, item, cancellationReason, setCancellationReason, onConfirm, onClose, isPending }) => {
  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-xl p-6 w-full max-w-md">
          <View className="flex-row items-center mb-4">
            <AlertCircle size={24} color="#EF4444" />
            <Text className="ml-2 text-xl font-semibold text-gray-900">
              Cancel Request
            </Text>
          </View>
          <Text className="text-gray-600 mb-4">
            Are you sure you want to cancel your request for {item.med_details?.med_name || 'this medicine'}?
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-800"
            placeholder="Please provide a reason for cancellation..."
            placeholderTextColor="#9CA3AF"
            value={cancellationReason}
            onChangeText={setCancellationReason}
            multiline
            numberOfLines={3}
          />
          <View className="flex-row justify-end space-x-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-gray-100"
            >
              <Text className="text-gray-700 font-medium">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-red-600 flex-row items-center"
            >
              {isPending && <RefreshCw size={16} color="white" className="animate-spin mr-2" />}
              <Text className="text-white font-medium">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const MedicineRequestTracker: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;  // Assuming this was defined; adjust as needed
  const [refreshing, setRefreshing] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MedicineRequestItem | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const isResident = true;  // Adjust based on your logic; assuming resident for example

  // Define getStatusForTab (was missing in provided code)
  const getStatusForTab = (tab: TabType) => tab;

  const { data, isLoading: dataLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['userMedicineRequests', user?.rp, isResident, { page: currentPage, page_size: pageSize, search: debouncedSearchQuery, status: getStatusForTab(activeTab) }],
    queryFn: () => getUserMedicineRequests(user?.rp || '', isResident, {
      page: currentPage,
      page_size: pageSize,
      search: debouncedSearchQuery,
      status: getStatusForTab(activeTab),
    }),
    enabled: !!user?.rp && isAuthenticated,
    staleTime: 0, // always considered stale
    refetchInterval: 3000, // every 3 seconds (adjust as needed)
    refetchIntervalInBackground: true, // keeps polling even if tab is inactive
  });

  const requests = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Add local filtering as a safety net until backend filtering is implemented
  // This ensures items are only shown in the correct tab based on normalized status
  const filteredRequests = useMemo(() => {
    return requests.filter(item => item.status === activeTab);
  }, [requests, activeTab]);

  // Remove counts hook as per request; tabs now without counts
  // If needed later, re-add after backend fixes

  // Handle page change with reset if search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, activeTab]);

  const cancelMutation = useMutation({
    mutationFn: ({ medreqitem_id, reason }: { medreqitem_id: number; reason: string }) =>
      cancelMedicineRequestItem(medreqitem_id, reason),
    onSuccess: () => {
      setShowCancelModal(false);
      setCancellationReason('');
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ['userMedicineRequests'] });
      Alert.alert('Success', 'Request cancelled successfully.');
    },
    onError: (err: any) => Alert.alert('Error', `Failed to cancel: ${err.message}`),
  });

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
  if (authLoading || dataLoading) {  // Removed isCountsLoading
    return <LoadingState />;
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
          <View className="flex-row items-center p-1 border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Results Info */}
        {/* NOTE: This may show inaccurate totalCount until backend filters by status/search. For now, using filtered length for "Showing" */}


        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />  {/* No counts */}
        <View className="px-4 flex-row items-center justify-between py-3 bg-white border-b border-gray-200">
          <Text className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} requests
          </Text>
          <Text className="text-sm font-medium text-gray-800">
            Page {currentPage} of {totalPages}
          </Text>
        </View>
        {/* Reminder for Pending Tab */}
        {activeTab === 'pending' && (
          <View className="bg-blue-50 border-l-4 border-blue-400 px-4 py-3 mx-4 my-2 rounded-xl">
            <Text className="text-blue-800 text-sm font-medium">
              Cancellation is only possible for requests that are currently pending.
              Once the status changes, you won't be able to cancel.
            </Text>
          </View>
        )}

        {/* Reminder for To Pick Up Tab */}
        {activeTab === 'confirmed' && (
          <View className="bg-blue-50 border-l-4 border-blue-400 px-4 py-3 mx-4 my-2 rounded-xl">
            <Text className="text-blue-800 text-sm font-medium">
              Reminder: Medicines are available for pickup at the Barangay Health Center
              every weekdays, 8:00 AM - 5:00 PM only.
            </Text>
          </View>
        )}

        {/* Requests List */}
        {filteredRequests.length === 0 ? (  // Use filteredRequests
          <View className="flex-1 justify-center items-center px-6">
            <Package size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No requests found</Text>
            <Text className="text-gray-600 text-center mt-2 mb-8">
              {searchQuery || activeTab !== 'pending'
                ? "No requests match your current filters."
                : "Start by requesting medicines you need."}
            </Text>
            {!searchQuery && activeTab === 'pending' && (
              <TouchableOpacity
                onPress={() => router.push('/medicine-request/med-request')}
                className="bg-blue-600 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-medium">Request Medicine</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredRequests}
            keyExtractor={(item) => `medicine-request-${item.medreqitem_id}`}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3B82F6']}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1, // Ensure the FlatList takes up available space
              padding: 16,
              minHeight: '100%', // Ensure the container has enough height to be scrollable
            }}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center px-6 py-12">
                <Package size={64} color="#9CA3AF" />
                <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
                  No requests found
                </Text>
                <Text className="text-gray-600 text-center mt-2 mb-8">
                  {searchQuery || activeTab !== 'pending'
                    ? "No requests match your current filters."
                    : "Start by requesting medicines you need."}
                </Text>
                {!searchQuery && activeTab === 'pending' && (
                  <TouchableOpacity
                    onPress={() => router.push('/medicine-request/med-request')}
                    className="bg-blue-600 px-6 py-3 rounded-lg"
                  >
                    <Text className="text-white font-medium">Request Medicine</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
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
            ListFooterComponent={
              filteredRequests.length > 0 && totalPages > 1 ? (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              ) : isFetching ? (
                <View className="py-4 items-center">
                  <RefreshCw size={20} color="#3B82F6" className="animate-spin" />
                </View>
              ) : null
            }
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