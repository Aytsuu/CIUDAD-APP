import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Plus, Search, Eye } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import ClerkDonateCreate from "./donation-create";
import ClerkDonateView from "./donation-view";
import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Donations } from "./donation-types";
import { useGetDonations } from "./queries/donationFetchQueries";
import { Button } from "@/components/ui/button/button";
import { Spinner } from "@/components/ui/spinner";
import { useLoading } from "@/context/LoadingContext"; 
import { useDebounce } from "@/hooks/use-debounce";

function DonationTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { showLoading, hideLoading } = useLoading();

  const { 
    data: donationsData = { results: [], count: 0 }, 
    isLoading, 
    refetch,
  } = useGetDonations(
    currentPage,
    pageSize,
    debouncedSearchQuery,
    categoryFilter,
    statusFilter
  );

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  const categoryOptions = [
    { id: "all", name: "All Categories" },
    { id: "Monetary Donations", name: "Monetary Donations" },
    { id: "Essential Goods", name: "Essential Goods" },
    { id: "Medical Supplies", name: "Medical Supplies" },
    { id: "Household Items", name: "Household Items" },
    { id: "Educational Supplies", name: "Educational Supplies" },
    { id: "Baby & Childcare Items", name: "Baby & Childcare Items" },
    { id: "Animal Welfare Items", name: "Animal Welfare Items" },
    { id: "Shelter & Homeless Aid", name: "Shelter & Homeless Aid" },
    { id: "Disaster Relief Supplies", name: "Disaster Relief Supplies" },
  ];

  const statusOptions = [
    { id: "all", name: "All Statuses" },
    { id: "Stashed", name: "Stashed" },
    { id: "Allotted", name: "Allotted" },
  ];

  const donations = donationsData.results || [];
  const totalCount = donationsData.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const columns: ColumnDef<Donations>[] = [
    {
      accessorKey: "don_num",
      header: ({ column }) => (
        <div
          className="flex justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reference No.
          <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("don_num")}</div>
      ),
    },
    {
      accessorKey: "don_donor",
      header: "Donor",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("don_donor")}</div>
      ),
    },
    {
      accessorKey: "don_item_name",
      header: "Item Name",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("don_item_name")}</div>
      ),
    },
    {
      accessorKey: "don_category",
      header: "Item Category",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("don_category")}</div>
      ),
    },
    {
      accessorKey: "don_qty",
      header: "Quantity/Amount",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("don_qty")}</div>
      ),
    },
    {
      accessorKey: "don_status",
      header: "Condition",
      cell: ({ row }) => {
        const status = row.getValue("don_status") as string;
        return (
          <div className="text-center">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                status === "Stashed"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {status}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "don_date",
      header: "Date",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("don_date")}</div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
                    <Eye size={16} />
                  </div>
                }
                className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                title="Edit Donation"
                description="Fill out all necessary fields"
                mainContent={
                  <div className="w-full h-full">
                    <ClerkDonateView
                      don_num={row.original.don_num}
                      onSaveSuccess={refetch}
                    />
                  </div>
                }
              />
            }
            content="View"
          />
        </div>
      ),
    },
  ];

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value;
    setPageSize(value >= 1 ? value : 1);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'category') {
      setCategoryFilter(value);
    } else if (filterType === 'status') {
      setStatusFilter(value);
    }
    setCurrentPage(1);
  };

  return (
    <div className="w-full h-full">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Donation Records
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view donation records
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      {/* Search and Create Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search donations..."
              className="pl-10 bg-white w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-2">
            <SelectLayout
              className="bg-white w-full sm:w-48"
              label=""
              placeholder="Filter by Category"
              options={categoryOptions}
              value={categoryFilter}
              onChange={(value) => handleFilterChange('category', value)}
            />
            <SelectLayout
              className="bg-white w-full sm:w-48"
              placeholder="Filter by Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(value) => handleFilterChange('status', value)}
            />
          </div>
        </div>

        <div className="w-full sm:w-auto flex justify-end">
          <DialogLayout
            trigger={
              <Button className="w-full sm:w-auto">
                <Plus size={15} /> Create
              </Button>
            }
            className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
            title="Add Donation"
            description="Fill out all necessary fields"
            mainContent={
              <div className="w-full h-full">
                <ClerkDonateCreate
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

      <div className="bg-white rounded-md">
        <div className="flex justify-between p-3">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-6"
              value={pageSize}
              onChange={handlePageSizeChange}
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <DataTable columns={columns} data={donations} />
            </div>

            {/* Pagination Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
              <p className="text-xs sm:text-sm text-darkGray">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalCount)} of{" "}
                {totalCount} rows
              </p>
              {totalCount > 0 && totalPages > 1 && (
                <PaginationLayout
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DonationTracker;