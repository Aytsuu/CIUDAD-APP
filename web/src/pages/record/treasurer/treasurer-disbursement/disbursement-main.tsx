import CardLayout from "@/components/ui/card/card-layout";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Trash,
  Edit,
  Archive,
  ArchiveRestore,
  X,
} from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { DisbursementCreate } from "./disbursement-create";
import { EditDisbursementVoucher } from "./disbursement-edit";
import { Button } from "@/components/ui/button/button";
import {
  useGetDisbursementVouchers,
  useGetDisbursementVoucher,
  useGetDisbursementFiles,
  useGetDisbursementVoucherYears
} from "./queries/incDisb-fetchqueries";
import {
  usePermanentDeleteDisbursementVoucher,
  useDeleteDisbursementFile,
  useArchiveDisbursementVoucher,
  useRestoreDisbursementVoucher,
  useArchiveDisbursementFile,
  useRestoreDisbursementFile,
} from "./queries/incDisb-delqueries";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import ViewDisbursementVoucher from "./disbursement-view";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { DisbursementVoucher, DisbursementFile } from "./incDisb-types";
import { DocumentCard } from "./disbursement-suppdocs-modal";
import { useLoading } from "@/context/LoadingContext"; 
import { useDebounce } from "@/hooks/use-debounce";
import { SelectLayout } from "@/components/ui/select/select-layout";

