import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Archive, Search, RotateCcw, Trash } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetArchivedAnnualDevPlans, useRestoreAnnualDevPlans, useDeleteAnnualDevPlans } from "./queries/annualDevPlanFetchQueries";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
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

  const { data: archivedPlansData, isLoading } = useGetArchivedAnnualDevPlans(
    currentPage,
    pageSize,
    debouncedSearchQuery
  );

  const restorePlansMutation = useRestoreAnnualDevPlans();
  const deletePlansMutation = useDeleteAnnualDevPlans();

  const archivedPlans = archivedPlansData?.results || [];
  const totalCount = archivedPlansData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, pageSize]);

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

  const clearSearch = () => setSearchQuery("");

  return (
    <div className="bg-snow w-full h-full">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex flex-row items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack}>
            <ChevronLeft />
          </Button>
          <h1 className="font-semibold text-2xl text-darkBlue2">Archived Annual Development Plans</h1>
        </div>
        <p className="text-xs sm:text-sm text-darkGray ml-12">
          Manage and restore archived development plans ({totalCount} archived)
        </p>
      </div>
      <hr className="border-gray mb-5 sm:mb-4" />

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-[20rem]">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
            size={17}
          />
          <Input 
            placeholder="Search archived plans..." 
            className="pl-10 w-full bg-white text-sm" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          {selectedPlans.length > 0 && (
            <>
              <Button
                variant="outline"
                className="border-2 border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800"
                onClick={handleRestoreClick}
                disabled={isRestoring}
              >
                <RotateCcw size={16} />
                {isRestoring 
                  ? "Restoring..." 
                  : selectedPlans.length === 1
                  ? `Restore ${selectedPlans.length} plan`
                  : `Restore ${selectedPlans.length} plans`
                }
              </Button>
              <Button
                variant="outline"
                className="border-2 border-red-200 text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                <Trash size={16} />
                {isDeleting 
                  ? "Deleting..." 
                  : selectedPlans.length === 1
                  ? `Delete ${selectedPlans.length} plan`
                  : `Delete ${selectedPlans.length} plans`
                }
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-300 rounded-[5px] p-5 min-h-[20rem]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : archivedPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="mb-10 mt-10">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Archive className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              {searchQuery ? "No Archived Plans Found" : "No Archived Plans Yet"}
            </h3>
            <p className="text-gray-600 mt-2">
              {searchQuery
                ? `No archived plans match "${searchQuery}". Try adjusting your search.`
                : "Archived development plans will appear here once you archive them."}
            </p>
            {searchQuery && (
              <Button onClick={clearSearch} className="mt-4">
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="w-full">
            {/* Table Header */}
            <div className="flex items-center justify-between mb-4">
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
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount} archived plans
              </div>
            </div>

            {/* Plans List */}
            <div className="space-y-3">
              {archivedPlans.map((plan: any) => (
                <div 
                  key={plan.dev_id} 
                  className={`border border-gray-200 rounded-lg p-4 transition-colors cursor-pointer ${
                    selectedPlans.includes(plan.dev_id) 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectPlan(plan.dev_id)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedPlans.includes(plan.dev_id)}
                      onChange={() => handleSelectPlan(plan.dev_id)}
                      className="mt-1 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="space-y-2">
                        {/* Main Info */}
                        <div>
                          <h4 className="font-semibold text-blue-900">
                            {plan.dev_client}
                          </h4>
                          {plan.dev_issue && (
                            <p className="text-sm text-gray-700">
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

                        {/* Details */}
                        <div className="space-y-0.5">
                          {plan.dev_activity && (() => {
                            try {
                              const activities = typeof plan.dev_activity === 'string' ? JSON.parse(plan.dev_activity) : plan.dev_activity;
                              if (Array.isArray(activities) && activities.length > 0) {
                                return (
                                  <div className="text-xs text-gray-600">
                                    <span className="font-medium text-gray-700">Activities:</span> {activities.map((a: any) => a.activity || a).join(', ')}
                                  </div>
                                );
                              }
                            } catch {}
                            return null;
                          })()}
                          {plan.dev_res_person && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium text-gray-700">Responsible Person:</span> {plan.dev_res_person}
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            <span className="font-medium text-gray-700">Date:</span> {new Date(plan.dev_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                              <div className="pt-2 border-t border-gray-200">
                                <div className="text-xs font-semibold text-gray-700 mb-1.5">GAD BUDGET ITEMS</div>
                                <div className="space-y-1.5">
                                  {budgetItems.map((item: any, idx: number) => {
                                    const quantity = Number(item.quantity || 0);
                                    const price = Number(item.price || 0);
                                    const itemTotal = quantity * price;
                                    return (
                                      <div key={idx} className="flex flex-col text-xs bg-gray-50 p-2 rounded">
                                        <span className="font-medium text-gray-900">{item.name}</span>
                                        <div className="flex items-center gap-x-6 text-gray-600 mt-0.5">
                                          <span>Quantity: {quantity}</span>
                                          <span>Price: ₱{price.toFixed(2)}</span>
                                          <span className="font-semibold text-blue-600">Total ₱{itemTotal.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="mt-1.5 pt-1.5 border-t border-gray-300">
                                  <div className="flex justify-end text-sm font-bold text-blue-700">
                                    Total: ₱{total.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            );
                          } catch {
                            return null;
                          }
                          })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

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
