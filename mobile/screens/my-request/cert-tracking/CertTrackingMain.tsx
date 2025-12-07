import React, { useRef } from "react";
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from '@/screens/_PageLayout';
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Search } from "lucide-react-native";
import { useCertTracking, useCancelCertificate, useCancelBusinessPermit, useCancelServiceCharge } from "./queries/certTrackingQueries";
import { SearchInput } from "@/components/ui/search-input";
import { LoadingState } from "@/components/ui/loading-state";
import { LoadingModal } from "@/components/ui/loading-modal";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { SelectLayout } from "@/components/ui/select-layout";
import { useToastContext } from "@/components/ui/toast";

const INITIAL_PAGE_SIZE = 10;

export default function CertTrackingMain() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToastContext();

  const { data, isLoading, isError, refetch } = useCertTracking(user?.rp || "");
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
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pageSize, setPageSize] = React.useState<number>(INITIAL_PAGE_SIZE);
  const [isScrolling, setIsScrolling] = React.useState<boolean>(false);
  const [isLoadMore, setIsLoadMore] = React.useState<boolean>(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Check if any cancellation is in progress
  const isCancellingAny = isCancelling || isCancellingBusiness || isCancellingService;

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

  const canShowCancelButton = (item: any) => {
    const normalizedStatus = getNormalizedStatus(extractStatus(item));
    const paymentStatus = (getPaymentStatus(item) || "").toLowerCase();
    const isActionableStatus = !['completed', 'cancelled', 'declined'].includes(normalizedStatus);
    const hasCancelableId = Boolean(item?.cr_id || item?.bpr_id || item?.pay_id);
    const isPaymentPending = paymentStatus === 'pending' || paymentStatus === 'unpaid' || paymentStatus === '';
    return isActionableStatus && hasCancelableId && isPaymentPending;
  };

  const getDeclineReason = (item: any): string => {
    const declineReason = item?.cr_reason ?? item?.bus_reason ?? item?.pay_reason ?? '';
    return declineReason.toString().trim();
  }

  const extractStatus = (item: any) => {
    const status = item?.cr_req_status ?? item?.req_status ?? item?.sr_req_status ?? item?.pay_req_status ?? '';
    const extracted = status.toString().trim();
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
    if (!requestDate) return null;
    try {
      const dt = new Date(requestDate);
      if (isNaN(dt.getTime())) return null;
      // Add 7 days to the request date
      dt.setDate(dt.getDate() + 7);
      return dt;
    } catch {
      return null;
    }
  }

  const formatDueDate = (requestDate?: string) => {
    const dueDate = calculateDueDate(requestDate);
    if (!dueDate) return '—';
    return dueDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  const getDueDateStatus = (requestDate?: string): 'normal' | 'warning' => {
    const dueDate = calculateDueDate(requestDate);
    if (!dueDate) return 'normal';
    
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Only show warning if within 2 days (past due dates will be auto-declined)
    if (diffDays <= 2 && diffDays >= 0) return 'warning';
    return 'normal';
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
          toast.success("Request cancelled successfully");
        },
        onError: () => {
          setCancellingItemId(null);
          toast.error("Failed to cancel request. Please try again.");
        }
      });
    } else if (item?.bpr_id) {
      // Cancel business permit
      setCancellingItemId(String(itemId));
      cancelBusiness(String(itemId), {
        onSuccess: () => {
          setCancellingItemId(null);
          toast.success("Request cancelled successfully");
        },
        onError: () => {
          setCancellingItemId(null);
          toast.error("Failed to cancel request. Please try again.");
        }
      });
    } else if (item?.pay_id) {
      // Cancel service charge
      setCancellingItemId(String(itemId));
      cancelService(String(itemId), {
        onSuccess: () => {
          setCancellingItemId(null);
          toast.success("Request cancelled successfully");
        },
        onError: () => {
          setCancellingItemId(null);
          toast.error("Failed to cancel request. Please try again.");
        }
      });
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInputVal);
    setShowSearch(false);
    setPageSize(INITIAL_PAGE_SIZE);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPageSize(INITIAL_PAGE_SIZE);
    await refetch();
    setIsRefreshing(false);
  };

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  const handleLoadMore = () => {
    if (isScrolling && filteredItems.length > pageSize) {
      setIsLoadMore(true);
      setTimeout(() => {
        setPageSize((prev) => prev + 5);
        setIsLoadMore(false);
      }, 300);
    }
  };

  // Compute filtered, sorted, and paginated items for current tab
  const { filteredItems, paginatedItems } = React.useMemo(() => {
    const items = activeTab === 'personal' ? data?.personal || []
      : activeTab === 'business' ? data?.business || []
      : data?.serviceCharge || [];
    
    // Filter items
    const filtered = items.filter((i: any) => {
      const normalizedStatus = getNormalizedStatus(extractStatus(i));
      const paymentStatus = (getPaymentStatus(i) || "").toLowerCase();
      
      const statusMatch = statusFilter === 'all' || normalizedStatus === statusFilter;
      let paymentMatch = true;
      if (paymentFilter !== 'all') {
        if (paymentStatus === 'declined' || paymentStatus === 'cancelled') {
          paymentMatch = false;
        } else if (paymentFilter === 'unpaid') {
          paymentMatch = paymentStatus === 'unpaid';
        } else if (paymentFilter === 'paid') {
          paymentMatch = paymentStatus === 'paid';
        }
      }
      
      // Search matching based on tab type
      let searchMatch = true;
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (activeTab === 'personal') {
          searchMatch = (i?.purpose?.pr_purpose ?? i?.purpose ?? "Certification").toLowerCase().includes(searchLower);
        } else if (activeTab === 'business') {
          searchMatch = (i?.purpose ?? "Business Permit").toLowerCase().includes(searchLower);
        } else {
          searchMatch = (i?.purpose ?? "Service Charge").toLowerCase().includes(searchLower);
        }
      }
      
      return statusMatch && paymentMatch && searchMatch;
    });
    
    // Sort items
    const sorted = filtered.sort((a: any, b: any) => {
      const statusOrder: Record<string, number> = { 
        'in_progress': 1, 
        'completed': 2, 
        'cancelled': 3,
        'declined': 4,
        'pending': 1
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
    });
    
    // Paginate items
    const paginated = sorted.slice(0, pageSize);
    
    return { filteredItems: sorted, paginatedItems: paginated };
  }, [data, activeTab, statusFilter, paymentFilter, searchQuery, pageSize]);

  // Reset pageSize when filters/tabs change
  React.useEffect(() => {
    setPageSize(INITIAL_PAGE_SIZE);
  }, [statusFilter, paymentFilter, activeTab, searchQuery]);

  // Unified render function for items
  const renderItem = React.useCallback(({ item }: { item: any }) => {
    const paymentStatus = (getPaymentStatus(item) || "").toLowerCase();
    
    // Get purpose based on tab type
    let purpose = "Request";
    if (activeTab === 'personal') {
      purpose = item?.purpose?.pr_purpose ?? item?.purpose ?? "Certification";
    } else if (activeTab === 'business') {
      purpose = item?.purpose ?? "Business Permit";
    } else {
      purpose = item?.purpose ?? "Service Charge";
    }
    
    // Get request date
    const requestDate = item?.req_request_date || item?.req_date || item?.cr_req_request_date || item?.pay_date_req;
    
    // Get completion date based on tab type
    let completionDate = null;
    if (activeTab === 'personal') {
      completionDate = item?.cr_date_completed || item?.date_completed || item?.ic_date_of_issuance;
    } else if (activeTab === 'business') {
      completionDate = item?.cr_date_completed || item?.date_completed || item?.issued_business_permit?.ibp_date_of_issuance || item?.req_date_completed;
    } else {
      completionDate = item?.cr_date_completed || item?.date_completed || item?.issued_serviceCharge?.isc_date_of_issuance || item?.req_date_completed;
    }
    
    // Get paid date
    const paidDate = item?.cr_pay_date || item?.req_pay_date || item?.invoice?.inv_date || item?.pay_date_paid;
    
    return (
      <View className="px-6 pt-4">
        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-900 font-medium flex-1">{wrapPurpose(purpose)}</Text>
            <View className="flex-row gap-2">
              {getStatusBadge(extractStatus(item))}
            </View>
          </View>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-gray-500 text-xs">Payment Status:</Text>
            {getPaymentBadge(getPaymentStatus(item))}
          </View>
          <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(requestDate)}</Text>
          {paymentStatus === 'unpaid' && (() => {
            const dueDateStatus = getDueDateStatus(requestDate);
            const dueDateText = formatDueDate(requestDate);
            return (
              <Text className={`text-xs mt-1 ${
                dueDateStatus === 'warning' 
                  ? 'text-orange-600 font-medium' 
                  : 'text-gray-500'
              }`}>
                Due Date: {dueDateText}
                {dueDateStatus === 'warning' && ' (Due Soon)'}
              </Text>
            );
          })()}
          {paymentStatus === 'paid' && paidDate && (
            <Text className="text-gray-500 text-xs mt-1">Date Paid: {formatDate(paidDate)}</Text>
          )}
          {getNormalizedStatus(extractStatus(item)) === 'completed' && completionDate && (
            <Text className="text-gray-500 text-xs mt-1">Date Completed: {formatDate(completionDate)}</Text>
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
          {canShowCancelButton(item) && (
            <View className="mt-3">
              <ConfirmationModal
                trigger={
                  <TouchableOpacity
                    disabled={cancellingItemId === String(item?.cr_id || item?.bpr_id || item?.pay_id)}
                    className="self-start bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
                    activeOpacity={0.8}
                  >
                    <Text className="text-red-700 text-xs font-medium">
                      {cancellingItemId === String(item?.cr_id || item?.bpr_id || item?.pay_id)
                        ? 'Cancelling…'
                        : 'Cancel Request'}
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
      </View>
    );
  }, [activeTab, cancellingItemId, handleCancel]);

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
        {/* Full Screen Loading Modal */}
        <LoadingModal visible={isCancellingAny} />
        
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
              <View className="flex-row gap-3">
                {/* Request Status Dropdown */}
                <View className="flex-1">
                  <SelectLayout
                    label="Request Status"
                    placeholder="Select status"
                    options={[
                      { label: 'All', value: 'all' },
                      { label: 'In Progress', value: 'in_progress' },
                      { label: 'Completed', value: 'completed' },
                      { label: 'Cancelled', value: 'cancelled' },
                      { label: 'Declined', value: 'declined' }
                    ]}
                    selectedValue={statusFilter}
                    onSelect={(option) => setStatusFilter(option.value as any)}
                  />
                </View>

                {/* Payment Status Dropdown */}
                <View className="flex-1">
                  <SelectLayout
                    label="Payment Status"
                    placeholder="Select payment"
                    options={[
                      { label: 'All', value: 'all' },
                      { label: 'Unpaid', value: 'unpaid' },
                      { label: 'Paid', value: 'paid' }
                    ]}
                    selectedValue={paymentFilter}
                    onSelect={(option) => setPaymentFilter(option.value as any)}
                  />
                </View>
              </View>
            </View>

            {/* Tab Content */}
            <>
              {paginatedItems.length > 0 && (
                <View className="px-6 pt-4">
                  <Text className="text-xs text-gray-500">{`Showing ${paginatedItems.length} of ${filteredItems.length} requests`}</Text>
                </View>
              )}
              <FlatList
                maxToRenderPerBatch={5}
                overScrollMode="never"
                data={paginatedItems}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                initialNumToRender={5}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                onScroll={handleScroll}
                windowSize={11}
                renderItem={renderItem}
                keyExtractor={(item, idx) => String(item?.cr_id || item?.bpr_id || item?.pay_id || idx)}
                removeClippedSubviews
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    colors={['#00a8f0']}
                    tintColor="#00a8f0"
                  />
                }
                contentContainerStyle={{
                  paddingTop: 0,
                  paddingBottom: 20,
                  gap: 15,
                }}
                ListEmptyComponent={
                  !isLoading ? (
                    <View className="flex-1 items-center justify-center py-12 px-6">
                      <View className="items-center">
                        <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
                          {searchQuery ? `No ${formatTabName(activeTab)} requests found for "${searchQuery}"` : `No ${formatTabName(activeTab)} requests yet`}
                        </Text>
                        <Text className="text-gray-500 text-sm text-center">
                          {searchQuery ? 'Try a different search term' : `Your ${formatTabName(activeTab)} requests will appear here`}
                        </Text>
                      </View>
                    </View>
                  ) : null
                }
                ListFooterComponent={() =>
                  isLoadMore ? (
                    <View className="py-4 items-center">
                      <ActivityIndicator size="small" color="#3B82F6" />
                      <Text className="text-xs text-gray-500 mt-2">
                        Loading more requests...
                      </Text>
                    </View>
                  ) : (
                    filteredItems.length > pageSize &&
                    paginatedItems.length > 0 && (
                      <View className="py-4 items-center">
                        <Text className="text-xs text-gray-400">
                          Scroll to load more
                        </Text>
                      </View>
                    )
                  )
                }
              />
            </>
          </>
        )}
      </View>
    </PageLayout>
  );
}
 