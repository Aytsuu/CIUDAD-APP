import React, { useState, useMemo } from 'react';
import {View, Text, TouchableOpacity, FlatList, Linking, Alert, Modal, ScrollView, Image} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Eye, FileText, X, Plus } from 'lucide-react-native';
import { SelectLayout } from '@/components/ui/select-layout';
import { useOrdinances, OrdinanceData } from './queries/ordinance-fetch-queries';
import { useUpdateOrdinance } from './queries/ordinance-fetch-insert-queries';
import { groupOrdinancesIntoFolders } from './rest-api/ordinanceGetAPI';
import PageLayout from '@/screens/_PageLayout';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from "@/components/ui/loading-state";
import OrdinanceUpload from './ordinance-upload';
import { Search } from '@/lib/icons/Search';
import { SearchInput } from '@/components/ui/search-input';

// Helper type for grouped ordinances
interface OrdinanceFolder {
  id: string;
  baseOrdinance: OrdinanceData;
  amendments: OrdinanceData[];
  totalOrdinances: number;
}


function OrdinancePage() {
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [selectedFolder, setSelectedFolder] = useState<OrdinanceFolder | null>(null);
  const [folderViewModalVisible, setFolderViewModalVisible] = useState(false);
  
  // Upload modal state
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [creationMode, setCreationMode] = useState<'new' | 'amend' | 'repeal'>('new');
  const [selectedOrdinance, setSelectedOrdinance] = useState<string>("");

  // Use debounce for search to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Convert empty string to undefined for API
  const searchQueryParam = debouncedSearchQuery && debouncedSearchQuery.trim() !== "" 
    ? debouncedSearchQuery.trim() 
    : undefined;

  // Fetch data - if searching, fetch all data and filter client-side for better reliability
  // Otherwise use backend filtering
  const { 
    data: ordinanceData = { results: [], count: 0, total_pages: 1 }, 
    isLoading, 
    isError, 
    refetch 
  } = useOrdinances(
    1,
    1000, // large number to get all data
    undefined, // Don't send search to backend - we'll filter client-side for reliability
    categoryFilter, 
    yearFilter,
    false // Show all ordinances (both active and archived)
  );

  // Extract the actual data array from paginated response
  const fetchedData = ordinanceData.results || [];

  // Mutation hooks
  const updateOrdinanceMutation = useUpdateOrdinance();

  const categoryOptions = [
    { id: "all", name: "All" },
    { id: "Council", name: "Council" },
    { id: "Waste Committee", name: "Waste Committee" },
    { id: "GAD", name: "GAD" },
    { id: "Finance", name: "Finance" }
  ];

  // Generate all years from 2020 to current year + 1
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    const endYear = currentYear + 1;
    
    const options = [{ id: "all", name: "All Years" }];
    
    // Generate years from endYear down to startYear (most recent first)
    for (let year = endYear; year >= startYear; year--) {
      options.push({ id: year.toString(), name: year.toString() });
    }

    return options;
  }, []);

  // Group ordinances into folders and sort by ord_num
  // Also apply client-side search filtering as fallback/backup
  const ordinanceFolders = useMemo(() => {
    let filteredData = fetchedData;
    
    // Apply client-side search filter as backup (in case backend search doesn't work properly)
    if (searchQueryParam && searchQueryParam.trim() !== '') {
      const searchLower = searchQueryParam.toLowerCase().trim();
      
      // First, find all ordinances that match the search
      const matchingOrdinances = new Set<string>();
      fetchedData.forEach((ord) => {
        const title = (ord.ord_title || '').toLowerCase();
        const num = (ord.ord_num || '').toLowerCase();
        const details = (ord.ord_details || '').toLowerCase();
        const category = Array.isArray(ord.ord_category) 
          ? ord.ord_category.map(c => c.toLowerCase()).join(' ')
          : (ord.ord_category || '').toLowerCase();
        
        if (
          title.includes(searchLower) ||
          num.includes(searchLower) ||
          details.includes(searchLower) ||
          category.includes(searchLower)
        ) {
          matchingOrdinances.add(ord.ord_num);
          // If this is an amendment, also include its parent
          if (ord.ord_parent && ord.ord_parent !== ord.ord_num) {
            matchingOrdinances.add(ord.ord_parent);
          }
        }
      });
      
      // Also include parents of matching amendments
      fetchedData.forEach((ord) => {
        if (ord.ord_parent && ord.ord_parent !== ord.ord_num && matchingOrdinances.has(ord.ord_num)) {
          matchingOrdinances.add(ord.ord_parent);
        }
      });
      
      // Filter to include only matching ordinances and their parents
      filteredData = fetchedData.filter((ord) => matchingOrdinances.has(ord.ord_num));
    }
    
    const folders = groupOrdinancesIntoFolders(filteredData);
    // Sort by ord_num (extract number and year for proper sorting)
    // Filter out any folders with undefined baseOrdinance (safety check)
    return folders
      .filter(folder => folder.baseOrdinance && folder.baseOrdinance.ord_num)
      .sort((a, b) => {
        const aNum = a.baseOrdinance?.ord_num || '';
        const bNum = b.baseOrdinance?.ord_num || '';
        return aNum.localeCompare(bNum, undefined, { numeric: true, sensitivity: 'base' });
      });
  }, [fetchedData, searchQueryParam]);

  // Get available ordinances for amendment/repeal selection
  const availableOrdinances = useMemo(() => {
    return fetchedData
      .filter(ord => ord.ord_num && ord.ord_num.trim() !== '')
      .filter(ord => !ord.ord_repealed)
      .map(ord => ({
        id: ord.ord_num,
        name: `${ord.ord_num} - ${ord.ord_title} (${ord.ord_year})`,
        category: ord.ord_category
      }));
  }, [fetchedData]);

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
  };

  const handleYearFilterChange = (value: string) => {
    setYearFilter(value);
  };

  const handleSearch = React.useCallback(() => {
    setIsSearching(true);
    setSearchQuery(searchInputVal);
  }, [searchInputVal]);

  // Clear loading state when debounced search completes and results are filtered
  React.useEffect(() => {
    if (searchQuery && searchQuery === debouncedSearchQuery) {
      // Small delay to ensure filtering is complete
      const timer = setTimeout(() => setIsSearching(false), 100);
      return () => clearTimeout(timer);
    } else if (!searchQuery) {
      setIsSearching(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  const handleViewPdf = (pdfUrl: string) => {
    if (!pdfUrl) {
      Alert.alert("Error", "No PDF file available");
      return;
    }
    
    Linking.openURL(pdfUrl).catch(() =>
      Alert.alert('Cannot Open PDF', 'Please make sure you have a PDF reader app installed.')
    );
  };

  const handleFolderView = (folder: OrdinanceFolder) => {
    setSelectedFolder(folder);
    setFolderViewModalVisible(true);
  };

  const handleRefresh = () => {
    refetch();
  };


  // Reset form for upload modal
  const resetForm = () => {
    setSelectedOrdinance("");
    setCreationMode('new');
  };

  // Get category badge color
  const getCategoryColor = (category: string | string[]) => {
    // Handle array - take first element, or handle string directly
    const categoryStr = Array.isArray(category) ? (category[0] || '') : (category || '');
    
    switch ((categoryStr || '').toLowerCase()) {
      case 'gad':
        return { bg: 'bg-purple-100', text: 'text-purple-800' };
      case 'finance':
        return { bg: 'bg-orange-100', text: 'text-orange-800' };
      case 'council':
        return { bg: 'bg-gray-100', text: 'text-gray-700' };
      case 'waste committee':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const renderFolderItem = ({ item: folder }: { item: OrdinanceFolder }) => {
    // Normalize category to handle both array and string
    const categories = Array.isArray(folder.baseOrdinance.ord_category) 
      ? folder.baseOrdinance.ord_category 
      : [folder.baseOrdinance.ord_category];
    
    // Check if this ordinance has been repealed (either base ordinance is repealed or has repeal amendments)
    const hasRepeal = folder.baseOrdinance.ord_repealed || 
      folder.amendments.some(amendment => amendment.ord_repealed && !amendment.ord_is_ammend);
    
    return (
      <Card className={`border border-gray-200 bg-white mb-4 ${hasRepeal ? 'opacity-75' : ''}`}>
        <CardHeader className="flex-row justify-between items-start">
          <View className="flex-1 pr-2">
            <View className="flex-row items-center mb-2">
              <View className={`w-8 h-8 rounded-lg items-center justify-center mr-2 ${hasRepeal ? 'bg-red-500' : 'bg-blue-500'}`}>
                <FileText size={16} color="white" />
              </View>
              <View className="flex-1">
                <Text className={`text-base font-semibold ${hasRepeal ? 'text-gray-600' : 'text-gray-900'}`} numberOfLines={2}>
                  {folder.baseOrdinance.ord_title}
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center gap-1 flex-wrap">
              <Text className="text-xs text-gray-500">ORD: {folder.baseOrdinance.ord_num}</Text>
              {hasRepeal && (
                <View className="px-2 py-0.5 rounded-full bg-red-100 border border-red-200">
                  <Text className="text-xs text-red-800 font-medium">REPEALED</Text>
                </View>
              )}
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            {/* View More for single ordinance, View All for multiple ordinances */}
            {folder.totalOrdinances === 1 ? (
              <TouchableOpacity
                onPress={() => handleFolderView(folder)}
                className="bg-blue-50 px-2 py-1 rounded"
              >
                <View className="flex-row items-center">
                  <Eye size={12} color="#2563eb" />
                  <Text className="text-xs text-blue-600 ml-1 font-medium">View More</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => handleFolderView(folder)}
                className="bg-blue-50 px-2 py-1 rounded"
              >
                <View className="flex-row items-center">
                  <Eye size={12} color="#2563eb" />
                  <Text className="text-xs text-blue-600 ml-1 font-medium">View All</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </CardHeader>

        <CardContent className="space-y-2">
          <View className="mb-2">
            {/* Status badge */}
            <View className="mb-2">
              {folder.totalOrdinances === 1 ? (
                <View className="px-2 py-0.5 rounded bg-gray-100 self-start">
                  <Text className="text-xs text-gray-600">Single Ordinance</Text>
                </View>
              ) : folder.amendments.length > 0 ? (
                <View className="px-2 py-0.5 rounded bg-blue-100 self-start">
                  <Text className="text-xs text-blue-600">Multiple Ordinances</Text>
                </View>
              ) : (
                <View className="px-2 py-0.5 rounded bg-green-100 self-start">
                  <Text className="text-xs text-green-600">Base Ordinance</Text>
                </View>
              )}
            </View>
            
            {/* Category badges - handle both array and string with proper wrapping */}
            <View className="flex-row flex-wrap gap-1">
              {categories.map((cat: string, index: number) => {
                const categoryColor = getCategoryColor(cat);
                return (
                  <View key={index} className={`px-2 py-0.5 rounded ${categoryColor.bg} mb-1`}>
                    <Text className={`text-xs ${categoryColor.text} font-medium`}>
                      {cat}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View className="bg-gray-50 rounded-lg p-3 mb-2">
            <View className="flex-row items-center mb-1">
              <FileText size={12} color="#3b82f6" />
              <Text className="text-xs font-semibold text-blue-700 ml-1">Details</Text>
            </View>
            <Text className="text-xs text-gray-700 mt-1" numberOfLines={3}>
              {folder.baseOrdinance.ord_details || 'No details available'}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => {
                if (folder.baseOrdinance.file?.file_url) {
                  handleViewPdf(folder.baseOrdinance.file.file_url);
                } else {
                  Alert.alert('No file available', 'No PDF file is attached to this ordinance.');
                }
              }}
              className="bg-green-50 border border-green-300 rounded px-3 py-2"
            >
              <View className="flex-row items-center">
                <Eye size={12} color="#16a34a" />
                <Text className="text-xs text-green-600 ml-1 font-medium">View File</Text>
              </View>
            </TouchableOpacity>
            
          </View>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">Ordinance Record</Text>
      }
      rightAction={
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Search size={22} className="text-gray-700" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              resetForm();
              setUploadModalVisible(true);
            }}
            className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>
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

        {/* Filters */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row gap-3 pb-3">
            <View className="flex-1">
              <SelectLayout
                label="Category Filter"
                placeholder="Select category"
                options={categoryOptions.map(f => ({ label: f.name, value: f.id }))}
                selectedValue={categoryFilter}
                onSelect={(option) => handleCategoryFilterChange(option.value)}
              />
            </View>
            <View className="flex-1">
              <SelectLayout
                label="Year Filter"
                placeholder="Select year"
                options={yearOptions.map(y => ({ label: y.name, value: y.id }))}
                selectedValue={yearFilter}
                onSelect={(option) => handleYearFilterChange(option.value)}
              />
            </View>
          </View>
        </View>

        {/* Ordinances List */}
        <View className="flex-1">
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <LoadingState />
            </View>
          ) : isError ? (
            <View className="flex-1 justify-center items-center px-6 py-20">
              <Text className="text-red-500 text-center mb-4">
                Failed to load ordinances.
              </Text>
              <TouchableOpacity
                onPress={handleRefresh}
                className="bg-[#2a3a61] px-4 py-2 rounded-lg"
              >
                <Text className="text-white">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : isSearching ? (
            <View className="flex-1 justify-center items-center py-20">
              <LoadingState />
            </View>
          ) : (
            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
              {ordinanceFolders.length ? (
                ordinanceFolders.map((folder) => (
                  <React.Fragment key={folder.id}>
                    {renderFolderItem({ item: folder })}
                  </React.Fragment>
                ))
              ) : (
                <View className="flex-1 items-center justify-center py-12">
                  <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
                    {searchQuery ? 'No ordinances found matching your search' : 'No ordinances yet'}
                  </Text>
                  <Text className="text-gray-500 text-sm text-center">
                    {searchQuery ? 'Try adjusting your search terms' : 'Ordinances will appear here'}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Folder View Modal */}
        <Modal
          visible={folderViewModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setFolderViewModalVisible(false);
            setSelectedFolder(null);
          }}
        >
          <View className="flex-1 bg-black/50">
            <View className="flex-1 mt-16 bg-white rounded-t-3xl">
              {/* Modal Header */}
              <View className="px-6 py-4 border-b border-gray-200">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900" numberOfLines={2}>
                      {selectedFolder?.baseOrdinance.ord_title}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      ORD: {selectedFolder?.baseOrdinance.ord_num} • {selectedFolder?.totalOrdinances} ordinance{selectedFolder?.totalOrdinances !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setFolderViewModalVisible(false);
                      setSelectedFolder(null);
                    }}
                    className="p-2"
                  >
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Modal Content */}
              <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <View className="p-6">
                  {selectedFolder && (
                    <View className="space-y-4">
                      {/* Base Ordinance */}
                      <View className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <View className="flex-row items-center justify-between mb-4">
                          <View className="flex-row items-center">
                            <View className="w-3 h-3 bg-blue-500 rounded-full mr-2"></View>
                            <Text className="text-base font-semibold text-blue-600">Base Ordinance</Text>
                            <View className="ml-2 px-2 py-1 bg-blue-100 rounded-full">
                              <Text className="text-xs text-blue-800 font-medium">v1.0</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              if (selectedFolder.baseOrdinance.file?.file_url) {
                                handleViewPdf(selectedFolder.baseOrdinance.file.file_url);
                              } else {
                                Alert.alert('No file available');
                              }
                            }}
                            className="bg-blue-500 px-3 py-1.5 rounded-lg"
                          >
                            <View className="flex-row items-center">
                              <Eye size={14} color="white" />
                              <Text className="text-xs text-white ml-1 font-medium">View File</Text>
                            </View>
                          </TouchableOpacity>
                        </View>

                        <Text className="text-base font-medium text-gray-900 mb-3 leading-tight">
                          {selectedFolder.baseOrdinance.ord_title}
                        </Text>
                        <View className="flex-row items-center mb-3">
                          <Text className="text-sm text-gray-600 font-medium">ORD:</Text>
                          <Text className="text-sm text-gray-800 font-semibold ml-1">
                            {selectedFolder.baseOrdinance.ord_num}
                          </Text>
                          <View className="w-1 h-1 bg-gray-300 rounded-full mx-2"></View>
                          <Text className="text-sm text-gray-600">
                            {new Date(selectedFolder.baseOrdinance.ord_date_created).toLocaleDateString()}
                          </Text>
                        </View>
                        <View className="bg-gray-50 p-3 rounded-lg">
                          <Text className="text-sm text-gray-700 leading-relaxed">
                            {selectedFolder.baseOrdinance.ord_details || 'No details available'}
                          </Text>
                        </View>
                      </View>

                      {/* Amendments & Repeals */}
                      {selectedFolder.amendments.length > 0 && (() => {
                        const amendmentItems = selectedFolder.amendments.filter(a => a.ord_is_ammend);
                        const repealItems = selectedFolder.amendments.filter(a => a.ord_repealed && !a.ord_is_ammend);
                        
                        return (
                          <View className="space-y-4">
                            {amendmentItems.length > 0 && (
                              <View className="space-y-4">
                                <View className="flex-row items-center mt-6 mb-4">
                                  <View className="w-3 h-3 bg-green-500 rounded-full mr-2"></View>
                                  <Text className="text-base font-semibold text-green-600">
                                    Amendments ({amendmentItems.length})
                                  </Text>
                                  <View className="ml-2 px-2 py-1 bg-green-100 rounded-full">
                                    <Text className="text-xs text-green-800 font-medium">
                                      {amendmentItems.length} ITEM{amendmentItems.length !== 1 ? 'S' : ''}
                                    </Text>
                                  </View>
                                </View>

                                {amendmentItems.map((amendment, index) => (
                                  <View key={amendment.ord_num} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <View className="flex-row items-center justify-between mb-4">
                                      <View className="flex-row items-center">
                                        <View className="w-3 h-3 bg-green-500 rounded-full mr-2"></View>
                                        <Text className="text-base font-semibold text-green-600">
                                          Amendment {index + 1}
                                        </Text>
                                        <View className="ml-2 px-2 py-1 bg-green-100 rounded-full">
                                          <Text className="text-xs text-green-800 font-medium">
                                            v{amendment.ord_ammend_ver || index + 1}
                                          </Text>
                                        </View>
                                      </View>
                                      <TouchableOpacity
                                        onPress={() => {
                                          if (amendment.file?.file_url) {
                                            handleViewPdf(amendment.file.file_url);
                                          } else {
                                            Alert.alert('No file available');
                                          }
                                        }}
                                        className="bg-green-500 px-3 py-1.5 rounded-lg"
                                      >
                                        <View className="flex-row items-center">
                                          <Eye size={14} color="white" />
                                          <Text className="text-xs text-white ml-1 font-medium">View File</Text>
                                        </View>
                                      </TouchableOpacity>
                                    </View>

                                    <Text className="text-base font-medium text-gray-900 mb-3 leading-tight">
                                      {amendment.ord_title}
                                    </Text>
                                    <View className="flex-row items-center mb-3">
                                      <Text className="text-sm text-gray-600 font-medium">ORD:</Text>
                                      <Text className="text-sm text-gray-800 font-semibold ml-1">
                                        {amendment.ord_num}
                                      </Text>
                                      <View className="w-1 h-1 bg-gray-300 rounded-full mx-2"></View>
                                      <Text className="text-sm text-gray-600">
                                        {new Date(amendment.ord_date_created).toLocaleDateString()}
                                      </Text>
                                    </View>
                                    <View className="bg-gray-50 p-3 rounded-lg">
                                      <Text className="text-sm text-gray-700 leading-relaxed">
                                        {amendment.ord_details || 'No details available'}
                                      </Text>
                                    </View>
                                  </View>
                                ))}
                              </View>
                            )}

                            {repealItems.length > 0 && (
                              <View className="space-y-4">
                                <View className="flex-row items-center mt-6 mb-4">
                                  <View className="w-3 h-3 bg-red-500 rounded-full mr-2"></View>
                                  <Text className="text-base font-semibold text-red-600">
                                    Repeals ({repealItems.length})
                                  </Text>
                                  <View className="ml-2 px-2 py-1 bg-red-100 rounded-full">
                                    <Text className="text-xs text-red-800 font-medium">
                                      {repealItems.length} ITEM{repealItems.length !== 1 ? 'S' : ''}
                                    </Text>
                                  </View>
                                </View>

                                {repealItems.map((repeal) => (
                                  <View key={repeal.ord_num} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <View className="flex-row items-center justify-between mb-4">
                                      <View className="flex-row items-center">
                                        <View className="w-3 h-3 bg-red-500 rounded-full mr-2"></View>
                                        <Text className="text-base font-semibold text-red-600">Repeal</Text>
                                        <View className="ml-2 px-2 py-1 bg-red-100 rounded-full">
                                          <Text className="text-xs text-red-800 font-medium">REPEALED</Text>
                                        </View>
                                      </View>
                                      <TouchableOpacity
                                        onPress={() => {
                                          if (repeal.file?.file_url) {
                                            handleViewPdf(repeal.file.file_url);
                                          } else {
                                            Alert.alert('No file available');
                                          }
                                        }}
                                        className="bg-red-500 px-3 py-1.5 rounded-lg"
                                      >
                                        <View className="flex-row items-center">
                                          <Eye size={14} color="white" />
                                          <Text className="text-xs text-white ml-1 font-medium">View File</Text>
                                        </View>
                                      </TouchableOpacity>
                                    </View>

                                    <Text className="text-base font-medium text-gray-900 mb-3 leading-tight">
                                      {repeal.ord_title}
                                    </Text>
                                    <View className="flex-row items-center mb-3">
                                      <Text className="text-sm text-gray-600 font-medium">ORD:</Text>
                                      <Text className="text-sm text-gray-800 font-semibold ml-1">
                                        {repeal.ord_num}
                                      </Text>
                                      <View className="w-1 h-1 bg-gray-300 rounded-full mx-2"></View>
                                      <Text className="text-sm text-gray-600">
                                        {new Date(repeal.ord_date_created).toLocaleDateString()}
                                      </Text>
                                    </View>
                                    <View className="bg-gray-50 p-3 rounded-lg">
                                      <Text className="text-sm text-gray-700 leading-relaxed">
                                        {repeal.ord_details || 'No details available'}
                                      </Text>
                                    </View>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        );
                      })()}
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Upload Ordinance Modal */}
        <OrdinanceUpload
          visible={uploadModalVisible}
          onClose={() => {
            setUploadModalVisible(false);
            resetForm();
          }}
          creationMode={creationMode}
          setCreationMode={setCreationMode}
          selectedOrdinance={selectedOrdinance}
          setSelectedOrdinance={setSelectedOrdinance}
          availableOrdinances={availableOrdinances}
          onSuccess={() => {
            refetch();
          }}
        />

      </View>
    </PageLayout>
  );
}

export default OrdinancePage;

