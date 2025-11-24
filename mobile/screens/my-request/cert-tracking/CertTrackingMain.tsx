import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from '@/screens/_PageLayout';
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Search } from "lucide-react-native";
import { ChevronDown } from "lucide-react-native";
import { useCertTracking, useCancelCertificate, useCancelBusinessPermit, useCancelServiceCharge } from "./queries/certTrackingQueries";
import { SearchInput } from "@/components/ui/search-input";
import { LoadingState } from "@/components/ui/loading-state";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { CustomDropdown } from "@/components/ui/custom-dropdown";

export default function CertTrackingMain() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading, isError } = useCertTracking(user?.rp || "");
  const { mutate: cancelCert, isPending: isCancelling } = useCancelCertificate(user?.rp || "");
  const { mutate: cancelBusiness, isPending: isCancellingBusiness } = useCancelBusinessPermit(user?.rp || "");
  const { mutate: cancelService, isPending: isCancellingService } = useCancelServiceCharge(user?.rp || "");
  const [activeTab, setActiveTab] = React.useState<'personal' | 'business' | 'serviceCharge'>('personal');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'in_progress' | 'completed' | 'cancelled' | 'declined'>('all');
  const [paymentFilter, setPaymentFilter] = React.useState<'all' | 'unpaid' | 'paid'>('all');
  const [searchInputVal, setSearchInputVal] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showSearch, setShowSearch] = React.useState(false);
  const [cancellingItemId, setCancellingItemId] = React.useState<string | null>(null);

  const getStatusBadge = (status?: string) => {
    const normalized = (status || "").toLowerCase().trim();
    
    // Check for declined status (admin declined from website)
    if (normalized.includes("declined") || normalized.includes("rejected")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700">Declined</Text>
    }
    
    // Check for cancelled status (resident cancelled)
    if (normalized.includes("cancel")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-orange-100 text-orange-700">Cancelled</Text>
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

  const getNormalizedStatus = (status?: string): 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'declined' => {
    const normalized = (status || "").toLowerCase().trim();
    
    // Check for declined status (admin declined from website)
    if (normalized.includes("declined") || normalized.includes("rejected")) {
      return 'declined';
    }
    
    // Check for cancelled status (resident cancelled)
    if (normalized.includes("cancel")) {
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

  const getPaymentBadge = (paymentStatus?: string) => {
    const normalized = (paymentStatus || "").toLowerCase().trim();
    
    if (normalized === 'paid') {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-800">Paid</Text>;
    }
    
    if (normalized === 'unpaid') {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-orange-100 text-orange-800">Unpaid</Text>;
    }
    
    // Handle declined payment status (when request is declined, payment status is also set to Declined)
    if (normalized === 'declined') {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700">Declined</Text>;
    }
    
    // Handle cancelled payment status (when request is cancelled, payment status is also set to Cancelled)
    if (normalized === 'cancelled') {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-orange-100 text-orange-700">Cancelled</Text>;
    }
    
    return <Text className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-800">—</Text>;
  }

  const getPaymentStatus = (item: any): string => {
    // Try multiple possible payment status fields
    const paymentStatus = item?.cr_req_payment_status ?? 
                          item?.req_payment_status ?? 
                          item?.pay_status ??
                          item?.payment_status ?? 
                          '';
    return paymentStatus.toString().trim();
  }

  const getDeclineReason = (item: any): string => {
    const declineReason = item?.cr_reason ?? item?.bus_reason ?? item?.pay_reason ?? '';
    return declineReason.toString().trim();
  }

  const extractStatus = (item: any) => {
    const status = item?.cr_req_status ?? item?.req_status ?? item?.sr_req_status ?? item?.pay_req_status ?? '';
    const extracted = status.toString().trim();

    if (extracted) {
      console.log('Extracted status:', extracted, 'for item:', item?.bpr_id || item?.cr_id || item?.pay_id);
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

  const calculateDueDate = (requestDate?: string) => {
    if (!requestDate) return '—';
    try {
      const dt = new Date(requestDate);
      if (isNaN(dt.getTime())) return '—';
      // Add 7 days to the request date
      dt.setDate(dt.getDate() + 7);
      return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return '—';
    }
  }

  const wrapPurpose = (text?: string, maxFirstLine: number = 24) => {
    if (!text) return '—';
    if (text.length <= maxFirstLine) return text;
    const breakIdx = text.lastIndexOf(' ', maxFirstLine);
    const idx = breakIdx > 0 ? breakIdx : maxFirstLine;
    return text.slice(0, idx) + "\n" + text.slice(idx).trimStart();
  }

  const formatTabName = (tab: string) => {
    if (tab === 'serviceCharge') return 'Service Charge';
    return tab.charAt(0).toUpperCase() + tab.slice(1);
  }

  const handleCancel = (item: any) => {
    // Use cr_id for personal certificates, bpr_id for business permits, pay_id for service charges
    const itemId = item?.cr_id || item?.bpr_id || item?.pay_id;
    
    if (item?.cr_id) {
      // Cancel personal certificate
      setCancellingItemId(String(itemId));
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
      setCancellingItemId(String(itemId));
      cancelBusiness(String(itemId), {
        onSuccess: () => {
          setCancellingItemId(null);
        },
        onError: () => {
          setCancellingItemId(null);
        }
      });
    } else if (item?.pay_id) {
      // Cancel service charge
      setCancellingItemId(String(itemId));
      cancelService(String(itemId), {
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

  if (authLoading) {
    return (
      <PageLayout
        wrapScroll={false}
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
            
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
        }
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
        wrapScroll={false}
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
        }
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
      headerTitle={<Text className="text-gray-900 text-[13px]">Request Tracking</Text>}
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
                <TouchableOpacity
                  className={`flex-1 py-4 items-center border-b-2 ${
                    activeTab === 'serviceCharge' ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onPress={() => setActiveTab('serviceCharge')}
                >
                  <Text className={`text-sm font-medium ${
                    activeTab === 'serviceCharge' ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    Service Charge
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Filters */}
            <View className="bg-white px-6 py-4 border-b border-gray-200">
              <View className="flex-row gap-4">
                {/* Request Status Dropdown */}
                <View className="flex-1">
                  <Text className="text-xs font-medium text-gray-600 mb-2">Request Status</Text>
                  <CustomDropdown
                    value={statusFilter}
                    onSelect={(value: string) => setStatusFilter(value as any)}
                    data={[
                      { label: 'All', value: 'all' },
                      { label: 'In Progress', value: 'in_progress' },
                      { label: 'Completed', value: 'completed' },
                      { label: 'Cancelled', value: 'cancelled' },
                      { label: 'Declined', value: 'declined' }
                    ]}
                    placeholder="Select status"
                  />
                </View>

                {/* Payment Status Dropdown */}
                <View className="flex-1">
                  <Text className="text-xs font-medium text-gray-600 mb-2">Payment Status</Text>
                  <CustomDropdown
                    value={paymentFilter}
                    onSelect={(value: string) => setPaymentFilter(value as any)}
                    data={[
                      { label: 'All', value: 'all' },
                      { label: 'Unpaid', value: 'unpaid' },
                      { label: 'Paid', value: 'paid' }
                    ]}
                    placeholder="Select payment"
                  />
                </View>
              </View>
            </View>

            {/* Tab Content */}
            <ScrollView showsVerticalScrollIndicator={false} className="p-6">
              {activeTab === 'personal' ? (
                <>
                  {data?.personal?.filter((i: any) => {
                    const normalizedStatus = getNormalizedStatus(extractStatus(i));
                    const paymentStatus = getPaymentStatus(i).toLowerCase();
                    
                    const statusMatch = statusFilter === 'all' || normalizedStatus === statusFilter;
                    // For payment filter: 'unpaid' matches 'unpaid', 'paid' matches 'paid', 
                    // but 'declined' and 'cancelled' payment statuses should not match 'unpaid' or 'paid'
                    let paymentMatch = true;
                    if (paymentFilter !== 'all') {
                      // If payment status is declined or cancelled, it should not match unpaid or paid filters
                      if (paymentStatus === 'declined' || paymentStatus === 'cancelled') {
                        paymentMatch = false;
                      } else if (paymentFilter === 'unpaid') {
                        paymentMatch = paymentStatus === 'unpaid';
                      } else if (paymentFilter === 'paid') {
                        paymentMatch = paymentStatus === 'paid';
                      }
                    }
                    const searchMatch = !searchQuery || 
                      (i?.purpose?.pr_purpose ?? i?.purpose ?? "Certification").toLowerCase().includes(searchQuery.toLowerCase());
                    
                    
                    return statusMatch && paymentMatch && searchMatch;
                  }).length ? (
                    data.personal
                      .filter((i: any) => {
                        const normalizedStatus = getNormalizedStatus(extractStatus(i));
                        const paymentStatus = getPaymentStatus(i).toLowerCase();
                        
                        const statusMatch = statusFilter === 'all' || normalizedStatus === statusFilter;
                        // For payment filter: 'unpaid' matches 'unpaid', 'paid' matches 'paid', 
                        // but 'declined' and 'cancelled' payment statuses should not match 'unpaid' or 'paid'
                        let paymentMatch = true;
                        if (paymentFilter !== 'all') {
                          // If payment status is declined or cancelled, it should not match unpaid or paid filters
                          if (paymentStatus === 'declined' || paymentStatus === 'cancelled') {
                            paymentMatch = false;
                          } else if (paymentFilter === 'unpaid') {
                            paymentMatch = paymentStatus === 'unpaid';
                          } else if (paymentFilter === 'paid') {
                            paymentMatch = paymentStatus === 'paid';
                          }
                        }
                        const searchMatch = !searchQuery || 
                          (i?.purpose?.pr_purpose ?? i?.purpose ?? "Certification").toLowerCase().includes(searchQuery.toLowerCase());
                        
                        return statusMatch && paymentMatch && searchMatch;
                      })
                      .sort((a: any, b: any) => {
                        // Sort by status: In Progress first, then Completed, then Cancelled, then Declined
                        const statusOrder: Record<string, number> = { 
                          'in_progress': 1, 
                          'completed': 2, 
                          'cancelled': 3,
                          'declined': 4,
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
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="text-gray-900 font-medium flex-1">{wrapPurpose(item?.purpose?.pr_purpose ?? item?.purpose ?? "Certification")}</Text>
                          <View className="flex-row gap-2">
                            {getStatusBadge(extractStatus(item))}
                          </View>
                        </View>
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-gray-500 text-xs">Payment Status:</Text>
                          {getPaymentBadge(getPaymentStatus(item))}
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(item?.req_request_date || item?.req_date || item?.cr_req_request_date)}</Text>
                        <Text className="text-gray-500 text-xs mt-1">Due Date: {calculateDueDate(item?.req_request_date || item?.req_date || item?.cr_req_request_date)}</Text>
                        {getPaymentStatus(item).toLowerCase() === 'paid' && (item?.cr_pay_date || item?.invoice?.inv_date) && (
                          <Text className="text-gray-500 text-xs mt-1">Date Paid: {formatDate(item?.cr_pay_date || item?.invoice?.inv_date)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) === 'completed' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Completed: {formatDate(item?.cr_date_completed || item?.date_completed || item?.ic_date_of_issuance)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) === 'cancelled' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Cancelled: {formatDate(item?.req_date_completed || item?.cr_date_rejected || item?.date_cancelled)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) === 'declined' && (
                          <>
                            <Text className="text-gray-500 text-xs mt-1">Date Declined: {formatDate(item?.req_date_completed || item?.cr_date_rejected || item?.date_declined)}</Text>
                            {getDeclineReason(item) && (
                              <Text className="text-gray-500 text-xs mt-1">Decline Reason: {getDeclineReason(item)}</Text>
                            )}
                          </>
                        )}
                        {getNormalizedStatus(extractStatus(item)) !== 'completed' && getNormalizedStatus(extractStatus(item)) !== 'cancelled' && getNormalizedStatus(extractStatus(item)) !== 'declined' && (item?.cr_id || item?.bpr_id) && (
                          <View className="mt-3">
                            <ConfirmationModal
                              trigger={
                                <TouchableOpacity
                                  disabled={cancellingItemId === String(item?.cr_id || item?.bpr_id || item?.pay_id)}
                                  className="self-start bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
                                  activeOpacity={0.8}
                                >
                                  <Text className="text-red-700 text-xs font-medium">
                                    {cancellingItemId === String(item?.cr_id || item?.bpr_id || item?.pay_id) ? 'Cancelling…' : 'Cancel Request'}
                                  </Text>
                                </TouchableOpacity>
                              }
                              title="Cancel Request"
                              description="Are you sure you want to cancel this request? This action cannot be undone."
                              actionLabel="Yes, Cancel"
                              variant="destructive"
                              onPress={() => handleCancel(item)}
                              loading={cancellingItemId === String(item?.cr_id || item?.bpr_id || item?.pay_id)}
                              loadingMessage="Cancelling request..."
                            />
                          </View>
                        )}
                      </View>
                      ))
                  ) : (
                    <View className="flex-1 items-center justify-center py-12">
                      <View className="items-center">
                        <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
                          {searchQuery ? `No ${formatTabName(activeTab)} requests found for "${searchQuery}"` : `No ${formatTabName(activeTab)} requests yet`}
                        </Text>
                        <Text className="text-gray-500 text-sm text-center">
                          {searchQuery ? 'Try a different search term' : `Your ${formatTabName(activeTab)} requests will appear here`}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              ) : activeTab === 'business' ? (
                <>
                  {data?.business?.filter((i: any) => {
                    const normalizedStatus = getNormalizedStatus(extractStatus(i));
                    const paymentStatus = getPaymentStatus(i).toLowerCase();
                    
                    const statusMatch = statusFilter === 'all' || normalizedStatus === statusFilter;
                    // For payment filter: 'unpaid' matches 'unpaid', 'paid' matches 'paid', 
                    // but 'declined' and 'cancelled' payment statuses should not match 'unpaid' or 'paid'
                    let paymentMatch = true;
                    if (paymentFilter !== 'all') {
                      // If payment status is declined or cancelled, it should not match unpaid or paid filters
                      if (paymentStatus === 'declined' || paymentStatus === 'cancelled') {
                        paymentMatch = false;
                      } else if (paymentFilter === 'unpaid') {
                        paymentMatch = paymentStatus === 'unpaid';
                      } else if (paymentFilter === 'paid') {
                        paymentMatch = paymentStatus === 'paid';
                      }
                    }
                    const searchMatch = !searchQuery || 
                      (i?.purpose ?? "Business Permit").toLowerCase().includes(searchQuery.toLowerCase());
                    
                    return statusMatch && paymentMatch && searchMatch;
                  }).length ? (
                    data.business
                      .filter((i: any) => {
                        const normalizedStatus = getNormalizedStatus(extractStatus(i));
                        const paymentStatus = getPaymentStatus(i).toLowerCase();
                        
                        const statusMatch = statusFilter === 'all' || normalizedStatus === statusFilter;
                        // For payment filter: 'unpaid' matches 'unpaid', 'paid' matches 'paid', 
                        // but 'declined' and 'cancelled' payment statuses should not match 'unpaid' or 'paid'
                        let paymentMatch = true;
                        if (paymentFilter !== 'all') {
                          // If payment status is declined or cancelled, it should not match unpaid or paid filters
                          if (paymentStatus === 'declined' || paymentStatus === 'cancelled') {
                            paymentMatch = false;
                          } else if (paymentFilter === 'unpaid') {
                            paymentMatch = paymentStatus === 'unpaid';
                          } else if (paymentFilter === 'paid') {
                            paymentMatch = paymentStatus === 'paid';
                          }
                        }
                        const searchMatch = !searchQuery || 
                          (i?.purpose ?? "Business Permit").toLowerCase().includes(searchQuery.toLowerCase());
                        
                        return statusMatch && paymentMatch && searchMatch;
                      })
                      .sort((a: any, b: any) => {
                        // Sort by status: In Progress first, then Completed, then Cancelled, then Declined
                        const statusOrder: Record<string, number> = { 
                          'in_progress': 1, 
                          'completed': 2, 
                          'cancelled': 3,
                          'declined': 4,
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
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="text-gray-900 font-medium flex-1">{wrapPurpose(item?.purpose ?? "Business Permit")}</Text>
                          <View className="flex-row gap-2">
                            {getStatusBadge(extractStatus(item))}
                          </View>
                        </View>
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-gray-500 text-xs">Payment Status:</Text>
                          {getPaymentBadge(getPaymentStatus(item))}
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(item?.req_request_date || item?.req_date || item?.cr_req_request_date)}</Text>
                        <Text className="text-gray-500 text-xs mt-1">Due Date: {calculateDueDate(item?.req_request_date || item?.req_date || item?.cr_req_request_date)}</Text>
                        {getPaymentStatus(item).toLowerCase() === 'paid' && (item?.req_pay_date || item?.invoice?.inv_date) && (
                          <Text className="text-gray-500 text-xs mt-1">Date Paid: {formatDate(item?.req_pay_date || item?.invoice?.inv_date)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) === 'completed' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Completed: {formatDate(item?.cr_date_completed || item?.date_completed || item?.issued_business_permit?.ibp_date_of_issuance || item?.req_date_completed)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) === 'cancelled' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Cancelled: {formatDate(item?.req_date_completed || item?.cr_date_rejected || item?.date_cancelled)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) === 'declined' && (
                          <>
                            <Text className="text-gray-500 text-xs mt-1">Date Declined: {formatDate(item?.req_date_completed || item?.cr_date_rejected || item?.date_declined)}</Text>
                            {getDeclineReason(item) && (
                              <Text className="text-gray-500 text-xs mt-1">Decline Reason: {getDeclineReason(item)}</Text>
                            )}
                          </>
                        )}
                        {getNormalizedStatus(extractStatus(item)) !== 'completed' && getNormalizedStatus(extractStatus(item)) !== 'cancelled' && getNormalizedStatus(extractStatus(item)) !== 'declined' && (item?.cr_id || item?.bpr_id) && (
                          <View className="mt-3">
                            <ConfirmationModal
                              trigger={
                                <TouchableOpacity
                                  disabled={cancellingItemId === String(item?.cr_id || item?.bpr_id || item?.pay_id)}
                                  className="self-start bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
                                  activeOpacity={0.8}
                                >
                                  <Text className="text-red-700 text-xs font-medium">
                                    {cancellingItemId === String(item?.cr_id || item?.bpr_id || item?.pay_id) ? 'Cancelling…' : 'Cancel Request'}
                                  </Text>
                                </TouchableOpacity>
                              }
                              title="Cancel Request"
                              description="Are you sure you want to cancel this request? This action cannot be undone."
                              actionLabel="Yes, Cancel"
                              variant="destructive"
                              onPress={() => handleCancel(item)}
                              loading={cancellingItemId === String(item?.cr_id || item?.bpr_id || item?.pay_id)}
                              loadingMessage="Cancelling request..."
                            />
                          </View>
                        )}
                      </View>
                      ))
                  ) : (
                    <View className="flex-1 items-center justify-center py-12">
                      <View className="items-center">
                        <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
                          {searchQuery ? `No ${formatTabName(activeTab)} requests found for "${searchQuery}"` : `No ${formatTabName(activeTab)} requests yet`}
                        </Text>
                        <Text className="text-gray-500 text-sm text-center">
                          {searchQuery ? 'Try a different search term' : `Your ${formatTabName(activeTab)} requests will appear here`}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <>
                  {(data as any)?.serviceCharge?.filter((i: any) => {
                    const normalizedStatus = getNormalizedStatus(extractStatus(i));
                    const paymentStatus = getPaymentStatus(i).toLowerCase();
                    
                    const statusMatch = statusFilter === 'all' || normalizedStatus === statusFilter;
                    // For payment filter: 'unpaid' matches 'unpaid', 'paid' matches 'paid', 
                    // but 'declined' and 'cancelled' payment statuses should not match 'unpaid' or 'paid'
                    let paymentMatch = true;
                    if (paymentFilter !== 'all') {
                      // If payment status is declined or cancelled, it should not match unpaid or paid filters
                      if (paymentStatus === 'declined' || paymentStatus === 'cancelled') {
                        paymentMatch = false;
                      } else if (paymentFilter === 'unpaid') {
                        paymentMatch = paymentStatus === 'unpaid';
                      } else if (paymentFilter === 'paid') {
                        paymentMatch = paymentStatus === 'paid';
                      }
                    }
                    const searchMatch = !searchQuery || 
                      (i?.purpose ?? "Service Charge").toLowerCase().includes(searchQuery.toLowerCase());
                    
                    return statusMatch && paymentMatch && searchMatch;
                  }).length ? (
                    (data as any).serviceCharge
                      .filter((i: any) => {
                        const normalizedStatus = getNormalizedStatus(extractStatus(i));
                        const paymentStatus = getPaymentStatus(i).toLowerCase();
                        
                        const statusMatch = statusFilter === 'all' || normalizedStatus === statusFilter;
                        // For payment filter: 'unpaid' matches 'unpaid', 'paid' matches 'paid', 
                        // but 'declined' and 'cancelled' payment statuses should not match 'unpaid' or 'paid'
                        let paymentMatch = true;
                        if (paymentFilter !== 'all') {
                          // If payment status is declined or cancelled, it should not match unpaid or paid filters
                          if (paymentStatus === 'declined' || paymentStatus === 'cancelled') {
                            paymentMatch = false;
                          } else if (paymentFilter === 'unpaid') {
                            paymentMatch = paymentStatus === 'unpaid';
                          } else if (paymentFilter === 'paid') {
                            paymentMatch = paymentStatus === 'paid';
                          }
                        }
                        const searchMatch = !searchQuery || 
                          (i?.purpose ?? "serviceCharge").toLowerCase().includes(searchQuery.toLowerCase());
                        
                        return statusMatch && paymentMatch && searchMatch;
                      })
                      .sort((a: any, b: any) => {
                        // Sort by status: In Progress first, then Completed, then Cancelled, then Declined
                        const statusOrder: Record<string, number> = { 
                          'in_progress': 1, 
                          'completed': 2, 
                          'cancelled': 3,
                          'declined': 4,
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
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="text-gray-900 font-medium flex-1">{wrapPurpose(item?.purpose ?? "Service Charge")}</Text>
                          <View className="flex-row gap-2">
                            {getStatusBadge(extractStatus(item))}
                          </View>
                        </View>
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-gray-500 text-xs">Payment Status:</Text>
                          {getPaymentBadge(getPaymentStatus(item))}
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(item?.req_request_date || item?.req_date || item?.cr_req_request_date || item?.pay_date_req)}</Text>
                        <Text className="text-gray-500 text-xs mt-1">Due Date: {calculateDueDate(item?.req_request_date || item?.req_date || item?.cr_req_request_date || item?.pay_date_req)}</Text>
                        {getPaymentStatus(item).toLowerCase() === 'paid' && (item?.req_pay_date || item?.invoice?.inv_date || item?.pay_date_paid) && (
                          <Text className="text-gray-500 text-xs mt-1">Date Paid: {formatDate(item?.req_pay_date || item?.invoice?.inv_date || item?.pay_date_paid)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) === 'completed' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Completed: {formatDate(item?.cr_date_completed || item?.date_completed || item?.issued_serviceCharge?.isc_date_of_issuance || item?.req_date_completed)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) === 'cancelled' && (
                          <Text className="text-gray-500 text-xs mt-1">Date Cancelled: {formatDate(item?.req_date_completed || item?.cr_date_rejected || item?.date_cancelled)}</Text>
                        )}
                        {getNormalizedStatus(extractStatus(item)) === 'declined' && (
                          <>
                            <Text className="text-gray-500 text-xs mt-1">Date Declined: {formatDate(item?.req_date_completed || item?.cr_date_rejected || item?.date_declined)}</Text>
                            {getDeclineReason(item) && (
                              <Text className="text-gray-500 text-xs mt-1">Decline Reason: {getDeclineReason(item)}</Text>
                            )}
                          </>
                        )}
                        {getNormalizedStatus(extractStatus(item)) !== 'completed' && getNormalizedStatus(extractStatus(item)) !== 'cancelled' && getNormalizedStatus(extractStatus(item)) !== 'declined' && (item?.cr_id || item?.bpr_id) && (
                          <View className="mt-3">
                            <ConfirmationModal
                              trigger={
                                <TouchableOpacity
                                  disabled={cancellingItemId === String(item?.cr_id || item?.bpr_id || item?.pay_id)}
                                  className="self-start bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
                                  activeOpacity={0.8}
                                >
                                  <Text className="text-red-700 text-xs font-medium">
                                    {cancellingItemId === String(item?.cr_id || item?.bpr_id || item?.pay_id) ? 'Cancelling…' : 'Cancel Request'}
                                  </Text>
                                </TouchableOpacity>
                              }
                              title="Cancel Request"
                              description="Are you sure you want to cancel this request? This action cannot be undone."
                              actionLabel="Yes, Cancel"
                              variant="destructive"
                              onPress={() => handleCancel(item)}
                              loading={cancellingItemId === String(item?.cr_id || item?.bpr_id || item?.pay_id)}
                              loadingMessage="Cancelling request..."
                            />
                          </View>
                        )}
                      </View>
                      ))
                  ) : (
                    <View className="flex-1 items-center justify-center py-12">
                      <View className="items-center">
                        <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
                          {searchQuery ? `No ${formatTabName(activeTab)} requests found for "${searchQuery}"` : `No ${formatTabName(activeTab)} requests yet`}
                        </Text>
                        <Text className="text-gray-500 text-sm text-center">
                          {searchQuery ? 'Try a different search term' : `Your ${formatTabName(activeTab)} requests will appear here`}
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


