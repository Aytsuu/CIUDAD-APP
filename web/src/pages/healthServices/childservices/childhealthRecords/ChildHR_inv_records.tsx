"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, FileInput, ChevronLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { ChildHealthRecordCard } from "@/components/ui/childInfocard";
import { api2 } from "@/api/api";
import { Skeleton } from "@/components/ui/skeleton";

// API functions
const getChildHealthRecords = async (chrec_id: number) => {
  const response = await api2.get(`/child-health/history/${chrec_id}/`);
  return response.data;
};

export default function InvChildHealthRecords() {
  type ChrRecords = {
    chrec_id: number;
    chhist_id: number;
    id: number;
    age: string;
    wt: number;
    ht: number;
    bmi: string;
    latestNote: string | null; // Changed to hold a single latest note
    vaccineStat: string;
    nutritionStat: string;
    updatedAt: string;
    rawCreatedAt: string;
  };

  // State and hooks
  const location = useLocation();
  const { ChildHealthRecord } = location.state || {};
  const [childData, setChildData] = useState(ChildHealthRecord || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Data fetching with React Query
  const {
    data: historyData = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["indivchildhistory", childData?.chrec_id], // Added chrec_id to queryKey
    queryFn: () => getChildHealthRecords(childData?.chrec_id),
    enabled: !!childData?.chrec_id,
    staleTime: 300000,
    gcTime: 600000,
    select: (data) => {
      const mainRecord = data && data.length > 0 ? data[0] : null;
      if (!mainRecord || !mainRecord.child_health_histories) {
        return [];
      }

      // Sort the child_health_histories by created_at in descending order
      const sortedHistories = [...mainRecord.child_health_histories].sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return sortedHistories.map((record: any, index: number) => {
        let bmi = "N/A";
        if (record.child_health_vital_signs?.length > 0) {
          const vital = record.child_health_vital_signs[0];
          if (vital.bm_details?.height && vital.bm_details?.weight) {
            const heightInM = vital.bm_details.height / 100;
            const bmiValue = (
              vital.bm_details.weight /
              (heightInM * heightInM)
            ).toFixed(1);
            bmi = bmiValue;
          }
        }

        // Find the latest note for this specific history record (chhist_id)
        let latestNoteContent: string | null = null;
        if (record.child_health_notes && record.child_health_notes.length > 0) {
          const sortedNotes = [...record.child_health_notes].sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          latestNoteContent = sortedNotes[0].chn_notes || null;
        }

        return {
          chrec_id: mainRecord.chrec_id, // Keep the main chrec_id
          chhist_id: record.chhist_id,
          id: index + 1, // This ID will now reflect the sorted order (latest first)
          age: record.child_health_vital_signs?.[0]?.bm_details?.age || "N/A",
          wt: record.child_health_vital_signs?.[0]?.bm_details?.weight || 0,
          ht: record.child_health_vital_signs?.[0]?.bm_details?.height || 0,
          bmi,
          latestNote: latestNoteContent, // Assign the single latest note
          vaccineStat: record.tt_status || "N/A",
          nutritionStat: record.nutrition_statuses?.[0]?.wfa || "N/A",
          updatedAt: new Date(record.created_at).toLocaleDateString(), // This is the history record's created_at
          rawCreatedAt: record.created_at, // This is the history record's created_at
        };
      });
    },
  });

  // Latest record calculation (now correctly refers to the latest chhist_id)
  const latestHistoryCreatedAt = useMemo(() => {
    if (historyData.length === 0) return null;
    return new Date(historyData[0].rawCreatedAt).getTime();
  }, [historyData]);

  // Filter and paginate data
  const filteredData = useMemo(() => {
    return historyData.filter((item: ChrRecords) => {
      const searchText = `${item.age} ${item.wt} ${item.ht} ${item.bmi} ${
        item.vaccineStat
      } ${item.nutritionStat} ${item.updatedAt} ${
        item.latestNote || ""
      }`.toLowerCase(); // Use latestNote
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, historyData]);

  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, filteredData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Navigation function
  function toChildHealthForm() {
    navigate("/newAddChildHRForm", {
      state: {
        recordType: "existingPatient",
        params: { ChildHealthRecord: childData },
      },
    });
  }

  // Table columns
  const columns: ColumnDef<ChrRecords>[] = [
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
      accessorKey: "age",
      header: "Age",
    },
    {
      accessorKey: "wt",
      header: "WT (kg)",
    },
    {
      accessorKey: "ht",
      header: "HT (cm)",
    },
    {
      accessorKey: "bmi",
      header: "BMI",
    },
    {
      accessorKey: "vaccineStat",
      header: "Immunization Status",
    },
    {
      accessorKey: "nutritionStat",
      header: "Nutrition Status",
    },
    {
      accessorKey: "latestNote", // Changed accessorKey to latestNote
      header: "Notes",
      cell: ({ row }) => (
        <div className="min-w-[150px]">
          {row.original.latestNote ? (
            <p className="text-sm">{row.original.latestNote}</p> // Display the single latest note
          ) : (
            <span className="text-gray-500">No notes</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const originalRecord = historyData.find(
          (rec: any) => rec.chhist_id === row.original.chhist_id
        );
        const isLatest =
          originalRecord &&
          new Date(originalRecord.rawCreatedAt).getTime() ===
            latestHistoryCreatedAt;
        return (
          <div className="flex justify-center gap-2">
            <Link
              to="/child-health-history-detail"
              state={{
                params: {
                  chhistId: originalRecord?.chhist_id,
                  patId: childData?.pat_id,
                  originalRecord,
                  patientData: childData,
                  chrecId: childData?.chrec_id,
                },
              }}
            >
              <Button variant="ghost">View</Button>
            </Link>
            {isLatest && (
              <Link
                to="/child-health-record/edit"
                state={{
                  params: {
                    chhistId: originalRecord?.chhist_id,
                    patId: childData?.pat_id,
                    originalRecord,
                    patientData: childData,
                    chrecId: childData?.chrec_id,
                    mode: "edit", // This is the key part
                  },
                }}
              >
                <Button>Update</Button>
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">
          Error loading data:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-snow">
      <div className="flex flex-col sm:flex-row gap-4 ">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Child Health Hisotry Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view child's health history
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <div className="mb-5">
        <ChildHealthRecordCard child={childData} />
      </div>

      {/* Wrap the DataTable with TooltipProvider */}
      <div className="h-full w-full rounded-md">
        <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-8"
              value={pageSize}
              onChange={(e) =>
                setPageSize(Math.max(1, Number.parseInt(e.target.value) || 10))
              }
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                size={17}
              />
              <Input
                placeholder="Search records..."
                className="pl-10 bg-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileInput className="mr-2" size={16} />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="bg-white w-full overflow-x-auto">
          <DataTable columns={columns} data={currentData} />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} records
          </p>
          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
