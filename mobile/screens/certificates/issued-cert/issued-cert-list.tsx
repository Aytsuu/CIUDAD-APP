import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getIssuedCertificates, IssuedCertificate } from '../queries/issuedCertificateQueries'
import { DataTable, ColumnDef } from '@/components/ui/table/data-table'
import { SelectLayout } from '@/components/ui/select-layout'

const IssuedCertList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterValue, setFilterValue] = useState("All")
  const [activeTab, setActiveTab] = useState<"certificates" | "businessPermits" | "serviceCharges">("certificates")
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  // Fetch issued certificates from API
  useEffect(() => {
    const fetchIssuedCertificates = async () => {
      try {
        setLoading(true)
        const data = await getIssuedCertificates()
        setCertificates(data.results)
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
    // Navigate to certificate details or open PDF for viewing only
    console.log('View certificate:', certificate.requester)
    // router.push(`/certificate-details/${certificate.ic_id}`)
  }

  // Filter and search logic matching web version
  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const matchesSearch = searchQuery === '' || 
        cert.requester?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = filterValue === "All" || cert.purpose === filterValue
      
      return matchesSearch && matchesFilter
    })
  }, [certificates, searchQuery, filterValue])

  const paginatedData = filteredCertificates

  // Table columns matching web version
  const columns: ColumnDef<IssuedCertificate>[] = [
    {
      accessorKey: 'ic_id',
      header: 'ID',
      cell: ({ value }) => (
        <Text className="text-sm font-medium text-gray-900">{value || 'N/A'}</Text>
      )
    },
    {
      accessorKey: 'requester',
      header: 'Requester',
      cell: ({ value }) => (
        <Text className="text-sm text-gray-900">{value || 'N/A'}</Text>
      )
    },
    {
      accessorKey: 'purpose',
      header: 'Purpose',
      cell: ({ value }) => (
        <Text className="text-sm text-gray-900">{value || 'N/A'}</Text>
      )
    },
    {
      accessorKey: 'dateIssued',
      header: 'Date Issued',
      cell: ({ value }) => (
        <Text className="text-sm text-gray-900">{formatDate(value) || 'N/A'}</Text>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ value }) => (
        <View className="bg-green-100 px-2 py-1 rounded-full">
          <Text className="text-green-800 text-xs font-medium">Issued</Text>
        </View>
      )
    }
  ]

  const filterOptions = [
    { label: "All", value: "All" },
    { label: "Barangay Clearance", value: "Barangay Clearance" },
    { label: "Certificate of Residency", value: "Certificate of Residency" },
    { label: "Certificate of Indigency", value: "Certificate of Indigency" },
    { label: "Business Clearance", value: "Business Clearance" }
  ]

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
                Issued Certificates
              </Text>
            </View>
            <Text className="text-gray-600 text-sm ml-11">
              View and manage issued certificates
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
                placeholder="Search issued certificates..."
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
                  selectedValue={filterValue}
                  onSelect={(option) => setFilterValue(option.value)}
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

export default IssuedCertList
