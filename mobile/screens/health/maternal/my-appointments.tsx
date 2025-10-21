import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl, Modal, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Calendar, Clock, CheckCircle, XCircle, AlertCircle, X } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { usePrenatalAppointmentRequests } from "./queries/fetch";
import { useCancelPrenatalAppointment } from "./queries/update";
import PageLayout from "@/screens/_PageLayout";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

export default function MyPrenatalAppointments() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected'>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Cancel dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");

  const rp_id = user?.rp || "";
  const { pat_id } = useAuth();
  
  const { data: appointmentData, isLoading, isError, refetch } = usePrenatalAppointmentRequests(rp_id);
  const { mutate: cancelAppointment, isPending: isCancelling } = useCancelPrenatalAppointment();

  const appointments = appointmentData?.requests || [];
  const statusCounts = appointmentData?.status_counts || {
    pending: 0,
    approved: 0,
    cancelled: 0,
    completed: 0,
    rejected: 0
  };

  // Refresh functionality
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing appointments:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Status badge component
  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
        return (
          <View className="flex-row items-center bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-full">
            <Clock size={12} color="#d97706" />
            <Text className="ml-1 text-xs font-medium text-yellow-700">Pending</Text>
          </View>
        );
      case 'approved':
        return (
          <View className="flex-row items-center bg-green-50 border border-green-200 px-2 py-1 rounded-full">
            <CheckCircle size={12} color="#059669" />
            <Text className="ml-1 text-xs font-medium text-green-700">Approved</Text>
          </View>
        );
      case 'completed':
        return (
          <View className="flex-row items-center bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">
            <CheckCircle size={12} color="#2563eb" />
            <Text className="ml-1 text-xs font-medium text-blue-700">Completed</Text>
          </View>
        );
      case 'cancelled':
        return (
          <View className="flex-row items-center bg-red-50 border border-red-200 px-2 py-1 rounded-full">
            <XCircle size={12} color="#dc2626" />
            <Text className="ml-1 text-xs font-medium text-red-700">Cancelled</Text>
          </View>
        );
      case 'rejected':
        return (
          <View className="flex-row items-center bg-red-50 border border-red-200 px-2 py-1 rounded-full">
            <AlertCircle size={12} color="#dc2626" />
            <Text className="ml-1 text-xs font-medium text-red-700">Rejected</Text>
          </View>
        );
      default:
        return (
          <View className="flex-row items-center bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">
            <Text className="text-xs font-medium text-gray-700">{status}</Text>
          </View>
        );
    }
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Open cancel dialog
  const openCancelDialog = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCancelReason("");
    setShowCancelDialog(true);
  };

  // Close cancel dialog
  const closeCancelDialog = () => {
    setShowCancelDialog(false);
    setSelectedAppointment(null);
    setCancelReason("");
  };

  // Confirm cancellation
  const confirmCancelAppointment = () => {
    if (!cancelReason.trim()) {
      Alert.alert("Required", "Please provide a reason for cancellation.");
      return;
    }

    if (!selectedAppointment) return;

    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    cancelAppointment(
      {
        par_id: selectedAppointment.par_id.toString(),
        updateData: {
          cancelled_at: currentDate,
          status: 'cancelled',
          reason: cancelReason.trim()
        }
      },
      {
        onSuccess: () => {
          closeCancelDialog();
          Alert.alert(
            "Success", 
            "Your appointment has been cancelled successfully.",
            [{ text: "OK" }]
          );
          refetch(); // Refresh the appointments list
        },
        onError: (error: any) => {
          console.error("Cancel appointment error:", error);
          Alert.alert(
            "Error", 
            "Failed to cancel appointment. Please try again or contact support.",
            [{ text: "OK" }]
          );
        }
      }
    );
  };

  // Filter appointments based on status
  const filteredAppointments = appointments.filter((appointment: any) => {
    if (statusFilter === 'all') return true;
    return appointment.status.toLowerCase() === statusFilter;
  });

  // Show authentication loading
  if (authLoading) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">My Appointments</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 text-base mt-4">Loading...</Text>
        </View>
      </PageLayout>
    );
  }

  // Show data loading
  if (isLoading) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">My Appointments</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 text-base mt-4">Loading appointments...</Text>
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
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">My Appointments</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView 
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />
        }
      >
        {/* Status Filter Tabs */}
        <View className="bg-white rounded-lg p-1 mb-4 shadow-sm border border-gray-200">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4 }}
          >
            {[
              { key: 'all', label: 'All', count: appointments.length },
              { key: 'pending', label: 'Pending', count: statusCounts.pending },
              { key: 'approved', label: 'Approved', count: statusCounts.approved },
              { key: 'completed', label: 'Completed', count: statusCounts.completed },
              { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
              { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setStatusFilter(tab.key as any)}
                className={`px-4 py-2 mx-1 rounded-md ${
                  statusFilter === tab.key ? 'bg-blue-100 border border-blue-300' : 'bg-transparent'
                }`}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-sm font-medium ${
                    statusFilter === tab.key ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Error State */}
        {isError && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <Text className="text-red-800 text-sm">Failed to load appointments. Please try again.</Text>
          </View>
        )}

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center border border-gray-200">
            <Calendar size={48} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
              {statusFilter === 'all' ? 'No appointments found' : `No ${statusFilter} appointments`}
            </Text>
            <Text className="text-gray-600 text-center mt-2 mb-4">
              {statusFilter === 'all' 
                ? "You haven't made any prenatal appointment requests yet." 
                : `You don't have any ${statusFilter} appointments.`
              }
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-lg"
              onPress={() => router.push('/(health)/maternal/bookingpage')}
            >
              <Text className="text-white font-medium">Book New Appointment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-3">
            {filteredAppointments.map((appointment: any, index: number) => (
              <View key={appointment.par_id || index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-lg">Prenatal Appointment</Text>
                    <Text className="text-gray-600 text-sm mt-1">Request No: {appointment.par_id}</Text>
                  </View>
                  {getStatusBadge(appointment.status)}
                </View>

                <View className="space-y-2 gap-2">
                  <View className="flex-row items-center">
                    <Calendar size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">
                      Requested: {formatDate(appointment.requested_at)}
                    </Text>
                  </View>

                   <View className="flex-row items-center">
                    <Calendar size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">
                      Date of appointment: {formatDate(appointment.requested_date)}
                    </Text>
                  </View>


                  {appointment.approved_at && (
                    <View className="flex-row items-center">
                      <CheckCircle size={16} color="#059669" />
                      <Text className="text-gray-600 text-sm ml-2">
                        Approved: {formatDate(appointment.approved_at)}
                      </Text>
                    </View>
                  )}

                  {appointment.completed_at && (
                    <View className="flex-row items-center">
                      <CheckCircle size={16} color="#2563eb" />
                      <Text className="text-gray-600 text-sm ml-2">
                        Completed: {formatDate(appointment.completed_at)}
                      </Text>
                    </View>
                  )}

                  {appointment.cancelled_at && (
                    <View className="flex-row items-center">
                      <XCircle size={16} color="#dc2626" />
                      <Text className="text-gray-600 text-sm ml-2">
                        Cancelled: {formatDate(appointment.cancelled_at)}
                      </Text>
                    </View>
                  )}

                  {appointment.rejected_at && (
                    <View className="flex-row items-center">
                      <AlertCircle size={16} color="#dc2626" />
                      <Text className="text-gray-600 text-sm ml-2">
                        Rejected: {formatDate(appointment.rejected_at)}
                      </Text>
                    </View>
                  )}

                  {appointment.reason && (
                    <View className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <Text className="text-gray-700 text-sm">
                        <Text className="font-medium">Reason: </Text>
                        {appointment.reason}
                      </Text>
                    </View>
                  )}
                </View>

                {appointment.status.toLowerCase() === 'pending' && (
                  <View className="flex-row space-x-2 mt-3">
                    <TouchableOpacity
                      className={`flex-1 py-3 px-4 rounded-lg ${
                        isCancelling
                          ? 'bg-gray-100 border border-gray-300'
                          : 'bg-red-500 border border-red-300'
                      }`}
                      disabled={isCancelling}
                      onPress={() => openCancelDialog(appointment)}
                    >
                      {isCancelling ? (
                        <View className="flex-row items-center justify-center">
                          <ActivityIndicator size="small" color="#6B7280" />
                          <Text className="text-gray-600 text-center font-medium ml-2">Cancelling...</Text>
                        </View>
                      ) : (
                        <Text className="text-white text-center font-medium">Cancel</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Footer info */}
        <View className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Text className="text-blue-800 font-medium mb-2">📋 Appointment Information</Text>
          <Text className="text-blue-700 text-sm">
            • Please arrive 15 minutes early{'\n'}
            • Bring necessary documents and previous medical records{'\n'}
            • Contact the health center for any concerns{'\n'}
            • Cancellations must be made at least 2-3 days in advance
          </Text>
        </View>
      </ScrollView>

      {/* Cancel Appointment Dialog */}
      <Modal
        visible={showCancelDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={closeCancelDialog}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            {/* Header */}
            <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
              <Text className="text-xl font-semibold text-gray-900">Cancel Appointment</Text>
              <TouchableOpacity
                onPress={closeCancelDialog}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="p-5">
              <View className="flex-row items-center bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <AlertCircle size={20} color="#D97706" />
                <Text className="text-yellow-800 text-sm ml-2 flex-1">
                  Are you sure you want to cancel this appointment?
                </Text>
              </View>

              <Text className="text-gray-700 font-medium mb-2">
                Reason for Cancellation <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-gray-900 min-h-[100px] text-base"
                placeholder="Please provide a reason for cancelling this appointment..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={cancelReason}
                onChangeText={setCancelReason}
                maxLength={500}
              />
              <Text className="text-gray-500 text-xs mt-1 text-right">
                {cancelReason.length}/500 characters
              </Text>
            </View>

            {/* Actions */}
            <View className="flex-row p-5 border-t border-gray-200 space-x-3 gap-3">
              <TouchableOpacity
                className="flex-1 py-3 px-4 rounded-lg bg-gray-100 border border-gray-300"
                onPress={closeCancelDialog}
                disabled={isCancelling}
              >
                <Text className="text-gray-700 text-center font-medium">No, Keep It</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-lg ${
                  isCancelling ? 'bg-red-400' : 'bg-red-500'
                }`}
                onPress={confirmCancelAppointment}
                disabled={isCancelling || !cancelReason.trim()}
              >
                {isCancelling ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white text-center font-medium ml-2">Cancelling...</Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-medium">Yes, Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </PageLayout>
  );
}