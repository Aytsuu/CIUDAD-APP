import { View, Text, ScrollView, Pressable, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button/button'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getCertificates, Certificate } from '../queries/certificateQueries'

const CertList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch certificates from API
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true)
        const data = await getCertificates()
        setCertificates(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching certificates:', err)
        setError('Failed to load certificates')
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  const handleCertificatePress = (certificate: Certificate) => {
    // Navigate to certificate details
    console.log('View certificate:', certificate.cr_id)
    // router.push(`/certificate-details/${certificate.cr_id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCertificates = certificates.filter(cert => {
    // Add null/undefined checks for all properties
    const certId = cert.cr_id || ''
    const firstName = cert.resident_details?.per_fname || ''
    const lastName = cert.resident_details?.per_lname || ''
    
    const matchesSearch = certId.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                         firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lastName.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

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
                Personal Clearance Request
              </Text>
            </View>
            <Text className="text-gray-600 text-sm ml-11">
              Create, manage, and process personal clearance requests
            </Text>
          </View>

          {/* Search */}
          <View className="mb-6">
            <View className="relative">
              <View className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <Ionicons name="search" size={20} color="#9CA3AF" />
              </View>
              <TextInput
                placeholder="Search certificates..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Certificate List */}
          <View className="space-y-4">
            {loading ? (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-8 items-center">
                  <Ionicons name="refresh-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 text-center mt-2">
                    Loading certificates...
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
            ) : filteredCertificates.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-8 items-center">
                  <Ionicons name="document-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 text-center mt-2">
                    {searchQuery ? 'No certificates match your search' : 'No certificates found'}
                  </Text>
                </CardContent>
              </Card>
            ) : (
              filteredCertificates.map((certificate) => (
                <Pressable
                  key={certificate.cr_id || Math.random().toString()}
                  onPress={() => handleCertificatePress(certificate)}
                  className="active:opacity-80"
                >
                  <Card className="border-0 shadow-lg bg-white rounded-xl">
                    <CardContent className="p-5">
                      <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-gray-900 mb-1">
                            {certificate.cr_id || 'N/A'}
                          </Text>
                          <Text className="text-gray-600 text-sm">
                            {certificate.resident_details?.per_fname || ''} {certificate.resident_details?.per_lname || ''}
                          </Text>
                        </View>
                        <View className={`px-2 py-1 rounded-full ${getStatusColor(certificate.req_status)}`}>
                          <Text className="text-xs font-medium">
                            {certificate.req_status || 'Unknown'}
                          </Text>
                        </View>
                      </View>

                      <View className="space-y-3">
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Purpose:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {certificate.req_type || 'N/A'}
                          </Text>
                        </View>

                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Request Date:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {certificate.req_request_date || 'N/A'}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Claim Date:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {certificate.req_claim_date || 'N/A'}
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
        </View>
      </ScrollView>
    </View>
  )
}

export default CertList