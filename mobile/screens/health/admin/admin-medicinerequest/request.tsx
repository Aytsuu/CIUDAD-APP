import { useState, useEffect, useMemo } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Modal, RefreshControl, Touchable } from "react-native"
import { usePendingMedicineRequests, useUpdateRequestStatus } from "../../medicine-request/restful-api"
export default function AdminMedicineRequests() {
  const [selectedStatus, setSelectedStatus] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [referralReason, setReferralReason] = useState('')
  const [showReferralForm, setShowReferralForm] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const { mutate: updateStatus, isLoading: isUpdating } = useUpdateRequestStatus()

  const { data: fetchedRequests, isLoading: isFetching, refetch } = usePendingMedicineRequests(
    page,
    pageSize,
    searchQuery
  )

  const requests = fetchedRequests?.results || [] // Assuming the response has 'results' array

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true)
    refetch()
    setRefreshing(false)
  }

  // Handle status update
  const handleUpdateStatus = (requestId, newStatus, referralReason = '') => {
    updateStatus({
      medreq_id: requestId,
      status: newStatus,
      doctor_notes: referralReason
    }, {
      onSuccess: () => {
        Alert.alert("Success", "Request status updated successfully")
        refetch()
        setShowDetailsModal(false)
        setShowReferralForm(false)
        setReferralReason('')
      },
      onError: (error) => {
        Alert.alert("Error", error.message || "Failed to update status")
      }
    })
  }

  // Open referral form
  const handleRefer = () => {
    setShowReferralForm(true)
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-4">
          <Text className="text-2xl font-bold">Medicine Requests</Text>
          <TextInput
            className="border p-2 mt-4"
            placeholder="Search requests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {isFetching ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            requests.map((request) => (
              <TouchableOpacity
                key={request.id}
                onPress={() => {
                  setSelectedRequest(request)
                  setShowDetailsModal(true)
                }}
              >
                <View className="p-4 border-b">
                  <Text>{request.requestId}</Text>
                  <Text>{request.user.name}</Text>
                  <Text>{request.status}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Details Modal */}
      <Modal visible={showDetailsModal} onRequestClose={() => setShowDetailsModal(false)}>
        <View className="flex-1">
          {selectedRequest && (
            <ScrollView className="p-4">
              {/* Display request details */}
              <Text className="text-xl">Request ID: {selectedRequest.requestId}</Text>
              {/* Add more details */}
              <View className="flex-row mt-4">
                <TouchableOpacity onPress={() => handleUpdateStatus(selectedRequest.id, 'confirmed')}>
                  <Text>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRefer}>
                  <Text>Refer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Referral Form Modal */}
      <Modal visible={showReferralForm} onRequestClose={() => setShowReferralForm(false)}>
        <View className="flex-1 p-4">
          <TextInput
            placeholder="Referral Reason"
            value={referralReason}
            onChangeText={setReferralReason}
            multiline
          />
          <TouchableOpacity onPress={() => handleUpdateStatus(selectedRequest.id, 'referred', referralReason)}>
            <Text>Submit Referral</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  )
}