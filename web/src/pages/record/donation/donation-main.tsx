import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Donations } from "./donation-types";
import { useGetDonations } from "./queries/donationFetchQueries";
import { Button } from "@/components/ui/button/button";

function DonationTracker() {
  const [_data] = useState<Donations[]>([]);
  // const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    data: donations = [], 
    isLoading, 
    refetch 
  } = useGetDonations();

  // const { mutate: deleteEntry} = useDeleteDonation();

  // const handleDelete = async (don_num: number) => {
  //   deleteEntry(don_num);
  // };

  const categoryOptions = [
    { id: "all", name: "All" },
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
    { id: "Alloted", name: "Alloted" },
  ];

  // Filter data based on search query and category
  const filteredData = donations.filter((donation) => {
    const searchString = `${donation.don_num} ${donation.don_donor} ${donation.don_item_name} ${donation.don_category} ${donation.don_qty} ${donation.don_date}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || donation.don_category === categoryFilter;
    const matchesStatus = statusFilter === "all" || donation.don_status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
          {/* <TooltipLayout
            trigger={
              <div className="flex items-center h-8">
                <ConfirmationModal
                  trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] border-none text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center"><Trash size={16} /></div>}
                  title="Confirm Delete"
                  description="Are you sure you want to delete this entry?"
                  actionLabel="Confirm"
                  // onClick={() => handleDelete(row.original.don_num)} 
                />                     */}
              {/* </div>   
            } */}
            {/* content="Delete"
          /> */}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <Skeleton className="h-10 w-full mb-4 opacity-30" />
        <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="relative w-full flex gap-2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
            size={17}
          />
          <Input
            placeholder="Search..."
            className="pl-10 bg-white w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SelectLayout
            className="bg-white"
            label=""
            placeholder="Filter by Category"
            options={categoryOptions}
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value)}
          />
          <SelectLayout
            className="bg-white"
            label=""
            placeholder="Filter by Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
          />
        </div>
        <DialogLayout
          trigger={
            <Button>
              <Plus size={15} /> Create
            </Button>
          }
          className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
          title="Add Donation"
          description="Fill out all necessary fields"
          mainContent={
            <div className="w-full h-full">
              <ClerkDonateCreate onSuccess={() => {
                setIsDialogOpen(false);
                refetch();
              }}/>
            </div>
          }
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-md">
        <div className="flex justify-between p-3">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-6"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                setPageSize(value >= 1 ? value : 1);
                setCurrentPage(1); // Reset to first page when changing page size
              }}
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={paginatedData} />
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} rows
          </p>
          {filteredData.length > 0 && (
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
    </div>
  );
}

export default DonationTracker;