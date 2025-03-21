import React from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Trash, Plus, FileInput, Edit } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import CommodityModal from "../addListModal/CommodityModal";
import EditCommodityModal from "../editListModal/EditCommodityModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCommodity } from "../requests/GetRequest";
import { handleDeleteCommodityList } from "../requests/DeleteRequest";
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";
import { MainLayoutComponent } from "@/components/ui/main-layout-component";
import { Skeleton } from "@/components/ui/skeleton";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";

type CommodityRecords = {
  id: number;
  commodityName: string;
};

export default function CommodityList() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    React.useState(false);
  const [comToDelete, setComToDelete] = React.useState<number | null>(null);
  const [isDialog, setIsDialog] = React.useState(false);
  const queryClient = useQueryClient();

  // Fetch commodity data using useQuery
  const { data: commodities, isLoading: isLoadingCommodities } = useQuery({
    queryKey: ["commodities"],
    queryFn: getCommodity,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Format commodity data
  const formatCommodityData = React.useCallback((): CommodityRecords[] => {
    if (!commodities) return [];
    return commodities.map((commodity: any) => ({
      id: commodity.com_id,
      commodityName: commodity.com_name,
    }));
  }, [commodities]);

  // Filter commodity data based on search query
  const filteredCommodities = React.useMemo(() => {
    return formatCommodityData().filter((record) =>
      Object.values(record)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, formatCommodityData]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredCommodities.length / pageSize);

  // Slice the data for the current page
  const paginatedCommodities = filteredCommodities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle delete operation
  const handleDelete = async () => {
    if (comToDelete !== null) {
      await handleDeleteCommodityList(comToDelete, () => {
        queryClient.invalidateQueries({ queryKey: ["commodities"] });
      });
      setIsDeleteConfirmationOpen(false);
      setComToDelete(null);
    }
  };

  if (isLoadingCommodities) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  const columns: ColumnDef<CommodityRecords>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
            {row.original.id}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "commodityName",
      header: "Commodity Name",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <DialogLayout
            trigger={
              <Button variant="outline">
                <Edit size={16} />
              </Button>
            }
            mainContent={
              <EditCommodityModal
                initialData={row.original}
                fetchData={formatCommodityData}
                setIsDialog={setIsDialog}
              />
            }
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setComToDelete(row.original.id);
              setIsDeleteConfirmationOpen(true);
            }}
          >
            <Trash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
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
          </div>
        </div>
        <div className="flex gap-2">
          <DialogLayout
            trigger={
              <Button className="bg-buttonBlue text-white hover:bg-buttonBlue/90">
                <Plus size={15} /> New
              </Button>
            }
            title="Add New Commodity"
            // mainContent={<CommodityModal setIsDialog={setIsDialog} />}
            mainContent={<></>}
            isOpen={isDialog}
            onOpenChange={setIsDialog}
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
              onChange={(e) => {
                const value = +e.target.value;
                if (value >= 1) {
                  setPageSize(value);
                } else {
                  setPageSize(1); // Reset to 1 if invalid
                }
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <DropdownLayout
            trigger={
              <Button variant="outline" className="h-[2rem]">
                <FileInput /> Export
              </Button>
            }
            options={[
              { id: "", name: "Export as CSV" },
              { id: "", name: "Export as Excel" },
              { id: "", name: "Export as PDF" },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={paginatedCommodities} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredCommodities.length)} of{" "}
            {filteredCommodities.length} rows
          </p>
          {paginatedCommodities.length > 0 && (
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        onConfirm={handleDelete}
        title="Delete Commodity"
        description="Are you sure you want to delete this commodity? This action cannot be undone."
      />
    </div>
  );
}
