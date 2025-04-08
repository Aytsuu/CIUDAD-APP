import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileInput } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import VaccineModal from "../addListModal/VaccineModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAntigen } from "../requests/get/getAntigen";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { Skeleton } from "@/components/ui/skeleton";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { VaccineColumns } from "../tables/columns/VaccineCol";
import { handleDeleteAntigen } from "../requests/delete/DeleteAntigen";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/dropdown-menu";
import ImmunizationSupplies from "../addListModal/ImmunizationSupplies";



export type VaccineRecords = {
  id: number;
  vaccineName: string;
  vaccineType: string;
  ageGroup: string;
  doses: number | string;
  specifyAge: string;
  schedule: string;
  category: string;
  noOfDoses?: number | string;
  type: "vaccine" | "supplies";
  doseDetails: {
    doseNumber: number;
    interval?: number;
    unit?: string;
  }[];
};

export default function VaccineList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    React.useState(false);
  const [vaccineToDelete, setVaccineToDelete] = useState<number | null>(null);
  const [isDialog, setIsDialog] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"vaccine" | "supplies">(
    "vaccine"
  );
  const queryClient = useQueryClient();

  const { data: vaccineData, isLoading: isLoadingVaccines } = useQuery({
    queryKey: ["vaccines"],
    queryFn: getAntigen,
    refetchOnMount: true,
    staleTime: 0,
  });

  const formatVaccineData = React.useCallback(() => {
    if (!vaccineData) return [];

    return vaccineData
      .map((item: any) => {
        // Handle Vaccine items
        if (item.vac_name) {
          const specifyAge = item.specify_age || item.age_group || "birth";
          const category = item.vaccat_details?.vaccat_type || "N/A";

          const baseData: VaccineRecords = {
            id: item.vac_id,
            vaccineName: item.vac_name,
            vaccineType:
              item.vac_type_choices === "routine"
                ? "Routine"
                : item.vac_type_choices === "primary"
                ? "Primary Series"
                : "N/A",
            ageGroup: item.age_group || "N/A",
            doses: item.no_of_doses || "N/A",
            specifyAge: specifyAge,
            category: category,
            noOfDoses: item.no_of_doses || "N/A",
            schedule: item.schedule || "N/A",
            type: "vaccine",
            doseDetails: [],
          };

          if (item.vac_type_choices === "routine" && item.routine_frequency) {
            baseData.doseDetails.push({
              doseNumber: 1,
              interval: item.routine_frequency.interval,
              unit: item.routine_frequency.time_unit,
            });
          } else if (
            item.vac_type_choices === "primary" &&
            item.intervals?.length
          ) {
            const sortedIntervals = [...item.intervals].sort(
              (a, b) => a.dose_number - b.dose_number
            );
            sortedIntervals.forEach((interval) => {
              baseData.doseDetails.push({
                doseNumber: interval.dose_number,
                interval: interval.interval,
                unit: interval.time_unit,
              });
            });
          }
          return baseData;
        }
        // Handle Immunization Supplies items
        else if (item.imz_name) {
          return {
            id: item.imz_id,
            vaccineName: item.imz_name,
            vaccineType: "N/A",
            ageGroup: "N/A",
            doses: "N/A",
            specifyAge: "N/A",
            category: item.vaccat_details?.vaccat_type || "Immunization Supply",
            noOfDoses: "N/A",
            schedule: "N/A",
            type: "supplies",
            doseDetails: [],
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [vaccineData]);

  const filteredVaccines = React.useMemo(() => {
    return formatVaccineData()
      .filter((record): record is VaccineRecords => record !== null)
      .filter((record: VaccineRecords) =>
        Object.values(record)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
  }, [searchQuery, formatVaccineData]);

  const totalPages = Math.ceil(filteredVaccines.length / pageSize);
  const paginatedVaccines = filteredVaccines.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  

  const handleDelete = async () => {
    if (vaccineToDelete !== null) {
      const recordToDelete = filteredVaccines.find(record => record.id === vaccineToDelete);
      if (recordToDelete) {
        try {
          await handleDeleteAntigen(
            vaccineToDelete,
            recordToDelete.type,
            
          );
          
          setIsDeleteConfirmationOpen(false);
          setVaccineToDelete(null);
        } catch (error) {
          console.error("Delete error:", error);
          // Show error to user if needed
        }
      }
    }
  };


  const columns = VaccineColumns(
    setIsDialog,
    setVaccineToDelete,
    setIsDeleteConfirmationOpen
  );

  if (isLoadingVaccines) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

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
              placeholder="Search vaccines..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-buttonBlue text-white hover:bg-buttonBlue/90 group">
                <Plus size={15} /> New Vaccine
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-[200px]"
              onMouseEnter={(e: React.MouseEvent) => e.preventDefault()}
            >
              <DropdownMenuItem
                onClick={() => {
                  setSelectedOption("vaccine");
                  setIsDialog(true);
                }}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2"
              >
                Vaccine
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedOption("supplies");
                  setIsDialog(true);
                }}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2"
              >
                Immunization Supplies
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DialogLayout
            isOpen={isDialog}
            onOpenChange={setIsDialog}
            title={
              selectedOption === "vaccine"
                ? "Add New Vaccine"
                : "Add Immunization Supplies"
            }
            mainContent={
              selectedOption === "vaccine" ? (
                <VaccineModal setIsDialog={setIsDialog} />
              ) : (
                <ImmunizationSupplies setIsDialog={setIsDialog} />
              )
            }
            trigger={undefined}
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
                setPageSize(value >= 1 ? value : 1);
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
          <DataTable columns={columns} data={paginatedVaccines} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredVaccines.length)} of{" "}
            {filteredVaccines.length} vaccines
          </p>
          {paginatedVaccines.length > 0 && (
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
  onConfirm={handleDelete}  // Use the new handler here
  title={
    vaccineToDelete &&
    filteredVaccines.find((v) => v.id === vaccineToDelete)?.type === "vaccine"
      ? "Delete Vaccine"
      : "Delete Immunization Supply"
  }
  description={
    vaccineToDelete &&
    filteredVaccines.find((v) => v.id === vaccineToDelete)?.type === "vaccine"
      ? "Are you sure you want to delete this vaccine? This action cannot be undone."
      : "Are you sure you want to delete this immunization supply? This action cannot be undone."
  }
/>
    </div>
  );
}
