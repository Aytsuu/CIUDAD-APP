"use client";
import { useState, useMemo, useEffect } from "react";
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
import { ChildHealthRecordCard } from "@/components/ui/childInfocard";
import { api2 } from "@/api/api";
import { TableSkeleton } from "../../skeleton/table-skeleton";
// API functions
const getChildHealthRecords = async (chrec_id: number) => {
  const response = await api2.get(`/child-health/history/${chrec_id}/`);
  return response.data;
};

type NutritionStatus = {
  wfa: string;
  lhfa: string;
  wfl: string;
  muac: string;
  edemaSeverity: string;
};

type ChrRecords = {
  chrec_id: number;
  chhist_id: number;
  id: number;
  age: string;
  wt: number;
  ht: number;
  bmi: string;
  latestNote: string | null;
  followUpDescription: string;
  followUpDate: string;
  followUpStatus: string;
  vaccineStat: string;
  nutritionStatus: NutritionStatus;
  updatedAt: string;
  rawCreatedAt: string;
  status: string;
};

export default function InvChildHealthRecords() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ChildHealthRecord } = location.state || {};
  const mode = location.state.mode as
    | "addnewchildhealthrecord"
    | "immunization"
    | undefined;

  const [childData, setChildData] = useState(ChildHealthRecord);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!ChildHealthRecord || !ChildHealthRecord.chrec_id) {
      console.error(
        "ChildHealthRecord or chrec_id is missing from location state."
      );
    }
  }, [ChildHealthRecord, navigate]);

  if (!ChildHealthRecord || !ChildHealthRecord.chrec_id) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        Error: Child health record data is missing or incomplete.
      </div>
    );
  }

  const {
    data: historyData = [],
    isLoading,
    isError,
    error,
  } = useQuery<any, Error, ChrRecords[]>({
    queryKey: ["indivchildhistory", childData.chrec_id],
    queryFn: () => getChildHealthRecords(childData.chrec_id),
    enabled: !!childData.chrec_id,
    staleTime: 300000,
    gcTime: 600000,
    select: (data) => {
      const mainRecord = data && data.length > 0 ? data[0] : null;
      if (!mainRecord || !mainRecord.child_health_histories) {
        return [];
      }

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

        let latestNoteContent: string | null = null;
        let followUpDescription = "";
        let followUpDate = "";
        let followUpStatus = "";

        if (record.child_health_notes && record.child_health_notes.length > 0) {
          const sortedNotes = [...record.child_health_notes].sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          latestNoteContent = sortedNotes[0].chn_notes || null;
          
          if (sortedNotes[0].followv_details) {
            followUpDescription = sortedNotes[0].followv_details.followv_description || "";
            followUpDate = sortedNotes[0].followv_details.followv_date || "";
            followUpStatus = sortedNotes[0].followv_details.followv_status || "";
          }
        }

        const nutritionStatus = record.nutrition_statuses?.[0] || {
          wfa: "N/A",
          lhfa: "N/A",
          wfl: "N/A",
          muac: "N/A",
          edemaSeverity: "none",
        };

        return {
          chrec_id: mainRecord.chrec_id,
          patrec: mainRecord.patrec_id,
          status: record.status || "N/A",  
          chhist_id: record.chhist_id,
          id: index + 1,
          temp: record.child_health_vital_signs?.[0]?.temp || 0,
          age: record.child_health_vital_signs?.[0]?.bm_details?.age || "N/A",
          wt: record.child_health_vital_signs?.[0]?.bm_details?.weight || 0,
          ht: record.child_health_vital_signs?.[0]?.bm_details?.height || 0,
          bmi,
          latestNote: latestNoteContent,
          followUpDescription,
          followUpDate,
          followUpStatus,
          vaccineStat: record.tt_status || "N/A",
          nutritionStatus: {
            wfa: nutritionStatus.wfa || "N/A",
            lhfa: nutritionStatus.lhfa || "N/A",
            wfl: nutritionStatus.wfl || "N/A",
            muac: nutritionStatus.muac || "N/A",
            edemaSeverity: nutritionStatus.edemaSeverity || "none",
          },
          updatedAt: new Date(record.created_at).toLocaleDateString(),
          rawCreatedAt: record.created_at,
        };
      });
    },
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!childData?.patrec_id || !historyData?.length) return;

    const updateFollowUps = async () => {
      try {
        const response = await api2.get(
          `/patientrecords/followup-pending/${childData.patrec_id}/`
        );

        const visits = response.data.results ?? [];
        if (!visits.length) return;

        await Promise.all(
          visits.map(async (visit: any) => {
            const newStatus = visit.date === today ? "completed" : "missed";
            const todayNote =
              newStatus === "missed"
                ? `Missed on ${today}`
                : `Completed on ${today}`;

            await api2.patch(`/patientrecords/follow-up-visit/${visit.id}/`, {
              followv_status: newStatus,
              followv_description:
                (visit.description ? `${visit.description} | ` : "") +
                todayNote,
            });
          })
        );
      } catch (err) {
        console.error("Failed to update follow-ups:", err);
      }
    };

    updateFollowUps();
  }, [childData?.pat_id, historyData]);

  const latestRecord = useMemo(() => {
    if (historyData.length === 0) return null;
    return historyData[0];
  }, [historyData]);


  // Filter out immunization records when not in immunization mode
