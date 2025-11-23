import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from 'expo-router'
import { getCertificates, Certificate } from '../queries/certificateQueries'
import PageLayout from '../../_PageLayout'
import { ChevronLeft } from 'lucide-react-native'
import { LoadingState } from '@/components/ui/loading-state'
import { Search } from '@/lib/icons/Search'
import { SearchInput } from '@/components/ui/search-input'
import { SelectLayout } from '@/components/ui/select-layout'

const CertList = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [allCertificates, setAllCertificates] = useState<Certificate[]>([]) // Store all certificates for purpose extraction
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [residentTypeFilter, setResidentTypeFilter] = useState<'all' | 'resident' | 'nonresident'>('all')
  const [purposeFilter, setPurposeFilter] = useState<string>('all')
  const [searchInputVal, setSearchInputVal] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showSearch, setShowSearch] = useState<boolean>(false)

  // Fetch all certificates (without purpose filter) to extract all available purposes
  useEffect(() => {
    const fetchAllCertificates = async () => {
      try {
        // Fetch all certificates without purpose filter to get all purposes
        const data = await getCertificates(
          undefined, // no search
          1,
          1000, // Large page size to get all results
          undefined, // status param is for request status, not resident type
          'Paid', // Only fetch Paid certificates like web version
          undefined // no purpose filter - get all purposes
        )
        setAllCertificates(data.results)
      } catch (err) {
        // Silently fail - purposes will just be empty
      }
    }

    fetchAllCertificates()
  }, []) // Only fetch once on mount

  // Fetch certificates from API - matching web version (only Paid certificates)
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true)
        // Map purposeFilter to purpose parameter for backend
        const purposeParam = purposeFilter === 'all' ? undefined : purposeFilter
        
        // Fetch all results (no pagination) - use large page size to get all
        // Note: Backend doesn't support resident/non-resident filter via status param
        // We'll filter client-side based on is_nonresident field
        const data = await getCertificates(
          searchQuery || undefined,
          1,
          1000, // Large page size to get all results
          undefined, // status param is for request status, not resident type
          'Paid', // Only fetch Paid certificates like web version
          purposeParam
        )
        setCertificates(data.results)
        setError(null)
      } catch (err) {
        setError('Failed to load certificates')
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [searchQuery, purposeFilter]) // Removed residentTypeFilter from dependencies since we filter client-side

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

  // Extract unique purposes from all certificates (not filtered) for dropdown
  // This ensures all purposes are always available in the dropdown
  const purposes = useMemo(() => {
    const uniquePurposes = new Set<string>();
    allCertificates.forEach(cert => {
      if (cert.req_purpose) {
        uniquePurposes.add(cert.req_purpose);
      }
    });
    return Array.from(uniquePurposes).sort();
  }, [allCertificates])

  // Filter certificates client-side by resident type and purpose
  const filteredCertificates = useMemo(() => {
    let filtered = certificates;

    // Filter by resident type (client-side since backend doesn't support this)
    if (residentTypeFilter !== 'all') {
      filtered = filtered.filter(cert => {
        const isNonResident = cert.is_nonresident || false;
        if (residentTypeFilter === 'resident' && isNonResident) return false;
        if (residentTypeFilter === 'nonresident' && !isNonResident) return false;
        return true;
      });
    }

    // Filter by purpose (already handled by backend, but keep for consistency)
    if (purposeFilter !== 'all') {
      filtered = filtered.filter(cert => cert.req_purpose === purposeFilter);
    }

    return filtered;
  }, [certificates, residentTypeFilter, purposeFilter]);

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Personal Clearance Request</Text>}
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
              <SelectLayout
                label="Type Filter"
                placeholder="Select type"
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Resident', value: 'resident' },
                  { label: 'Non-Resident', value: 'nonresident' }
                ]}
                selectedValue={residentTypeFilter}
                onSelect={(option) => setResidentTypeFilter(option.value as any)}
              />
            </View>
            <View className="flex-1">
              <SelectLayout
                label="Purpose Filter"
                placeholder="Select purpose"
                options={[
                  { label: 'All', value: 'all' },
                  ...purposes.map(purpose => ({ label: purpose, value: purpose }))
                ]}
                selectedValue={purposeFilter}
                onSelect={(option) => setPurposeFilter(option.value)}
              />
            </View>
          </View>
        </View>

        {/* Scrollable Content Area */}
        <View className="flex-1">
          {error ? (
            <View className="flex-1 justify-center items-center p-6">
              <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                <Text className="text-red-800 text-sm text-center">Failed to load certificates.</Text>
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
                          <Text className="text-gray-900 font-medium">{wrapPurpose(certificate.req_type || "Personal Certificate")}</Text>
                          {isNonResident && (
                            <Text className="text-purple-600 text-[10px] mt-1 font-medium">Non-Resident</Text>
                          )}
                        </View>
                        {getStatusBadge(certificate.req_status)}
                      </View>
                      <Text className="text-gray-500 text-xs mt-1">ID: {id}</Text>
                      <Text className="text-gray-500 text-xs mt-1">Name: {name || '—'}</Text>
                      <Text className="text-gray-500 text-xs mt-1">Purpose: {certificate.req_purpose || certificate.req_type || '—'}</Text>
                      <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(certificate.req_request_date)}</Text>
                      {certificate.req_claim_date && (
                        <Text className="text-gray-500 text-xs mt-1">Date Claimed: {formatDate(certificate.req_claim_date)}</Text>
                      )}
                    </View>
                  );
                })
              ) : (
                <View className="flex-1 items-center justify-center py-12">
                  <View className="items-center">
                    <View className="bg-gray-100 rounded-full p-4 mb-4">
                      <Text className="text-gray-500 text-2xl">📋</Text>
                    </View>
                    <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
                      {searchQuery ? 'No certificates found matching your search' : 'No certificates yet'}
                    </Text>
                    <Text className="text-gray-500 text-sm text-center">
                      {searchQuery ? 'Try adjusting your search terms' : 'Your certificates will appear here'}
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

export default CertList