import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from 'expo-router'
import { 
  getIssuedCertificates, 
  getIssuedBusinessPermits, 
  getIssuedServiceCharges,
  IssuedCertificate,
  IssuedBusinessPermit,
  IssuedServiceCharge 
} from '../queries/issuedCertificateQueries'
import PageLayout from '../../_PageLayout'
import { ChevronLeft } from 'lucide-react-native'
import { LoadingState } from '@/components/ui/loading-state'
import { Search } from '@/lib/icons/Search'
import { SearchInput } from '@/components/ui/search-input'

const IssuedCertList = () => {
  const [activeMainTab, setActiveMainTab] = useState<'certificates' | 'businessPermits' | 'serviceCharges'>('certificates')
  
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([])
  const [businessPermits, setBusinessPermits] = useState<IssuedBusinessPermit[]>([])
  const [serviceCharges, setServiceCharges] = useState<IssuedServiceCharge[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchInputVal, setSearchInputVal] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showSearch, setShowSearch] = useState<boolean>(false)

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        if (activeMainTab === 'certificates') {
          const data = await getIssuedCertificates(searchQuery, 1, 10)
          setCertificates(data.results)
        } else if (activeMainTab === 'businessPermits') {
          const data = await getIssuedBusinessPermits(searchQuery, 1, 10)
          setBusinessPermits(data.results)
        } else if (activeMainTab === 'serviceCharges') {
          const data = await getIssuedServiceCharges(searchQuery, 1, 10)
          setServiceCharges(data.results)
        }
        
        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchQuery, activeMainTab])

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

  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal);
  }, [searchInputVal]);

  const renderCertificates = () => (
    <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
      {certificates.length ? (
        certificates.map((certificate, idx) => (
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
          <Text className="text-gray-700 text-lg font-medium mb-2 text-center">No certificates found</Text>
        </View>
      )}
    </ScrollView>
  )

  const renderBusinessPermits = () => (
    <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
      {businessPermits.length ? (
        businessPermits.map((permit, idx) => (
          <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-900 font-medium">{wrapPurpose(permit.business_name || "Business Permit")}</Text>
              {getStatusBadge()}
            </View>
            <Text className="text-gray-500 text-xs mt-1">ID: {permit.ibp_id}</Text>
            <Text className="text-gray-500 text-xs mt-1">Purpose: {permit.purpose}</Text>
            <Text className="text-gray-500 text-xs mt-1">Date Issued: {formatDate(permit.dateIssued)}</Text>
          </View>
        ))
      ) : (
        <View className="flex-1 items-center justify-center py-12">
          <Text className="text-gray-700 text-lg font-medium mb-2 text-center">No business permits found</Text>
        </View>
      )}
    </ScrollView>
  )

  const renderServiceCharges = () => (
    <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
      {serviceCharges.length ? (
        serviceCharges.map((serviceCharge, idx) => (
          <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-900 font-medium">{serviceCharge.sr_code || "Service Charge"}</Text>
              {getStatusBadge()}
            </View>
            <Text className="text-gray-500 text-xs mt-1">ID: {serviceCharge.sr_id}</Text>
            {serviceCharge.complainant_names && serviceCharge.complainant_names.length > 0 && (
              <Text className="text-gray-500 text-xs mt-1">Complainant: {serviceCharge.complainant_names.join(', ')}</Text>
            )}
            <Text className="text-gray-500 text-xs mt-1">Date Issued: {formatDate(serviceCharge.sr_req_date)}</Text>
          </View>
        ))
      ) : (
        <View className="flex-1 items-center justify-center py-12">
          <Text className="text-gray-700 text-lg font-medium mb-2 text-center">No service charges found</Text>
        </View>
      )}
    </ScrollView>
  )

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

        {/* Main Tabs */}
        <View className="bg-white border-b border-gray-200">
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeMainTab === 'certificates' ? 'border-blue-500' : 'border-transparent'
              }`}
              onPress={() => setActiveMainTab('certificates')}
            >
              <Text className={`text-sm font-medium ${
                activeMainTab === 'certificates' ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Certificates
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeMainTab === 'businessPermits' ? 'border-blue-500' : 'border-transparent'
              }`}
              onPress={() => setActiveMainTab('businessPermits')}
            >
              <Text className={`text-sm font-medium ${
                activeMainTab === 'businessPermits' ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Business Permits
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeMainTab === 'serviceCharges' ? 'border-blue-500' : 'border-transparent'
              }`}
              onPress={() => setActiveMainTab('serviceCharges')}
            >
              <Text className={`text-sm font-medium ${
                activeMainTab === 'serviceCharges' ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Service Charges
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        <View className="flex-1">
          {error ? (
            <View className="flex-1 justify-center items-center p-6">
              <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                <Text className="text-red-800 text-sm text-center">Failed to load data.</Text>
              </View>
            </View>
          ) : (
            <>
              {activeMainTab === 'certificates' && renderCertificates()}
              {activeMainTab === 'businessPermits' && renderBusinessPermits()}
              {activeMainTab === 'serviceCharges' && renderServiceCharges()}
            </>
          )}
        </View>
      </View>
    </PageLayout>
  )
}

export default IssuedCertList
