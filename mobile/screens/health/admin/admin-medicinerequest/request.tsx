"use client"

import { View, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Modal } from "react-native"
import { Search, Filter, Clock, User, Calendar, Phone, MapPin, FileText, CheckCircle, Send, Eye, MessageCircle, AlertCircle, ArrowLeft } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { Button } from "@/components/ui/button"
import * as React from "react"
import { router } from "expo-router"

export default function AdminMedicineRequests() {
  const [selectedStatus, setSelectedStatus] = React.useState('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [selectedRequest, setSelectedRequest] = React.useState(null)
  const [showDetailsModal, setShowDetailsModal] = React.useState(false)

  // Sample data - Replace with actual database fetch
  const sampleRequests = [
    {
      id: 1,
      requestId: "REQ-2024-001",
      user: {
        name: "Maria Santos",
        phone: "+63 912 345 6789",
        address: "123 Rizal Street, Cebu City",
        age: 34,
        emergencyContact: "+63 912 345 6790"
      },
      medicines: [
        { name: "Paracetamol 500mg" },
        { name: "Amoxicillin 250mg" }
      ],
      symptoms: "Fever, headache, and body aches for 3 days",
      requestDate: "2024-01-15T10:30:00Z",
      status: "pending",

      notes: "Patient has been experiencing symptoms for 3 days",
      lastUpdated: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      requestId: "REQ-2024-002",
      user: {
        name: "Juan Dela Cruz",
        phone: "+63 923 456 7890",
        address: "456 Colon Street, Cebu City",
        age: 28,
        emergencyContact: "+63 923 456 7891"
      },
      medicines: [
        { name: "Insulin Glargine", quantity: 2, unit: "vials" },
        { name: "Blood glucose strips", quantity: 50, unit: "pieces" }
      ],
      symptoms: "Diabetic patient running low on medication",
      requestDate: "2024-01-14T15:45:00Z",
      status: "confirmed",

      notes: "Regular diabetic patient, needs immediate attention",
      lastUpdated: "2024-01-14T16:00:00Z",
      confirmedBy: "Dr. Smith",
      confirmedDate: "2024-01-14T16:00:00Z"
    },
    {
      id: 3,
      requestId: "REQ-2024-003",
      user: {
        name: "Ana Garcia",
        phone: "+63 934 567 8901",
        address: "789 Lahug, Cebu City",
        age: 42,
        emergencyContact: "+63 934 567 8902"
      },
      medicines: [
        { name: "Lisinopril 10mg" }
      ],
      symptoms: "Hypertension maintenance medication",
      requestDate: "2024-01-13T09:15:00Z",
      status: "referred",
      notes: "Regular maintenance for hypertension",
      lastUpdated: "2024-01-13T14:20:00Z",
      referredTo: "Cebu General Hospital",
      referralDate: "2024-01-13T14:20:00Z",
      referralReason: "Requires specialist consultation"
    },
    {
      id: 4,
      requestId: "REQ-2024-004",
      user: {
        name: "Pedro Lim",
        phone: "+63 945 678 9012",
        address: "321 IT Park, Cebu City",
        age: 55,
        emergencyContact: "+63 945 678 9013"
      },
      medicines: [
        { name: "Aspirin 80mg" },
        { name: "Atorvastatin 20mg" }
      ],
      symptoms: "Chest pain and shortness of breath",
      requestDate: "2024-01-12T20:30:00Z",
      status: "pending",
      notes: "Experiencing chest pain, possible cardiac issue",
      lastUpdated: "2024-01-12T20:30:00Z"
    }
  ]

  const statusOptions = [
    { id: 'all', name: 'All Requests', color: '#6B7280', count: sampleRequests.length },
    { id: 'pending', name: 'Pending', color: '#F59E0B', count: sampleRequests.filter(r => r.status === 'pending').length },
    { id: 'confirmed', name: 'Confirmed', color: '#10B981', count: sampleRequests.filter(r => r.status === 'confirmed').length },
    { id: 'referred', name: 'Referred', color: '#3B82F6', count: sampleRequests.filter(r => r.status === 'referred').length }
  ]

  // Filter requests
  const filteredRequests = React.useMemo(() => {
    let filtered = sampleRequests

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(request => request.status === selectedStatus)
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(request =>
        request.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.medicines.some(med => med.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    return filtered.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
  }, [selectedStatus, searchQuery])

  const handleConfirmRequest = async (requestId) => {
    // Implement confirm logic
    console.log(`Confirming request ${requestId}`)
    // API call to confirm request
  }

  const handleReferRequest = async (requestId) => {
    // Implement referral logic
    console.log(`Referring request ${requestId}`)
    // API call to refer request
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeElapsed = (dateString) => {
    const now = new Date()
    const requestDate = new Date(dateString)
    const diffHours = Math.floor((now - requestDate) / (1000 * 60 * 60))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} days ago`
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <TouchableOpacity 
                      onPress={() => router.back()}
                      className="bg-white/20 p-2 rounded-full"
                    >
                      <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>

        {/* Header Padding */}
        <View className="pt-2 px-4 bg-[#F8FAFC]">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-PoppinsBold font-bold text-[#263D67]">
                Medicine Requests
              </Text>
              <Text className="text-sm font-PoppinsRegular text-[#6B7280]">
                {filteredRequests.length} requests found
              </Text>
            </View>
          </View>


        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl p-2 mb-4">
          <Search size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-[#263D67] font-PoppinsRegular"
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Status Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {statusOptions.map((status) => {
              const isSelected = selectedStatus === status.id
              return (
                <TouchableOpacity
                  key={status.id}
                  onPress={() => setSelectedStatus(status.id)}
                  className={`flex-row items-center px-4 py-2 rounded-full ${isSelected ? 'bg-[#263D67]' : 'bg-white border border-gray-200'
                    }`}
                >
                  <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: isSelected ? 'white' : status.color }}
                  />
                  <Text className={`font-PoppinsMedium text-sm ${isSelected ? 'text-white' : 'text-[#263D67]'
                    }`}>
                    {status.name} ({status.count})
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>
      </View>

      {/* Requests List */}
      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { }} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredRequests.length === 0 ? (
          <View className="items-center justify-center py-20">
            <FileText size={48} color="#D1D5DB" />
            <Text className="text-xl font-PoppinsSemiBold text-[#6B7280] mt-4">No requests found</Text>
            <Text className="text-[#9CA3AF] font-PoppinsRegular mt-2 text-center">
              Try adjusting your search or filter criteria
            </Text>
          </View>
        ) : (
          <View className="pb-4">
            {filteredRequests.map((request) => (
              <View key={request.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                {/* Request Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-lg font-PoppinsSemiBold text-[#263D67]">
                        {request.user.name}
                      </Text>

                    </View>
                    <Text className="text-sm font-PoppinsRegular text-[#6B7280] mb-1">
                      Request ID: {request.requestId}
                    </Text>
                    <Text className="text-xs font-PoppinsRegular text-[#9CA3AF]">
                      {getTimeElapsed(request.requestDate)} • {formatDate(request.requestDate)}
                    </Text>
                  </View>

                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${statusOptions.find(s => s.id === request.status)?.color}20`
                    }}
                  >
                    <Text
                      className="text-xs font-PoppinsMedium capitalize"
                      style={{
                        color: statusOptions.find(s => s.id === request.status)?.color
                      }}
                    >
                      {request.status}
                    </Text>
                  </View>
                </View>

                {/* Patient Info */}
                <View className="bg-gray-50 rounded-lg p-3 mb-3">
                  <View className="flex-row items-center mb-2">
                    <User size={14} color="#6B7280" />
                    <Text className="text-sm font-PoppinsMedium text-[#263D67] ml-2">
                      Age: {request.user.age}
                    </Text>
                    <Phone size={14} color="#6B7280" className="ml-4" />
                    <Text className="text-sm font-PoppinsRegular text-[#6B7280] ml-2">
                      {request.user.phone}
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <MapPin size={14} color="#6B7280" className="mt-0.5" />
                    <Text className="text-sm font-PoppinsRegular text-[#6B7280] ml-2 flex-1">
                      {request.user.address}
                    </Text>
                  </View>
                </View>

                {/* Medicines Requested */}
                <View className="mb-3">
                  <Text className="text-sm font-PoppinsSemiBold text-[#263D67] mb-2">
                    Medicines Requested:
                  </Text>
                  {request.medicines.map((medicine, index) => (
                    <View key={index} className="flex-row justify-between items-center py-1">
                      <Text className="text-sm font-PoppinsRegular text-[#263D67] flex-1">
                        {medicine.name}
                      </Text>
                      <Text className="text-sm font-PoppinsMedium text-[#6B7280]">
                        {medicine.quantity} {medicine.unit}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Symptoms */}
                <View className="mb-4">
                  <Text className="text-sm font-PoppinsSemiBold text-[#263D67] mb-1">
                    Symptoms/Condition:
                  </Text>
                  <Text className="text-sm font-PoppinsRegular text-[#6B7280]">
                    {request.symptoms}
                  </Text>
                </View>

                {/* Additional Info for Confirmed/Referred */}
                {request.status === 'confirmed' && (
                  <View className="bg-green-50 rounded-lg p-3 mb-3">
                    <Text className="text-sm font-PoppinsMedium text-green-700">
                      ✓ Confirmed by {request.confirmedBy} on {formatDate(request.confirmedDate)}
                    </Text>
                  </View>
                )}

                {request.status === 'referred' && (
                  <View className="bg-blue-50 rounded-lg p-3 mb-3">
                    <Text className="text-sm font-PoppinsMedium text-blue-700">
                      📋 Referred to {request.referredTo}
                    </Text>
                    <Text className="text-xs font-PoppinsRegular text-blue-600 mt-1">
                      Reason: {request.referralReason}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View className="flex-row justify-between items-center">
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedRequest(request)
                      setShowDetailsModal(true)
                    }}
                    className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
                  >
                    <Eye size={14} color="#6B7280" />
                    <Text className="text-sm font-PoppinsMedium text-[#6B7280] ml-2">
                      View Details
                    </Text>
                  </TouchableOpacity>

                  {request.status === 'pending' && (
                    <View className="flex-row space-x-2">
                      <TouchableOpacity
                        onPress={() => handleReferRequest(request.id)}
                        className="flex-row items-center bg-blue-500 px-4 py-2 rounded-lg"
                      >
                        <Send size={14} color="white" />
                        <Text className="text-sm font-PoppinsMedium text-white ml-2">
                          Refer
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleConfirmRequest(request.id)}
                        className="flex-row items-center bg-green-500 px-4 py-2 rounded-lg"
                      >
                        <CheckCircle size={14} color="white" />
                        <Text className="text-sm font-PoppinsMedium text-white ml-2">
                          Confirm
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[80%]">
            <View className="p-4 border-b border-gray-200">
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
              <Text className="text-xl font-PoppinsBold text-[#263D67] text-center">
                Request Details
              </Text>
            </View>

            {selectedRequest && (
              <ScrollView className="p-4">
                <View className="space-y-4">
                  <View>
                    <Text className="text-sm font-PoppinsSemiBold text-[#263D67] mb-2">
                      Patient Information
                    </Text>
                    <View className="bg-gray-50 rounded-lg p-3">
                      <Text className="font-PoppinsMedium text-[#263D67]">{selectedRequest.user.name}</Text>
                      <Text className="text-sm text-[#6B7280]">Age: {selectedRequest.user.age}</Text>
                      <Text className="text-sm text-[#6B7280]">Phone: {selectedRequest.user.phone}</Text>
                      <Text className="text-sm text-[#6B7280]">Emergency: {selectedRequest.user.emergencyContact}</Text>
                      <Text className="text-sm text-[#6B7280]">Address: {selectedRequest.user.address}</Text>
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm font-PoppinsSemiBold text-[#263D67] mb-2">
                      Medical Information
                    </Text>
                    <View className="bg-gray-50 rounded-lg p-3">
                      <Text className="text-sm text-[#263D67] mb-2">
                        <Text className="font-PoppinsSemiBold">Symptoms: </Text>
                        {selectedRequest.symptoms}
                      </Text>
                      <Text className="text-sm text-[#263D67]">
                        <Text className="font-PoppinsSemiBold">Notes: </Text>
                        {selectedRequest.notes}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}

            <View className="p-4 border-t border-gray-200">
              <Button
                className="bg-[#263D67] py-3 rounded-xl"
                onPress={() => setShowDetailsModal(false)}
              >
                <Text className="text-white font-PoppinsMedium">Close</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}