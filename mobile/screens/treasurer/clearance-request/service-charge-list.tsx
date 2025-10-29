import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { router } from 'expo-router'
import { getUnpaidServiceCharges, UnpaidServiceCharge } from './queries/ClearanceQueries'
import PageLayout from '../../_PageLayout'
import { ChevronLeft } from 'lucide-react-native'
import { LoadingState } from '@/components/ui/loading-state'
import { Search } from '@/lib/icons/Search'
import { SearchInput } from '@/components/ui/search-input'
import { CustomDropdown } from '@/components/ui/custom-dropdown'

const ServiceChargeClearanceList = () => {
  const [serviceCharges, setServiceCharges] = useState<UnpaidServiceCharge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInputVal, setSearchInputVal] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'Unpaid' | 'Paid' | 'Declined'>('Unpaid')

  // Fetch service charges from API (fetch all, filter client-side like web)
  useEffect(() => {
    const fetchServiceCharges = async () => {
      try {
        setLoading(true)
        // Fetch all data without payment_status filter (like web does)
        const data = await getUnpaidServiceCharges(searchQuery, 1, 1000)
        setServiceCharges(data.results)
        setError(null)
      } catch (err) {
        console.error('Error fetching service charges:', err)
        setError('Failed to load service charges')
      } finally {
        setLoading(false)
      }
    }

    fetchServiceCharges()
  }, [searchQuery])

  const getPaymentBadge = (serviceCharge: UnpaidServiceCharge) => {
    // Check payment status (for service charges, declined status is in payment_status)
    const paymentStatus = (serviceCharge.req_payment_status || "").toLowerCase();
    if (paymentStatus === "declined" || paymentStatus.includes("declined") || paymentStatus.includes("rejected")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700">Declined</Text>
    }
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

  const wrapText = (text?: string, maxFirstLine: number = 24) => {
    if (!text) return '—';
    if (text.length <= maxFirstLine) return text;
    const breakIdx = text.lastIndexOf(' ', maxFirstLine);
    const idx = breakIdx > 0 ? breakIdx : maxFirstLine;
    return text.slice(0, idx) + "\n" + text.slice(idx).trimStart();
  }

  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal);
  }, [searchInputVal]);

  // Filter service charges based on payment status and search (like web does)
  const filteredServiceCharges = useMemo(() => {
    let filtered = serviceCharges;
    
    // Filter out cancelled requests first (service charges may not have cancelled status, but filter for consistency)
    filtered = filtered.filter(sc => {
      const paymentStatus = (sc.req_payment_status || '').toLowerCase();
      // Service charges typically don't have "Cancelled" in payment_status, but filter it out if present
      return paymentStatus !== 'cancelled';
    });
    
    // Filter by payment status (like web component does)
    if (paymentStatusFilter === 'Declined') {
      // Show only declined requests
      filtered = filtered.filter(sc => {
        const status = (sc.req_payment_status || '').toLowerCase();
        return status.includes('declined') || status.includes('rejected');
      });
    } else {
      // For paid/unpaid, filter out declined requests
      filtered = filtered.filter(sc => {
        const status = (sc.req_payment_status || '').toLowerCase();
        if (status.includes('declined') || status.includes('rejected')) {
          return false;
        }
        
        // Then filter by payment status
        if (paymentStatusFilter === 'Paid') {
          return status === 'paid';
        } else if (paymentStatusFilter === 'Unpaid') {
          return status !== 'paid';
        }
        // Declined already handled above
        return false;
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(sc => {
        return (
          sc.sr_code?.toLowerCase().includes(searchLower) ||
          sc.sr_id?.toLowerCase().includes(searchLower) ||
          sc.complainant_name?.toLowerCase().includes(searchLower) ||
          (sc.complainant_names && sc.complainant_names.some(name => 
            name.toLowerCase().includes(searchLower)
          )) ||
          (sc.accused_names && sc.accused_names.some(name => 
            name.toLowerCase().includes(searchLower)
          ))
        );
      });
    }
    
    return filtered;
  }, [serviceCharges, searchQuery, paymentStatusFilter])

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Service Charge Requests</Text>}
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
          <Text className="text-xs font-medium text-gray-600 mb-2">Payment Status Filter</Text>
          <CustomDropdown
            value={paymentStatusFilter}
            onSelect={(value: string) => setPaymentStatusFilter(value as any)}
            data={[
              { label: 'Unpaid', value: 'Unpaid' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Declined', value: 'Declined' }
            ]}
            placeholder="Select payment status"
          />
        </View>

        {/* Scrollable Content Area */}
        <View className="flex-1">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <View className="flex-1 justify-center items-center p-6">
              <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                <Text className="text-red-800 text-sm text-center">Failed to load unpaid service charges.</Text>
              </View>
            </View>
          ) : (
            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
              {filteredServiceCharges.length ? (
                filteredServiceCharges.map((serviceCharge, idx) => (
                  <View key={idx} className="bg-white rounded-xl p-5 mb-4 shadow-md border border-gray-200">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 mr-3">
                        <Text className="text-gray-900 font-bold text-base leading-5">{wrapText(serviceCharge.sr_code || "Service Charge")}</Text>
                        <Text className="text-gray-500 text-xs mt-1 font-medium">#{serviceCharge.sr_id}</Text>
                      </View>
                      {getPaymentBadge(serviceCharge)}
                    </View>
                    
                    {/* Complainant(s) */}
                    <View className="bg-blue-50 rounded-lg p-3 mb-3">
                      <Text className="text-blue-800 text-xs font-semibold mb-1">COMPLAINANT</Text>
                      <Text className="text-gray-700 text-sm font-medium">
                        {serviceCharge.complainant_names && serviceCharge.complainant_names.length 
                          ? serviceCharge.complainant_names.join(', ') 
                          : serviceCharge.complainant_name || '—'}
                      </Text>
                      {serviceCharge.complainant_addresses && serviceCharge.complainant_addresses.length > 0 && (
                        <Text className="text-gray-600 text-xs mt-1">
                          {serviceCharge.complainant_addresses.filter(Boolean).join(', ')}
                        </Text>
                      )}
                    </View>
                    
                    {/* Respondent */}
                    {(serviceCharge.accused_names && serviceCharge.accused_names.length > 0) && (
                      <View className="bg-orange-50 rounded-lg p-3 mb-3">
                        <Text className="text-orange-800 text-xs font-semibold mb-1">RESPONDENT</Text>
                        <Text className="text-gray-700 text-sm font-medium">
                          {serviceCharge.accused_names.join(', ')}
                        </Text>
                        {serviceCharge.accused_addresses && serviceCharge.accused_addresses.length > 0 && (
                          <Text className="text-gray-600 text-xs mt-1">
                            {serviceCharge.accused_addresses.filter(Boolean).join(', ')}
                          </Text>
                        )}
                      </View>
                    )}
                    
                    <View className="bg-gray-50 rounded-lg p-3">
                      <Text className="text-gray-600 text-xs font-semibold mb-1">REQUEST DETAILS</Text>
                      <Text className="text-gray-700 text-sm font-medium">Date Requested: {formatDate(serviceCharge.sr_req_date)}</Text>
                      {serviceCharge.pay_sr_type && (
                        <Text className="text-gray-700 text-sm font-medium mt-2">Type: {serviceCharge.pay_sr_type}</Text>
                      )}
                      {(serviceCharge.req_payment_status === 'Declined' || (serviceCharge.req_payment_status || '').toLowerCase().includes('declined')) && serviceCharge.decline_reason && (
                        <Text className="text-gray-700 text-sm font-medium mt-2">Decline Reason: {serviceCharge.decline_reason}</Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View className="flex-1 items-center justify-center py-16">
                  <View className="items-center bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <Text className="text-gray-800 text-xl font-bold mb-3 text-center">
                      {searchQuery ? 'No Matching Service Charges' : 'No Service Charges Yet'}
                    </Text>
                    <Text className="text-gray-600 text-sm text-center leading-5">
                      {searchQuery ? 'Try adjusting your search terms' : 'Service charge requests will appear here when available'}
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

export default ServiceChargeClearanceList

