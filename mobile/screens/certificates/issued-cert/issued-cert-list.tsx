import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { router } from 'expo-router'
import { getIssuedCertificates, IssuedCertificate } from '../queries/issuedCertificateQueries'
import PageLayout from '../../_PageLayout'
import { ChevronLeft } from 'lucide-react-native'
import { LoadingState } from '@/components/ui/loading-state'
import { Search } from '@/lib/icons/Search'
import { SearchInput } from '@/components/ui/search-input'

const IssuedCertList = () => {
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purposeFilter, setPurposeFilter] = useState<'all' | 'Barangay Clearance' | 'Certificate of Residency' | 'Certificate of Indigency' | 'Business Clearance'>('all')
  const [activeTab, setActiveTab] = useState<'all' | 'Barangay Clearance' | 'Certificate of Residency' | 'Certificate of Indigency' | 'Business Clearance'>('all')
  const [searchInputVal, setSearchInputVal] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showSearch, setShowSearch] = useState<boolean>(false)

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

  const getStatusBadge = () => {
    return <Text className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-800">Issued</Text>
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

  // Filter certificates based on purpose and search
  const filteredCertificates = useMemo(() => {
    let filtered = certificates.filter(cert => {
      if (activeTab === 'all') return true;
      return cert.purpose === activeTab;
    });

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(cert => {
        const searchLower = searchQuery.toLowerCase();
        return (
          cert.ic_id?.toLowerCase().includes(searchLower) ||
          cert.requester?.toLowerCase().includes(searchLower) ||
          cert.purpose?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [certificates, activeTab, searchQuery])

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Issued Certificates</Text>}
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

        {/* Fixed Tab Headers */}
        <View className="bg-white border-b border-gray-200">
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === 'all' ? 'border-blue-500' : 'border-transparent'
              }`}
              onPress={() => setActiveTab('all')}
            >
              <Text className={`font-medium ${activeTab === 'all' ? 'text-blue-600' : 'text-gray-500'}`}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === 'Barangay Clearance' ? 'border-blue-500' : 'border-transparent'
              }`}
              onPress={() => setActiveTab('Barangay Clearance')}
            >
              <Text className={`font-medium ${activeTab === 'Barangay Clearance' ? 'text-blue-600' : 'text-gray-500'}`}>
                Barangay
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === 'Certificate of Residency' ? 'border-blue-500' : 'border-transparent'
              }`}
              onPress={() => setActiveTab('Certificate of Residency')}
            >
              <Text className={`font-medium ${activeTab === 'Certificate of Residency' ? 'text-blue-600' : 'text-gray-500'}`}>
                Residency
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === 'Certificate of Indigency' ? 'border-blue-500' : 'border-transparent'
              }`}
              onPress={() => setActiveTab('Certificate of Indigency')}
            >
              <Text className={`font-medium ${activeTab === 'Certificate of Indigency' ? 'text-blue-600' : 'text-gray-500'}`}>
                Indigency
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === 'Business Clearance' ? 'border-blue-500' : 'border-transparent'
              }`}
              onPress={() => setActiveTab('Business Clearance')}
            >
              <Text className={`font-medium ${activeTab === 'Business Clearance' ? 'text-blue-600' : 'text-gray-500'}`}>
                Business
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Content Area */}
        <View className="flex-1">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <LoadingState />
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center p-6">
              <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                <Text className="text-red-800 text-sm text-center">Failed to load issued certificates.</Text>
              </View>
            </View>
          ) : (
            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
              {filteredCertificates.length ? (
                filteredCertificates.map((certificate, idx) => (
                  <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-900 font-medium">{wrapPurpose(certificate.purpose || "Certificate")}</Text>
                      {getStatusBadge()}
                    </View>
                    <Text className="text-gray-500 text-xs mt-1">ID: {certificate.ic_id}</Text>
                    <Text className="text-gray-500 text-xs mt-1">Requester: {certificate.requester}</Text>
                    <Text className="text-gray-500 text-xs mt-1">Date Issued: {formatDate(certificate.dateIssued)}</Text>
                  </View>
                ))
              ) : (
                <View className="flex-1 items-center justify-center py-12">
                  <View className="items-center">
                    <View className="bg-gray-100 rounded-full p-4 mb-4">
                      <Text className="text-gray-500 text-2xl">🏆</Text>
                    </View>
                    <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
                      {searchQuery ? 'No certificates found matching your search' : `No ${activeTab === 'all' ? '' : activeTab.toLowerCase()} certificates yet`}
                    </Text>
                    <Text className="text-gray-500 text-sm text-center">
                      {searchQuery ? 'Try adjusting your search terms' : `Your ${activeTab === 'all' ? '' : activeTab.toLowerCase()} certificates will appear here`}
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

export default IssuedCertList