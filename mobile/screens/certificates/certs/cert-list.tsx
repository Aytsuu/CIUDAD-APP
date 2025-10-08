import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { router } from 'expo-router'
import { getCertificates, Certificate } from '../queries/certificateQueries'
import PageLayout from '../../_PageLayout'
import { ChevronLeft } from 'lucide-react-native'

const CertList = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected' | 'completed'>('all')

  // Fetch certificates from API
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true)
        const data = await getCertificates()
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

  const getNormalizedStatus = (status?: string): 'approved' | 'pending' | 'rejected' | 'completed' => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("reject")) return 'rejected';
    if (normalized.includes("approve")) return 'approved';
    if (normalized.includes("complete")) return 'completed';
    return 'pending';
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

  // Filter certificates based on status
  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      if (statusFilter === 'all') return true;
      return getNormalizedStatus(cert.req_status) === statusFilter;
    })
  }, [certificates, statusFilter])

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Personal Clearance Request</Text>}
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 px-5">
        {loading && (
          <View className="items-center justify-center py-10">
            <ActivityIndicator />
            <Text className="text-gray-500 mt-2">Loading certificates…</Text>
          </View>
        )}

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <Text className="text-red-800 text-sm">Failed to load certificates.</Text>
          </View>
        )}

        {!loading && !error && (
          <>
            {/* Status Filters */}
            <View className="flex-row bg-gray-100 rounded-xl p-1 mb-3">
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'all' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setStatusFilter('all')}
              >
                <Text className={`text-sm ${statusFilter === 'all' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'pending' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setStatusFilter('pending')}
              >
                <Text className={`text-sm ${statusFilter === 'pending' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Pending</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'approved' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setStatusFilter('approved')}
              >
                <Text className={`text-sm ${statusFilter === 'approved' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Approved</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'completed' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setStatusFilter('completed')}
              >
                <Text className={`text-sm ${statusFilter === 'completed' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Completed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'rejected' ? 'bg-white' : ''}`}
                activeOpacity={0.8}
                onPress={() => setStatusFilter('rejected')}
              >
                <Text className={`text-sm ${statusFilter === 'rejected' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Rejected</Text>
              </TouchableOpacity>
            </View>

            {/* Certificate Cards */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredCertificates.length ? (
                filteredCertificates.map((certificate, idx) => (
                  <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-900 font-medium">{wrapPurpose(certificate.req_type || "Personal Certificate")}</Text>
                      {getStatusBadge(certificate.req_status)}
                    </View>
                    <Text className="text-gray-500 text-xs mt-1">ID: {certificate.cr_id}</Text>
                    <Text className="text-gray-500 text-xs mt-1">Name: {certificate.resident_details?.per_fname} {certificate.resident_details?.per_lname}</Text>
                    <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(certificate.req_request_date)}</Text>
                    {certificate.req_claim_date && (
                      <Text className="text-gray-500 text-xs mt-1">Date Claimed: {formatDate(certificate.req_claim_date)}</Text>
                    )}
                  </View>
                ))
              ) : (
                <Text className="text-gray-500 text-sm mb-4">No personal certificates found.</Text>
              )}
            </ScrollView>
          </>
        )}
      </View>
    </PageLayout>
  )
}

export default CertList