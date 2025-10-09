import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, RefreshControl, Alert, Modal, TextInput, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, XCircle, RefreshCw, Trash2, Search, Calendar, AlertCircle, Plus } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api2 } from '@/api/api';
import PageLayout from '@/screens/_PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/ui/loading-state';
import { formatDate } from '@/helpers/dateHelpers';
import { addDays, differenceInDays } from 'date-fns';

// Types
interface AppointmentItem {
  id: number;
  chief_complaint: string;
  scheduled_date: string;
  meridiem: string;
  status: string;
  created_at: string;
  archive_reason?: string | null;
}

type TabType = "pending" | "confirmed" | "completed" | "cancelled";

// API Functions
const fetchUserAppointments = async (rpId: string): Promise<AppointmentItem[]> => {
  if (!rpId) {
    throw new Error('User ID is required');
  }
  
  const response = await api2.get(`/medical-consultation/user-appointments/?rp_id=${rpId}&include_archived=true`);
  
  const results = response.data.results || response.data;
  
  if (!Array.isArray(results)) {
    throw new Error('Invalid response format from server');
  }
  
  console.log('API Response (Appointments):', results);
  
  return results.map((item: any) => ({
    id: item.id,
    chief_complaint: item.chief_complaint || 'No complaint provided',
    scheduled_date: item.scheduled_date,
    meridiem: item.meridiem,
    status: item.status,
    created_at: item.created_at,
    archive_reason: item.archive_reason || null,
  }));
};

