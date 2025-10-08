import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getCertificates, Certificate } from '../queries/certificateQueries'
import { DataTable, ColumnDef } from '@/components/ui/table/data-table'
import { SelectLayout } from '@/components/ui/select-layout'

const CertList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState("all")
  const [filterPurpose, setFilterPurpose] = useState("all")
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  // Fetch certificates from API
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true)
        const data = await getCertificates()
        setCertificates(data.results)
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

  // Filter and search logic matching web version
  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const matchesSearch = searchQuery === '' || 
        cert.cr_id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.resident_details?.per_fname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.resident_details?.per_lname?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = filterType === "all" || cert.req_status === filterType
      const matchesPurpose = filterPurpose === "all" || cert.req_type === filterPurpose
      
      return matchesSearch && matchesType && matchesPurpose
    })
  }, [certificates, searchQuery, filterType, filterPurpose])

  const paginatedData = filteredCertificates

  // Table columns matching web version
  const columns: ColumnDef<Certificate>[] = [
    {
      accessorKey: 'cr_id',
      header: 'ID',
      cell: ({ value }) => (
        <Text className="text-sm font-medium text-gray-900">{value || 'N/A'}</Text>
      )
    },
    {
      accessorKey: 'resident_details',
      header: 'Name',
      cell: ({ value }) => (
        <Text className="text-sm text-gray-900">
          {value?.per_fname || ''} {value?.per_lname || ''}
        </Text>
      )
    },
    {
      accessorKey: 'req_type',
      header: 'Purpose',
      cell: ({ value }) => (
        <Text className="text-sm text-gray-900">{value || 'N/A'}</Text>
      )
    },
    {
      accessorKey: 'req_status',
      header: 'Status',
      cell: ({ value }) => (
        <View className={`px-2 py-1 rounded-full ${getStatusColor(value)}`}>
          <Text className="text-xs font-medium">{value || 'Unknown'}</Text>
        </View>
      )
    },
    {
      accessorKey: 'req_request_date',
      header: 'Request Date',
      cell: ({ value }) => (
        <Text className="text-sm text-gray-900">{value || 'N/A'}</Text>
      )
    },
    {
      accessorKey: 'req_claim_date',
      header: 'Claim Date',
      cell: ({ value }) => (
        <Text className="text-sm text-gray-900">{value || 'N/A'}</Text>
      )
    }
  ]

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
    { label: "Completed", value: "completed" }
  ]

  const purposeOptions = [
    { label: "All", value: "all" },
    { label: "Barangay Clearance", value: "Barangay Clearance" },
    { label: "Certificate of Residency", value: "Certificate of Residency" },
    { label: "Certificate of Indigency", value: "Certificate of Indigency" }
  ]

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

          {/* Search and Filters - Matching Web Layout */}
          <View className="mb-6 space-y-4">
            {/* Search Bar */}
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

            {/* Filter Row */}
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <SelectLayout
                  options={filterOptions}
                  selectedValue={filterType}
                  onSelect={(option) => setFilterType(option.value)}
                  placeholder="Filter by Status"
                  className="h-10"
                />
              </View>
              <View className="flex-1">
                <SelectLayout
                  options={purposeOptions}
                  selectedValue={filterPurpose}
                  onSelect={(option) => setFilterPurpose(option.value)}
                  placeholder="Filter by Purpose"
                  className="h-10"
                />
              </View>
            </View>
          </View>

          {/* Data Table - Matching Web Version */}
          <View className="mb-4">
            <DataTable
              columns={columns}
              data={paginatedData}
              loading={loading}
              onRowPress={handleCertificatePress}
            />
          </View>

          {/* Pagination Info */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm text-gray-600">
              Showing {filteredCertificates.length} rows
            </Text>
            <View className="flex-row items-center space-x-2">
              <Text className="text-sm text-gray-600">Show</Text>
              <TextInput
                value={entriesPerPage.toString()}
                onChangeText={(text) => setEntriesPerPage(parseInt(text) || 10)}
                className="w-14 h-8 border border-gray-300 rounded text-center text-sm"
                keyboardType="numeric"
              />
              <Text className="text-sm text-gray-600">Entries</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  )
}

export default CertList