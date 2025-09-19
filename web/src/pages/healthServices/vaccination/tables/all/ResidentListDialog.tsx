"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { Search, ArrowUpDown } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useUnvaccinatedResidentsDetails } from "../../queries/fetch";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

interface PaginatedResidentListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  vaccineId: number;
  ageGroupId: number | string | null;
}

interface ResidentData {
  rp_id: string;
  pat_id: string | null;
  status: string;
  name: string;
  age: number;
  sex: string;
  address: string;
  sitio: string;
  contact: string;
  birth_date: string;
}

export function PaginatedResidentListDialog({ isOpen, onClose, title, vaccineId, ageGroupId }: PaginatedResidentListDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryParams = React.useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      age_group_id: ageGroupId,
      search: searchQuery.trim()
    }),
    [currentPage, pageSize, ageGroupId, searchQuery]
  );

  const { data: residentsResponse, isLoading } = useUnvaccinatedResidentsDetails(vaccineId, queryParams);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize >= 1 ? newPageSize : 1);
    setCurrentPage(1);
  };

  // Format data for DataTable
  const formatResidentData = React.useCallback((): ResidentData[] => {
    if (!residentsResponse?.success) return [];

    return residentsResponse.results.map((resident: any) => {
      const info = resident.personal_info || {};
      const addresses = info.per_addresses || [];

      // Construct address string
      const addressString = addresses.length > 0 ? [addresses[0].add_street, addresses[0].add_barangay, addresses[0].add_city, addresses[0].add_province].filter((part) => part && part.trim().length > 0).join(", ") || "No address provided" : "No address provided";

      const sitio = addresses.length > 0 ? addresses[0].sitio || "N/A" : "N/A";

      return {
        rp_id: resident.rp_id || "",
        pat_id: resident.pat_id || null,
        status: resident.status || "",
        name: `${info.per_lname || ""}, ${info.per_fname || ""} ${info.per_mname || ""}`.trim(),
        age: info.per_age || 0,
        sex: info.per_sex || "",
        address: addressString,
        sitio: sitio,
        contact: info.per_contact || "N/A",
        birth_date: info.per_dob || ""
      };
    });
  }, [residentsResponse]);

  // const residents = residentsResponse?.success ? residentsResponse.results : [];
  const totalCount = residentsResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const formattedData = formatResidentData();

  const columns: ColumnDef<ResidentData>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="flex flex-col w-full">
            <div className="font-medium truncate">{row.original.name}</div>
            <div className="text-sm text-gray-600">{row.original.rp_id}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: "age",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Age <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[80px] px-2">
          <div className="text-center w-full">
            <div className="font-medium">{row.original.age}</div>
            <div className="text-sm text-gray-600">{row.original.sex}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Address <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[200px] max-w-[300px] px-2">
          <div className="w-full">
            <div className="text-sm break-words whitespace-normal leading-tight">{row.original.address || "No address provided"}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: "sitio",
      header: "Sitio",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full text-sm">{row.original.sitio}</div>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[150px] px-2">
          <div className="text-center w-full">
            <span className={`text-xs px-2 py-1 rounded-full ${row.original.status === "Has patient, not vaccinated for this vaccine" ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-800"}`}>
              {row.original.status === "Has patient, not vaccinated for this vaccine" ? "Not Vaccinated" : "No Patient Record"}
            </span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full text-sm">{row.original.contact}</div>
        </div>
      )
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title} - Unvaccinated Residents</DialogTitle>
        </DialogHeader>

        <div className="w-full flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input placeholder="Search residents..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Page size selector */}
        <div className="w-full bg-white flex items-center justify-between p-4 border rounded-lg mb-4">
          <div className="flex gap-x-3 justify-start items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input type="number" className="w-[70px] h-8 flex items-center justify-center text-center" value={pageSize} onChange={(e) => handlePageSizeChange(parseInt(e.target.value) || 10)} min="1" />
            <p className="text-xs sm:text-sm">Residents per page</p>
          </div>

          {residentsResponse?.success && <div className="text-sm text-gray-600">Total: {totalCount} residents</div>}
        </div>

        {isLoading ? (
          <div className="w-full h-[200px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading residents...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-white w-full overflow-auto flex-1">{formattedData.length > 0 ? <DataTable columns={columns} data={formattedData} /> : <div className="text-center text-gray-500 py-8">{searchQuery.trim() ? "No matching residents found" : "No unvaccinated residents found"}</div>}</div>

            {/* Pagination */}
            {totalCount > pageSize && (
              <div className="flex justify-between items-center mt-4 p-4 border-t">
                <p className="text-xs sm:text-sm font-normal text-gray-500">
                  Showing {formattedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} residents
                </p>

                <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
