import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getBusinessPermits, BusinessPermit } from '../queries/businessPermitQueries'
import { DataTable, ColumnDef } from '@/components/ui/table/data-table'
import { SelectLayout } from '@/components/ui/select-layout'

const BusinessList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [businessPermits, setBusinessPermits] = useState<BusinessPermit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  // Fetch business permits from API
  useEffect(() => {
    const fetchBusinessPermits = async () => {
      try {
        setLoading(true)
        const data = await getBusinessPermits()
        setBusinessPermits(data.results)
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

  // Filter and search logic matching web version
  const filteredBusinesses = useMemo(() => {
    return businessPermits.filter(business => {
      const matchesSearch = searchQuery === '' || 
        business.bp_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.owner_name?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = filterStatus === "all" || business.req_payment_status === filterStatus
      const matchesType = filterType === "all" || business.business_type === filterType
      
      return matchesSearch && matchesStatus && matchesType
    })
  }, [businessPermits, searchQuery, filterStatus, filterType])

  const paginatedData = filteredBusinesses

  // Table columns matching web version
  const columns: ColumnDef<BusinessPermit>[] = [
    {
      accessorKey: 'bp_id',
      header: 'ID',
      cell: ({ value }) => (
        <Text className="text-sm font-medium text-gray-900">{value || 'N/A'}</Text>
      )
    },
    {
      accessorKey: 'business_name',
      header: 'Business Name',
      cell: ({ value }) => (
        <Text className="text-sm text-gray-900">{value || 'N/A'}</Text>
      )
    },
    {
      accessorKey: 'owner_name',
      header: 'Owner',
      cell: ({ value }) => (
        <Text className="text-sm text-gray-900">{value || 'N/A'}</Text>
      )
    },
    {
      accessorKey: 'business_type',
      header: 'Type',
      cell: ({ value }) => (
        <Text className="text-sm text-gray-900">{value || 'N/A'}</Text>
      )
    },
    {
      accessorKey: 'req_payment_status',
      header: 'Payment Status',
      cell: ({ value }) => (
        <View className={`px-2 py-1 rounded-full ${getPaymentStatusColor(value)}`}>
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

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Cancelled", value: "cancelled" }
  ]

  const typeOptions = [
    { label: "All", value: "all" },
    { label: "Sari-sari Store", value: "Sari-sari Store" },
    { label: "Restaurant", value: "Restaurant" },
    { label: "Retail", value: "Retail" },
    { label: "Service", value: "Service" }
  ]

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

          {/* Search and Filters - Matching Web Layout */}
          <View className="mb-6 space-y-4">
            {/* Search Bar */}
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

            {/* Filter Row */}
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <SelectLayout
                  options={statusOptions}
                  selectedValue={filterStatus}
                  onSelect={(option) => setFilterStatus(option.value)}
                  placeholder="Filter by Status"
                  className="h-10"
                />
              </View>
              <View className="flex-1">
                <SelectLayout
                  options={typeOptions}
                  selectedValue={filterType}
                  onSelect={(option) => setFilterType(option.value)}
                  placeholder="Filter by Type"
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
              onRowPress={handleBusinessPress}
            />
          </View>

          {/* Pagination Info */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm text-gray-600">
              Showing {filteredBusinesses.length} rows
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
