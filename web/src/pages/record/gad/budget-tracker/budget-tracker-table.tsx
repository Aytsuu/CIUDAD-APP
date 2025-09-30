import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog/dialog";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import {
  Archive,
  ArchiveRestore,
  Eye,
  Search,
  ChevronLeft,
  Calendar,
  ArrowUpDown,
  Trash,
  FileText,
} from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { DataTable } from "@/components/ui/table/data-table";
import GADAddEntryForm from "./budget-tracker-create-form";
import { Input } from "@/components/ui/input";
import GADEditEntryForm from "./budget-tracker-edit-form";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Spinner } from "@/components/ui/spinner";
import {
  useArchiveGADBudget,
  useRestoreGADBudget,
  usePermanentDeleteGADBudget,
} from "./queries/BTDeleteQueries";
import { useGADBudgets } from "./queries/BTFetchQueries";
import { useGetGADYearBudgets } from "./queries/BTYearQueries";
import { GADBudgetEntry } from "./budget-tracker-types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { useLoading } from "@/context/LoadingContext"; 

function BudgetTracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [activeTab, setActiveTab] = useState("active");
  const { year: gbudy_year } = useParams<{ year: string }>();
  const { data: yearBudgets } = useGetGADYearBudgets();
  const { mutate: archiveEntry } = useArchiveGADBudget();
  const { mutate: restoreEntry } = useRestoreGADBudget();
  const { mutate: permanentDeleteEntry } = usePermanentDeleteGADBudget();
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { showLoading, hideLoading } = useLoading();

  const handleArchive = (gbud_num: number) => {
    archiveEntry(gbud_num, {
      onSuccess: () => refetch(),
    });
  };

  const handleRestore = (gbud_num: number) => {
    restoreEntry(gbud_num, {
      onSuccess: () => refetch(),
    });
  };

  const handlePermanentDelete = (gbud_num: number) => {
    permanentDeleteEntry(gbud_num, {
      onSuccess: () => refetch(),
    });
  };

 const {
    data,
    isLoading,
    error,
    refetch,
  } = useGADBudgets(
    gbudy_year || "",
    currentPage,
    pageSize,
    debouncedSearchQuery,
    selectedMonth,
    activeTab === "archive"
  );

  const budgetEntries = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const currentYearBudget = yearBudgets?.find(
    (budget) => budget.gbudy_year === gbudy_year
  )?.gbudy_budget;

  const formattedBudget = currentYearBudget
    ? Number(currentYearBudget).toFixed(2)
    : "0.00";

  const [isSuppDocDialogOpen, setIsSuppDocDialogOpen] = useState(false);
  const [selectedRowFiles, setSelectedRowFiles] = useState<Array<{
    gbf_id: number;
    gbf_name: string;
    gbf_type: string;
    gbf_path: string;
    gbf_url: string;
  }> | null>(null);

  const monthOptions = [
    { id: "All", name: "All" },
    { id: "01", name: "January" },
    { id: "02", name: "February" },
    { id: "03", name: "March" },
    { id: "04", name: "April" },
    { id: "05", name: "May" },
    { id: "06", name: "June" },
    { id: "07", name: "July" },
    { id: "08", name: "August" },
    { id: "09", name: "September" },
    { id: "10", name: "October" },
    { id: "11", name: "November" },
    { id: "12", name: "December" },
  ];

  const calculateTotalProposedWithoutActual = () => {
    if (!budgetEntries || budgetEntries.length === 0) return 0;

    return budgetEntries.reduce((total, entry) => {
      // Skip archived or non-expense entries
      if (entry.gbud_is_archive) return total;

      // Convert all values to numbers safely (handles strings like "0.00")
      const toNum = (val: any) => {
        if (val === undefined || val === null) return undefined;
        const num = +val; // Convert to number
        return isNaN(num) ? undefined : num;
      };

      const actual = toNum(entry.gbud_actual_expense);
      const proposed = toNum(entry.gbud_proposed_budget);
      const shouldInclude =
        (actual === undefined || actual === null || actual === 0) &&
        proposed !== undefined &&
        proposed !== null &&
        proposed !== 0;

      if (shouldInclude) {
        return total + proposed;
      }
      return total;
    }, 0);
  };

  const getLatestRemainingBalance = (): number => {
    // If no entries, return the initial budget
    if (!budgetEntries || budgetEntries.length === 0) {
      return currentYearBudget ? Number(currentYearBudget) : 0;
    }

    // Filter active (unarchived) entries
    const activeEntries = budgetEntries.filter(
      (entry) => !entry.gbud_is_archive
    );

    // If no active entries, return initial budget
    if (activeEntries.length === 0) {
      return currentYearBudget ? Number(currentYearBudget) : 0;
    }

    // Calculate balance from scratch using only gbud_actual_expense
    let balance = currentYearBudget ? Number(currentYearBudget) : 0;

    activeEntries.forEach((entry) => {
      if (entry.gbud_actual_expense !== null) {
        const amount = Number(entry.gbud_actual_expense) || 0;
        balance -= amount;
      }
    });

    return balance;
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle month filter change
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    setCurrentPage(1); // Reset to first page on filter
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page on tab change
  };

  const columns: ColumnDef<GADBudgetEntry>[] = [
    {
      accessorKey: "gbud_datetime",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date & Time
          <ArrowUpDown size={14} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="">
          {new Date(row.getValue("gbud_datetime")).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
      ),
    },
    {
      id: "particulars",
      header: "Particular",
      cell: ({ row }) => {
        const { gbud_exp_particulars } = row.original;
        let displayParticulars = "";

        if (gbud_exp_particulars && typeof gbud_exp_particulars === "string") {
          try {
            const parsed = JSON.parse(gbud_exp_particulars);
            if (Array.isArray(parsed)) {
              displayParticulars =
                parsed
                  .map(
                    (item: { name: string; pax: string; amount: number }) =>
                      item.name
                  )
                  .join(", ") || "No items";
            } else {
              displayParticulars = gbud_exp_particulars;
            }
          } catch (e) {
            displayParticulars = gbud_exp_particulars;
          }
        } else if (Array.isArray(gbud_exp_particulars)) {
          displayParticulars =
            gbud_exp_particulars
              .map(
                (item: { name: string; pax: string; amount: number }) =>
                  item.name
              )
              .join(", ") || "No items";
        } else {
          displayParticulars = "No particulars";
        }

        return <div>{displayParticulars}</div>;
      },
    },
    {
      accessorKey: "gbud_amount",
      header: "Amount",
      cell: ({ row }) => {
        const { gbud_actual_expense, gbud_proposed_budget } = row.original;
        const num = (val: any) =>
          val !== undefined && val !== null ? +val : undefined;

        let amount: number = 0;
        const actual = num(gbud_actual_expense);
        const proposed = num(gbud_proposed_budget);
        amount = actual && actual > 0 ? actual : proposed ?? 0;
        return <div>Php {amount.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "files",
      header: "Supporting Docs",
      cell: ({ row }) => {
        const entry = row.original;
        const files = entry.files || [];
        const hasReferenceNum = !!entry.gbud_reference_num;
        const hasFiles = files.length > 0;

        return (
          <div className="flex justify-center gap-2">
            {!hasReferenceNum || !hasFiles ? (
              <span className="text-red-500">
                Missing
                {!hasReferenceNum && " Reference Number"}
                {!hasReferenceNum && !hasFiles && " and"}
                {!hasFiles && " Supporting Docs"}
              </span>
            ) : files.length > 0 ? (
              <div
                className="text-sky-500 underline cursor-pointer"
                onClick={() => {
                  setSelectedRowFiles(files);
                  setIsSuppDocDialogOpen(true);
                }}
              >
                View All Docs ({files.length})
              </div>
            ) : (
              <span>No docs</span>
            )}
          </div>
        );
      },
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-1">
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                    <Eye size={16} />
                  </div>
                }
                className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                title="Entry Details"
                description="View detailed information about this budget entry."
                mainContent={
                  <div className="w-full h-full">
                    <GADEditEntryForm
                      gbud_num={row.original.gbud_num!}
                      onSaveSuccess={refetch}
                    />
                  </div>
                }
              />
            }
            content="View"
          />
          <TooltipLayout
            trigger={
              <ConfirmationModal
                trigger={
                  <Button variant="destructive">
                    <Archive size={16} />
                  </Button>
                }
                title="Archive Entry"
                description="This will move the entry to archive. Continue?"
                actionLabel="Archive"
                onClick={() => handleArchive(row.original.gbud_num!)}
              />
            }
            content="Archive"
          />
        </div>
      ),
    },
  ];

  const archiveColumns: ColumnDef<GADBudgetEntry>[] = [
    ...columns.filter((col) => col.id !== "action"),
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-1">
          <TooltipLayout
            trigger={
              <ConfirmationModal
                trigger={
                  <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                    <ArchiveRestore size={16} />
                  </div>
                }
                title="Restore Entry"
                description="This will move the entry back to active. Continue?"
                actionLabel="Restore"
                onClick={() => handleRestore(row.original.gbud_num!)}
              />
            }
            content="Restore"
          />
          <TooltipLayout
            trigger={
              <ConfirmationModal
                trigger={
                  <Button variant="destructive">
                    <Trash size={16} />
                  </Button>
                }
                title="Permanently Delete"
                description="This cannot be undone. The entry will be permanently deleted."
                actionLabel="Delete"
                onClick={() => handlePermanentDelete(row.original.gbud_num!)}
              />
            }
            content="Delete Permanently"
          />
        </div>
      ),
    },
  ];

  if (error) {
    return <div className="text-red-500">{error.message}</div>;
  }

   useEffect(() => {
      if (isLoading) {
        showLoading();
      } else {
        hideLoading();
      }
    }, [isLoading, showLoading, hideLoading]);

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-3 mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
          <Link to="/gad-budget-tracker-main">
            <ChevronLeft />
          </Link>
          <div className="rounded-full border-2 border-solid border-darkBlue2 p-2 flex items-center">
            <Calendar />
          </div>
          <div className="ml-2">{gbudy_year || "N/A"}</div>
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view expense records for year {gbudy_year}.
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-6" />

      <div className="flex flex-row gap-5 mb-5 flex-wrap">
        <div className="flex flex-row gap-2">
          <Label className="w-35 text-md">Whole Year Budget:</Label>
          <Label className="text-[#2563EB] text-md font-bold">
            Php {formattedBudget}
          </Label>
        </div>
        <div className="flex flex-row gap-2">
          <Label className="w-35 text-md">Remaining Balance:</Label>
          <Label className="text-green-600 text-md font-bold">
            Php {getLatestRemainingBalance()}
          </Label>
        </div>
        <div className="flex flex-row gap-2">
          <Label className="w-35 text-md">Pending Expenses:</Label>
          <Label className="text-red-500 text-md font-bold">
            Php {calculateTotalProposedWithoutActual()}
          </Label>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-5">
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
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex flex-row gap-2 justify-center items-center">
            <Label>Filter: </Label>
            <SelectLayout
              className="bg-white"
              options={monthOptions}
              placeholder="Month"
              value={selectedMonth}
              label="Month"
              onChange={handleMonthChange}
            />
          </div>
          <Link to={`/gad-budget-log/${gbudy_year}`}>
            <Button variant="link" className="mr-1 w-20 underline text-sky-600">
              View Logs
            </Button>
          </Link>
        </div>
        <div>
          <DialogLayout
            trigger={
              <div className="bg-primary text-white rounded-md p-3 text-sm font-semibold drop-shadow-sm">
                + New Entry
              </div>
            }
            className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
            title="Add New Entry"
            description="Fill in the details for your entry."
            mainContent={
              <div className="w-full h-full">
                <GADAddEntryForm
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    refetch();
                  }}
                />
              </div>
            }
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </div>
      </div>

      <div className="bg-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6 pt-6">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-8"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                setPageSize(value >= 1 ? value : 1);
                setCurrentPage(1);
              }}
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>

          <div className="flex items-center">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-2 max-w-xs">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="archive">
                  <div className="flex items-center gap-2">
                    <Archive size={16} /> Archive
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px] relative">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : activeTab === "active" ? (
            <DataTable columns={columns} data={budgetEntries} />
          ) : (
            <DataTable columns={archiveColumns} data={budgetEntries} />
          )}
        </div>
      </div>

      {!isLoading && (
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {budgetEntries.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows
          </p>
          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      <Dialog open={isSuppDocDialogOpen} onOpenChange={setIsSuppDocDialogOpen}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] flex flex-col">
          <DialogHeader className="sticky top-0 z-10 pb-4 border-b ">
            <div className="flex items-center justify-between">
              <DialogTitle>Supporting Documents</DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedRowFiles && selectedRowFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedRowFiles.map((file, index) => {
                  const inferredType = file.gbf_url?.includes(".pdf")
                    ? "application/pdf"
                    : "image/jpeg";

                  const fileType = file.gbf_type || inferredType;
                  const fileName = file.gbf_name || `Document ${index + 1}`;
                  const isImage = fileType.startsWith("image/");
                  const isPDF = fileType === "application/pdf";

                  return (
                    <div
                      key={file.gbf_id}
                      className="border border-gray-200 rounded-lg overflow-hidden bg-white cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() =>
                        file.gbf_url && window.open(file.gbf_url, "_blank")
                      }
                    >
                      {/* Document Preview */}
                      <div className="h-40 bg-gray-50 flex items-center justify-center">
                        {isImage && file.gbf_url ? (
                          <img
                            src={file.gbf_url}
                            alt={fileName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error("Image load failed:", file.gbf_url);
                              (e.target as HTMLImageElement).src =
                                "/placeholder-image.png";
                            }}
                          />
                        ) : (
                          <FileText
                            size={32}
                            className={isPDF ? "text-red-500" : "text-gray-400"}
                          />
                        )}
                      </div>

                      {/* Document Info */}
                      <div className="p-3">
                        <p className="text-xs text-gray-500 mt-1">
                          {isPDF ? "PDF Document" : "Image Document"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <FileText size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  No supporting documents available
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BudgetTracker;
