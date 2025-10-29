import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { router } from 'expo-router'
import { getUnpaidCertificates, UnpaidCertificate } from './queries/ClearanceQueries'
import PageLayout from '../../_PageLayout'
import { ChevronLeft } from 'lucide-react-native'
import { LoadingState } from '@/components/ui/loading-state'
import { Search } from '@/lib/icons/Search'
import { SearchInput } from '@/components/ui/search-input'
import { CustomDropdown } from '@/components/ui/custom-dropdown'

const CertificateClearanceList = () => {
  const [certificates, setCertificates] = useState<UnpaidCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInputVal, setSearchInputVal] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'Unpaid' | 'Paid' | 'Declined'>('Unpaid')
  const [residentTypeFilter, setResidentTypeFilter] = useState<'all' | 'resident' | 'nonresident'>('all')

  // Fetch certificates from API (fetch all, filter client-side like web)
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true)
        // Fetch all data without payment_status filter (like web does)
        const data = await getUnpaidCertificates(searchQuery, 1, 1000)
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
  }, [searchQuery])

  const getPaymentBadge = (certificate: UnpaidCertificate) => {
    // First check if request status is Declined
    const reqStatus = (certificate.req_status || "").toLowerCase();
    if (reqStatus === "declined" || reqStatus.includes("declined") || reqStatus.includes("rejected")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700">Declined</Text>
    }
    
    // Then check payment status
    const paymentStatus = (certificate.req_payment_status || "").toLowerCase();
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

  // Filter certificates based on payment status, resident type, and search (like web does)
  const filteredCertificates = useMemo(() => {
    let filtered = certificates;
    
    // Filter out cancelled requests first
    filtered = filtered.filter(cert => {
      const status = cert.req_status || '';
      return status !== 'Cancelled' && status.toLowerCase() !== 'cancelled';
    });
    
    // Filter by resident type first
    if (residentTypeFilter !== 'all') {
      filtered = filtered.filter(cert => {
        const isNonResident = cert.is_nonresident || false;
        if (residentTypeFilter === 'resident' && isNonResident) return false;
        if (residentTypeFilter === 'nonresident' && !isNonResident) return false;
        return true;
      });
    }
    
    // Filter by payment status (exactly like web component does)
    if (paymentStatusFilter === 'Declined') {
      // Show only declined requests (check req_status field like web does)
      filtered = filtered.filter(cert => {
        const status = cert.req_status || '';
        return status === 'Declined' || status.toLowerCase() === 'declined';
      });
    } else {
      // For paid/unpaid/all, filter out declined requests first
      filtered = filtered.filter(cert => {
        const status = cert.req_status || '';
        // Filter out declined requests (like web does)
        if (status === 'Declined' || status.toLowerCase() === 'declined') {
          return false;
        }
        
        // Then filter by payment status
        const paymentStatus = (cert.req_payment_status || '').toLowerCase();
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
      filtered = filtered.filter(cert => {
        const isNonRes = cert.is_nonresident || false;
        
        if (isNonRes) {
          return (
            cert.cr_id?.toLowerCase().includes(searchLower) ||
            cert.nrc_id?.toLowerCase().includes(searchLower) ||
            cert.nrc_fname?.toLowerCase().includes(searchLower) ||
            cert.nrc_lname?.toLowerCase().includes(searchLower) ||
            cert.nrc_mname?.toLowerCase().includes(searchLower) ||
            cert.req_type?.toLowerCase().includes(searchLower) ||
            cert.req_purpose?.toLowerCase().includes(searchLower)
          );
        } else {
          return (
            cert.cr_id?.toLowerCase().includes(searchLower) ||
            cert.resident_details?.per_fname?.toLowerCase().includes(searchLower) ||
            cert.resident_details?.per_lname?.toLowerCase().includes(searchLower) ||
            cert.resident_details?.per_mname?.toLowerCase().includes(searchLower) ||
            cert.req_type?.toLowerCase().includes(searchLower) ||
            cert.req_purpose?.toLowerCase().includes(searchLower)
          );
        }
      });
    }
    
    return filtered;
  }, [certificates, searchQuery, paymentStatusFilter, residentTypeFilter])

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Certificate Requests</Text>}
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

        {/* Filters - Side by Side */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs font-medium text-gray-600 mb-2">Type Filter</Text>
              <CustomDropdown
                value={residentTypeFilter}
                onSelect={(value: string) => setResidentTypeFilter(value as any)}
                data={[
                  { label: 'All', value: 'all' },
                  { label: 'Resident', value: 'resident' },
                  { label: 'Non-Resident', value: 'nonresident' }
                ]}
                placeholder="Select type"
              />
            </View>
            <View className="flex-1">
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
          </View>
        </View>

        {/* Scrollable Content Area */}
        <View className="flex-1">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <View className="flex-1 justify-center items-center p-6">
              <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                <Text className="text-red-800 text-sm text-center">Failed to load unpaid certificates.</Text>
              </View>
            </View>
          ) : (
            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
              {filteredCertificates.length ? (
                filteredCertificates.map((certificate, idx) => {
                  const isNonResident = certificate.is_nonresident || false;
                  const name = isNonResident
                    ? `${certificate.nrc_lname || ''} ${certificate.nrc_fname || ''} ${certificate.nrc_mname || ''}`.trim()
                    : `${certificate.resident_details?.per_fname || ''} ${certificate.resident_details?.per_lname || ''}`.trim();
                  const id = isNonResident ? certificate.nrc_id || certificate.cr_id : certificate.cr_id;

                  return (
                    <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <Text className="text-gray-900 font-medium">{wrapPurpose(certificate.req_type || "Certificate")}</Text>
                          {isNonResident && (
                            <Text className="text-purple-600 text-[10px] mt-1 font-medium">Non-Resident</Text>
                          )}
                        </View>
                        {getPaymentBadge(certificate)}
                      </View>
                      <Text className="text-gray-500 text-xs mt-1">ID: {id}</Text>
                      <Text className="text-gray-500 text-xs mt-1">Name: {name || '—'}</Text>
                      <Text className="text-gray-500 text-xs mt-1">Purpose: {certificate.req_purpose || certificate.req_type || '—'}</Text>
                      <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(certificate.req_request_date)}</Text>
                      {certificate.amount && (
                        <Text className="text-gray-500 text-xs mt-1">Amount: ₱{parseFloat(certificate.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                      )}
                      {certificate.req_status === 'Declined' && certificate.decline_reason && (
                        <Text className="text-gray-500 text-xs mt-1">Decline Reason: {certificate.decline_reason}</Text>
                      )}
                    </View>
                  );
                })
              ) : (
                <View className="flex-1 items-center justify-center py-12">
                  <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
                    {searchQuery ? 'No certificates found matching your search' : 'No certificates yet'}
                  </Text>
                  <Text className="text-gray-500 text-sm text-center">
                    {searchQuery ? 'Try adjusting your search terms' : 'Certificate requests will appear here'}
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

export default CertificateClearanceList

