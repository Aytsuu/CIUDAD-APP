import CardLayout from "@/components/ui/card/card-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash,
  Archive,
  ArchiveRestore,
  X,
} from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { ProjectProposalForm } from "./create-projprop";
import { EditProjectProposalForm } from "./edit-projprop";
import { Button } from "@/components/ui/button/button";
import {
  useGetProjectProposals,
  useGetProjectProposal,
  useGetSupportDocs,
} from "./queries/projprop-fetchqueries";
import {
  usePermanentDeleteProjectProposal,
  useDeleteSupportDocument,
  useArchiveProjectProposal,
  useRestoreProjectProposal,
  useArchiveSupportDocument,
  useRestoreSupportDocument,
} from "./queries/projprop-delqueries";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import ViewProjectProposal from "./view-projprop";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ProjectProposal, SupportDoc } from "./projprop-types";
import { DocumentCard } from "./projpropsupp-docs-modal";

function GADProjectProposal() {
  const filter = [
    { id: "All", name: "All" },
  ];

  const {
    data: projects = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProjectProposals();
  const { mutate: deleteProject } = usePermanentDeleteProjectProposal();
  const { mutate: deleteSupportDoc } = useDeleteSupportDocument();
  const { mutate: archiveProject } = useArchiveProjectProposal();
  const { mutate: restoreProject } = useRestoreProjectProposal();
  const { mutate: archiveSupportDoc } = useArchiveSupportDocument();
  const { mutate: restoreSupportDoc } = useRestoreSupportDocument();

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [_isPdfLoading, setIsPdfLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<ProjectProposal | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectProposal | null>(null);
  const [selectedSuppDocs, setSelectedSuppDocs] = useState<SupportDoc[]>([]);
  const [isSuppDocDialogOpen, setIsSuppDocDialogOpen] = useState(false);
  const [isDeletingDoc, setIsDeletingDoc] = useState(false);
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [suppDocTab, setSuppDocTab] = useState<"active" | "archived">("active");
  const [pageSize, _setPageSize] = useState(3);
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
  if (isSuppDocDialogOpen) {
    setSelectedSuppDocs(supportDocs);
  }
}, [supportDocs, isSuppDocDialogOpen]);

  useEffect(() => {
    if (detailedProject && selectedProject?.gprId === detailedProject.gprId) {
      setEditingProject(detailedProject);
    }
  }, [detailedProject, selectedProject]);

  const filteredProjects = (projects as ProjectProposal[])
    .filter((_project: ProjectProposal) => {
      if (selectedFilter === "All") return true;
      return false;
    })
    .filter((project: ProjectProposal) => {
      return viewMode === "active"
        ? project.gprIsArchive === false
        : project.gprIsArchive === true;
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

  const handleDelete = (gprId: number) => {
    setIsDeleting(true);
    deleteProject(gprId, {
      onSettled: () => setIsDeleting(false),
    });
  };

  const handleArchive = (gprId: number) => {
    archiveProject(gprId, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleRestore = (gprId: number) => {
    restoreProject(gprId, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleViewProject = (project: ProjectProposal) => {
    if (selectedProject?.gprId === project.gprId && isViewDialogOpen) return;

    setIsViewDialogOpen(false);
    setSelectedProject(null);

    setTimeout(() => {
      setSelectedProject(project);
      setIsViewDialogOpen(true);
    }, 50);
  };

  const closePreview = () => {
    setIsViewDialogOpen(false);
    setSelectedProject(null);
  };

  const handleEdit = (project: ProjectProposal) => {
    setIsViewDialogOpen(false);
    setSelectedProject(project);
    setEditingProject(project);
    setIsEditDialogOpen(true);
  };

  const handleViewSupportingDocs = (project: ProjectProposal) => {
    setSelectedProject(project);
    setIsSuppDocDialogOpen(true);
  };

  const handleDeleteDoc = async (psdId: number) => {
    if (!selectedProject) return;

    setIsDeletingDoc(true);
    deleteSupportDoc(
      { gprId: selectedProject.gprId, psdId },
      {
        onSuccess: () => {
          setSelectedSuppDocs((prev) =>
            prev.filter((doc) => doc.psd_id !== psdId)
          );
        },
        onSettled: () => setIsDeletingDoc(false),
      }
    );
  };

  const handleArchiveDoc = async (psdId: number) => {
    if (!selectedProject) return;

    setIsDeletingDoc(true);
    archiveSupportDoc(
      { gprId: selectedProject.gprId, psdId },
      {
        onSuccess: () => {
          setSelectedSuppDocs((prev) =>
            prev.map((doc) =>
              doc.psd_id === psdId ? { ...doc, psd_is_archive: true } : doc
            )
          );
        },
        onSettled: () => setIsDeletingDoc(false),
      }
    );
  };

  const handleRestoreDoc = async (psdId: number) => {
    if (!selectedProject) return;

    setIsDeletingDoc(true);
    restoreSupportDoc(
      { gprId: selectedProject.gprId, psdId },
      {
        onSuccess: () => {
          setSelectedSuppDocs((prev) =>
            prev.map((doc) =>
              doc.psd_id === psdId ? { ...doc, psd_is_archive: false } : doc
            )
          );
        },
        onSettled: () => setIsDeletingDoc(false),
      }
    );
  };

  // Calculate total budget of all displayed projects
  const totalBudget = filteredProjects.reduce((sum, project) => {
    if (!project.budgetItems || project.budgetItems.length === 0) return sum;

    const projectTotal = project.budgetItems.reduce((projectSum, item) => {
      const amount = typeof item.amount === 'string' ? parseFloat(item.amount) || 0 : item.amount || 0;
      const paxCount = typeof item.pax === 'string' 
        ? parseInt(item.pax.replace(/\D/g, '')) || 1 
        : 1;
      return projectSum + (paxCount * amount);
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
          <Skeleton className="h-10 w-48 opacity-30" />
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
          <div>GAD Project Proposal</div>
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Create, track, and manage project proposals with ease, ensuring clear
          objectives and streamlined approval processes.
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
          {viewMode === "active" && (
            <DialogLayout
              trigger={
                <Button>
                  <Plus size={15} /> Create
                </Button>
              }
              className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
              title="Create Project Proposal"
              description=""
              mainContent={
                <div className="w-full h-full">
                  <ProjectProposalForm
                    onSuccess={() => setIsCreateDialogOpen(false)}
                  />
                </div>
              }
              isOpen={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            />
          )}
        </div>

        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "active" | "archived")}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Dynamic Total Budget Display */}
      <div className="flex justify-between mt-2 mb-2">
        <div className="bg-white border px-4 py-2 rounded-lg">
          <span className="font-medium text-black">
            Grand Total:{" "}
            <span className="font-bold text-green-700">
              ₱{new Intl.NumberFormat('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              }).format(totalBudget)}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {paginatedProjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No {viewMode === "active" ? "active" : "archived"} project proposals
            found.
          </div>
        )}
        {paginatedProjects.map((project: ProjectProposal, index: number) => {
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
                    {viewMode === "active" ? (
                      <>
                        <ConfirmationModal
                          trigger={
                            <Archive
                              className="text-gray-500 hover:text-red-600 cursor-pointer"
                              size={20}
                            />
                          }
                          title="Archive Project Proposal"
                          description="Are you sure you want to archive this project proposal?"
                          actionLabel="Archive"
                          onClick={() => handleArchive(project.gprId)}
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
                          title="Restore Project Proposal"
                          description="Are you sure you want to restore this project proposal?"
                          actionLabel="Restore"
                          onClick={() => handleRestore(project.gprId)}
                          type="success"
                        />
                        <ConfirmationModal
                          trigger={
                            <Trash
                              className="text-gray-500 hover:text-red-600 cursor-pointer"
                              size={20}
                            />
                          }
                          title="Permanently Delete Project Proposal"
                          description="Are you sure you want to permanently delete this project proposal? This action cannot be undone."
                          actionLabel={isDeleting ? "Deleting..." : "Delete"}
                          onClick={() => handleDelete(project.gprId)}
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
                    {project.background || "No background provided"}
                  </div>
                  <div className="text-left mt-1">
                    <span className="text-xs text-gray-500">
                      Date: {project.date || "No date provided"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 underline">
                       Total Budget: ₱{
                          project.budgetItems && project.budgetItems.length > 0
                            ? new Intl.NumberFormat('en-US', { 
                                style: 'decimal', 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              }).format(
                                project.budgetItems.reduce((grandTotal, item) => {
                                  const amount = typeof item.amount === 'string' ? parseFloat(item.amount) || 0 : item.amount || 0;
                                  const paxCount = typeof item.pax === 'string' 
                                    ? parseInt(item.pax) || (item.pax.includes("pax") ? parseInt(item.pax) || 1 : 1)
                                    : 1;
                                  return grandTotal + (paxCount * amount);
                                }, 0)
                              )
                            : "N/A"
                        }
                    </span>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col gap-1">
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
                  onClick={() => selectedProject && handleEdit(selectedProject)}
                  className="flex items-center gap-2"
                  disabled={
                    selectedProject?.gprIsArchive === true}
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

      <Dialog open={isSuppDocDialogOpen} onOpenChange={setIsSuppDocDialogOpen}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] flex flex-col">
          <DialogHeader className="sticky top-0 z-10 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle>Supporting Documents</DialogTitle>
            </div>
          </DialogHeader>

          <Tabs
            value={suppDocTab}
            onValueChange={(value) =>
              setSuppDocTab(value as "active" | "archived")
            }
            className="w-full flex-1 flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isSupportDocsLoading ? (
                  <p className="text-gray-500 text-center py-8 col-span-full">
                    Loading documents...
                  </p>
                ) : selectedSuppDocs.filter((doc) => !doc.psd_is_archive)
                    .length > 0 ? (
                  selectedSuppDocs
                    .filter((doc) => !doc.psd_is_archive)
                    .map((doc) => (
                      <DocumentCard
                        key={doc.psd_id}
                        doc={doc}
                        showActions={
                          selectedProject?.gprIsArchive === false }
                        onDelete={() => handleDeleteDoc(doc.psd_id)}
                        onArchive={() => handleArchiveDoc(doc.psd_id)}
                        isDeleting={isDeletingDoc}
                      />
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-8 col-span-full">
                    No active supporting documents available.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="archived"
              className="flex-1 overflow-y-auto p-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isSupportDocsLoading ? (
                  <p className="text-gray-500 text-center py-8 col-span-full">
                    Loading documents...
                  </p>
                ) : selectedSuppDocs.filter((doc) => doc.psd_is_archive)
                    .length > 0 ? (
                  selectedSuppDocs
                    .filter((doc) => doc.psd_is_archive)
                    .map((doc) => (
                      <DocumentCard
                        key={doc.psd_id}
                        doc={doc}
                        showActions={
                          selectedProject?.gprIsArchive === false }
                        onDelete={() => handleDeleteDoc(doc.psd_id)}
                        onRestore={() => handleRestoreDoc(doc.psd_id)}
                        isDeleting={isDeletingDoc}
                        isArchived
                      />
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-8 col-span-full">
                    No archived supporting documents available.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {editingProject && (
        <DialogLayout
          trigger={null}
          className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
          title={`Editing: ${
            editingProject.projectTitle || "Project Proposal"
          }`}
          description=""
          mainContent={
            <div className="w-full h-full">
              <EditProjectProposalForm
                onSuccess={(_updatedData) => {
                  setIsEditDialogOpen(false);
                  setSelectedProject(null);
                  setEditingProject(null);
                }}
                initialValues={editingProject}
                isEditMode={true}
              />
            </div>
          }
          isOpen={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedProject(null);
              setEditingProject(null);
            }
          }}
        />
      )}
    </div>
  );
}

export default GADProjectProposal;