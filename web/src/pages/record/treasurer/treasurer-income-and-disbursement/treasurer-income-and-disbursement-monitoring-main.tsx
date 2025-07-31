import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Search, Eye, Trash, Archive, ArchiveRestore } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button/button";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  useGetIncomeImages,
  useGetDisbursementImages
} from "./queries/fetchqueries";
import {
  useArchiveIncomeImage,
  useRestoreIncomeImage,
  usePermanentDeleteIncomeImage,
  useArchiveDisbursementImage,
  useRestoreDisbursementImage,
  usePermanentDeleteDisbursementImage,
  usePermanentDeleteIncomeFolder,
  useRestoreIncomeFolder,
  usePermanentDeleteDisbursementFolder,
  useRestoreDisbursementFolder,
} from "./queries/delqueries";
import { formatDate } from "@/helpers/dateFormatter";
import { ImageItem, Album, IncomeImage, DisbursementImage } from "./inc-disb-types";

function IncomeandDisbursementView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");

  const {
    data: incomeImages = [],
    isLoading: isIncomeLoading,
    error: incomeError,
  } = useGetIncomeImages(viewMode === "archived");
  const {
    data: disbursementImages = [],
    isLoading: isDisbursementLoading,
    error: disbursementError,
  } = useGetDisbursementImages(viewMode === "archived");

  const archiveIncomeImage = useArchiveIncomeImage();
  const restoreIncomeImage = useRestoreIncomeImage();
  const permanentDeleteIncomeImage = usePermanentDeleteIncomeImage();
  const archiveDisbursementImage = useArchiveDisbursementImage();
  const restoreDisbursementImage = useRestoreDisbursementImage();
  const permanentDeleteDisbursementImage = usePermanentDeleteDisbursementImage();
  const permanentDeleteIncomeFolder = usePermanentDeleteIncomeFolder();
  const restoreIncomeFolder = useRestoreIncomeFolder();
  const permanentDeleteDisbursementFolder = usePermanentDeleteDisbursementFolder();
  const restoreDisbursementFolder = useRestoreDisbursementFolder();

  const albums: Album[] = useMemo(() => {
    const albumMap: { [key: string]: Album } = {};

    incomeImages.forEach((img) => {
      if (!img.inf_name)
        console.warn(`Missing inf_name for inf_num: ${img.infi_num}`);
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
      albumMap[key].images.push({ ...img, type: "income" });
      if (albumMap[key].is_archive) {
        albumMap[key].is_archive = img.infi_is_archive;
      }
    });

    disbursementImages.forEach((img) => {
      if (!img.dis_name)
        console.warn(`Missing dis_name for dis_num: ${img.disf_num}`);
      const key = `disbursement-${img.dis_num}`;
      if (!albumMap[key]) {
        albumMap[key] = {
          id: img.dis_num,
          type: "disbursement",
          year: img.dis_year,
          images: [],
          staff_names: [],
          is_archive: true,
          dis_name: img.dis_name || `Disbursement ${img.disf_num}`,
        };
      }
      albumMap[key].images.push({ ...img, type: "disbursement" });
      if (albumMap[key].is_archive) {
        albumMap[key].is_archive = img.disf_is_archive;
      }
    });

    const albums = Object.values(albumMap);
    console.log("Albums:", albums);
    return albums;
  }, [incomeImages, disbursementImages]);

  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    incomeImages.forEach((img) => years.add(img.inf_year));
    disbursementImages.forEach((img) => years.add(img.dis_year));
    const yearOptions = Array.from(years)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map((year) => ({ id: year, name: year }));
    return [{ id: "all", name: "All" }, ...yearOptions];
  }, [incomeImages, disbursementImages]);

  const filteredAlbums = useMemo(() => {
    let result = albums;

    if (selectedYear && selectedYear !== "all") {
      result = result.filter((album) => album.year === selectedYear);
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
        ]
          .join(" ")
          .toLowerCase();
        return searchableText.includes(searchQuery.toLowerCase());
      });
    }

    return result;
  }, [albums, selectedYear, viewMode, searchQuery]);

  const totalPages = Math.ceil(filteredAlbums.length / pageSize);
  const paginatedAlbums = filteredAlbums.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleArchiveImage = (item: ImageItem) => {
    if (item.type === "income") {
      archiveIncomeImage.mutate((item as IncomeImage).infi_num);
    } else {
      archiveDisbursementImage.mutate((item as DisbursementImage).disf_num);
    }
  };

  const handleRestoreImage = (item: ImageItem) => {
    if (item.type === "income") {
      restoreIncomeImage.mutate((item as IncomeImage).infi_num);
    } else {
      restoreDisbursementImage.mutate((item as DisbursementImage).disf_num);
    }
  };

  const handlePermanentDeleteImage = (item: ImageItem) => {
    if (item.type === "income") {
      permanentDeleteIncomeImage.mutate((item as IncomeImage).infi_num);
    } else {
      permanentDeleteDisbursementImage.mutate(
        (item as DisbursementImage).disf_num
      );
    }
  };

const handleDeleteAllImages = (album: Album) => {
  const allArchived = album.images.every(img => 
    (img.type === 'income' && (img as IncomeImage).infi_is_archive) ||
    (img.type === 'disbursement' && (img as DisbursementImage).disf_is_archive)
  );

  if (allArchived) {
    // Delete entire folder if all images are archived
    if (album.type === 'income') {
      permanentDeleteIncomeFolder.mutate(album.id);
    } else {
      permanentDeleteDisbursementFolder.mutate(album.id);
    }
  } else {
    // Only delete archived images
    album.images.forEach((img) => {
      const isArchived = img.type === 'income' 
        ? (img as IncomeImage).infi_is_archive 
        : (img as DisbursementImage).disf_is_archive;
        
      if (isArchived) {
        handlePermanentDeleteImage(img);
      }
    });
  }
};

const handleRestoreAllImages = (album: Album) => {
  // Only restore archived images
  album.images.forEach((img) => {
    const isArchived = img.type === 'income' 
      ? (img as IncomeImage).infi_is_archive 
      : (img as DisbursementImage).disf_is_archive;
      
    if (isArchived) {
      handleRestoreImage(img);
    }
  });
};

const getDeleteAllTitle = (album: Album) => {
  const allArchived = album.images.every(img => 
    (img.type === 'income' && (img as IncomeImage).infi_is_archive) ||
    (img.type === 'disbursement' && (img as DisbursementImage).disf_is_archive)
  );
  return allArchived ? "Delete Entire Folder" : "Delete Archived Images";
};

