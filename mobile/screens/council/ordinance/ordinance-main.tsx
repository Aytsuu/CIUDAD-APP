import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Linking,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Search, Eye, FileText, X } from 'lucide-react-native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SelectLayout } from '@/components/ui/select-layout';
import { useOrdinances, OrdinanceData } from './queries/ordinance-fetch-queries';
import PageLayout from '@/screens/_PageLayout';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from "@/components/ui/loading-state";

// Helper type for grouped ordinances
interface OrdinanceFolder {
  id: string;
  baseOrdinance: OrdinanceData;
  amendments: OrdinanceData[];
  totalOrdinances: number;
}

// Helper function to group ordinances into folders
const groupOrdinancesIntoFolders = (ordinances: OrdinanceData[]): OrdinanceFolder[] => {
  const folders: Map<string, OrdinanceFolder> = new Map();
  const processedOrdinances = new Set<string>();
  
  // First pass: Create folders for ordinances that have amendments or are amendments
  ordinances.forEach(ordinance => {
    if (processedOrdinances.has(ordinance.ord_num)) return;
    
    const hasAmendments = ordinances.some(ord => 
      ord.ord_parent === ordinance.ord_num && ord.ord_num !== ordinance.ord_num
    );
    
    const isAmendment = ordinance.ord_parent && ordinance.ord_parent !== ordinance.ord_num;
    
    if (hasAmendments || isAmendment) {
      const baseOrdinanceId = isAmendment ? ordinance.ord_parent! : ordinance.ord_num;
      
      if (!folders.has(baseOrdinanceId)) {
        const folderId = `folder-${baseOrdinanceId}`;
        folders.set(baseOrdinanceId, {
          id: folderId,
          baseOrdinance: ordinances.find(ord => ord.ord_num === baseOrdinanceId)!,
          amendments: [],
          totalOrdinances: 1
        });
      }
      
      processedOrdinances.add(ordinance.ord_num);
    }
  });
  
  // Second pass: Add amendments to their parent folders
  ordinances.forEach(ordinance => {
    if (ordinance.ord_parent && ordinance.ord_parent !== ordinance.ord_num) {
      const parentId = ordinance.ord_parent;
      const parentFolder = folders.get(parentId);
      
      if (parentFolder) {
        parentFolder.amendments.push(ordinance);
        parentFolder.totalOrdinances = parentFolder.amendments.length + 1;
        processedOrdinances.add(ordinance.ord_num);
      }
    }
  });
  
  // Third pass: Create standalone folders for ordinances that aren't part of any chain
  ordinances.forEach(ordinance => {
    if (!processedOrdinances.has(ordinance.ord_num)) {
      const standaloneId = `standalone-${ordinance.ord_num}`;
      folders.set(standaloneId, {
        id: standaloneId,
        baseOrdinance: ordinance,
        amendments: [],
        totalOrdinances: 1
      });
      processedOrdinances.add(ordinance.ord_num);
    }
  });
  
  return Array.from(folders.values());
};

function OrdinancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [selectedFolder, setSelectedFolder] = useState<OrdinanceFolder | null>(null);
  const [folderViewModalVisible, setFolderViewModalVisible] = useState(false);

  // Use debounce for search to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch data with backend filtering
  const { 
    data: ordinanceData = { results: [], count: 0, total_pages: 1 }, 
    isLoading, 
    isError, 
    refetch 
  } = useOrdinances(
    1,
    1000, // large number to get all data
    debouncedSearchQuery, 
    categoryFilter, 
    yearFilter,
    activeTab === "archive"
  );

  // Extract the actual data array from paginated response
  const fetchedData = ordinanceData.results || [];

  const categoryOptions = [
    { id: "all", name: "All" },
    { id: "Council", name: "Council" },
    { id: "Waste Committee", name: "Waste Committee" },
    { id: "GAD", name: "GAD" },
    { id: "Finance", name: "Finance" }
  ];

  // Extract unique years from ordinance data for the dropdown
  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    
    fetchedData.forEach(record => {
      if (record.ord_year) {
        years.add(record.ord_year);
      }
    });

    const sortedYears = Array.from(years).sort((a, b) => b - a);
    
    const options = [{ id: "all", name: "All Years" }];
    
    sortedYears.forEach(year => {
      options.push({ id: year.toString(), name: year.toString() });
    });

    return options;
  }, [fetchedData]);

  // Group ordinances into folders
  const ordinanceFolders = useMemo(() => {
    return groupOrdinancesIntoFolders(fetchedData);
  }, [fetchedData]);

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
  };

  const handleYearFilterChange = (value: string) => {
    setYearFilter(value);
  };

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

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Council': return { bg: 'bg-purple-100', text: 'text-purple-800' };
      case 'Waste Committee': return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'GAD': return { bg: 'bg-pink-100', text: 'text-pink-800' };
      case 'Finance': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  const renderFolderItem = ({ item: folder }: { item: OrdinanceFolder }) => {
    const categoryColor = getCategoryColor(folder.baseOrdinance.ord_category);
    
    return (
      <Card className="border border-gray-200 bg-white mb-4">
        <CardHeader className="flex-row justify-between items-start">
          <View className="flex-1 pr-2">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-lg bg-blue-500 items-center justify-center mr-2">
                <FileText size={16} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900" numberOfLines={2}>
                  {folder.baseOrdinance.ord_title}
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center gap-1 flex-wrap">
              <Text className="text-xs text-gray-500">ORD: {folder.baseOrdinance.ord_num}</Text>
              {folder.baseOrdinance.ord_repealed && (
                <View className="px-2 py-0.5 rounded-full bg-red-100">
                  <Text className="text-xs text-red-800 font-medium">Repealed</Text>
                </View>
              )}
            </View>
          </View>

          {folder.totalOrdinances > 1 && (
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
        </CardHeader>

        <CardContent className="space-y-2">
          <View className="flex-row items-center gap-2 mb-2">
            {folder.totalOrdinances === 1 ? (
              <View className="px-2 py-0.5 rounded bg-gray-100">
                <Text className="text-xs text-gray-600">Single Ordinance</Text>
              </View>
            ) : folder.amendments.length > 0 ? (
              <View className="px-2 py-0.5 rounded bg-blue-100">
                <Text className="text-xs text-blue-600">Multiple Ordinances</Text>
              </View>
            ) : (
              <View className="px-2 py-0.5 rounded bg-green-100">
                <Text className="text-xs text-green-600">Base Ordinance</Text>
              </View>
            )}
            
            <View className={`px-2 py-0.5 rounded ${categoryColor.bg}`}>
              <Text className={`text-xs ${categoryColor.text} font-medium`}>
                {folder.baseOrdinance.ord_category}
              </Text>
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

          <View className="flex-row justify-end">
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

  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Ordinance Record</Text>}
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <View className="flex-1 justify-center items-center px-6">
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
      </PageLayout>
    );
  }

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
        <View className="w-10 h-10 rounded-full items-center justify-center"></View>
      }
      wrapScroll={false}
    >
      <View className="flex-1 px-6">
        {/* Search and Filters */}
        <View className="mb-4">
          <View className="flex-row items-center gap-2 pb-3">
            <View className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-500 z-10" size={17} />
              <TextInput
                placeholder="Search..."
                className="pl-10 w-full h-[45px] bg-white text-base rounded-xl p-2 border border-gray-300"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View className="w-[120px] pb-5">
              <SelectLayout
                options={categoryOptions.map(f => ({ label: f.name, value: f.id }))}
                className="h-8"
                selectedValue={categoryFilter}
                onSelect={(option) => handleCategoryFilterChange(option.value)}
                placeholder="Category"
                isInModal={false}
              />
            </View>
          </View>

          {/* Year Filter */}
          <View className="pb-5">
            <SelectLayout
              options={yearOptions.map(y => ({ label: y.name, value: y.id }))}
              className="h-8"
              selectedValue={yearFilter}
              onSelect={(option) => handleYearFilterChange(option.value)}
              placeholder="Year Filter"
              isInModal={false}
            />
          </View>
        </View>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-blue-50 mb-5 mt-5 flex-row justify-between">
            <TabsTrigger 
              value="active" 
              className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
            >
              <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                Active
              </Text>
            </TabsTrigger>
            <TabsTrigger 
              value="archive"
              className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
            >
              <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                Archive
              </Text>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {isLoading ? (
              renderLoadingState()          
            ) : (
              <FlatList
                data={ordinanceFolders}
                renderItem={renderFolderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 500 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="text-center text-gray-500 py-4">
                    No active ordinances found
                  </Text>
                }
              />
            )}            
          </TabsContent>

          <TabsContent value="archive">
            {isLoading ? (
              renderLoadingState()          
            ) : (
              <FlatList
                data={ordinanceFolders}
                renderItem={renderFolderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 500 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="text-center text-gray-500 py-4">
                    No archived ordinances found
                  </Text>
                }
              />              
            )}              
          </TabsContent>
        </Tabs>

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
            <View className="flex-1 mt-20 bg-white rounded-t-3xl">
              {/* Modal Header */}
              <View className="p-4 border-b border-gray-200">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900" numberOfLines={2}>
                      {selectedFolder?.baseOrdinance.ord_title}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {selectedFolder?.totalOrdinances} ordinance(s) in this folder
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setFolderViewModalVisible(false);
                      setSelectedFolder(null);
                    }}
                    className="ml-2"
                  >
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Modal Content */}
              <ScrollView className="flex-1 p-4">
                {selectedFolder && (
                  <View className="space-y-4">
                    {/* Base Ordinance */}
                    <View className="bg-white rounded-lg border border-gray-200 p-4">
                      <View className="flex-row items-center mb-3">
                        <View className="w-2 h-2 bg-blue-500 rounded-full mr-2"></View>
                        <Text className="text-sm font-semibold text-blue-700">Base Ordinance</Text>
                        <View className="ml-2 px-2 py-0.5 rounded border border-gray-300">
                          <Text className="text-xs text-gray-600">Original</Text>
                        </View>
                      </View>

                      <View className="space-y-3">
                        <View className="flex-row items-center gap-2">
                          <TouchableOpacity
                            onPress={() => {
                              if (selectedFolder.baseOrdinance.file?.file_url) {
                                handleViewPdf(selectedFolder.baseOrdinance.file.file_url);
                              } else {
                                Alert.alert('No file available');
                              }
                            }}
                            className="bg-blue-50 px-3 py-1 rounded"
                          >
                            <View className="flex-row items-center">
                              <Eye size={12} color="#2563eb" />
                              <Text className="text-xs text-blue-600 ml-1">View File</Text>
                            </View>
                          </TouchableOpacity>
                        </View>

                        <Text className="text-base font-medium text-gray-900">
                          {selectedFolder.baseOrdinance.ord_title}
                        </Text>
                        <Text className="text-xs text-gray-600">
                          ORD: {selectedFolder.baseOrdinance.ord_num} • {selectedFolder.baseOrdinance.ord_date_created}
                        </Text>
                        <View className="bg-gray-50 p-3 rounded">
                          <Text className="text-sm text-gray-700">
                            {selectedFolder.baseOrdinance.ord_details || 'No details available'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Amendments & Repeals */}
                    {selectedFolder.amendments.length > 0 && (() => {
                      const amendmentItems = selectedFolder.amendments.filter(a => a.ord_is_ammend);
                      const repealItems = selectedFolder.amendments.filter(a => a.ord_repealed && !a.ord_is_ammend);
                      
                      return (
                        <View className="space-y-4">
                          {amendmentItems.length > 0 && (
                            <>
                              <View className="border-b border-gray-200 pb-2">
                                <Text className="text-base font-semibold text-gray-800">
                                  Amendments ({amendmentItems.length})
                                </Text>
                              </View>

                              {amendmentItems.map((amendment, index) => (
                                <View key={amendment.ord_num} className="bg-white rounded-lg border border-gray-200 p-4">
                                  <View className="flex-row items-center mb-3">
                                    <View className="w-2 h-2 bg-green-500 rounded-full mr-2"></View>
                                    <Text className="text-sm font-semibold text-green-700">Amendment {index + 1}</Text>
                                    <View className="ml-2 px-2 py-0.5 rounded border border-gray-300">
                                      <Text className="text-xs text-gray-600">Version {amendment.ord_ammend_ver || index + 1}</Text>
                                    </View>
                                  </View>

                                  <View className="space-y-3">
                                    <View className="flex-row items-center gap-2">
                                      <TouchableOpacity
                                        onPress={() => {
                                          if (amendment.file?.file_url) {
                                            handleViewPdf(amendment.file.file_url);
                                          } else {
                                            Alert.alert('No file available');
                                          }
                                        }}
                                        className="bg-blue-50 px-3 py-1 rounded"
                                      >
                                        <View className="flex-row items-center">
                                          <Eye size={12} color="#2563eb" />
                                          <Text className="text-xs text-blue-600 ml-1">View File</Text>
                                        </View>
                                      </TouchableOpacity>
                                    </View>

                                    <Text className="text-base font-medium text-gray-900">
                                      {amendment.ord_title}
                                    </Text>
                                    <Text className="text-xs text-gray-600">
                                      ORD: {amendment.ord_num} • {amendment.ord_date_created}
                                    </Text>
                                    <View className="bg-gray-50 p-3 rounded">
                                      <Text className="text-sm text-gray-700">
                                        {amendment.ord_details || 'No details available'}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              ))}
                            </>
                          )}

                          {repealItems.length > 0 && (
                            <>
                              <View className="border-b border-gray-200 pb-2">
                                <Text className="text-base font-semibold text-gray-800">
                                  Repeals ({repealItems.length})
                                </Text>
                              </View>

                              {repealItems.map((repeal) => (
                                <View key={repeal.ord_num} className="bg-white rounded-lg border border-gray-200 p-4">
                                  <View className="flex-row items-center mb-3">
                                    <View className="w-2 h-2 bg-red-500 rounded-full mr-2"></View>
                                    <Text className="text-sm font-semibold text-red-700">Repeal</Text>
                                  </View>

                                  <View className="space-y-3">
                                    <View className="flex-row items-center gap-2">
                                      <TouchableOpacity
                                        onPress={() => {
                                          if (repeal.file?.file_url) {
                                            handleViewPdf(repeal.file.file_url);
                                          } else {
                                            Alert.alert('No file available');
                                          }
                                        }}
                                        className="bg-blue-50 px-3 py-1 rounded"
                                      >
                                        <View className="flex-row items-center">
                                          <Eye size={12} color="#2563eb" />
                                          <Text className="text-xs text-blue-600 ml-1">View File</Text>
                                        </View>
                                      </TouchableOpacity>
                                    </View>

                                    <Text className="text-base font-medium text-gray-900">
                                      {repeal.ord_title}
                                    </Text>
                                    <Text className="text-xs text-gray-600">
                                      ORD: {repeal.ord_num} • {repeal.ord_date_created}
                                    </Text>
                                    <View className="bg-gray-50 p-3 rounded">
                                      <Text className="text-sm text-gray-700">
                                        {repeal.ord_details || 'No details available'}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              ))}
                            </>
                          )}
                        </View>
                      );
                    })()}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </PageLayout>
  );
}

export default OrdinancePage;

