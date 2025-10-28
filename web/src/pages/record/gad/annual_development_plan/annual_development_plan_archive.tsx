import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Archive, Search, RotateCcw, Trash, ChevronLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetArchivedAnnualDevPlans, useRestoreAnnualDevPlans, useDeleteAnnualDevPlans } from "./queries/annualDevPlanFetchQueries";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { TooltipProvider } from "@/components/ui/tooltip";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AnnualDevelopmentPlanArchiveProps {
  onBack: () => void;
}

export default function AnnualDevelopmentPlanArchive({ onBack }: AnnualDevelopmentPlanArchiveProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlans, setSelectedPlans] = useState<number[]>([]);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedPageSize = useDebounce(pageSize, 100);

  const { data: archivedPlansData, isLoading } = useGetArchivedAnnualDevPlans(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery,
    '-dev_id' // Order by latest archived (descending ID)
  );

  const restorePlansMutation = useRestoreAnnualDevPlans();
  const deletePlansMutation = useDeleteAnnualDevPlans();

  const archivedPlans = archivedPlansData?.results || [];
  const totalCount = archivedPlansData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const handleSelectPlan = (devId: number) => {
    setSelectedPlans(prev => 
      prev.includes(devId) 
        ? prev.filter(id => id !== devId)
        : [...prev, devId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlans.length === archivedPlans.length) {
      setSelectedPlans([]);
    } else {
      setSelectedPlans(archivedPlans.map((plan: any) => plan.dev_id));
    }
  };

  const handleRestoreClick = () => {
    if (selectedPlans.length > 0) {
      setShowRestoreDialog(true);
    }
  };

  const handleConfirmRestore = async () => {
    setIsRestoring(true);
    try {
      await restorePlansMutation.mutateAsync(selectedPlans);
      showSuccessToast(`Successfully restored ${selectedPlans.length} development plan(s)`);
      setSelectedPlans([]);
      setShowRestoreDialog(false);
    } catch (error) {
      console.error("Failed to restore plans:", error);
      showErrorToast("Failed to restore development plans");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteClick = () => {
    if (selectedPlans.length > 0) {
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePlansMutation.mutateAsync(selectedPlans);
      showSuccessToast(`Successfully deleted ${selectedPlans.length} development plan(s) permanently`);
      setSelectedPlans([]);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete plans:", error);
      showErrorToast("Failed to delete development plans");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = (devId: number) => {
    setSelectedPlans([devId]);
    setShowRestoreDialog(true);
  };

  const handleDelete = (devId: number) => {
    setSelectedPlans([devId]);
    setShowDeleteDialog(true);
  };

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="flex gap-2 justify-between pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button
            className="text-black p-2 self-start"
            variant="outline"
            onClick={onBack}
          >
            <ChevronLeft />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Archive / <span className="text-gray-400">Annual Development Plans</span>
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              View and manage all archived annual development plans
            </p>
          </div>
        </div>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      <div className="flex w-full h-full gap-4">
        <Card className="w-full shadow-lg border border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search archived plans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-sm font-medium text-gray-700">Show</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number.parseInt(value))}>
                    <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">entries</span>
                </div>
              </div>
              {selectedPlans.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800"
                    onClick={handleRestoreClick}
                    disabled={isRestoring}
                  >
                    <RotateCcw size={16} />
                    {isRestoring 
                      ? "Restoring..." 
                      : `Restore ${selectedPlans.length}`
                    }
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 border-red-200 text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800"
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                  >
                    <Trash size={16} />
                    {isDeleting 
                      ? "Deleting..." 
                      : `Delete ${selectedPlans.length}`
                    }
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Content starts directly */}

            {/* Empty State */}
            {!isLoading && archivedPlans.length === 0 && (
              <div className="text-center py-12">
                <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No archived plans found" : "No archived plans yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? `No archived plans match "${searchQuery}". Try adjusting your search.`
                    : "Archived development plans will appear here once you archive them."}
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
                <span className="ml-2 text-gray-600">Loading archived plans...</span>
              </div>
            )}

            {/* Plans List */}
            {!isLoading && archivedPlans.length > 0 && (
              <div className="h-[600px] overflow-y-auto px-4 pb-4">
                <div className="flex items-center justify-between mb-4 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPlans.length === archivedPlans.length && archivedPlans.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({selectedPlans.length} selected)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {archivedPlans.map((plan: any) => (
                    <Card 
                      key={plan.dev_id}
                      className={`transition-all duration-200 shadow-md hover:shadow-lg border ${
                        selectedPlans.includes(plan.dev_id) 
                          ? 'ring-2 ring-blue-400 border-blue-300 bg-blue-50/20' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <CardHeader className="pb-4 border-b border-gray-200">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedPlans.includes(plan.dev_id)}
                              onChange={() => handleSelectPlan(plan.dev_id)}
                              className="mt-1 rounded border-gray-300"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 leading-tight mb-2">
                                {plan.dev_client}
                              </h4>
                              {plan.dev_issue && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {plan.dev_issue}
                                </p>
                              )}
                              <p className="text-sm text-gray-700 font-medium">
                                {(() => {
                                  try {
                                    if (typeof plan.dev_project === 'string' && plan.dev_project.startsWith('[')) {
                                      const parsed = JSON.parse(plan.dev_project);
                                      return Array.isArray(parsed) ? parsed[0] : plan.dev_project;
                                    }
                                    return plan.dev_project;
                                  } catch {
                                    return plan.dev_project;
                                  }
                                })()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <TooltipProvider>
                              <TooltipLayout
                                trigger={
                                  <div>
                                    <ConfirmationModal
                                      trigger={
                                        <div className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 p-2.5 rounded-lg cursor-pointer transition-colors">
                                          <RotateCcw size={18} />
                                        </div>
                                      }
                                      title="Restore Archived Plan"
                                      description="Would you like to restore this plan from the archive and make it active again?"
                                      actionLabel="Restore"
                                      onClick={() => handleRestore(plan.dev_id)}
                                    />
                                  </div>
                                }
                                content="Restore"
                              />
                              <TooltipLayout
                                trigger={
                                  <div>
                                    <ConfirmationModal
                                      trigger={
                                        <div className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 p-2.5 rounded-lg cursor-pointer transition-colors">
                                          <Trash size={18} />
                                        </div>
                                      }
                                      title="Permanent Deletion Confirmation"
                                      description="This plan will be permanently deleted and cannot be recovered. Do you wish to proceed?"
                                      actionLabel="Delete"
                                      onClick={() => handleDelete(plan.dev_id)}
                                    />
                                  </div>
                                }
                                content="Delete Permanently"
                              />
                            </TooltipProvider>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        <div className="space-y-2">
                          {plan.dev_activity && (() => {
                            try {
                              const activities = typeof plan.dev_activity === 'string' ? JSON.parse(plan.dev_activity) : plan.dev_activity;
                              if (Array.isArray(activities) && activities.length > 0) {
                                return (
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-700">Activities: </span>
                                    <span className="text-gray-600">{activities.map((a: any) => a.activity || a).join(', ')}</span>
                                  </div>
                                );
                              }
                            } catch {}
                            return null;
                          })()}
                          {plan.dev_res_person && (() => {
                            try {
                              const persons = typeof plan.dev_res_person === 'string' ? JSON.parse(plan.dev_res_person) : plan.dev_res_person;
                              const personList = Array.isArray(persons) ? persons.join(', ') : persons;
                              return (
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">Responsible: </span>
                                  <span className="text-gray-600">{personList}</span>
                                </div>
                              );
                            } catch {
                              return (
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">Responsible: </span>
                                  <span className="text-gray-600">{plan.dev_res_person}</span>
                                </div>
                              );
                            }
                          })()}
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">Date: </span>
                            {new Date(plan.dev_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>

                        {/* Budget Items */}
                        {(() => {
                          try {
                            const budgetItems = Array.isArray(plan.dev_budget_items) ? plan.dev_budget_items : 
                                 (typeof plan.dev_budget_items === 'string' ? JSON.parse(plan.dev_budget_items || '[]') : []);
                            
                            if (!budgetItems || budgetItems.length === 0) return null;
                            
                            const total = budgetItems.reduce((sum: number, item: any) => {
                              const quantity = Number(item.quantity || 0);
                              const price = Number(item.price || 0);
                              return sum + (quantity * price);
                            }, 0);
                            
                            return (
                              <div className="pt-4 border-t border-gray-200">
                                <div className="text-sm font-semibold text-gray-700 mb-3">
                                  GAD Budget Items
                                </div>
                                <div className="space-y-2">
                                  {budgetItems.map((item: any, idx: number) => {
                                    const quantity = Number(item.quantity || 0);
                                    const price = Number(item.price || 0);
                                    const itemTotal = quantity * price;
                                    return (
                                      <div key={idx} className="flex flex-col text-xs bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                        <span className="font-medium text-gray-900 mb-1">{item.name}</span>
                                        <div className="flex items-center justify-between text-gray-600">
                                          <div className="flex gap-4">
                                            <span>Qty: {quantity}</span>
                                            <span>₱{price.toFixed(2)}</span>
                                          </div>
                                          <span className="font-semibold text-blue-600">₱{itemTotal.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-300">
                                  <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-gray-700">Total Budget:</span>
                                    <span className="text-blue-700">₱{total.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          } catch {
                            return null;
                          }
                        })()}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pagination Section */}
      {totalPages > 0 && !isLoading && archivedPlans.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows
          </div>
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-green-600" />
              Restore Development Plans?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to restore {selectedPlans.length === 1 ? 'this development plan' : `these ${selectedPlans.length} development plans`}?
              </p>
              <p className="text-sm text-gray-600">
                Restored plans will be moved back to the main development plans list and will be visible again.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRestore}
              disabled={isRestoring}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRestoring ? "Restoring..." : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash className="h-5 w-5 text-red-600" />
              Permanently Delete Development Plans?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to permanently delete {selectedPlans.length === 1 ? 'this development plan' : `these ${selectedPlans.length} development plans`}?
              </p>
              <p className="text-sm text-gray-600">
                This action cannot be undone. The development plans will be permanently deleted and cannot be recovered.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