const cancelAppointment = async (appointment_id: number, reason: string): Promise<void> => {
  try {
    await api2.patch(`/medical-consultation/cancel-appointment/${appointment_id}/`, { 
      archive_reason: reason 
    });
  } catch (error) {
    console.error('Error canceling appointment:', error);
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
        color: 'text-blue-700', 
        bgColor: 'bg-blue-100', 
        borderColor: 'border-blue-200', 
        label: 'Confirmed' 
      };
    case 'completed':
      return { 
        color: 'text-green-700', 
        bgColor: 'bg-green-100', 
        borderColor: 'border-green-200', 
        label: 'Completed' 
      };
    case 'cancelled':
      return { 
        color: 'text-red-700', 
        bgColor: 'bg-red-100', 
        borderColor: 'border-red-200', 
        label: 'Cancelled' 
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
  counts: { pending: number; confirmed: number; completed: number; cancelled: number };
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
      onPress={() => setActiveTab('confirmed')}
      className={`flex-1 items-center py-3 ${activeTab === 'confirmed' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'confirmed' ? 'text-blue-600' : 'text-gray-600'}`}>
        Confirmed ({counts.confirmed})
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

const AppointmentCard: React.FC<{
  item: AppointmentItem;
  onCancel: () => void;
  isCancelPending: boolean;
}> = ({ item, onCancel, isCancelPending }) => {
  const canCancel = item.status.toLowerCase() === 'pending';
  
  return (
    <View className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden shadow-sm">
      {/* Header */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
                <Calendar color="white" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-lg text-gray-900">
                  {item.chief_complaint}
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
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Calendar size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-700">
              {formatDate(item.scheduled_date)} - {item.meridiem}
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center">
          <AlertCircle size={16} color="#6B7280" />
          <Text className="ml-2 text-sm text-gray-700">
            Requested on: {formatDate(item.created_at)}
          </Text>
        </View>

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
              {isCancelPending ? 'Cancelling...' : 'Cancel Appointment'}
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
  item: AppointmentItem | null;
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
          <Text className="text-lg font-semibold text-gray-900 mb-2">Cancel Appointment</Text>
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

const AppointmentTracker = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [selectedItem, setSelectedItem] = useState<AppointmentItem | null>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const rpId = user?.rp;

  const { data: appointments = [], isLoading: isFetching, error } = useQuery<AppointmentItem[]>({
    queryKey: ['userAppointments', rpId],
    queryFn: () => fetchUserAppointments(rpId || ''),
    enabled: !!rpId,
    staleTime: 5 * 60 * 1000,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ appointment_id, reason }: { appointment_id: number; reason: string }) => 
      cancelAppointment(appointment_id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAppointments'] });
      setShowCancelModal(false);
      setCancellationReason('');
      setSelectedItem(null);
      Alert.alert('Success', 'Appointment cancelled successfully.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to cancel appointment. Please try again.');
    },
  });

  const groupedAppointments = useMemo(() => {
    return appointments.reduce((acc: Record<TabType, AppointmentItem[]>, item) => {
      let tab: TabType;
      switch (item.status.toLowerCase()) {
        case 'pending':
          tab = 'pending';
          break;
        case 'confirmed':
          tab = 'confirmed';
          break;
        case 'completed':
          tab = 'completed';
          break;
        case 'cancelled': case 'rejected':
          tab = 'cancelled';
          break;
        default:
          tab = 'pending';
      }
      if (!acc[tab]) acc[tab] = [];
      acc[tab].push(item);
      return acc;
    }, { pending: [], confirmed: [], completed: [], cancelled: [] });
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    let result = groupedAppointments[activeTab];

    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.chief_complaint?.toLowerCase().includes(lowerSearch) ||
        item.scheduled_date.toLowerCase().includes(lowerSearch) ||
        item.meridiem.toLowerCase().includes(lowerSearch)
      );
    }

    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [groupedAppointments, activeTab, searchQuery]);

  const counts = useMemo(() => ({
    pending: groupedAppointments.pending.length,
    confirmed: groupedAppointments.confirmed.length,
    completed: groupedAppointments.completed.length,
    cancelled: groupedAppointments.cancelled.length,
  }), [groupedAppointments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['userAppointments'] });
    setRefreshing(false);
  };

  const isWithinCancellationPeriod = (scheduledDate: string): boolean => {
    const appointmentDate = new Date(scheduledDate);
    const today = new Date();
    const daysUntilAppointment = differenceInDays(appointmentDate, today);
    return daysUntilAppointment < 2;
  };

  const handleCancelPress = (item: AppointmentItem) => {
    if (isWithinCancellationPeriod(item.scheduled_date)) {
      Alert.alert(
        'Cancellation Not Allowed',
        'Appointments cannot be cancelled within 2 days of the scheduled date.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedItem(item);
    setShowCancelModal(true);
  };

  if (isFetching) {
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
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">My Appointments</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <XCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading appointments</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">
            Failed to load your appointments. Please check your connection and try again.
          </Text>
          <TouchableOpacity onPress={onRefresh} className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg">
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
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Medical Consultation Appointments</Text>}
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center p-3 border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search appointments..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

        {/* Reminder */}
        {activeTab === 'pending' && (
          <View className="bg-blue-50 border-l-4 border-blue-400 px-4 py-3 mx-4 my-2 rounded-xl">
            <Text className="text-blue-800 text-sm font-medium">
              Note: Appointments cannot be cancelled within 2 days of the scheduled date.
            </Text>
          </View>
        )}
        {activeTab === 'confirmed' && (
          <View className="bg-blue-50 border-l-4 border-blue-400 px-4 py-3 mx-4 my-2 rounded-xl">
            <Text className="text-blue-800 text-sm font-medium">
              Reminder: Appointments are at the Barangay Health Center. Arrive 15 minutes early.
            </Text>
          </View>
        )}

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Calendar size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No appointments found</Text>
            <Text className="text-gray-600 text-center mt-2 mb-8">
              Start by scheduling a medical consultation.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredAppointments}
            keyExtractor={(item) => `appointment-${item.id}`}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={21}
            renderItem={({ item }) => (
              <AppointmentCard
                item={item}
                onCancel={() => handleCancelPress(item)}
                isCancelPending={cancelMutation.isPending}
              />
            )}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-20">
                <Calendar size={48} color="#D1D5DB" />
                <Text className="text-gray-600 text-lg font-semibold mb-2 mt-4">No appointments in this category</Text>
                <Text className="text-gray-500 text-center">
                  {searchQuery
                    ? `No ${activeTab} appointments match your search.`
                    : `No ${activeTab} appointments found.`}
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
              appointment_id: selectedItem.id,
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

export default AppointmentTracker;