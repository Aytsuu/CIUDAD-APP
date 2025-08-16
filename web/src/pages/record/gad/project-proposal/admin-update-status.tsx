import CardLayout from "@/components/ui/card/card-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { X, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import {useGetProjectProposals,useGetProjectProposal,useGetSupportDocs,} from "./queries/fetchqueries";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import {Dialog,DialogContent,DialogHeader,DialogTitle,} from "@/components/ui/dialog/dialog";
import ViewProjectProposal from "./view-projprop";
import { useUpdateProjectProposalStatus } from "./queries/updatequeries";
import { ProposalStatus, SupportDoc, ProjectProposal } from "./projprop-types";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

function AdminGADProjectProposal() {
  const style = {
    projStat: {
      pending: "text-blue",
      amend: "text-yellow-500",
      approved: "text-green-500",
      rejected: "text-red-500",
      viewed: "text-darkGray",
    },
  };

  const filter = [
    { id: "All", name: "All" },
    { id: "Pending", name: "Pending" },
    { id: "Viewed", name: "Viewed" },
    { id: "Amend", name: "Amend" },
    { id: "Approved", name: "Approved" },
    { id: "Rejected", name: "Rejected" },
  ];

  const {data: projects = [],isLoading,isError,error} = useGetProjectProposals();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectProposal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSuppDocDialogOpen, setIsSuppDocDialogOpen] = useState(false);
  const [selectedSuppDocs, setSelectedSuppDocs] = useState<SupportDoc[]>([]);
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ProposalStatus | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const updateStatusMutation = useUpdateProjectProposalStatus();
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [pageSize, setPageSize] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: detailedProject } = useGetProjectProposal(
    selectedProject?.gprId || 0,
    {
      enabled: isViewDialogOpen && !!selectedProject?.gprId,
    }
  );

  const { data: supportDocs = [], isLoading: isSupportDocsLoading } =
    useGetSupportDocs(selectedProject?.gprId || 0, {
      enabled: !!selectedProject?.gprId,
    });

  useEffect(() => {
    if (isSuppDocDialogOpen && supportDocs.length > 0) {
      setSelectedSuppDocs(supportDocs);
    }
  }, [supportDocs, isSuppDocDialogOpen]);

  useEffect(() => {
    if (detailedProject && selectedProject?.gprId === detailedProject.gprId) {
      setNewStatus(detailedProject.status as ProposalStatus);
    }
  }, [detailedProject, selectedProject]);

  const filteredProjects = (projects as ProjectProposal[])
    .filter((project: ProjectProposal) => {
      if (selectedFilter === "All") return true;
      return project.status === selectedFilter;
    })
    .filter((project: ProjectProposal) => {
      return project.gprIsArchive === false;
    })
    .filter((project: ProjectProposal) => {
      const title = project.projectTitle?.toLowerCase() || "";
      const background = project.background?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      return title.includes(search) || background.includes(search);
    });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredProjects.length / pageSize);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleViewProject = (project: ProjectProposal) => {
    if (selectedProject?.gprId === project.gprId && isViewDialogOpen) return;

    setIsViewDialogOpen(false);
    setSelectedProject(null);

    // Automatically set to "Viewed" if current status is "Pending"
    if (project.status === "Pending") {
      updateStatusMutation.mutate(
        {
          gprId: project.gprId,
          status: "Viewed", // This is now type-safe
          reason: "Project viewed by admin",
        },
        {
          onSuccess: () => {
            // Create a new object with the correct type
            const updatedProject: ProjectProposal = {
              ...project,
              status: "Viewed", // Explicitly typed
              statusReason: "Project viewed by admin",
            };
            setSelectedProject(updatedProject);
            setIsViewDialogOpen(true);
          },
          onError: (error) => {
            setSelectedProject(project); // Original project has correct types
            setIsViewDialogOpen(true);
          },
        }
      );
    } else {
      setTimeout(() => {
        setSelectedProject(project); // Original project has correct types
        setIsViewDialogOpen(true);
      }, 50);
    }
  };

  const closePreview = () => {
    setIsViewDialogOpen(false);
    setSelectedProject(null);
    setNewStatus(null);
    setReason(null);
    setIsStatusUpdateDialogOpen(false);
  };

  const handleViewSupportingDocs = (project: ProjectProposal) => {
    setSelectedProject(project);
    setIsSuppDocDialogOpen(true);
  };

  const handleOpenStatusUpdateDialog = () => {
    setIsViewDialogOpen(false);
    setIsStatusUpdateDialogOpen(true);
    setNewStatus(selectedProject?.status || null);
    setReason(null);
  };

  const handleCloseStatusUpdateDialog = () => {
    setIsStatusUpdateDialogOpen(false);
    setNewStatus(null);
    setReason(null);
    if (selectedProject) {
      setIsViewDialogOpen(true);
    }
  };

  const handleUpdateStatus = () => {
    if (
      !selectedProject?.gprId ||
      !newStatus ||
      newStatus === selectedProject.status
    )
      return;

    updateStatusMutation.mutate(
      { gprId: selectedProject.gprId, status: newStatus, reason },
      {
        onSuccess: () => {
          setSelectedProject((prev) =>
            prev ? { ...prev, status: newStatus } : null
          );
          handleCloseStatusUpdateDialog();
          if (selectedProject) {
            setIsViewDialogOpen(true);
          }
        },
      }
    );
  };

  const isReasonRequired = newStatus === "Approved" || newStatus === "Rejected";
  const isUpdateDisabled =
    !newStatus ||
    newStatus === selectedProject?.status ||
    (isReasonRequired && !reason?.trim());

  // Calculate total budget of all displayed projects
  const totalBudget = filteredProjects.reduce((sum, project) => {
    if (!project.budgetItems || project.budgetItems.length === 0) return sum;

    const projectTotal = project.budgetItems.reduce((projectSum, item) => {
      const amount = item.amount || 0;
      const paxCount = item.pax?.includes("pax") ? parseInt(item.pax) || 1 : 1;
      return projectSum + paxCount * amount;
    }, 0);

    return sum + projectTotal;
  }, 0);

  if (isLoading) {
    return (
      <div className="bg-snow w-full h-full p-4">
        <div className="flex flex-col gap-3 mb-4">
          <Skeleton className="h-8 w-1/4 opacity-30" />
          <Skeleton className="h-5 w-2/3 opacity-30" />
        </div>
        <Skeleton className="h-[1px] w-full mb-5 opacity-30" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Skeleton className="h-10 w-full sm:w-64 opacity-30" />
            <div className="flex flex-row gap-2 justify-center items-center">
              <Skeleton className="h-5 w-12 opacity-30" />
              <Skeleton className="h-10 w-32 opacity-30" />
            </div>
            <Skeleton className="h-10 w-24 opacity-30" />
          </div>
        </div>
        <div className="flex flex-col mt-4 gap-4">
          {[...Array(3)].map((_, index: number) => (
            <Skeleton
              key={index}
              className="h-32 w-full opacity-30 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-4">
        Error loading project proposals: {error?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="bg-snow w-full h-full p-4">
      <div className="flex flex-col gap-3 mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
          <div>Review Project Proposal</div>
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage project proposals with ease and streamlined approval processes.
        </p>
      </div>
      <hr className="border-gray mb-5 sm:mb-4" />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-row gap-2 justify-center items-center">
            <Label>Filter: </Label>
            <SelectLayout
              className="bg-white"
              options={filter}
              placeholder="Filter"
              value={selectedFilter}
              onChange={(value: string) => setSelectedFilter(value)}
            />
          </div>
        </div>

        {/* Dynamic Total Budget Display */}
        <div className="flex justify-end mt-2 mb-2">
          <div className="bg-white border px-4 py-2 rounded-lg">
            <span className="font-medium text-black">
              Grand Total:{" "}
              <span className="font-bold text-green-700">
                ₱
                {new Intl.NumberFormat("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(totalBudget)}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col mt-4 gap-4">
        {paginatedProjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No project proposals found.
          </div>
        )}
        {paginatedProjects.map((project: ProjectProposal, index: number) => {
          const status =
            project.status.toLowerCase() as keyof typeof style.projStat;
          const reason = project.statusReason || "No reason provided";

          return (
            <CardLayout
              key={project.gprId || index}
              title={
                <div className="flex flex-row justify-between items-center">
                  <div className="w-full">
                    {project.projectTitle || "Untitled"}
                  </div>
                  <div className="flex gap-2">
                    <Eye
                      className="text-gray-500 hover:text-blue-600 cursor-pointer"
                      size={20}
                      onClick={() => handleViewProject(project)}
                    />
                  </div>
                </div>
              }
              description={
                <div className="space-y-2">
                  <div className="line-clamp-2 text-sm text-gray-600">
                    {project.background || "No background provided"}
                  </div>
                  <div className="text-left mt-1">
                    <span className="text-xs text-gray-500">
                      Date: {project.date || "No date provided"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 underline">
                    Total Budget: ₱
                    {project.budgetItems && project.budgetItems.length > 0
                      ? new Intl.NumberFormat("en-US", {
                          style: "decimal",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(
                          project.budgetItems.reduce((grandTotal, item) => {
                            const amount = item.amount || 0;
                            const paxCount = item.pax?.includes("pax")
                              ? parseInt(item.pax) || 1
                              : 1;
                            return grandTotal + paxCount * amount;
                          }, 0)
                        )
                      : "N/A"}
                  </span>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-xs font-medium ${
                          style.projStat[status] || "text-gray-500"
                        }`}
                      >
                        {project.status || "Pending"}
                      </span>
                      <span className="text-xs text-gray-400">
                        Remark(s): {reason}
                      </span>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewSupportingDocs(project)}
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
        })}

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredProjects.length)} of{" "}
            {filteredProjects.length} rows
          </p>
          {filteredProjects.length > 0 && (
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
            />
          )}
        </div>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={closePreview}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[95vh] max-h-[95vh] p-0 flex flex-col">
          <DialogHeader className="p-4 bg-background border-b sticky top-0 z-50">
            <div className="flex items-center justify-between w-full">
              <DialogTitle className="text-left">
                {selectedProject?.projectTitle || "Project Proposal"}
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleOpenStatusUpdateDialog}
                  disabled={!selectedProject}
                >
                  Update Status
                </Button>
                <X
                  className="text-gray-500 cursor-pointer hover:text-gray-700"
                  size={20}
                  onClick={closePreview}
                />
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto relative p-4">
            {selectedProject && (
              <ViewProjectProposal
                project={detailedProject || selectedProject}
                onLoad={() => setIsPdfLoading(false)}
                onError={() => setIsPdfLoading(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isStatusUpdateDialogOpen}
        onOpenChange={handleCloseStatusUpdateDialog}
      >
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Update Proposal Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium">Update Status</Label>
              <SelectLayout
                className="bg-white mt-1 w-full"
                placeholder="Select Status"
                options={filter.filter(
                  (f) => f.id !== "All" && f.id !== "Viewed"
                )}
                value={newStatus || ""}
                onChange={(value: string) => {
                  setNewStatus(value as ProposalStatus);
                  if (
                    value !== "Approved" &&
                    value !== "Rejected" &&
                    value !== "Amend"
                  ) {
                    setReason(null);
                  }
                }}
              />
            </div>

            {(newStatus === "Approved" ||
              newStatus === "Rejected" ||
              newStatus === "Amend") && (
              <div>
                <Label className="text-sm font-medium">
                  Reason for {newStatus}
                </Label>
                <textarea
                  className="w-full p-2 border rounded mt-1 text-sm resize-none h-24"
                  placeholder={`Enter reason for ${newStatus.toLowerCase()} status...`}
                  value={reason || ""}
                  onChange={(e) => setReason(e.target.value || null)}
                />
                {isReasonRequired && !reason?.trim() && (
                  <p className="text-red-500 text-xs mt-1">
                    Remarks is required for {newStatus} status.
                  </p>
                )}
              </div>
            )}

            <ConfirmationModal
              trigger={
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isUpdateDisabled}
                >
                  Update Status
                </Button>
              }
              title="Confirm Status Update"
              description={`Are you sure you want to update the status to ${
                newStatus || "N/A"
              }?${reason ? ` Reason: ${reason}` : ""}`}
              actionLabel="Confirm"
              onClick={handleUpdateStatus}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuppDocDialogOpen} onOpenChange={setIsSuppDocDialogOpen}>
        <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] p-4 flex flex-col">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle>Supporting Documents</DialogTitle>
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsSuppDocDialogOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4 space-y-6">
            {isSupportDocsLoading ? (
              <p className="text-gray-500 text-center py-8">
                Loading documents...
              </p>
            ) : selectedSuppDocs.length > 0 ? (
              selectedSuppDocs
                .filter((doc) => doc.psd_is_archive === false)
                .map((doc) => (
                  <div
                    key={doc.psd_id || Math.random()}
                    className="flex flex-col items-center"
                  >
                    <div className="relative w-full max-w-4xl">
                      {doc.psd_type?.startsWith("image/") && doc.psd_url ? (
                        <img
                          src={doc.psd_url}
                          alt={`Supporting Document ${
                            doc.psd_name || "Unknown"
                          }`}
                          className="w-full max-h-[70vh] object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder-image.png";
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
                          <p className="mt-2 text-sm text-gray-600">
                            {doc.psd_name || "No file name"}
                          </p>
                          {doc.psd_url ? (
                            <a
                              href={doc.psd_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          ) : (
                            <p className="mt-2 text-sm text-red-500">
                              No file available
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {doc.psd_name || "Unknown"}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No supporting documents available.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminGADProjectProposal;