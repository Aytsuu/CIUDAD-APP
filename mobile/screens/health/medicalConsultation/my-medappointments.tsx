import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, RefreshControl, Alert, Modal, TextInput, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, XCircle, RefreshCw, Trash2, Search, Calendar, AlertCircle, ChevronRight, ChevronLeft as ChevronLeftIcon } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api2 } from '@/api/api';
import PageLayout from '@/screens/_PageLayout';
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/ui/loading-state';
import { formatDate } from '@/helpers/dateHelpers';
import { differenceInDays } from 'date-fns';
import { AppointmentItem, useUserAppointments, cancelAppointment } from './queries/fetch'; // Make sure cancelAppointment is imported

// Types
type TabType = "pending" | "confirmed" | "completed" | "cancelled" | "referred";

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
    case 'rejected':
      return { 
        color: 'text-red-700', 
        bgColor: 'bg-red-100', 
        borderColor: 'border-red-200', 
        label: 'Cancelled' 
      };
    case 'referred':
      return { 
        color: 'text-purple-700', 
        bgColor: 'bg-purple-100', 
        borderColor: 'border-purple-200', 
        label: 'Referred' 
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

// Convert tab to backend status parameter
const getStatusParam = (tab: TabType): string => {
  const statusMap: Record<TabType, string> = {
    'pending': 'pending',
    'confirmed': 'confirmed',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'referred': 'referred'
  };
  return statusMap[tab];
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
  counts: { pending: number; confirmed: number; completed: number; cancelled: number; referred: number };
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
    <TouchableOpacity
      onPress={() => setActiveTab('referred')}
      className={`flex-1 items-center py-3 ${activeTab === 'referred' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'referred' ? 'text-blue-600' : 'text-gray-600'}`}>
        Referred ({counts.referred})
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
              Reason: {item.archive_reason}
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

// Enhanced Cancel Modal Component
const CancelModal: React.FC<{
  visible: boolean;
  item: AppointmentItem | null;
  cancellationReason: string;
  setCancellationReason: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
  error?: string | null;
}> = ({ visible, item, cancellationReason, setCancellationReason, onConfirm, onClose, isPending, error }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 p-4">
        <View className="bg-white rounded-lg w-full max-w-md p-6">
          <Text className="text-lg font-semibold text-gray-900 mb-2">Cancel Appointment</Text>
          
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}
          
          <Text className="text-sm text-gray-600 mb-4">
            Are you sure you want to cancel this appointment? 
            <Text className="font-bold text-red-700"> This action cannot be undone.</Text>
          </Text>
          
          <Text className="text-sm text-gray-700 mb-2 font-medium">Cancellation Reason:</Text>
          <TextInput
            value={cancellationReason}
            onChangeText={setCancellationReason}
            placeholder="Please provide a reason for cancellation..."
            multiline
            className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4 text-sm"
            style={{ height: 80, textAlignVertical: 'top' }}
            editable={!isPending}
          />
          
          <View className="flex-row justify-end space-x-2">
            <TouchableOpacity 
              onPress={onClose} 
              disabled={isPending}
              className="px-4 py-2 rounded-md border border-gray-300"
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={!cancellationReason.trim() || isPending}
              className="bg-red-500 px-4 py-2 rounded-md disabled:opacity-50"
            >
              <Text className="text-white font-medium">
                {isPending ? 'Cancelling...' : 'Confirm Cancellation'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Pagination Controls Component
const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <View className="flex-row justify-center items-center p-4 border-t border-gray-200 bg-white">
      <TouchableOpacity 
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex-row items-center px-4 py-2 rounded-lg mx-1 ${currentPage === 1 ? 'bg-gray-100' : 'bg-gray-200'}`}
      >
        <ChevronLeftIcon size={16} color={currentPage === 1 ? '#9CA3AF' : '#374151'} />
        <Text className={`ml-1 ${currentPage === 1 ? 'text-gray-500' : 'text-gray-700'}`}>Previous</Text>
      </TouchableOpacity>
      
      <Text className="mx-4 text-gray-700">
        Page {currentPage} of {totalPages}
      </Text>
      
      <TouchableOpacity 
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex-row items-center px-4 py-2 rounded-lg mx-1 ${currentPage === totalPages ? 'bg-gray-100' : 'bg-gray-200'}`}
      >
        <Text className={`mr-1 ${currentPage === totalPages ? 'text-gray-500' : 'text-gray-700'}`}>Next</Text>
        <ChevronRight size={16} color={currentPage === totalPages ? '#9CA3AF' : '#374151'} />
      </TouchableOpacity>
    </View>
  );
};

const AppointmentTracker = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [selectedItem, setSelectedItem] = useState<AppointmentItem | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const rpId = user?.rp;
  const pageSize = 10;

  // Debounce search to avoid too many API calls
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch]);

  const { data: appointmentsData, isLoading: isFetching, error, refetch } = useUserAppointments(
    rpId || '',
    getStatusParam(activeTab),
    debouncedSearch || undefined,
    currentPage,
    pageSize
  );

  const appointments = appointmentsData?.results || [];
  const totalCount = appointmentsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const cancelMutation = useMutation({
    mutationFn: ({ appointment_id, reason }: { appointment_id: number; reason: string }) => 
      cancelAppointment(appointment_id, reason),
    onSuccess: () => {
      console.log('Appointment cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['userAppointments'] });
      setShowCancelModal(false);
      setCancellationReason('');
      setSelectedItem(null);
      setCancelError(null);
      Alert.alert('Success', 'Appointment cancelled successfully.');
    },
    onError: (error: any) => {
      console.error('Cancel appointment error:', error);
      
      let errorMessage = 'Failed to cancel appointment. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        console.log('Error details:', { status, data });
        
        if (status === 400) {
          errorMessage = data.detail || data.error || 'Invalid request. Please check your input.';
        } else if (status === 404) {
          errorMessage = 'Appointment not found. It may have been already cancelled.';
        } else if (status === 403) {
          errorMessage = 'You are not authorized to cancel this appointment.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (data.detail) {
          errorMessage = data.detail;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      setCancelError(errorMessage);
    },
  });

  // Get counts for each tab
  const { data: allAppointmentsData } = useUserAppointments(
    rpId || '',
    undefined, // No status filter
    undefined, // No search
    1, // First page only for counts
    1000 // Large page size to get all counts
  );

  const counts = {
    pending: allAppointmentsData?.results.filter(a => a.status === 'pending').length || 0,
    confirmed: allAppointmentsData?.results.filter(a => a.status === 'confirmed').length || 0,
    completed: allAppointmentsData?.results.filter(a => a.status === 'completed').length || 0,
    cancelled: allAppointmentsData?.results.filter(a => ['cancelled', 'rejected'].includes(a.status)).length || 0,
    referred: allAppointmentsData?.results.filter(a => a.status === 'referred').length || 0,
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['userAppointments'] });
    setRefreshing(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const isWithinCancellationPeriod = (scheduledDate: string): boolean => {
    try {
      const appointmentDate = new Date(scheduledDate);
      const today = new Date();
      const daysUntilAppointment = differenceInDays(appointmentDate, today);
      return daysUntilAppointment < 2;
    } catch (error) {
      console.error('Error calculating cancellation period:', error);
      return false;
    }
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
    setCancelError(null);
    setCancellationReason('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (!cancellationReason.trim()) {
      setCancelError('Please provide a cancellation reason.');
      return;
    }
    if (selectedItem) {
      cancelMutation.mutate({
        appointment_id: selectedItem.id,
        reason: cancellationReason.trim(),
      });
    }
  };

  const handleCloseModal = () => {
    setShowCancelModal(false);
    setCancellationReason('');
    setSelectedItem(null);
    setCancelError(null);
  };

  if (isFetching && !refreshing) {
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
              Reminder: Arrive on time at the Barangay Health Center.
            </Text>
          </View>
        )}
        {activeTab === 'referred' && (
          <View className="bg-purple-50 border-l-4 border-purple-400 px-4 py-3 mx-4 my-2 rounded-xl">
            <Text className="text-purple-800 text-sm font-medium">
              Note: Referred appointments require follow-up with the designated specialist or facility.
            </Text>
          </View>
        )}

        {/* Appointments List */}
        <View className="flex-1">
          <FlatList
            data={appointments}
            keyExtractor={(item) => `appointment-${item.id}-${currentPage}`}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
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
                <Text className="text-gray-600 text-lg font-semibold mb-2 mt-4">No appointments found</Text>
                <Text className="text-gray-500 text-center">
                  {searchQuery || activeTab !== 'pending'
                    ? `No ${activeTab} appointments match your search.`
                    : 'Start by scheduling a medical consultation.'}
                </Text>
              </View>
            )}
          />
          
          {/* Pagination Controls */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </View>
      </View>

      {/* Cancel Modal */}
      <CancelModal
        visible={showCancelModal}
        item={selectedItem}
        cancellationReason={cancellationReason}
        setCancellationReason={setCancellationReason}
        onConfirm={handleConfirmCancel}
        onClose={handleCloseModal}
        isPending={cancelMutation.isPending}
        error={cancelError}
      />
    </PageLayout>
  );
};

export default AppointmentTracker;