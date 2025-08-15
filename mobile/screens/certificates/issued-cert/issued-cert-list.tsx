import { View, Text, ScrollView, Pressable, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getIssuedCertificates, IssuedCertificate } from '@/screens/certificates/restful-api/issuedCertGetAPI'

const IssuedCertList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch issued certificates from API
  useEffect(() => {
    const fetchIssuedCertificates = async () => {
      try {
        setLoading(true)
        const data = await getIssuedCertificates()
        setCertificates(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching issued certificates:', err)
        setError('Failed to load issued certificates')
      } finally {
        setLoading(false)
      }
    }

    fetchIssuedCertificates()
  }, [])

  const handleCertificatePress = (certificate: IssuedCertificate) => {
    // Navigate to certificate details or open PDF
    console.log('View certificate:', certificate.requester)
    // router.push(`/certificate-details/${certificate.fileUrl}`)
  }

  const handleDownload = (certificate: IssuedCertificate) => {
    // Handle download functionality
    console.log('Download certificate:', certificate.fileUrl)
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.purpose.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

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
                Issued Certifications
              </Text>
            </View>
            <Text className="text-gray-600 text-sm ml-11">
              Collection of issued certifications
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="mb-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-gray-500 text-sm">Total Issued</Text>
                    <Text className="text-2xl font-bold text-gray-900">
                      {certificates.length}
                    </Text>
                  </View>
                  <View className="flex-row space-x-4">
                    <View className="items-center">
                      <Text className="text-gray-500 text-xs">This Month</Text>
                      <Text className="text-lg font-semibold text-green-600">
                        {certificates.filter(cert => {
                          const certDate = new Date(cert.dateIssued)
                          const now = new Date()
                          return certDate.getMonth() === now.getMonth() && 
                                 certDate.getFullYear() === now.getFullYear()
                        }).length}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-gray-500 text-xs">This Week</Text>
                      <Text className="text-lg font-semibold text-blue-600">
                        {certificates.filter(cert => {
                          const certDate = new Date(cert.dateIssued)
                          const now = new Date()
                          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                          return certDate >= weekAgo
                        }).length}
                      </Text>
                    </View>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>

          {/* Search */}
          <View className="mb-6">
            <View className="relative">
              <View className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <Ionicons name="search" size={20} color="#9CA3AF" />
              </View>
              <TextInput
                placeholder="Search issued certificates..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Certificate List */}
          <View className="space-y-4">
            {filteredCertificates.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-8 items-center">
                  <Ionicons name="ribbon-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 text-center mt-2">
                    No issued certificates found
                  </Text>
                </CardContent>
              </Card>
            ) : (
              filteredCertificates.map((certificate, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleCertificatePress(certificate)}
                  className="active:opacity-80"
                >
                  <Card className="border-0 shadow-lg bg-white rounded-xl">
                    <CardContent className="p-5">
                      <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-gray-900 mb-1">
                            {certificate.requester}
                          </Text>
                          <Text className="text-gray-600 text-sm">
                            {certificate.purpose}
                          </Text>
                        </View>
                        <View className="flex-row items-center space-x-2">
                          <View className="bg-green-100 px-2 py-1 rounded-full">
                            <Text className="text-green-800 text-xs font-medium">
                              Issued
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="space-y-3">
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Purpose:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {certificate.purpose}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">Date Issued:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            {formatDate(certificate.dateIssued)}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-sm">File Status:</Text>
                          <Text className="text-gray-900 text-sm font-medium">
                            Available
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100">
                        <Pressable
                          onPress={() => handleDownload(certificate)}
                          className="flex-row items-center bg-blue-50 px-3 py-2 rounded-lg"
                        >
                          <Ionicons name="download-outline" size={16} color="#2563EB" />
                          <Text className="text-blue-600 text-sm font-medium ml-1">
                            Download
                          </Text>
                        </Pressable>
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

export default IssuedCertList
