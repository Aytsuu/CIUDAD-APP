import React, { useState, useMemo, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, Dimensions } from "react-native";
import { router } from "expo-router";
import { Input } from "@/components/ui/input";
import { Search, Trash, Archive, ArchiveRestore, Edit, X, ChevronLeft } from "lucide-react-native";
import ScreenLayout from "@/screens/_ScreenLayout";
import { SelectLayout } from "@/components/ui/select-layout";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { 
  useGetIncomeImages, 
  useGetDisbursementImages, 
  IncomeImage, 
  DisbursementImage,
  Album,
  ImageItem,
  useArchiveIncomeImage,
  useRestoreIncomeImage,
  useDeleteIncomeImage,
  usePermanentDeleteIncomeImage,
  useArchiveDisbursementImage,
  useRestoreDisbursementImage,
  useDeleteDisbursementImage,
  usePermanentDeleteDisbursementImage,
  usePermanentDeleteDisbursementFolder,
  usePermanentDeleteIncomeFolder,
  useRestoreDisbursementFolder,
  useRestoreIncomeFolder
} from "./queries";

const PLACEHOLDER_IMAGE = "/placeholder-image.png";

const IncomeandDisbursementMain = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [zoomVisible, setZoomVisible] = useState(false);

  const { data: incomeImages = [], isLoading: isIncomeLoading, error: incomeError } = useGetIncomeImages(viewMode === "archived");
  const { data: disbursementImages = [], isLoading: isDisbursementLoading, error: disbursementError } = useGetDisbursementImages(viewMode === "archived");

  const archiveIncomeImage = useArchiveIncomeImage();
  const restoreIncomeImage = useRestoreIncomeImage();
  const deleteIncomeImage = useDeleteIncomeImage();
  const permanentDeleteIncomeImage = usePermanentDeleteIncomeImage();
  const archiveDisbursementImage = useArchiveDisbursementImage();
  const restoreDisbursementImage = useRestoreDisbursementImage();
  const deleteDisbursementImage = useDeleteDisbursementImage();
  const permanentDeleteDisbursementImage = usePermanentDeleteDisbursementImage();
  const permanentDeleteIncomeFolder = usePermanentDeleteIncomeFolder();
  const restoreIncomeFolder = useRestoreIncomeFolder();
  const permanentDeleteDisbursementFolder = usePermanentDeleteDisbursementFolder();
  const restoreDisbursementFolder = useRestoreDisbursementFolder();
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const typeOptions = [
    { label: "All Types", value: "all" },
    { label: "Income", value: "income" },
    { label: "Disbursement", value: "disbursement" },
  ];

  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    incomeImages.forEach((img) => years.add(img.inf_year));
    disbursementImages.forEach((img) => years.add(img.dis_year));
    return [
      { label: "All Years", value: "all" },
      ...Array.from(years)
        .sort((a, b) => parseInt(b) - parseInt(a))
        .map((year) => ({ label: year, value: year })),
    ];
  }, [incomeImages, disbursementImages]);

  const albums: Album[] = useMemo(() => {
    const albumMap: { [key: string]: Album } = {};

    incomeImages.forEach((img) => {
      if (!img.inf_name) console.warn(`Missing inf_name for inf_num: ${img.infi_num}`);
      const key = `income-${img.inf_num}`;
      if (!albumMap[key]) {
        albumMap[key] = {
          id: img.inf_num,
          type: "income",
          year: img.inf_year,
          images: [],
          staff_names: [],
          is_archive: true,
          inf_name: img.inf_name || `Income ${img.inf_num}`,
        };
      }
      albumMap[key].images.push({ ...img, type: "income" } as ImageItem);
      if (img.staff_name && !albumMap[key].staff_names.includes(img.staff_name)) {
        albumMap[key].staff_names.push(img.staff_name);
      }
      albumMap[key].is_archive = albumMap[key].images.every((i) => (i as IncomeImage).infi_is_archive);
    });

    disbursementImages.forEach((img) => {
      if (!img.dis_name) console.warn(`Missing dis_name for dis_num: ${img.disf_num}`);
      const key = `disbursement-${img.dis_num}`;
      if (!albumMap[key]) {
        albumMap[key] = {
          id: img.dis_num,
          type: "disbursement",
          year: img.dis_year,
          images: [],
          staff_names: [],
          is_archive: true,
          dis_name: img.dis_name || `Disbursement ${img.dis_num}`,
        };
      }
      albumMap[key].images.push({ ...img, type: "disbursement" } as ImageItem);
      if (img.staff_name && !albumMap[key].staff_names.includes(img.staff_name)) {
        albumMap[key].staff_names.push(img.staff_name);
      }
      albumMap[key].is_archive = albumMap[key].images.every((i) => (i as DisbursementImage).disf_is_archive);
    });

    return Object.values(albumMap);
  }, [incomeImages, disbursementImages]);

  const filteredAlbums = useMemo(() => {
    let result = albums;

    if (selectedYear && selectedYear !== "all") {
      result = result.filter((album) => album.year === selectedYear);
    }

    if (selectedType && selectedType !== "all") {
      result = result.filter((album) => album.type === selectedType);
    }

    if (viewMode === "active") {
      result = result.filter((album) => !album.is_archive);
    } else {
      result = result.filter((album) => album.is_archive);
    }

    if (searchQuery) {
      result = result.filter((album) => {
        const searchableText = [
          String(album.id),
          album.inf_name || "",
          album.dis_name || "",
        ].join(" ").toLowerCase();
        return searchableText.includes(searchQuery.toLowerCase());
      });
    }

    return result;
  }, [albums, selectedYear, selectedType, viewMode, searchQuery]);

  const totalPages = Math.ceil(filteredAlbums.length / pageSize);
  const paginatedAlbums = filteredAlbums.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePermanentDeleteImage = useCallback((item: ImageItem) => {
    const mutate = item.type === "income" ? permanentDeleteIncomeImage.mutate : permanentDeleteDisbursementImage.mutate;
    const id = item.type === "income" ? (item as IncomeImage).infi_num : (item as DisbursementImage).disf_num;
    
    mutate(id, {
      onError: (error) => console.error("Error deleting image:", error)
    });
  }, [permanentDeleteIncomeImage, permanentDeleteDisbursementImage]);

  const handlePermanentDeleteFolder = useCallback((album: Album) => {
    const allArchived = album.images.every(img => 
      (img.type === 'income' && (img as IncomeImage).infi_is_archive) ||
      (img.type === 'disbursement' && (img as DisbursementImage).disf_is_archive)
    );

    if (allArchived) {
      if (album.type === 'income') {
        permanentDeleteIncomeFolder.mutate(album.id, {
          onError: (error) => console.error("Error deleting folder:", error)
        });
      } else {
        permanentDeleteDisbursementFolder.mutate(album.id, {
          onError: (error) => console.error("Error deleting folder:", error)
        });
      }
    } else {
      album.images.forEach((img) => {
        const isArchived = img.type === 'income' 
          ? (img as IncomeImage).infi_is_archive 
          : (img as DisbursementImage).disf_is_archive;
          
        if (isArchived) {
          handlePermanentDeleteImage(img);
        }
      });
    }
  }, [permanentDeleteIncomeFolder, permanentDeleteDisbursementFolder, handlePermanentDeleteImage]);

  const getDeleteAllTitle = (album: Album) => {
    const allArchived = album.images.every(img => 
      (img.type === 'income' && (img as IncomeImage).infi_is_archive) ||
      (img.type === 'disbursement' && (img as DisbursementImage).disf_is_archive)
    );
    return allArchived ? "Delete Image(s)" : "Delete Archived Images";
  };

  const getDeleteAllDescription = (album: Album) => {
    const allArchived = album.images.every(img => 
      (img.type === 'income' && (img as IncomeImage).infi_is_archive) ||
      (img.type === 'disbursement' && (img as DisbursementImage).disf_is_archive)
    );
    return allArchived 
      ? "This will permanently delete the image(s). This action cannot be undone."
      : "This will permanently delete only the archived images in this folder. Active images will remain.";
  };

  const handleAction = useCallback((action: string, items: ImageItem | ImageItem[] | Album, onSuccess?: () => void) => {
    const itemsArray = Array.isArray(items) ? items : [items];
    let hasErrors = false;

    const mutations = itemsArray.map((item) => {
      const mutate = {
        archive: item.type === "income" ? archiveIncomeImage.mutate : archiveDisbursementImage.mutate,
        restore: item.type === "income" ? restoreIncomeImage.mutate : restoreDisbursementImage.mutate,
        delete: item.type === "income" ? deleteIncomeImage.mutate : deleteDisbursementImage.mutate,
        permanentDelete: item.type === "income" ? permanentDeleteIncomeImage.mutate : permanentDeleteDisbursementImage.mutate,
      }[action];

      if (mutate) {
        const id = item.type === "income" ? (item as IncomeImage).infi_num : (item as DisbursementImage).disf_num;
        return new Promise<void>((resolve) => {
          mutate(id, {
            onSuccess: () => resolve(),
            onError: (error: any) => {
              if (error.message.includes("Network Error") || error.response?.status === 404) {
                console.warn(`Network error for ${action} on item ${id}, possibly already deleted:`, error);
              } else {
                console.error(`Error performing ${action} on item ${id}:`, error);
                hasErrors = true;
              }
              resolve();
            },
          });
        });
      }
      return Promise.resolve();
    });

    return Promise.all(mutations).then(() => {
      if (onSuccess) onSuccess();
      setZoomVisible(false);
      if (hasErrors) {
        console.log("Some images failed to process");
      }
    });
  }, [
    archiveIncomeImage,
    archiveDisbursementImage,
    restoreIncomeImage,
    restoreDisbursementImage,
    deleteIncomeImage,
    deleteDisbursementImage,
    permanentDeleteIncomeImage,
    permanentDeleteDisbursementImage,
  ]);

  const handleOpenZoom = (album: Album) => {
    setSelectedAlbum(album);
    setZoomVisible(true);
  };

  const keyExtractor = (item: Album) => `${item.type}-${item.id}`;

  const renderItem = ({ item: album }: { item: Album }) => (
    <View className="w-1/2 p-2">
      <TouchableOpacity 
        className="bg-white rounded-lg shadow-md p-3 border max-w-full"
        onPress={() => handleOpenZoom(album)}
      >
        <View className="w-full h-32 bg-gray-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
          <Image
            source={{ uri: album.images[0]?.type === "income" ? (album.images[0] as IncomeImage).infi_url : (album.images[0] as DisbursementImage).disf_url || PLACEHOLDER_IMAGE }}
            className="w-full h-full"
          />
          <Text className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
            {album.images.length} {album.images.length === 1 ? "Image" : "Images"}
          </Text>
          {album.images.some((img) => (img as IncomeImage).infi_is_archive || (img as DisbursementImage).disf_is_archive) && !album.is_archive && (
            <Text className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
              Partially Archived
            </Text>
          )}
        </View>
        <View className="mt-2 space-y-1">
          <Text className="font-medium text-darkBlue2">
            {album.type === "income" ? album.inf_name || "Unnamed Income" : album.dis_name || "Unnamed Disbursement"}
          </Text>
          <Text className="text-xs text-gray-500">
            Date Uploaded: {album.images[0]?.type === "income" ? (album.images[0] as IncomeImage).infi_upload_date || "N/A" : (album.images[0] as DisbursementImage).disf_upload_date || "N/A"}
          </Text>
          <Text className="text-xs text-gray-500">
            For Year: {album.images[0]?.type === "income" ? (album.images[0] as IncomeImage).inf_year || "N/A" : (album.images[0] as DisbursementImage).dis_year || "N/A"}
          </Text>
        </View>
        <View className="mt-2 flex-row justify-end gap-1">
          {viewMode === "active" && (
            <>
              <TouchableOpacity
                className="bg-blue-600 p-1 rounded-md"
                onPress={(e) => {
                  e.stopPropagation();
                  router.push({
                    pathname: "/treasurer/inc-disbursement/inc-disb-edit",
                    params: { id: album.id.toString(), type: album.type },
                  });
                }}
              >
                <Edit size={16} color="white" />
              </TouchableOpacity>
              <View>
                <ConfirmationModal
                  trigger={
                    <TouchableOpacity className="bg-red-600 p-1 rounded-md">
                      <Archive size={16} color="white" />
                    </TouchableOpacity>
                  }
                  title="Archive Album"
                  description="Are you sure you want to archive this album? This will archive all images within it."
                  actionLabel="Archive"
                  variant="default"
                  onPress={() => handleAction("archive", album.images)}
                />
              </View>
            </>
          )}
          {viewMode === "archived" && (
            <>
              <View>
                <ConfirmationModal
                  trigger={
                    <TouchableOpacity className="bg-green-600 p-1 rounded-md">
                      <ArchiveRestore size={16} color="white" />
                    </TouchableOpacity>
                  }
                  title="Restore Album"
                  description="Are you sure you want to restore this album? This will restore all images within it."
                  actionLabel="Restore"
                  variant="default"
                  onPress={() => handleAction("restore", album.images)}
                />
              </View>
              <View>
                <ConfirmationModal
                  trigger={
                    <TouchableOpacity className="bg-red-600 p-1 rounded-md">
                      <Trash size={16} color="white" />
                    </TouchableOpacity>
                  }
                  title={getDeleteAllTitle(album)}
                  description={getDeleteAllDescription(album)}
                  actionLabel="Delete"
                  variant="destructive"
                  onPress={() => handlePermanentDeleteFolder(album)}
                />
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  if (isIncomeLoading || isDisbursementLoading) {
    return (
      <ScreenLayout
        customLeftAction={
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} color="black" className="text-black" />
          </TouchableOpacity>
        }
        headerBetweenAction={<Text className="text-[13px]">Income & Disbursement Monitoring</Text>}
        showExitButton={false}
        headerAlign="left"
        scrollable={false}
        keyboardAvoiding={true}
        contentPadding="medium"
      >
        <View className="flex-1 p-4">
          <View className="h-10 w-1/6 mb-3 bg-gray-200 opacity-30" />
          <View className="h-7 w-1/4 mb-6 bg-gray-200 opacity-30" />
          <View className="h-10 w-full mb-4 bg-gray-200 opacity-30" />
          <View className="h-4/5 w-full bg-gray-200 opacity-30" />
        </View>
      </ScreenLayout>
    );
  }

  if (incomeError || disbursementError) {
    return (
      <ScreenLayout
        customLeftAction={
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} color="black" className="text-black" />
          </TouchableOpacity>
        }
        headerBetweenAction={<Text className="text-[13px]">Income & Disbursement Monitoring</Text>}
        showExitButton={false}
        headerAlign="left"
        scrollable={false}
        keyboardAvoiding={true}
        contentPadding="medium"
      >
        <View className="flex-1 p-4">
          <Text className="text-red-500">
            Error: {(incomeError || disbursementError)?.message}
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Income & Disbursement Monitoring</Text>}
      showExitButton={false}
      headerAlign="left"
      scrollable={false}
      keyboardAvoiding={true}
      contentPadding="medium"
    >
      <View className="flex-1 p-4">
        <View className="flex flex-col gap-4 mb-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row gap-4 flex-1">
              <View className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-full h-10 bg-white text-sm border border-gray-300 rounded-md"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setCurrentPage(1);
                  }}
                />
              </View>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <SelectLayout
                options={yearOptions}
                selectedValue={selectedYear}
                onSelect={(option) => {
                  setSelectedYear(option.value);
                  setCurrentPage(1);
                }}
                placeholder="Select year"
              />
            </View>
            <View className="flex-1">
              <SelectLayout
                options={typeOptions}
                selectedValue={selectedType}
                onSelect={(option) => {
                  setSelectedType(option.value);
                  setCurrentPage(1);
                }}
                placeholder="Select type"
              />
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row space-x-2 gap-1">
              <TouchableOpacity
                className={`px-4 py-2 rounded-md ${viewMode === "active" ? "bg-blue-600" : "bg-gray-200"}`}
                onPress={() => {
                  setViewMode("active");
                  setCurrentPage(1);
                }}
              >
                <Text className={`${viewMode === "active" ? "text-white" : "text-gray-600"}`}>Active</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-2 rounded-md ${viewMode === "archived" ? "bg-blue-600" : "bg-gray-200"}`}
                onPress={() => {
                  setViewMode("archived");
                  setCurrentPage(1);
                }}
              >
                <Text className={`${viewMode === "archived" ? "text-white" : "text-gray-600"}`}>Archived</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="bg-blue-600 px-4 py-2 rounded-md"
              onPress={() => router.push("/treasurer/inc-disbursement/inc-disb-create")}
            >
              <Text className="text-white text-base font-semibold">Create New</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-1">
          {filteredAlbums.length === 0 ? (
            <Text className="text-center py-4 text-gray-500">
              No {viewMode === "active" ? "active" : "archived"} albums found.
            </Text>
          ) : (
            <FlatList
              data={paginatedAlbums}
              numColumns={2}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 20 }}
              nestedScrollEnabled={true}
              removeClippedSubviews={false}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={11}
            />
          )}
        </View>

        <View className="flex-row justify-between items-center mt-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm text-gray-600">Show</Text>
            <TextInput
              className="w-16 h-8 border border-gray-300 rounded-md text-center"
              keyboardType="numeric"
              value={pageSize.toString()}
              onChangeText={(text) => {
                const value = Math.max(1, Number(text) || 1);
                setPageSize(value);
                setCurrentPage(1);
              }}
            />
            <Text className="text-sm text-gray-600">entries</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredAlbums.length)} of{' '}
              {filteredAlbums.length} albums
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`px-2 py-1 rounded-md ${currentPage > 1 ? "bg-blue-600" : "bg-gray-300"}`}
                onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <Text className="text-white">Prev</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-2 py-1 rounded-md ${currentPage < totalPages ? "bg-blue-600" : "bg-gray-300"}`}
                onPress={() => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                disabled={currentPage === totalPages}
              >
                <Text className="text-white">Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Modal visible={zoomVisible} transparent={true} onRequestClose={() => setZoomVisible(false)}>
          <View className="flex-1 bg-black/80 justify-center items-center">
            <View className="w-[90%] h-[80%] bg-white rounded-lg overflow-hidden">
              <TouchableOpacity 
                className="absolute top-3 right-3 bg-black/50 w-8 h-8 rounded-full justify-center items-center z-10"
                onPress={() => setZoomVisible(false)}
              >
                <X size={20} color="white" />
              </TouchableOpacity>
              <FlatList
                data={selectedAlbum?.images || []}
                horizontal
                pagingEnabled
                keyExtractor={(item, index) => `${item.type}-${(item as IncomeImage).infi_num || (item as DisbursementImage).disf_num}-${index}`}
                renderItem={({ item }) => (
                  <View className="flex-1 justify-center items-center" style={{ width: screenWidth * 0.9 }}>
                    <Image
                      source={{ 
                        uri: item.type === "income" ? (item as IncomeImage).infi_url : (item as DisbursementImage).disf_url || PLACEHOLDER_IMAGE,
                        cache: 'force-cache'
                      }}
                      className="w-full h-full"
                      resizeMode="contain"
                      onError={() => console.log("Image failed to load")}
                      style={{ width: screenWidth * 0.9, height: screenHeight * 0.8 }}
                    />
                    <View className="mt-2 flex-row justify-end gap-1 absolute bottom-2 right-2">
                      {viewMode === "active" && (
                        <ConfirmationModal
                          trigger={
                            <TouchableOpacity>
                              <Archive size={20} color="red" />
                            </TouchableOpacity>
                          }
                          title="Archive Image"
                          description="Are you sure you want to archive this image?"
                          actionLabel="Archive"
                          variant="default"
                          onPress={() => handleAction("archive", item)}
                        />
                      )}
                      {viewMode === "archived" && (
                        <>
                          <ConfirmationModal
                            trigger={
                              <TouchableOpacity className="bg-green-600 p-1 rounded-md">
                                <ArchiveRestore size={16} color="white" />
                              </TouchableOpacity>
                            }
                            title="Restore Image"
                            description="Are you sure you want to restore this image?"
                            actionLabel="Restore"
                            variant="default"
                            onPress={() => handleAction("restore", item)}
                          />
                          <ConfirmationModal
                            trigger={
                              <TouchableOpacity className="bg-red-600 p-1 rounded-md">
                                <Trash size={16} color="white" />
                              </TouchableOpacity>
                            }
                            title="Delete Image"
                            description="This will permanently delete this image. This action cannot be undone."
                            actionLabel="Delete"
                            variant="destructive"
                            onPress={() => handlePermanentDeleteImage(item)}
                          />
                        </>
                      )}
                    </View>
                  </View>
                )}
                getItemLayout={(data, index) => ({
                  length: screenWidth * 0.9,
                  offset: screenWidth * 0.9 * index,
                  index,
                })}
              />
            </View>
          </View>
        </Modal>
      </View>
    </ScreenLayout>
  );
};

export default IncomeandDisbursementMain;