const getDeleteAllDescription = (album: Album) => {
  const allArchived = album.images.every(img => 
    (img.type === 'income' && (img as IncomeImage).infi_is_archive) ||
    (img.type === 'disbursement' && (img as DisbursementImage).disf_is_archive)
  );
  return allArchived 
    ? "This will permanently delete the entire folder and all its images. This action cannot be undone."
    : "This will permanently delete only the archived images in this folder. Active images will remain.";
};

  if (isIncomeLoading || isDisbursementLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <Skeleton className="h-10 w-full mb-4 opacity-30" />
        <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
      </div>
    );
  }

  if (incomeError || disbursementError) {
    return (
      <div className="w-full h-full">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 pt-2">
          Income & Disbursement Monitoring
        </h1>
        <p className="text-red-500">
          Error: {(incomeError || disbursementError)?.message}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full h-full">
        <div className="flex flex-col gap-3 mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
            Income & Disbursement Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and track all income and disbursement documentation.
          </p>
        </div>
        <hr className="border-gray mb-5 sm:mb-4" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                size={17}
              />
              <Input
                placeholder="Search..."
                className="pl-10 w-full bg-white text-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex flex-row gap-2 justify-center items-center">
              <Label>Year: </Label>
              <SelectLayout
                className="bg-white"
                options={yearOptions}
                placeholder="Year"
                value={selectedYear}
                onChange={(value) => {
                  setSelectedYear(value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <Tabs
            value={viewMode}
            onValueChange={(value) => {
              setViewMode(value as "active" | "archived");
              setCurrentPage(1);
            }}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col mt-4 gap-4">
          {filteredAlbums.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No {viewMode === "active" ? "active" : "archived"} albums found.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedAlbums.map((album) => (
              <div
                key={`${album.type}-${album.id}`}
                className="flex flex-col bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border max-w-full"
              >
                <div className="w-full h-40 bg-gray-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                  <img
                    src={
                      album.images[0]?.type === "income"
                        ? (album.images[0] as IncomeImage).infi_url
                        : (album.images[0] as DisbursementImage).disf_url ||
                          "/placeholder-image.png"
                    }
                    alt={`Album ${album.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-image.png";
                    }}
                  />
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {album.images.length || 0}{" "}
                    {album.images.length === 1 ? "Image" : "Images"}
                  </span>
                  {album.images.some(
                    (img) =>
                      (img.type === "income" &&
                        !(img as IncomeImage).infi_is_archive) ||
                      (img.type === "disbursement" &&
                        !(img as DisbursementImage).disf_is_archive)
                  )}
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="font-medium text-darkBlue2">
                    {album.type === "income"
                      ? album.inf_name || "Unnamed Income"
                      : album.dis_name || "Unnamed Disbursement"}
                  </h3>
                  <p className="text-xs text-gray-500">
                     Date Uploaded: {album.images[0]?.type === "income" 
                      ? formatDate((album.images[0] as IncomeImage).infi_upload_date) || "N/A" 
                      : formatDate((album.images[0] as DisbursementImage).disf_upload_date) || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Description:{" "}
                    {album.images[0]?.type === "income"
                      ? (album.images[0] as IncomeImage).inf_desc ||
                        "N/A"
                      : (album.images[0] as DisbursementImage)
                          .dis_desc || "N/A"}
                  </p>
                </div>

                <div className="mt-3 flex flex-row justify-between items-center gap-2">
                  <DialogLayout
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Eye size={16} className="mr-1" /> View
                      </Button>
                    }
                    className="max-w-[90vw] w-[90vw] h-[90vh]"
                    title={`${
                      album.type === "income"
                        ? album.inf_name || "Income"
                        : album.dis_name || "Disbursement"
                    } Album`}
                    mainContent={
                      <div className="flex flex-col gap-6 overflow-y-auto p-4">
                        {album.images.map((image) => (
                          <div
                            key={
                              image.type === "income"
                                ? (image as IncomeImage).infi_num
                                : (image as DisbursementImage).disf_num
                            }
                            className="flex flex-col items-center"
                          >
                            <img
                              src={
                                image.type === "income"
                                  ? (image as IncomeImage).infi_url
                                  : (image as DisbursementImage).disf_url ||
                                    "/placeholder-image.png"
                              }
                              alt={`Image ${
                                image.type === "income"
                                  ? (image as IncomeImage).infi_num
                                  : (image as DisbursementImage).disf_num
                              }`}
                              className="w-full max-h-[70vh] object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/placeholder-image.png";
                              }}
                            />
                            <div className="mt-2 flex justify-between items-center w-full">
                              <span className="text-xs text-gray-500">
                                {image.type === "income"
                                  ? (image as IncomeImage).infi_name ||
                                    "N/A"
                                  : (image as DisbursementImage)
                                      .disf_name || "N/A"}
                              </span>
                              <div className="flex gap-2">
                                {viewMode === "archived" ? (
                                  <>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <ConfirmationModal
                                            trigger={
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="bg-[#10b981] hover:bg-[#34d399] text-white"
                                              >
                                                <ArchiveRestore size={16} />
                                              </Button>
                                            }
                                            title="Restore Archived Image"
                                            description="Would you like to restore this image from the archive?"
                                            actionLabel="Confirm"
                                            onClick={() =>
                                              handleRestoreImage(image)
                                            }
                                            type="success"
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent>Restore</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <ConfirmationModal
                                            trigger={
                                              <Button
                                                variant="destructive"
                                                size="icon"
                                                className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white"
                                              >
                                                <Trash size={16} />
                                              </Button>
                                            }
                                            title="Permanent Deletion Confirmation"
                                            description="This image will be permanently deleted. Do you wish to proceed?"
                                            actionLabel="Confirm"
                                            onClick={() =>
                                              handlePermanentDeleteImage(image)
                                            }
                                            type="destructive"
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent>Delete</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </>
                                ) : (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <ConfirmationModal
                                          trigger={
                                            <Button
                                              variant="destructive"
                                              size="icon"
                                              className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white"
                                            >
                                              <Archive size={16} />
                                            </Button>
                                          }
                                          title="Archive Image"
                                          description="This image will be archived. Do you wish to proceed?"
                                          actionLabel="Confirm"
                                          onClick={() =>
                                            handleArchiveImage(image)
                                          }
                                          type="warning"
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent>Archive</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    }
                  />

                  <div className="flex gap-2">
                    {viewMode === "active" ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ConfirmationModal
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-black"
                                >
                                  <Archive size={16} className="mr-1" /> Archive
                                  All
                                </Button>
                              }
                              title="Archive All Images"
                              description="All images in this folder will be archived. Do you wish to proceed?"
                              actionLabel="Confirm"
                              onClick={() => {
                                album.images.forEach((img) =>
                                  handleArchiveImage(img)
                                );
                              }}
                              type="warning"
                            />
                          </TooltipTrigger>
                          <TooltipContent>Archive All Images</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <ConfirmationModal
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="bg-[#10b981] hover:bg-[#34d399] text-white"
                                  >
                                    <ArchiveRestore size={16} />
                                  </Button>
                                }
                                title="Restore All Images"
                                description="All images in this folder will be restored. Do you wish to proceed?"
                                actionLabel="Confirm"
                                onClick={() => handleRestoreAllImages(album)}
                                type="success"
                              />
                            </TooltipTrigger>
                            <TooltipContent>Restore All Images</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <ConfirmationModal
                                trigger={
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white"
                                  >
                                    <Trash size={16} />
                                  </Button>
                                }
                                title={getDeleteAllTitle(album)}
                                description={getDeleteAllDescription(album)}
                                actionLabel="Confirm"
                                onClick={() => handleDeleteAllImages(album)}
                                type="destructive"
                              />
                            </TooltipTrigger>
                            <TooltipContent>Delete All Images</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <Input
              type="number"
              className="w-16 h-8"
              min={1}
              value={pageSize}
              onChange={(e) => {
                const value = Math.max(1, Number(e.target.value));
                setPageSize(value);
                setCurrentPage(1);
              }}
            />
            <span className="text-sm text-gray-600">entries</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredAlbums.length)} of{" "}
              {filteredAlbums.length} albums
            </span>
            {filteredAlbums.length > 0 && (
              <PaginationLayout
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default IncomeandDisbursementView;