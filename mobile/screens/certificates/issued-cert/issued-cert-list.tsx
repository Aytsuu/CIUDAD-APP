import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { router } from 'expo-router'
import { getIssuedCertificates, IssuedCertificate } from '../queries/issuedCertificateQueries'
import _ScreenLayout from '../../_ScreenLayout'
import { ChevronLeft } from '@/lib/icons/ChevronLeft'

const IssuedCertList = () => {
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purposeFilter, setPurposeFilter] = useState<'all' | 'Barangay Clearance' | 'Certificate of Residency' | 'Certificate of Indigency' | 'Business Clearance'>('all')

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

  // Filter certificates based on purpose
  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      if (purposeFilter === 'all') return true;
      return cert.purpose === purposeFilter;
    })
  }, [certificates, purposeFilter])

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Issued Certificates</Text>}
      customRightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 px-5">
        {loading && (
          <View className="items-center justify-center py-10">
            <ActivityIndicator />
            <Text className="text-gray-500 mt-2">Loading issued certificates…</Text>
          </View>
        )}

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <Text className="text-red-800 text-sm">Failed to load issued certificates.</Text>
          </View>
        )}

        {!loading && !error && (
          <>
            {/* Purpose Filters */}
            <View className="flex-row bg-gray-100 rounded-xl p-1 mb-3">
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${purposeFilter === 'all' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setPurposeFilter('all')}
              >
                <Text className={`text-sm ${purposeFilter === 'all' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${purposeFilter === 'Barangay Clearance' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setPurposeFilter('Barangay Clearance')}
              >
                <Text className={`text-sm ${purposeFilter === 'Barangay Clearance' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Barangay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${purposeFilter === 'Certificate of Residency' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setPurposeFilter('Certificate of Residency')}
              >
                <Text className={`text-sm ${purposeFilter === 'Certificate of Residency' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Residency</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${purposeFilter === 'Certificate of Indigency' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setPurposeFilter('Certificate of Indigency')}
              >
                <Text className={`text-sm ${purposeFilter === 'Certificate of Indigency' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Indigency</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${purposeFilter === 'Business Clearance' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setPurposeFilter('Business Clearance')}
              >
                <Text className={`text-sm ${purposeFilter === 'Business Clearance' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Business</Text>
              </TouchableOpacity>
            </View>

            {/* Issued Certificate Cards */}
            <ScrollView showsVerticalScrollIndicator={false}>
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
                <Text className="text-gray-500 text-sm mb-4">No issued certificates found.</Text>
              )}
            </ScrollView>
          </>
        )}
      </View>
    </_ScreenLayout>
  )
}

export default IssuedCertList