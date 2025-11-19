import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from 'expo-router'
import { getBusinessPermits, BusinessPermit } from '../queries/businessPermitQueries'
import PageLayout from '../../_PageLayout'
import { ChevronLeft } from 'lucide-react-native'
import { LoadingState } from '@/components/ui/loading-state'
import { Search } from '@/lib/icons/Search'
import { SearchInput } from '@/components/ui/search-input'
import { CustomDropdown } from '@/components/ui/custom-dropdown'

const BusinessList = () => {
  const [businessPermits, setBusinessPermits] = useState<BusinessPermit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purposeFilter, setPurposeFilter] = useState<string>('all')
  const [searchInputVal, setSearchInputVal] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showSearch, setShowSearch] = useState<boolean>(false)

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

  const getStatusBadge = (status?: string) => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("reject") || normalized === "rejected") {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700">Rejected</Text>
    }
    if (normalized.includes("approve") || normalized === "approved") {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-800">Approved</Text>
    }
    if (normalized.includes("complete") || normalized === "completed") {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-800">Completed</Text>
    }
    return <Text className="text-[10px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Pending</Text>
  }

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return d;
    }
  }

  const wrapPurpose = (text?: string, maxFirstLine: number = 24) => {
    if (!text) return '—';
    if (text.length <= maxFirstLine) return text;
    const breakIdx = text.lastIndexOf(' ', maxFirstLine);
    const idx = breakIdx > 0 ? breakIdx : maxFirstLine;
    return text.slice(0, idx) + "\n" + text.slice(idx).trimStart();
  }

  // Search function
  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal);
  }, [searchInputVal]);

  // Extract unique purposes (business types) from business permits
  const purposes = useMemo(() => {
    const uniquePurposes = new Set<string>();
    businessPermits.forEach(business => {
      if (business.business_type) {
        uniquePurposes.add(business.business_type);
      }
    });
    return Array.from(uniquePurposes).sort();
  }, [businessPermits])

  // Filter business permits based on purpose and search
  const filteredBusinesses = useMemo(() => {
    let filtered = businessPermits.filter(business => {
      // Purpose filter (using business_type as purpose)
      if (purposeFilter !== 'all' && business.business_type !== purposeFilter) {
        return false;
      }
      return true;
    });

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(business => {
        const searchLower = searchQuery.toLowerCase();
        return (
          business.bp_id?.toLowerCase().includes(searchLower) ||
          business.business_name?.toLowerCase().includes(searchLower) ||
          business.owner_name?.toLowerCase().includes(searchLower) ||
          business.business_type?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [businessPermits, purposeFilter, searchQuery])

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Business Permit Request</Text>}
      rightAction={
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
      wrapScroll={false}
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        {showSearch && (
          <SearchInput 
            value={searchInputVal}
            onChange={setSearchInputVal}
            onSubmit={handleSearch} 
          />
        )}

        {/* Purpose Filter */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <Text className="text-xs font-medium text-gray-600 mb-2">Purpose Filter</Text>
          <CustomDropdown
            value={purposeFilter}
            onSelect={(value: string) => setPurposeFilter(value)}
            data={[
              { label: 'All', value: 'all' },
              ...purposes.map(purpose => ({ label: purpose, value: purpose }))
            ]}
            placeholder="Select purpose"
          />
        </View>

        {/* Scrollable Content Area */}
        <View className="flex-1">
          {error ? (
            <View className="flex-1 justify-center items-center p-6">
              <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                <Text className="text-red-800 text-sm text-center">Failed to load business permits.</Text>
              </View>
            </View>
          ) : (
            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
              {filteredBusinesses.length ? (
                filteredBusinesses.map((business, idx) => (
                  <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-900 font-medium">{wrapPurpose(business.business_name || "Business Permit")}</Text>
                      {getStatusBadge(business.req_status)}
                    </View>
                    <Text className="text-gray-500 text-xs mt-1">ID: {business.bp_id}</Text>
                    <Text className="text-gray-500 text-xs mt-1">Owner: {business.owner_name}</Text>
                    <Text className="text-gray-500 text-xs mt-1">Type: {business.business_type}</Text>
                    <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(business.req_request_date)}</Text>
                    {business.req_claim_date && (
                      <Text className="text-gray-500 text-xs mt-1">Date Claimed: {formatDate(business.req_claim_date)}</Text>
                    )}
                  </View>
                ))
              ) : (
                <View className="flex-1 items-center justify-center py-12">
                  <View className="items-center">
                    <View className="bg-gray-100 rounded-full p-4 mb-4">
                      <Text className="text-gray-500 text-2xl">🏢</Text>
                    </View>
                    <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
                      {searchQuery ? 'No business permits found matching your search' : 'No business permits yet'}
                    </Text>
                    <Text className="text-gray-500 text-sm text-center">
                      {searchQuery ? 'Try adjusting your search terms' : 'Your business permits will appear here'}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </PageLayout>
  )
}

export default BusinessList