function TreasurerDisbursementVouchers() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedYear, setSelectedYear] = useState("all");
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [pageSize, _setPageSize] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [_isPdfLoading, setIsPdfLoading] = useState(true);
  const [editingDisbursement, setEditingDisbursement] = useState<DisbursementVoucher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] = useState<DisbursementVoucher | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<DisbursementFile[]>([]);
  const [isFilesDialogOpen, setIsFilesDialogOpen] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [filesTab, setFilesTab] = useState<"active" | "archived">("active");
  const { showLoading, hideLoading } = useLoading();
  const { data: availableYears = [] } = useGetDisbursementVoucherYears();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetDisbursementVouchers(
    currentPage,
    pageSize,
    debouncedSearchTerm,
    selectedYear,
    viewMode === "archived"
  );

  const disbursements = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const { mutate: deleteDisbursement } = usePermanentDeleteDisbursementVoucher();
  const { mutate: deleteDisbursementFile } = useDeleteDisbursementFile();
  const { mutate: archiveDisbursement } = useArchiveDisbursementVoucher();
  const { mutate: restoreDisbursement } = useRestoreDisbursementVoucher();
  const { mutate: archiveDisbursementFile } = useArchiveDisbursementFile();
  const { mutate: restoreDisbursementFile } = useRestoreDisbursementFile();

  const { data: detailedDisbursement } = useGetDisbursementVoucher(
    selectedDisbursement?.dis_num?.toString() || "",
    {
      enabled: isViewDialogOpen && !!selectedDisbursement?.dis_num,
    }
  );

  const { data: disbursementFiles = [], isLoading: isFilesLoading } = useGetDisbursementFiles(
    selectedDisbursement?.dis_num?.toString() || "",
    undefined,
    {
      enabled: !!selectedDisbursement?.dis_num,
    }
  );

  const disbursementWithFiles = detailedDisbursement
    ? { ...detailedDisbursement, files: disbursementFiles }
    : selectedDisbursement
    ? { ...selectedDisbursement, files: disbursementFiles }
    : null;

  useEffect(() => {
    if (isFilesDialogOpen) {
      setSelectedFiles(disbursementFiles);
    }
  }, [disbursementFiles, isFilesDialogOpen]);

  useEffect(() => {
    if (detailedDisbursement && selectedDisbursement?.dis_num === detailedDisbursement.dis_num) {
      setEditingDisbursement(detailedDisbursement);
    }
  }, [detailedDisbursement, selectedDisbursement]);

  // Create year filter options
  const yearFilterOptions = [
    { id: "all", name: "All Years" },
    ...availableYears.map(year => ({ id: year.toString(), name: year.toString() }))
  ];

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle year filter change
  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setCurrentPage(1);
  };

  // Handle view mode change
  const handleViewModeChange = (value: string) => {
    setViewMode(value as "active" | "archived");
    setCurrentPage(1);
  };

  const handleDelete = (disNum: any) => {
    setIsDeleting(true);
    deleteDisbursement(disNum, {
      onSettled: () => setIsDeleting(false),
    });
  };

  const handleArchive = (disNum: any) => {
    archiveDisbursement(disNum, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleRestore = (disNum: any) => {
    restoreDisbursement(disNum, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleViewDisbursement = (disbursement: DisbursementVoucher) => {
    if (selectedDisbursement?.dis_num === disbursement.dis_num && isViewDialogOpen) return;

    setIsViewDialogOpen(false);
    setSelectedDisbursement(null);

    setTimeout(() => {
      setSelectedDisbursement(disbursement);
      setIsViewDialogOpen(true);
    }, 50);
  };

  const closePreview = () => {
    setIsViewDialogOpen(false);
    setSelectedDisbursement(null);
  };

  const handleEdit = (disbursement: DisbursementVoucher) => {
    setIsViewDialogOpen(false);
    setSelectedDisbursement(disbursement);
    setEditingDisbursement(disbursement);
    setIsEditDialogOpen(true);
  };

  const handleViewFiles = (disbursement: DisbursementVoucher) => {
    setSelectedDisbursement(disbursement);
    setIsFilesDialogOpen(true);
  };

  const handleDeleteFile = async (disfNum: any) => {
    if (!selectedDisbursement) return;

    setIsDeletingFile(true);
    deleteDisbursementFile(
      { disNum: selectedDisbursement.dis_num, disfNum },
      {
        onSuccess: () => {
          setSelectedFiles((prev) => prev.filter((file) => file.disf_num !== disfNum));
        },
        onSettled: () => setIsDeletingFile(false),
      }
    );
  };

  const handleArchiveFile = async (disfNum: any) => {
    if (!selectedDisbursement) return;

    setIsDeletingFile(true);
    archiveDisbursementFile(
      { disNum: selectedDisbursement.dis_num, disfNum },
      {
        onSuccess: () => {
          setSelectedFiles((prev) =>
            prev.map((file) =>
              file.disf_num === disfNum ? { ...file, disf_is_archive: true } : file
            )
          );
        },
        onSettled: () => setIsDeletingFile(false),
      }
    );
  };

  const handleRestoreFile = async (disfNum: any) => {
    if (!selectedDisbursement) return;

    setIsDeletingFile(true);
    restoreDisbursementFile(
      { disNum: selectedDisbursement.dis_num, disfNum },
      {
        onSuccess: () => {
          setSelectedFiles((prev) =>
            prev.map((file) =>
              file.disf_num === disfNum ? { ...file, disf_is_archive: false } : file
            )
          );
        },
        onSettled: () => setIsDeletingFile(false),
      }
    );
  };

  if (isError) {
    return (
      <div className="text-red-500 p-4">
        Error loading disbursement vouchers: {error?.message || "Unknown error"}
      </div>
    );
  }

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  return (
    <div className="bg-snow w-full h-full p-4">
      <div className="flex flex-col gap-3 mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
          <div>Disbursement Vouchers</div>
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Create, track, and manage disbursement vouchers with ease, ensuring proper documentation
          and approval processes.
        </p>
      </div>
      <hr className="border-gray mb-5 sm:mb-4" />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-3">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search..."
              className="pl-10 w-full bg-white text-sm"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex flex-row gap-2 justify-center items-center">
            <SelectLayout
              className="bg-white"
              options={yearFilterOptions}
              placeholder="Year"
              value={selectedYear}
              onChange={handleYearChange}
            />
          </div>
          {viewMode === "active" && (
            <DialogLayout
              trigger={
                <Button>
                  <Plus size={15} /> Create
                </Button>
              }
              className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
              title="Create Disbursement Voucher"
              description=""
              mainContent={
                <div className="w-full h-full">
                  <DisbursementCreate onSuccess={() => setIsCreateDialogOpen(false)} />
                </div>
              }
              isOpen={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            />
          )}
        </div>

        <Tabs
          value={viewMode}
          onValueChange={handleViewModeChange}
          className="w-auto"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived"> 
              <div className="flex items-center gap-2">
                <Archive size={16} /> Archive
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
            <Spinner size="lg" />
            Loading records...
          </div>
        ) : disbursements.length === 0 ? ( 
          <div className="text-center py-8 text-gray-500">
            No {viewMode === "active" ? "active" : "archived"} disbursement
            vouchers found.
          </div>
        ) : (
          <>
            {disbursements.map( 
              (disbursement: DisbursementVoucher, index: number) => {
                return (
                  <CardLayout
                    key={disbursement.dis_num || index}
                    title={
                      <div className="flex flex-row justify-between items-center">
                        <div className="w-full">
                          DV #{disbursement.dis_num} -{" "}
                          {disbursement.dis_payee || "Unknown Payee"}
                        </div>
                        <div className="flex gap-2">
                          <Eye
                            className="text-gray-500 hover:text-blue-600 cursor-pointer"
                            size={20}
                            onClick={() => handleViewDisbursement(disbursement)}
                          />
                          {viewMode === "active" ? (
                            <>
                              <ConfirmationModal
                                trigger={
                                  <Archive
                                    className="text-gray-500 hover:text-red-600 cursor-pointer"
                                    size={20}
                                  />
                                }
                                title="Archive Disbursement Voucher"
                                description="Are you sure you want to archive this disbursement voucher?"
                                actionLabel="Archive"
                                onClick={() =>
                                  handleArchive(disbursement.dis_num)
                                }
                                type="warning"
                              />
                            </>
                          ) : (
                            <>
                              <ConfirmationModal
                                trigger={
                                  <ArchiveRestore
                                    className="text-gray-500 hover:text-green-600 cursor-pointer"
                                    size={20}
                                  />
                                }
                                title="Restore Disbursement Voucher"
                                description="Are you sure you want to restore this disbursement voucher?"
                                actionLabel="Restore"
                                onClick={() =>
                                  handleRestore(disbursement.dis_num)
                                }
                                type="success"
                              />
                              <ConfirmationModal
                                trigger={
                                  <Trash
                                    className="text-gray-500 hover:text-red-600 cursor-pointer"
                                    size={20}
                                  />
                                }
                                title="Permanently Delete Disbursement Voucher"
                                description="Are you sure you want to permanently delete this disbursement voucher? This action cannot be undone."
                                actionLabel={
                                  isDeleting ? "Deleting..." : "Delete"
                                }
                                onClick={() =>
                                  handleDelete(disbursement.dis_num)
                                }
                                type="destructive"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    }
                    description={
                      <div className="space-y-2">
                        <div className="line-clamp-2 text-sm text-gray-600">
                          <strong>Particulars:</strong>{" "}
                          {disbursement.dis_particulars
                            ?.map((p) => p.forPayment)
                            .join(", ") || "No particulars provided"}
                        </div>
                        <div className="flex items-center justify-end mt-2">
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewFiles(disbursement)}
                              className="text-sky-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              View Supporting Docs
                            </Button>
                          </div>
                        </div>
                      </div>
                    }
                    content={null}
                    cardClassName="w-full border p-4"
                    titleClassName="text-lg font-semibold text-darkBlue2"
                    contentClassName="text-sm text-darkGray"
                  />
                );
              }
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
              <p className="text-xs sm:text-sm text-darkGray">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows 
              </p>
              {disbursements.length > 0 && ( 
                <PaginationLayout
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={closePreview}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[95vh] max-h-[95vh] p-0 flex flex-col">
          <DialogHeader className="p-4 bg-background border-b sticky top-0 z-50">
            <div className="flex items-center justify-between w-full">
              <DialogTitle className="text-left">
                Disbursement Voucher #{selectedDisbursement?.dis_num} -{" "}
                {selectedDisbursement?.dis_payee}
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    selectedDisbursement && handleEdit(selectedDisbursement)
                  }
                  className="flex items-center gap-2"
                  disabled={!selectedDisbursement}
                >
                  <Edit size={16} /> Edit
                </Button>
                <X
                  className="text-gray-500 cursor-pointer hover:text-gray-700"
                  size={20}
                  onClick={closePreview}
                />
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto relative">
            {selectedDisbursement && (
              <ViewDisbursementVoucher
                disbursement={detailedDisbursement || selectedDisbursement}
                onLoad={() => setIsPdfLoading(false)}
                onError={() => setIsPdfLoading(false)}
                onClose={closePreview}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isFilesDialogOpen} onOpenChange={setIsFilesDialogOpen}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] flex flex-col">
          <DialogHeader className="sticky top-0 z-10 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle>Disbursement Files</DialogTitle>
            </div>
          </DialogHeader>

          <Tabs
            value={filesTab}
            onValueChange={(value) =>
              setFilesTab(value as "active" | "archived")
            }
            className="w-full flex-1 flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isFilesLoading ? (
                  <p className="text-gray-500 text-center py-8 col-span-full">
                    Loading files...
                  </p>
                ) : selectedFiles.filter((file) => !file.disf_is_archive)
                    .length > 0 ? (
                  selectedFiles
                    .filter((file) => !file.disf_is_archive)
                    .map((file) => (
                      <DocumentCard
                        key={file.disf_num}
                        doc={file}
                        showActions={
                          selectedDisbursement?.dis_is_archive === false
                        }
                        onDelete={() => handleDeleteFile(file.disf_num)}
                        onArchive={() => handleArchiveFile(file.disf_num)}
                        isDeleting={isDeletingFile}
                      />
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-8 col-span-full">
                    No active files available.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="archived"
              className="flex-1 overflow-y-auto p-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isFilesLoading ? (
                  <p className="text-gray-500 text-center py-8 col-span-full">
                    Loading files...
                  </p>
                ) : selectedFiles.filter((file) => file.disf_is_archive)
                    .length > 0 ? (
                  selectedFiles
                    .filter((file) => file.disf_is_archive)
                    .map((file) => (
                      <DocumentCard
                        key={file.disf_num}
                        doc={file}
                        showActions={
                          selectedDisbursement?.dis_is_archive === false
                        }
                        onDelete={() => handleDeleteFile(file.disf_num)}
                        onRestore={() => handleRestoreFile(file.disf_num)}
                        isDeleting={isDeletingFile}
                        isArchived
                      />
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-8 col-span-full">
                    No archived files available.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {editingDisbursement && (
        <DialogLayout
          trigger={null}
          className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
          title={`Editing Disbursement Voucher #${editingDisbursement.dis_num}`}
          description=""
          mainContent={
            <div className="w-full h-full">
              <EditDisbursementVoucher
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  setSelectedDisbursement(null);
                  setEditingDisbursement(null);
                  refetch();
                }}
                existingVoucher={disbursementWithFiles}
              />
            </div>
          }
          isOpen={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedDisbursement(null);
              setEditingDisbursement(null);
            }
          }}
        />
      )}
    </div>
  );
}

export default TreasurerDisbursementVouchers;