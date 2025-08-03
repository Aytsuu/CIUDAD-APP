import { View, Text, ScrollView, Pressable, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getBusinessPermits, BusinessPermit } from '@/screens/certificates/restful-api/businessGetAPI'

const BusinessList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [businessPermits, setBusinessPermits] = useState<BusinessPermit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch business permits from API
  useEffect(() => {
    const fetchBusinessPermits = async () => {
      try {
        setLoading(true)
        const data = await getBusinessPermits()
        setBusinessPermits(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching business permits:', err)
        setError('Failed to load business permits')
      } finally {
        setLoading(false)
      }
    }

    fetchBusinessPermits()
  }, [])

  const handleBusinessPress = (business: BusinessPermit) => {
    // Navigate to business permit details
    console.log('View business permit:', business.bp_id)
    // router.push(`/business-permit-details/${business.bp_id}`)
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredBusinesses = businessPermits.filter(business => {
    const matchesSearch = business.bp_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const formatAddress = (business: BusinessPermit) => {
    return business.business_address
  }

  const formatCurrency = (amount: string) => {
    return `₱${parseInt(amount).toLocaleString()}`
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
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
                Business Permit Request
              </Text>
            </View>
            <Text className="text-gray-600 text-sm ml-11">
              Manage and view business permit requests
            </Text>
          </View>

          {/* Search */}
          <View className="mb-6">
            <View className="relative">
              <View className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <Ionicons name="search" size={20} color="#9CA3AF" />
              </View>
              <TextInput
                placeholder="Search business permits..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Business List */}
          <View className="space-y-4">
            {filteredBusinesses.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-8 items-center">
                  <Ionicons name="business-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 text-center mt-2">
                    No business permits found
                  </Text>
                </CardContent>
              </Card>
            ) : (
              filteredBusinesses.map((business) => (
                <Pressable
                  key={business.bp_id}
                  onPress={() => handleBusinessPress(business)}
                  className="active:opacity-80"
                >
                  <Card className="border-0 shadow-lg bg-white rounded-xl">
                    <CardContent className="p-5">
                      <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-gray-900 mb-1">
                            {business.bp_id}
                          </Text>
                          <Text className="text-gray-600 text-sm">
                            {business.business_name}
                          </Text>
                        </View>
                        <View className={`px-2 py-1 rounded-full ${getPaymentStatusColor(business.req_payment_status)}`}>
                          <Text className="text-xs font-medium">
                            {business.req_payment_status}
                          </Text>
                        </View>
                      </View>

                      <View className="space-y-3">
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Owner:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {business.owner_name}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Address:</Text>
                          <Text className="text-gray-900 text-sm font-medium text-right flex-1 ml-2">
                            {formatAddress(business)}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Business Type:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {business.business_type}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Payment:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {business.req_pay_method}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Request Date:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {business.req_request_date}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Claim Date:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {business.req_claim_date}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-end mt-4 pt-4 border-t border-gray-100">
                        
                      </View>
                    </CardContent>
                  </Card>
                </Pressable>
              ))
            )}
          </View>

          {/* Create New Business Permit Button */}
          <View className="mt-6 mb-4">
            <Button 
              className="w-full h-12 rounded-lg"
              onPress={() => console.log('Create new business permit')}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="ml-2 text-white font-medium">Create Business Permit</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default BusinessList
