import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from '@/screens/_PageLayout';
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Search } from "lucide-react-native";
import { useCertTracking, useCancelCertificate, useCancelBusinessPermit } from "./queries/certTrackingQueries";
import { SearchInput } from "@/components/ui/search-input";
import { LoadingState } from "@/components/ui/loading-state";
import { ConfirmationModal } from "@/components/ui/confirmationModal";

export default function CertTrackingMain() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading, isError } = useCertTracking(user?.rp || "");
  const { mutate: cancelCert, isPending: isCancelling } = useCancelCertificate(user?.rp || "");
  const { mutate: cancelBusiness } = useCancelBusinessPermit(user?.rp || "");
  const [activeTab, setActiveTab] = React.useState<'personal' | 'business'>('personal');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [searchInputVal, setSearchInputVal] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showSearch, setShowSearch] = React.useState(false);
  const [cancellingItemId, setCancellingItemId] = React.useState<string | null>(null);

  const getStatusBadge = (status?: string) => {
    const normalized = (status || "").toLowerCase().trim();
    
    // Check for cancelled status first
    if (normalized.includes("cancel") || normalized.includes("rejected") || normalized.includes("declined")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700">Cancelled</Text>
    }
    
    // Check for completed status
    if (normalized.includes("complete") || normalized.includes("approved") || normalized.includes("issued") || normalized.includes("done")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</Text>
    }
    
    // Check for in progress status
    if (normalized.includes("progress") || normalized.includes("processing") || normalized.includes("pending") || normalized.includes("submitted") || normalized.includes("under review")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">In Progress</Text>
    }
    
    // Default to in progress for any other status
    return <Text className="text-[10px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">In Progress</Text>
  }

  const getNormalizedStatus = (status?: string): 'pending' | 'in_progress' | 'completed' | 'cancelled' => {
    const normalized = (status || "").toLowerCase().trim();
    
    // Check for cancelled status first
    if (normalized.includes("cancel") || normalized.includes("rejected") || normalized.includes("declined")) {
      return 'cancelled';
    }
    
    // Check for completed status
    if (normalized.includes("complete") || normalized.includes("approved") || normalized.includes("issued") || normalized.includes("done")) {
      return 'completed';
    }
    
    // Check for in progress status
    if (normalized.includes("progress") || normalized.includes("processing") || normalized.includes("pending") || normalized.includes("submitted") || normalized.includes("under review")) {
      return 'in_progress';
    }
    
    // Default to in_progress for any other status (like "Pending", "Submitted", etc.)
    return 'in_progress';
  }

  const extractStatus = (item: any) => {
    // Try multiple possible status fields
    const status = item?.cr_req_status ?? 
                   item?.req_status ?? 
                   item?.status ?? 
                   item?.request_status ?? 
                   item?.permit_status ?? 
                   '';
    const extracted = status.toString().trim();
    
    // Debug logging to help understand what statuses we're getting
    if (extracted) {
      console.log('Extracted status:', extracted, 'for item:', item?.bpr_id || item?.cr_id);
    }
    
    return extracted;
  };

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

  const handleCancel = (item: any) => {
    // Use cr_id for personal certificates, bpr_id for business permits
    const itemId = item?.cr_id || item?.bpr_id;
    setCancellingItemId(String(itemId));
    
    if (item?.cr_id) {
      // Cancel personal certificate
      cancelCert(String(itemId), {
        onSuccess: () => {
          setCancellingItemId(null);
        },
        onError: () => {
          setCancellingItemId(null);
        }
      });
    } else if (item?.bpr_id) {
      // Cancel business permit
      cancelBusiness(String(itemId), {
        onSuccess: () => {
          setCancellingItemId(null);
        },
        onError: () => {
          setCancellingItemId(null);
        }
      });
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInputVal);
    setShowSearch(false);
  };

  // Show loading screen while auth is loading
  if (authLoading) {
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
        headerTitle="Track Requests"
        rightAction={<View className="w-10 h-10" />}
      >
        <LoadingState />
      </PageLayout>
    );
  }

  // Show loading screen while tracking data is loading
  if (isLoading) {
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
        headerTitle="Track Requests"
        rightAction={<View className="w-10 h-10" />}
      >
        <LoadingState />
      </PageLayout>
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
      headerTitle="Track Requests"
      rightAction={
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={20} color="#374151" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-gray-50">
        {showSearch && (
          <View className="px-6 py-4 bg-white border-b border-gray-200">
            <SearchInput
              value={searchInputVal}
              onChange={setSearchInputVal}
              onSubmit={handleSearch}
            />
          </View>
        )}

        {isError && (
          <View className="px-6 py-4">
            <View className="bg-red-50 border border-red-200 rounded-xl p-4">
              <Text className="text-red-800 text-sm text-center">Failed to load requests.</Text>
            </View>
          </View>
        )}

        {!isLoading && !isError && (
          <>
            {/* Fixed Tab Headers */}
            <View className="bg-white border-b border-gray-200">
              <View className="flex-row">
                <TouchableOpacity
                  className={`flex-1 py-4 items-center border-b-2 ${
                    activeTab === 'personal' ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onPress={() => setActiveTab('personal')}
                >
                  <Text className={`text-sm font-medium ${
                    activeTab === 'personal' ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    Personal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-4 items-center border-b-2 ${
                    activeTab === 'business' ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onPress={() => setActiveTab('business')}
                >
                  <Text className={`text-sm font-medium ${
                    activeTab === 'business' ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    Business
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Filters */}
            <View className="bg-white px-6 py-3 border-b border-gray-200">
              <View className="flex-row bg-gray-100 rounded-xl p-1">
                <TouchableOpacity
                  className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'all' ? 'bg-white' : ''}`}
                  activeOpacity={0.8}
                  onPress={() => setStatusFilter('all')}
                >
                  <Text className={`text-sm ${statusFilter === 'all' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'in_progress' ? 'bg-white' : ''}`}
                  activeOpacity={0.8}
                  onPress={() => setStatusFilter('in_progress')}
                >
                  <Text className={`text-sm ${statusFilter === 'in_progress' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>In Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'completed' ? 'bg-white' : ''}`}
                  activeOpacity={0.8}
                  onPress={() => setStatusFilter('completed')}
                >
                  <Text className={`text-sm ${statusFilter === 'completed' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Completed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-2 rounded-lg items-center ${statusFilter === 'cancelled' ? 'bg-white' : ''}`}
                  activeOpacity={0.8}
                  onPress={() => setStatusFilter('cancelled')}
                >
                  <Text className={`text-sm ${statusFilter === 'cancelled' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Cancelled</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tab Content */}
            <ScrollView showsVerticalScrollIndicator={false} className="p-6">
              {activeTab === 'personal' ? (
                <>
                  {data?.personal?.filter((i: any) => {
                    const statusMatch = statusFilter === 'all' || getNormalizedStatus(extractStatus(i)) === statusFilter;
                    const searchMatch = !searchQuery || 
                      (i?.purpose?.pr_purpose ?? i?.purpose ?? "Certification").toLowerCase().includes(searchQuery.toLowerCase());
                    return statusMatch && searchMatch;
                  }).length ? (
                    data.personal
                      .filter((i: any) => {
                        const statusMatch = statusFilter === 'all' || getNormalizedStatus(extractStatus(i)) === statusFilter;
                        const searchMatch = !searchQuery || 
                          (i?.purpose?.pr_purpose ?? i?.purpose ?? "Certification").toLowerCase().includes(searchQuery.toLowerCase());
                        return statusMatch && searchMatch;
                      })
                      .sort((a: any, b: any) => {
                        // Sort by status: In Progress first, then Completed, then Cancelled
                        const statusOrder: Record<string, number> = { 
                          'in_progress': 1, 
                          'completed': 2, 
                          'cancelled': 3,
                          'pending': 1 // Treat pending as in_progress
                        };
                        const statusA = getNormalizedStatus(extractStatus(a));
                        const statusB = getNormalizedStatus(extractStatus(b));
                        
                        const orderA = statusOrder[statusA] || 1;
                        const orderB = statusOrder[statusB] || 1;
                        
                        if (orderA !== orderB) {
                          return orderA - orderB;
                        }
                        
                        // If same status, sort by date (newest first)
                        const dateA = new Date(a?.req_request_date || a?.req_date || a?.cr_req_request_date || 0);
                        const dateB = new Date(b?.req_request_date || b?.req_date || b?.cr_req_request_date || 0);
                        return dateB.getTime() - dateA.getTime();
                      })
                      .map((item: any, idx: number) => (
                      <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-gray-900 font-medium">{wrapPurpose(item?.purpose?.pr_purpose ?? item?.purpose ?? "Certification")}</Text>
                          {getStatusBadge(extractStatus(item))}
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(item?.req_request_date || item?.req_date || item?.cr_req_request_date)}</Text>
                        {getNormalizedStatus(extractStatus(item)) === 'completed' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Completed: {formatDate(item?.cr_date_completed || item?.date_completed || item?.ic_date_of_issuance)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) === 'cancelled' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Cancelled: {formatDate(item?.cr_date_rejected || item?.date_cancelled)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) !== 'completed' && getNormalizedStatus(extractStatus(item)) !== 'cancelled' && (item?.cr_id || item?.bpr_id) && (
                          <View className="mt-3">
                            <ConfirmationModal
                              trigger={
                                <TouchableOpacity
                                  disabled={cancellingItemId === String(item?.cr_id || item?.bpr_id)}
                                  className="self-start bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
                                  activeOpacity={0.8}
                                >
                                  <Text className="text-red-700 text-xs font-medium">
                                    {cancellingItemId === String(item?.cr_id || item?.bpr_id) ? 'Cancelling…' : 'Cancel Request'}
                                  </Text>
                                </TouchableOpacity>
                              }
                              title="Cancel Request"
                              description="Are you sure you want to cancel this request? This action cannot be undone."
                              actionLabel="Yes, Cancel"
                              variant="destructive"
                              onPress={() => handleCancel(item)}
                              loading={cancellingItemId === String(item?.cr_id || item?.bpr_id)}
                              loadingMessage="Cancelling request..."
                            />
                          </View>
                        )}
                      </View>
                      ))
                  ) : (
                    <View className="flex-1 items-center justify-center py-12">
                      <View className="items-center">
                        <View className="bg-gray-100 rounded-full p-4 mb-4">
                          <Text className="text-gray-500 text-2xl">📋</Text>
                        </View>
                        <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
                          {searchQuery ? `No ${activeTab} requests found for "${searchQuery}"` : `No ${activeTab} requests yet`}
                        </Text>
                        <Text className="text-gray-500 text-sm text-center">
                          {searchQuery ? 'Try a different search term' : `Your ${activeTab} requests will appear here`}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <>
                  {data?.business?.filter((i: any) => {
                    const statusMatch = statusFilter === 'all' || getNormalizedStatus(extractStatus(i)) === statusFilter;
                    const searchMatch = !searchQuery || 
                      (i?.purpose ?? "Business Permit").toLowerCase().includes(searchQuery.toLowerCase());
                    return statusMatch && searchMatch;
                  }).length ? (
                    data.business
                      .filter((i: any) => {
                        const statusMatch = statusFilter === 'all' || getNormalizedStatus(extractStatus(i)) === statusFilter;
                        const searchMatch = !searchQuery || 
                          (i?.purpose ?? "Business Permit").toLowerCase().includes(searchQuery.toLowerCase());
                        return statusMatch && searchMatch;
                      })
                      .sort((a: any, b: any) => {
                        // Sort by status: In Progress first, then Completed, then Cancelled
                        const statusOrder: Record<string, number> = { 
                          'in_progress': 1, 
                          'completed': 2, 
                          'cancelled': 3,
                          'pending': 1 // Treat pending as in_progress
                        };
                        const statusA = getNormalizedStatus(extractStatus(a));
                        const statusB = getNormalizedStatus(extractStatus(b));
                        
                        const orderA = statusOrder[statusA] || 1;
                        const orderB = statusOrder[statusB] || 1;
                        
                        if (orderA !== orderB) {
                          return orderA - orderB;
                        }
                        
                        // If same status, sort by date (newest first)
                        const dateA = new Date(a?.req_request_date || a?.req_date || a?.cr_req_request_date || 0);
                        const dateB = new Date(b?.req_request_date || b?.req_date || b?.cr_req_request_date || 0);
                        return dateB.getTime() - dateA.getTime();
                      })
                      .map((item: any, idx: number) => (
                      <View key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-gray-900 font-medium">{wrapPurpose(item?.purpose ?? "Business Permit")}</Text>
                          {getStatusBadge(extractStatus(item))}
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(item?.req_request_date || item?.req_date || item?.cr_req_request_date)}</Text>
                        {getNormalizedStatus(extractStatus(item)) === 'completed' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Completed: {formatDate(item?.cr_date_completed || item?.date_completed || item?.issued_business_permit?.ibp_date_of_issuance || item?.req_date_completed)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) === 'cancelled' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Cancelled: {formatDate(item?.cr_date_rejected || item?.date_cancelled)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) !== 'completed' && getNormalizedStatus(extractStatus(item)) !== 'cancelled' && (item?.cr_id || item?.bpr_id) && (
                          <View className="mt-3">
                            <ConfirmationModal
                              trigger={
                                <TouchableOpacity
                                  disabled={cancellingItemId === String(item?.cr_id || item?.bpr_id)}
                                  className="self-start bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
                                  activeOpacity={0.8}
                                >
                                  <Text className="text-red-700 text-xs font-medium">
                                    {cancellingItemId === String(item?.cr_id || item?.bpr_id) ? 'Cancelling…' : 'Cancel Request'}
                                  </Text>
                                </TouchableOpacity>
                              }
                              title="Cancel Request"
                              description="Are you sure you want to cancel this request? This action cannot be undone."
                              actionLabel="Yes, Cancel"
                              variant="destructive"
                              onPress={() => handleCancel(item)}
                              loading={cancellingItemId === String(item?.cr_id || item?.bpr_id)}
                              loadingMessage="Cancelling request..."
                            />
                          </View>
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
                          {searchQuery ? `No ${activeTab} requests found for "${searchQuery}"` : `No ${activeTab} requests yet`}
                        </Text>
                        <Text className="text-gray-500 text-sm text-center">
                          {searchQuery ? 'Try a different search term' : `Your ${activeTab} requests will appear here`}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </>
        )}
      </View>
    </PageLayout>
  );
}