const filteredData = useMemo(() => {
  return historyData.filter((item: ChrRecords) => {
    // Skip immunization records when not in immunization mode
    if (mode !== "immunization" && item.status === "immunization") {
      return false;
    }
    
    const searchText = `${item.age} ${item.wt} ${item.ht} ${item.bmi} ${
      item.vaccineStat
    } ${item.nutritionStatus.wfa} ${item.nutritionStatus.lhfa} ${
      item.nutritionStatus.wfl
    } ${item.updatedAt} ${item.latestNote || ""} ${
      item.followUpDescription || ""
    }`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });
}, [searchQuery, historyData, mode]);

// Disable button when not in immunization mode and latest record is immunization
const shouldDisableButton = useMemo(() => {
  if (!latestRecord) return false;
  return mode !== "immunization" && latestRecord.status === "check-up" ;
}, [latestRecord, mode]);

// Button text based on mode
const buttonText = mode === "immunization" ? "Administer Vaccine" : "New Record";

  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, filteredData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const navigateToUpdateLatest = () => {
    if (latestRecord) {
      navigate("/child-health-record/addnewchildhealthrecord", {
        state: {
          params: {
            chhistId: latestRecord.chhist_id,
            patId: childData?.pat_id,
            originalRecord: latestRecord,
            patientData: childData,
            chrecId: childData?.chrec_id,
            mode: mode,
          },
        },
      });
    }
  };

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
      accessorKey: "temp",
      header: "Temp (°C)",
    },
    {
      accessorKey: "nutritionStatus.wfa",
      header: "WFA",
      cell: ({ row }) => row.original.nutritionStatus.wfa || "N/A",
    },
    {
      accessorKey: "nutritionStatus.lhfa",
      header: "LFA",
      cell: ({ row }) => row.original.nutritionStatus.lhfa || "N/A",
    },
    {
      accessorKey: "nutritionStatus.wfl",
      header: "WFL",
      cell: ({ row }) => row.original.nutritionStatus.wfl || "N/A",
    },
    {
      accessorKey: "nutritionStatus.muac",
      header: "MUAC",
      cell: ({ row }) => row.original.nutritionStatus.muac || "N/A",
    },
    {
      accessorKey: "nutritionStatus.edemaSeverity",
      header: "Edema",
      cell: ({ row }) =>
        row.original.nutritionStatus.edemaSeverity === "none"
          ? "None"
          : row.original.nutritionStatus.edemaSeverity,
    },
    {
      accessorKey: "latestNote",
      header: "Notes & Follow-up",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="min-w-[200px] max-w-[300px]">
            {record.latestNote ? (
              <p className="text-sm mb-2">{record.latestNote}</p>
            ) : (
              <p className="text-gray-500 text-sm mb-2">No notes</p>
            )}

            {(record.followUpDescription || record.followUpDate) && (
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-600">Follow-up:</span>
                  <span 
                    className={`text-xs px-2 py-1 rounded ${
                      record.followUpStatus === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : record.followUpStatus === 'missed' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {record.followUpStatus || 'pending'}
                  </span>
                </div>
                
                {record.followUpDescription && (
                  <p className="text-xs text-gray-600 break-words">
                    {record.followUpDescription.split('|').map((part, i) => (
                      <span key={i}>
                        {part.trim()}
                        {i < record.followUpDescription.split('|').length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                )}
                
                {record.followUpDate && (
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">Date:</span> {record.followUpDate}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      },
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
          </div>
        );
      },
    },
  ];



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
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Child Health History Records
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

      <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-4">
        {latestRecord && (
          <div className="ml-auto mt-4 sm:mt-0">
            <Button 
              onClick={navigateToUpdateLatest}
              disabled={shouldDisableButton}
            >
              {buttonText}
              </Button>
          </div>
        )}
      </div>

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
          {isLoading ? (
               <TableSkeleton columns={columns} rowCount={3} />

          ) : (
            <DataTable columns={columns} data={currentData} />
          )}
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