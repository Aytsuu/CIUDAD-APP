import PageLayout from "@/screens/_PageLayout";
import { TouchableOpacity, Text, View, FlatList, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { Search } from "@/lib/icons/Search"
import React from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/emptyState";
import { SelectLayout } from "@/components/ui/select-layout";
import type { SummonCaseList } from "../summon-types";
import { useGetLuponCaseList } from "../queries/summonFetchQueries";

// Status color mapping
const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    
    switch(status.toLowerCase()) {
        case "ongoing":
            return "bg-blue-100 border-blue-200";
        case "resolved":
            return "bg-green-100 border-green-200";
        case "escalated":
            return "bg-red-100 border-red-200";
        case "waiting for schedule":
            return "bg-yellow-100 border-yellow-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

// Status badge component
function StatusBadge({ status }: { status: string | null | undefined }) {
    const statusColor = getStatusColor(status);
    return (
        <View className={`px-3 py-1 rounded-full border ${statusColor}`}>
            <Text className={`text-xs font-medium`}>
                {status || "No Status"}
            </Text>
        </View>
    );
}

// Resident badge component
function ResidentBadge() {
    return (
        <View className="px-2 py-0.5 rounded-full bg-green-100 border border-green-200">
            <Text className="text-xs font-semibold text-green-700">Resident</Text>
        </View>
    );
}

// Summon Case Card Component
const SummonCaseCard = React.memo(({ item }: { item: SummonCaseList }) => {
    const router = useRouter();
    
    const hasResidentComplainant = (item: SummonCaseList) => {
        if (!item.complainant_rp_ids) return false;
        
        if (Array.isArray(item.complainant_rp_ids)) {
            return item.complainant_rp_ids.some(rpId => rpId != null);
        }
        
        return item.complainant_rp_ids != null;
    };

    const handleViewDetails = () => {
        router.push({
            pathname: "/(summon)/view-remarks-details",
            params: {
                sc_id: item.sc_id,
                incident_type: item.incident_type,
                hasResident: hasResidentComplainant(item) ? "true" : "false",
                comp_names: Array.isArray(item.complainant_names) 
                    ? item.complainant_names.join(",") 
                    : item.complainant_names || "N/A",
                acc_names: Array.isArray(item.accused_names) 
                    ? item.accused_names.join(",") 
                    : item.accused_names || "N/A",
                complainant_addresses: Array.isArray(item.complainant_addresses) 
                    ? item.complainant_addresses.join(",") 
                    : item.complainant_addresses || "N/A",
                accused_addresses: Array.isArray(item.accused_addresses) 
                    ? item.accused_addresses.join(",") 
                    : item.accused_addresses || "N/A",
                complainant_rp_ids: item.complainant_rp_ids ? JSON.stringify(item.complainant_rp_ids) : "",
                sc_code: item.sc_code,
                sc_mediation_status: item.sc_mediation_status || ""
            }
        });
    };


    return (
        <TouchableOpacity  onPress={() => handleViewDetails()}
            activeOpacity={0.8}
        >
            <Card className="border-2 border-gray-200 shadow-sm bg-white mb-3">
                <CardHeader className="pb-3">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                            <View className="flex-row items-center flex-wrap gap-2 mb-2">
                                <View className="bg-blue-600 px-3 py-1 rounded-full self-start">
                                    <Text className="text-white font-bold text-sm tracking-wide">{item.sc_code}</Text>
                                </View>
                                {hasResidentComplainant(item) && <ResidentBadge />}
                            </View>
                        </View>
                        
                        <StatusBadge status={item.sc_conciliation_status} />
                    </View>

                </CardHeader>

                <CardContent className="pt-3 border-t border-gray-200">
                    <View className="space-y-3 gap-3">
                        <View className="flex flex-row gap-2 items-center">
                            <Text className="text-sm font-medium text-gray-600">Incident Type:</Text>
                            <Text className='font-bold text-sm text-red-500'>{item.incident_type}</Text>
                        </View>

                        {/* Complainants */}
                        <View>
                            <Text className="text-sm font-medium text-gray-600 mb-1">Complainant/s:</Text>
                            <Text className="text-sm text-gray-800 font-bold">
                                {Array.isArray(item.complainant_names) 
                                    ? item.complainant_names.filter(name => name && name.trim() !== "").join(", ") 
                                    : item.complainant_names || "N/A"
                                }
                            </Text>
                        </View>
                        
                        {/* Respondents */}
                        <View>
                            <Text className="text-sm font-medium text-gray-600 mb-1">Respondent/s:</Text>
                            <Text className="text-sm text-gray-800 font-bold">
                                {Array.isArray(item.accused_names) 
                                    ? item.accused_names.filter(name => name && name.trim() !== "").join(", ") 
                                    : item.accused_names || "N/A"
                                }
                            </Text>
                        </View>
                    </View>
                </CardContent>
            </Card>
        </TouchableOpacity>
    );
});

export default function LuponConciliationMain() {
    const router = useRouter();
    
    // State management
    const [showSearch, setShowSearch] = React.useState<boolean>(false);
    const [searchInputVal, setSearchInputVal] = React.useState<string>('');
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const [selectedFilter, setSelectedFilter] = React.useState<string>("All");
    const [currentPage, setCurrentPage] = React.useState<number>(1);
    const [pageSize, _setPageSize] = React.useState<number>(10);
    const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
    // Query hook
    const { data: summonCaseData, isLoading, refetch } = useGetLuponCaseList(
        currentPage, 
        pageSize, 
        searchQuery, 
        selectedFilter
    );

    const summonCases = summonCaseData?.results || [];
    const totalItems = summonCaseData?.count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Refresh function
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    };

    const handleSearch = React.useCallback(() => {
        setSearchQuery(searchInputVal);
        setCurrentPage(1);
    }, [searchInputVal]);
   

    // Filter options for the dropdown
    const filterOptions = [
        { id: "All", name: "All Status" },
        { id: "Ongoing", name: "Ongoing" },
        { id: "Resolved", name: "Resolved" },
        { id: "Escalated", name: "Escalated" },
        { id: "Waiting for Schedule", name: "Waiting for Schedule" },
    ];

    // Handle filter change from dropdown
    const handleFilterChange = (value: string) => {
        setSelectedFilter(value);
        setCurrentPage(1);
    };

    // Empty state component
    const renderEmptyState = () => {
        const emptyMessage = searchQuery || selectedFilter !== "All"
            ? 'No summon cases found matching your criteria.'
            : 'No summon cases found.';
        
        return (
            <View className="flex-1 justify-center items-center py-8">
                <EmptyState emptyMessage={emptyMessage} />
            </View>
        );
    };

    // Loading state component
    const renderLoadingState = () => (
        <View className="h-64 justify-center items-center">
            <LoadingState />
        </View>
    );

    return (
        <>
            <PageLayout
                leftAction={
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                        className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                    >
                        <ChevronLeft size={24} className="text-gray-700" />
                    </TouchableOpacity>
                }
                wrapScroll={false}
                headerTitle={<Text className="text-gray-900 text-[13px]">Conciliation Proceedings Cases</Text>}
                rightAction={
                    <TouchableOpacity 
                        onPress={() => setShowSearch(!showSearch)} 
                        className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                    >
                        <Search size={22} className="text-gray-700" />
                    </TouchableOpacity>
                }
            >
                <View className="flex-1 bg-gray-50">
                    {/* Search Bar */}
                    {showSearch && (
                        <View className="px-6 pb-4">
                            <SearchInput 
                                value={searchInputVal}
                                onChange={setSearchInputVal}
                                onSubmit={handleSearch} 
                            />
                        </View>
                    )}

                    {/* Status Filter Dropdown */}
                    <View className="px-6 pb-4">
                        <SelectLayout
                            placeholder="Select status"
                            options={filterOptions.map(({ id, name }) => ({ value: id, label: name }))}
                            selectedValue={selectedFilter}
                            onSelect={(option) => handleFilterChange(option.value)}
                            className="bg-white"
                        />
                    </View>


                    {/* Cases List */}
                    <View className="flex-1 px-6">
                        {isLoading && !isRefreshing ? (
                            renderLoadingState()
                        ) : (
                            <View className="flex-1">
                                {totalItems === 0 ? (
                                    renderEmptyState()
                                ) : (
                                    <FlatList
                                        data={summonCases}
                                        renderItem={({ item }) => <SummonCaseCard item={item} />}
                                        keyExtractor={(item) => item.sc_id?.toString() ?? Math.random().toString()}
                                        showsVerticalScrollIndicator={false}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={isRefreshing}
                                                onRefresh={handleRefresh}
                                                colors={['#00a8f0']}
                                            />
                                        }
                                        contentContainerStyle={{ 
                                            paddingBottom: 16,
                                            paddingTop: 16
                                        }}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </PageLayout>
        </>
    );
}