import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Dimensions,
  RefreshControl,
  Linking,
  ActivityIndicator,
} from "react-native";
import {
  Archive,
  ArchiveRestore,
  Trash,
  ChevronLeft,
  X,
  CircleAlert,
  ClipboardCheck,
  FileText,
  ChevronRight,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { SelectLayout } from "@/components/ui/select-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import {
  useGADBudgets,
  useGetBudgetAggregates,
} from "./queries/btracker-fetch";
import {
  useArchiveGADBudget,
  useRestoreGADBudget,
  usePermanentDeleteGADBudget,
} from "./queries/btracker-del";
import PageLayout from "@/screens/_PageLayout";
import {
  GADBudgetEntryUI,
  DropdownOption,
  GADBudgetFile,
} from "./gad-btracker-types";
import { useDebounce } from "@/hooks/use-debounce";
import { LoadingState } from "@/components/ui/loading-state";
import { Search } from "@/lib/icons/Search";
import { SearchInput } from "@/components/ui/search-input";

const BudgetTrackerRecords = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const [viewFilesModalVisible, setViewFilesModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<GADBudgetFile[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const { data: aggregates, isLoading: aggregatesLoading } =
    useGetBudgetAggregates(year || "");

  const [showSearch, setShowSearch] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const {
    data: entriesData,
    isLoading,
    refetch,
    isFetching,
  } = useGADBudgets(
    year,
    currentPage,
    pageSize,
    debouncedSearchQuery,
    selectedMonth,
    activeTab === "archive"
  );
  const { mutate: archiveEntry } = useArchiveGADBudget();
  const { mutate: restoreEntry } = useRestoreGADBudget();
  const { mutate: deleteEntry } = usePermanentDeleteGADBudget();

  const handleSearch = () => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
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
    const hasNext = entriesData?.next;
    if (isScrolling && hasNext && !isFetching && !isLoadMore) {
      setIsLoadMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    await refetch();
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (!isFetching && isRefreshing) setIsRefreshing(false);
  }, [isFetching, isRefreshing]);

  useEffect(() => {
    if (!isLoading && isInitialRender) setIsInitialRender(false);
  }, [isLoading, isInitialRender]);

  useEffect(() => {
    if (!isFetching && isLoadMore) setIsLoadMore(false);
  }, [isFetching, isLoadMore]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedMonth, activeTab]);

  const entries = entriesData?.results || [];
  const totalCount = entriesData?.count || 0;
  const hasNext = entriesData?.next;

  const handleArchive = (gbud_num: number) => {
    if (gbud_num) {
      archiveEntry(gbud_num);
    }
  };

  const handleRestore = (gbud_num: number) => {
    if (gbud_num) {
      restoreEntry(gbud_num);
    }
  };

  const handleDelete = (gbud_num: number) => {
    if (gbud_num) {
      deleteEntry(gbud_num);
    }
  };

  const handleViewFiles = (files: GADBudgetFile[] | null | undefined) => {
    if (files && files.length > 0) {
      setSelectedFiles(files);
      setCurrentFileIndex(0);
      setViewFilesModalVisible(true);
    }
  };

  const handleOpenFile = () => {
    const currentFile = selectedFiles[currentFileIndex];
    if (
      currentFile &&
      (currentFile.gbf_type === "application/pdf" ||
        currentFile.gbf_url?.includes(".pdf"))
    ) {
      Linking.openURL(currentFile.gbf_url).catch((_err) => {});
    }
  };

  const nextFile = () => {
    setCurrentFileIndex((prev) =>
      prev === selectedFiles.length - 1 ? 0 : prev + 1
    );
  };

  const prevFile = () => {
    setCurrentFileIndex((prev) =>
      prev === 0 ? selectedFiles.length - 1 : prev - 1
    );
  };

  const isPDF = (file: GADBudgetFile) => {
    return (
      file.gbf_type === "application/pdf" ||
      file.gbf_url?.includes(".pdf") ||
      file.gbf_name?.toLowerCase().includes(".pdf")
    );
  };

  const handleCreate = () => {
    router.push({
      pathname: "/(gad)/budget-tracker/budget-tracker-create-form",
      params: { budYear: year },
    });
  };

  const handleEdit = (entry: GADBudgetEntryUI) => {
    if (!entry.gbud_num || !year) {
      return;
    }
    const params: Record<string, string | number> = {
      gbud_num: entry.gbud_num.toString(),
      budYear: year,
      gbud_datetime: entry.gbud_datetime || "",
      gbud_add_notes: entry.gbud_add_notes || "",
      gbud_particulars: entry.gbud_particulars
        ? Array.isArray(entry.gbud_particulars)
          ? JSON.stringify(entry.gbud_particulars)
          : entry.gbud_particulars
        : "",
      gbud_amount:
        entry.gbud_amount != null ? entry.gbud_amount.toString() : "",
      gbud_proposed_budget:
        entry.gbud_proposed_budget != null
          ? entry.gbud_proposed_budget.toString()
          : "",
      gbud_actual_expense:
        entry.gbud_actual_expense != null
          ? entry.gbud_actual_expense.toString()
          : "",
      gbud_reference_num: entry.gbud_reference_num || "",
      ...(entry.files &&
        entry.files.length > 0 && { files: JSON.stringify(entry.files) }),
    };

    router.push({
      pathname: "/(gad)/budget-tracker/budget-tracker-edit-form",
      params,
    });
  };

  const handleViewLogs = () => {
    router.push({
      pathname: "/(gad)/budget-tracker/budget-tracker-log",
      params: { budYear: year },
    });
  };

  const handleMonthSelect = (option: DropdownOption) => {
    setSelectedMonth(option.value);
    setCurrentPage(1);
  };

  const handleTabChange = (value: string) => {
    if (value === "active" || value === "archive") {
      setActiveTab(value);
      setCurrentPage(1);
    }
  };

  const renderItem = ({ item }: { item: GADBudgetEntryUI }) => (
    <TouchableOpacity onPress={() => handleEdit(item)}>
      <Card className="mb-4 border border-gray-200 bg-white">
        <CardHeader className="flex-row justify-between items-center">
          <CardTitle className="text-lg text-[#2a3a61]">
            {item.gbud_datetime
              ? new Date(item.gbud_datetime).toLocaleDateString()
              : "No date"}
          </CardTitle>
          {activeTab === "active" ? (
            <View className="flex-row gap-1">
              <ConfirmationModal
                trigger={
                  <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
                    <Archive size={16} color="#dc2626" />
                  </TouchableOpacity>
                }
                title="Archive Entry"
                description="Are you sure you want to archive this entry?"
                actionLabel="Archive"
                onPress={() => item.gbud_num && handleArchive(item.gbud_num)}
              />
            </View>
          ) : (
            <View className="flex-row gap-1">
              <ConfirmationModal
                trigger={
                  <TouchableOpacity className="bg-green-50 rounded py-1 px-1.5">
                    <ArchiveRestore size={16} color="#15803d" />
                  </TouchableOpacity>
                }
                title="Restore Entry"
                description="Are you sure you want to restore this entry?"
                actionLabel="Restore"
                onPress={() => item.gbud_num && handleRestore(item.gbud_num)}
              />
              <ConfirmationModal
                trigger={
                  <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
                    <Trash size={16} color="#dc2626" />
                  </TouchableOpacity>
                }
                title="Delete Entry"
                description="Are you sure you want to delete this entry?"
                actionLabel="Delete"
                onPress={() => item.gbud_num && handleDelete(item.gbud_num)}
              />
            </View>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Particulars:</Text>
            <Text>
              {item.gbud_particulars
                ? Array.isArray(item.gbud_particulars)
                  ? item.gbud_particulars.map((part) => part.name).join(", ") ||
                    "None"
                  : item.gbud_particulars
                : "None"}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Amount:</Text>
            <Text className="font-semibold">
              ₱
              {(Number(item.gbud_actual_expense) === 0
                ? item.gbud_proposed_budget || 0
                : item.gbud_actual_expense || item.gbud_proposed_budget || 0
              ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Documents:</Text>
            {item.files && item.files.length > 0 ? (
              <TouchableOpacity onPress={() => handleViewFiles(item.files)}>
                <Text className="text-blue-600 underline">
                  {item.files.length} attached
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center">
                <CircleAlert size={16} color="#ff2c2c" />
                <Text className="text-red-500 ml-1">No document</Text>
              </View>
            )}
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} color="#2a3a61" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">{year} Budget Records</Text>
      }
      rightAction={
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-white">
        {showSearch && (
          <SearchInput
            value={searchInputVal}
            onChange={setSearchInputVal}
            onSubmit={handleSearch}
          />
        )}

        <View className="flex p-2 px-6">
          <View className="flex-row items-center">
            <Text className="text-gray-600">Budget:</Text>
            <Text className="text-blue-500 font-bold ml-2">
              ₱
              {aggregatesLoading
                ? "..."
                : Number(aggregates?.total_budget || 0).toFixed(2)}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-600">Remaining Balance:</Text>
            <Text className="text-green-600 font-bold ml-2">
              ₱
              {aggregatesLoading
                ? "..."
                : Number(aggregates?.remaining_balance || 0).toFixed(2)}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-600">Total Expenses:</Text>
            <Text className="text-amber-600 font-bold ml-2">
              ₱
              {aggregatesLoading
                ? "..."
                : Number(aggregates?.total_expenses || 0).toFixed(2)}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-600">Pending Expenses:</Text>
            <Text className="text-red-600 font-bold ml-2">
              ₱
              {aggregatesLoading
                ? "..."
                : Number(aggregates?.pending_expenses || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        <View className="flex-1 px-6">
          <View className="flex-row gap-2 p-2">
            <SelectLayout
              options={[
                { label: "All", value: "All" },
                { label: "January", value: "01" },
                { label: "February", value: "02" },
                { label: "March", value: "03" },
                { label: "April", value: "04" },
                { label: "May", value: "05" },
                { label: "June", value: "06" },
                { label: "July", value: "07" },
                { label: "August", value: "08" },
                { label: "September", value: "09" },
                { label: "October", value: "10" },
                { label: "November", value: "11" },
                { label: "December", value: "12" },
              ]}
              selectedValue={selectedMonth}
              onSelect={handleMonthSelect}
              placeholder="Month"
              className="flex-1"
            />
          </View>

          <View className="p-2">
            <Button onPress={handleCreate} className="bg-primaryBlue">
              <Text className="text-white text-[13px] font-bold">
                New Entry
              </Text>
            </Button>
          </View>

          {isLoading && isInitialRender ? (
            <View className="h-64 justify-center items-center">
              <LoadingState />
            </View>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="flex-1"
            >
              <TabsList className="bg-blue-50 mt-5 flex-row justify-between">
                <TabsTrigger
                  value="active"
                  className={`flex-1 mx-1 ${
                    activeTab === "active"
                      ? "bg-white border-b-2 border-primaryBlue"
                      : ""
                  }`}
                >
                  <Text
                    className={`${
                      activeTab === "active"
                        ? "text-primaryBlue font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    Active
                  </Text>
                </TabsTrigger>
                <TabsTrigger
                  value="archive"
                  className={`flex-1 mx-1 ${
                    activeTab === "archive"
                      ? "bg-white border-b-2 border-primaryBlue"
                      : ""
                  }`}
                >
                  <View className="flex-row items-center justify-center">
                    <Archive
                      size={16}
                      className="mr-1"
                      color={activeTab === "archive" ? "#00A8F0" : "#6b7280"}
                    />
                    <Text
                      className={`${
                        activeTab === "archive"
                          ? "text-primaryBlue font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      Archive
                    </Text>
                  </View>
                </TabsTrigger>
              </TabsList>

              <View className="flex-row justify-end p-2">
                <TouchableOpacity
                  onPress={handleViewLogs}
                  className="bg-primaryBlue px-3 py-2 rounded-md"
                >
                  <Text className="text-white text-[17px]">
                    <ClipboardCheck size={14} color="white" /> Logs
                  </Text>
                </TouchableOpacity>
              </View>

              {!isRefreshing && entries.length > 0 && (
                <View className="mb-2">
                  <Text className="text-xs text-gray-500">
                    Showing {entries.length} of {totalCount} entries
                    {hasNext && ` (Page ${currentPage})`}
                  </Text>
                </View>
              )}

              <TabsContent value="active" className="p-2 flex-1">
                <FlatList
                  data={entries.filter((item) => !item.gbud_is_archive)}
                  renderItem={renderItem}
                  keyExtractor={(item) =>
                    item.gbud_num?.toString() || Math.random().toString()
                  }
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={5}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  onScroll={handleScroll}
                  windowSize={11}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={["#00a8f0"]}
                    />
                  }
                  ListFooterComponent={() =>
                    isFetching && isLoadMore ? (
                      <View className="py-4 items-center">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="text-xs text-gray-500 mt-2">
                          Loading more...
                        </Text>
                      </View>
                    ) : (
                      !hasNext &&
                      entries.length > 0 && (
                        <View className="py-4 items-center">
                          <Text className="text-xs text-gray-400">
                            No more records
                          </Text>
                        </View>
                      )
                    )
                  }
                  ListEmptyComponent={
                    <Text className="text-center text-gray-500 py-4">
                      No active entries found
                    </Text>
                  }
                />
              </TabsContent>

              <TabsContent value="archive" className="p-2 flex-1">
                <FlatList
                  data={entries.filter((item) => item.gbud_is_archive)}
                  renderItem={renderItem}
                  keyExtractor={(item) =>
                    item.gbud_num?.toString() || Math.random().toString()
                  }
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={5}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  onScroll={handleScroll}
                  windowSize={11}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={["#00a8f0"]}
                    />
                  }
                  ListFooterComponent={() =>
                    isFetching && isLoadMore ? (
                      <View className="py-4 items-center">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="text-xs text-gray-500 mt-2">
                          Loading more...
                        </Text>
                      </View>
                    ) : (
                      !hasNext &&
                      entries.length > 0 && (
                        <View className="py-4 items-center">
                          <Text className="text-xs text-gray-400">
                            No more records
                          </Text>
                        </View>
                      )
                    )
                  }
                  ListEmptyComponent={
                    <Text className="text-center text-gray-500 py-4">
                      No archived entries found
                    </Text>
                  }
                />
              </TabsContent>
            </Tabs>
          )}
        </View>

        <Modal
          visible={viewFilesModalVisible}
          transparent={true}
          onRequestClose={() => setViewFilesModalVisible(false)}
        >
          <View className="flex-1 bg-black/90 justify-center items-center">
            <TouchableOpacity
              className="absolute top-10 right-5 z-10"
              onPress={() => setViewFilesModalVisible(false)}
            >
              <X size={24} color="white" />
            </TouchableOpacity>

            {selectedFiles.length > 0 && (
              <>
                <View className="absolute top-10 left-5 z-10 bg-white/80 px-3 py-1 rounded-full">
                  <Text className="text-sm font-medium">
                    {currentFileIndex + 1} / {selectedFiles.length}
                  </Text>
                </View>

                {isPDF(selectedFiles[currentFileIndex]) ? (
                  <View className="w-full h-full justify-center items-center p-4">
                    <View className="w-full max-w-md aspect-[4/3] bg-gray-100 rounded-lg justify-center items-center p-4">
                      <FileText size={72} color="#0ea5e9" />
                      <Text className="text-lg mt-4 font-medium text-center">
                        {selectedFiles[currentFileIndex]?.gbf_name ||
                          "PDF Document"}
                      </Text>
                      <Text className="text-sm mt-2 text-center">
                        This document is in PDF format. Tap below to open it in
                        your PDF viewer.
                      </Text>
                      <TouchableOpacity
                        className="mt-6 bg-blue-500 px-6 py-3 rounded-md"
                        onPress={handleOpenFile}
                      >
                        <Text className="text-white font-medium">Open PDF</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <Image
                      source={{ uri: selectedFiles[currentFileIndex]?.gbf_url }}
                      style={{ width: screenWidth, height: screenHeight * 0.8 }}
                      resizeMode="contain"
                    />
                    <Text className="text-white mt-2 text-center px-4">
                      {selectedFiles[currentFileIndex]?.gbf_name}
                    </Text>
                  </>
                )}

                {selectedFiles.length > 1 && (
                  <>
                    <TouchableOpacity
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 w-12 h-12 rounded-full justify-center items-center"
                      onPress={prevFile}
                    >
                      <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 w-12 h-12 rounded-full justify-center items-center"
                      onPress={nextFile}
                    >
                      <ChevronRight size={24} color="white" />
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </Modal>
      </View>
    </PageLayout>
  );
};

export default BudgetTrackerRecords;
