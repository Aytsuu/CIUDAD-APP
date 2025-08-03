import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getClearanceRequests, ClearanceRequest, updatePaymentStatus } from './restful-api/clearanceRequestGetAPI'

const ClearanceRequestList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [clearanceRequests, setClearanceRequests] = useState<ClearanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch clearance requests from API
  useEffect(() => {
    const fetchClearanceRequests = async () => {
      try {
        setLoading(true)
        const data = await getClearanceRequests()
        setClearanceRequests(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching clearance requests:', err)
        setError('Failed to load clearance requests')
      } finally {
        setLoading(false)
      }
    }

    fetchClearanceRequests()
  }, [])



  const handlePaymentStatusUpdate = async (crId: string, newStatus: string) => {
    try {
      await updatePaymentStatus(crId, newStatus)
      // Refresh the list after update
      const updatedRequests = clearanceRequests.map(request => 
        request.cr_id === crId 
          ? { ...request, req_payment_status: newStatus }
          : request
      )
      setClearanceRequests(updatedRequests)
      Alert.alert('Success', 'Payment status updated successfully')
    } catch (err) {
      console.error('Error updating payment status:', err)
      Alert.alert('Error', 'Failed to update payment status')
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'unpaid':
        return 'bg-red-100 text-red-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRequests = clearanceRequests.filter(request => {
    const matchesSearch = request.cr_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.resident_details.per_fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.resident_details.per_lname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.req_type.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = selectedFilter === 'All' || request.req_payment_status === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const formatCurrency = (amount: string) => {
    return `₱${parseInt(amount).toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      })
    } catch (e) {
      return dateString
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 pt-10">
          {/* Header */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Pressable 
                onPress={() => router.back()}
                className="mr-3 p-2"
              >
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </Pressable>
              <Text className="text-2xl font-bold text-gray-900">
                Clearance Requests
              </Text>
            </View>
            <Text className="text-gray-600 text-sm ml-11">
              View clearance requests and payment status
            </Text>
          </View>

          {/* Search and Filter */}
          <View className="mb-6 space-y-3">
            <View className="relative">
              <View className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <Ionicons name="search" size={20} color="#9CA3AF" />
              </View>
              <TextInput
                placeholder="Search clearance requests..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            {/* Filter Dropdown */}
            <View className="flex-row items-center space-x-2">
              <Text className="text-gray-600 text-sm">Filter:</Text>
              <View className="flex-1 relative">
                <Pressable
                  onPress={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row justify-between items-center"
                >
                  <Text className="text-gray-900">{selectedFilter}</Text>
                  <Ionicons 
                    name={showFilterDropdown ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#9CA3AF" 
                  />
                </Pressable>
                
                {showFilterDropdown && (
                  <View className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {['All', 'Paid', 'Unpaid'].map((option) => (
                      <Pressable
                        key={option}
                        onPress={() => {
                          setSelectedFilter(option)
                          setShowFilterDropdown(false)
                        }}
                        className={`px-4 py-3 border-b border-gray-100 ${
                          selectedFilter === option ? 'bg-blue-50' : ''
                        }`}
                      >
                        <Text className={`text-sm ${
                          selectedFilter === option ? 'text-blue-600 font-medium' : 'text-gray-900'
                        }`}>
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Clearance Request List */}
          <View className="space-y-6 mb-8">
            {loading ? (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-8 items-center">
                  <Ionicons name="refresh-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 text-center mt-2">
                    Loading clearance requests...
                  </Text>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-8 items-center">
                  <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                  <Text className="text-red-500 text-center mt-2">
                    {error}
                  </Text>
                </CardContent>
              </Card>
            ) : filteredRequests.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-8 items-center">
                  <Ionicons name="document-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 text-center mt-2">
                    No clearance requests found
                  </Text>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.cr_id} className="border-0 shadow-lg bg-white rounded-xl mb-4">
                    <CardContent className="p-5">
                      <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-gray-900 mb-1">
                            {request.cr_id}
                          </Text>
                          <Text className="text-gray-600 text-sm">
                            {request.resident_details.per_fname} {request.resident_details.per_lname}
                          </Text>
                        </View>
                        <View className={`px-2 py-1 rounded-full ${getPaymentStatusColor(request.req_payment_status)}`}>
                          <Text className="text-xs font-medium">
                            {request.req_payment_status}
                          </Text>
                        </View>
                      </View>

                      <View className="space-y-3">
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Type:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {request.req_type}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Amount:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {formatCurrency(request.req_amount)}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Request Date:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {formatDate(request.req_request_date)}
                          </Text>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default ClearanceRequestList 