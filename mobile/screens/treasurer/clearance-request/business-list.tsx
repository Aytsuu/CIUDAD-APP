import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from 'expo-router'
import { getUnpaidBusinessPermits, UnpaidBusinessPermit } from './queries/ClearanceQueries'
import PageLayout from '../../_PageLayout'
import { ChevronLeft } from 'lucide-react-native'
import { LoadingState } from '@/components/ui/loading-state'
import { Search } from '@/lib/icons/Search'
import { SearchInput } from '@/components/ui/search-input'
import { SelectLayout } from '@/components/ui/select-layout'

const BusinessClearanceList = () => {
  const [businessPermits, setBusinessPermits] = useState<UnpaidBusinessPermit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInputVal, setSearchInputVal] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'Unpaid' | 'Paid' | 'Declined'>('Unpaid')

  // Fetch business permits from API (fetch all, filter client-side like web)
  useEffect(() => {
    const fetchBusinessPermits = async () => {
      try {
        setLoading(true)
        // Fetch all data without payment_status filter (like web does)
        const data = await getUnpaidBusinessPermits(searchQuery, 1, 1000)
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
  }, [searchQuery])

  const getPaymentBadge = (business: UnpaidBusinessPermit) => {
    // First check if request status is Declined
    const reqStatus = (business.req_status || "").toLowerCase();
    if (reqStatus === "declined" || reqStatus.includes("declined") || reqStatus.includes("rejected")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700">Declined</Text>
    }
    
    // Then check payment status
    const paymentStatus = (business.req_payment_status || "").toLowerCase();
    if (paymentStatus === "paid") {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-800">Paid</Text>
    }
    
    // Default to Unpaid
    return <Text className="text-[10px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Unpaid</Text>
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

  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal);
  }, [searchInputVal]);

  // Filter business permits based on payment status and search (like web does)
  const filteredBusinesses = useMemo(() => {
    let filtered = businessPermits;
    
    // Filter out cancelled requests first
    filtered = filtered.filter(business => {
      const status = business.req_status || '';
      return status !== 'Cancelled' && status.toLowerCase() !== 'cancelled';
    });
    
    // Filter by payment status (exactly like web component does)
    if (paymentStatusFilter === 'Declined') {
      // Show only declined requests (check req_status field like web does)
      filtered = filtered.filter(business => {
        const status = business.req_status || '';
        return status === 'Declined' || status.toLowerCase() === 'declined';
      });
    } else {
      // For paid/unpaid/all, filter out declined requests first
      filtered = filtered.filter(business => {
        const status = business.req_status || '';
        // Filter out declined requests (like web does)
        if (status === 'Declined' || status.toLowerCase() === 'declined') {
          return false;
        }
        
        // Then filter by payment status
        const paymentStatus = (business.req_payment_status || '').toLowerCase();
        if (paymentStatusFilter === 'Paid') {
          return paymentStatus === 'paid';
        } else if (paymentStatusFilter === 'Unpaid') {
          return paymentStatus !== 'paid';
        }
        // Declined already handled above
        return false;
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(business => {
        return (
          business.bp_id?.toLowerCase().includes(searchLower) ||
          business.business_name?.toLowerCase().includes(searchLower) ||
          business.owner_name?.toLowerCase().includes(searchLower) ||
          business.business_type?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return filtered;
  }, [businessPermits, searchQuery, paymentStatusFilter])

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Business Permit Requests</Text>}
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

        {/* Payment Status Filter */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <SelectLayout
            label="Payment Status Filter"
            placeholder="Select payment status"
            options={[
              { label: 'Unpaid', value: 'Unpaid' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Declined', value: 'Declined' }
            ]}
            selectedValue={paymentStatusFilter}
            onSelect={(option) => setPaymentStatusFilter(option.value as any)}
          />
        </View>

        {/* Scrollable Content Area */}
        <View className="flex-1">
          {error ? (
            <View className="flex-1 justify-center items-center p-6">
              <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                <Text className="text-red-800 text-sm text-center">Failed to load unpaid business permits.</Text>
              </View>
            </View>
          ) : (
            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
              {filteredBusinesses.length ? (
                filteredBusinesses.map((business, idx) => (
                  <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-900 font-medium">{wrapPurpose(business.business_name || "Business Permit")}</Text>
                      {getPaymentBadge(business)}
                    </View>
                    <Text className="text-gray-500 text-xs mt-1">ID: {business.bp_id}</Text>
                    <Text className="text-gray-500 text-xs mt-1">Owner: {business.owner_name}</Text>
                    <Text className="text-gray-500 text-xs mt-1">Type: {business.business_type}</Text>
                    <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(business.req_request_date)}</Text>
                    {business.req_status === 'Declined' && business.decline_reason && (
                      <Text className="text-gray-500 text-xs mt-1">Decline Reason: {business.decline_reason}</Text>
                    )}
                  </View>
                ))
              ) : (
                <View className="flex-1 items-center justify-center py-12">
                  <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
                    {searchQuery ? 'No business permits found matching your search' : 'No business permits yet'}
                  </Text>
                  <Text className="text-gray-500 text-sm text-center">
                    {searchQuery ? 'Try adjusting your search terms' : 'Business permit requests will appear here'}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </PageLayout>
  )
}

export default BusinessClearanceList

