import type React from "react";
import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFPRecordsForPatient } from "@/pages/familyplanning/request-db/GetRequest";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, FileText, LayoutList, Plus, Calendar, MessageCircleWarning } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { getPatientDetails } from "../patientsRecord/restful-api/get";
import ViewButton from "@/components/ui/view-button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Import the correct type from your API or shared types
import type { IndividualFPRecordDetail } from "@/pages/familyplanning/request-db/GetRequest";

// Updated function to determine follow-up status based on backend status and date
const getFollowUpDisplayStatus = (followv_status?: string, followUpDate?: string) => {
  // If no follow-up data exists
  if (!followv_status || !followUpDate) {
    return { 
      status: "No Follow-up", 
      className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200" 
    };
  }

  // If status is "Completed", always show as completed regardless of date
  if (followv_status.toLowerCase() === "completed") {
    return { 
      status: "Completed", 
      className: "bg-green-100 text-green-800 border-green-300 hover:bg-green-200" 
    };
  }

  // If status is "Pending", check if the date has passed
  if (followv_status.toLowerCase() === "pending") {
    const today = new Date();
    const followUp = new Date(followUpDate);
    
    // Set hours to 0 for date-only comparison
    today.setHours(0, 0, 0, 0);
    followUp.setHours(0, 0, 0, 0);

    if (followUp < today) {
      return { 
        status: "Missed", 
        className: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200" 
      };
    } else if (followUp.getTime() === today.getTime()) {
      return { 
        status: "Due Today", 
        className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200" 
      };
    } else {
      return { 
        status: "Pending", 
        className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200" 
      };
    }
  }

  // Default case - show the backend status as is with yellow color
  return { 
    status: followv_status, 
    className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200" 
  };
};

// Check if any record has missed follow-ups for the warning banner
const hasMissedFollowUps = (records: IndividualFPRecordDetail[]) => {
  return records.some(record => {
    const { status } = getFollowUpDisplayStatus(record.followv_status, record.dateOfFollowUp);
    return status === "Missed";
  });
};

const IndividualFamPlanningTable: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId } = location.state || {};
  const [selectedRecords, setSelectedRecords] = useState<IndividualFPRecordDetail[]>([]);

  const {
    data: fpPatientRecords = [],
    isLoading: isLoadingFPRecords,
    isError: isErrorFPRecords,
    error: errorFPRecords,
  } = useQuery<IndividualFPRecordDetail[]>({
    queryKey: ["individualFPRecordsList", patientId],
    queryFn: () => getFPRecordsForPatient(patientId),
    enabled: !!patientId,
  });

  const {
    data: patientInfoForCard,
    isLoading: isLoadingPatientInfo,
    isError: isErrorPatientInfo,
    error: errorPatientInfo,
  } = useQuery({
    queryKey: ["patientDetails", patientId],
    queryFn: () => getPatientDetails(patientId!),
    enabled: !!patientId,
  });

  const displayPatientName = useMemo(() => {
    if (patientInfoForCard) {
      return `${patientInfoForCard.personal_info.per_fname} ${
        patientInfoForCard.personal_info.per_mname
          ? patientInfoForCard.personal_info.per_mname + " "
          : ""
      }${patientInfoForCard.personal_info.per_lname}`;
    }
    return "Loading patient name...";
  }, [patientInfoForCard]);

  const handleCheckboxChange = (record: IndividualFPRecordDetail, isChecked: boolean) => {
    setSelectedRecords((prevSelected) => {
      if (isChecked) {
        if (prevSelected.length >= 5) {
          toast.warning("You can select a maximum of 5 records for comparison.");
          return prevSelected;
        }
        return [...prevSelected, record];
      } else {
        return prevSelected.filter((r) => r.fprecord !== record.fprecord);
      }
    });
  };

  const handleAddFollowUp = (record: IndividualFPRecordDetail) => {
    if (!record.fprecord) {
      toast.error("Record ID not found for follow-up.");
      return;
    }
    const patrecIdToReuse = record.patrec_id;
    if (!patrecIdToReuse) {
      toast.error("Patient Record ID (patrec_id) not found for follow-up.");
      return;
    }
    navigate(
      `/familyplanning/new-record/${record.patient_id}?mode=followup&patrecId=${patrecIdToReuse}&prefillFromFpRecord=${record.fprecord}`,
      { state: { gender: record.sex } }
    );
  };

  const handleCompareRecords = () => {
    if (selectedRecords.length < 2) {
      toast.error("Please select at least two records to compare.");
      return;
    }
    navigate("/familyplanning/compare-multiple", {
      state: { recordIds: selectedRecords.map((record) => record.fprecord) },
    });
  };

  const handleCreateNewRecord = (patient: { gender: any }) => {
    if (!patientId) {
      toast.error("Patient ID not found");
      return;
    }
    navigate(`/familyplanning/new-record/${patientId}?mode=create&prefill=true`, {
      state: { gender: patient.gender },
    });
  };

  const groupedRecords = useMemo(() => {
    const groups: { [key: string]: IndividualFPRecordDetail[] } = {};
    fpPatientRecords.forEach((record) => {
      const patrecId = record.patrec_id || "Unknown";
      if (!groups[patrecId]) {
        groups[patrecId] = [];
      }
      groups[patrecId].push(record);
    });

    // Sort each group by created_at descending
    Object.keys(groups).forEach((patrecId) => {
      groups[patrecId].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });

    // Sort groups by latest record's created_at
    return Object.entries(groups).sort(([, aRecords], [, bRecords]) => {
      const aLatest = new Date(aRecords[0]?.created_at || 0).getTime();
      const bLatest = new Date(bRecords[0]?.created_at || 0).getTime();
      return bLatest - aLatest;
    });
  }, [fpPatientRecords]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getGroupHeader = (records: IndividualFPRecordDetail[]) => {
    if (records.length === 0) return "Unknown";
    const latestRecord = records[0];
    const date = formatDate(latestRecord.created_at);
    const method = latestRecord.method_used || latestRecord.otherMethod || "N/A";
    return `${date} (${method})`;
  };

  const tableColumns = useMemo<ColumnDef<IndividualFPRecordDetail>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => handleCheckboxChange(row.original, !!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "fprecord",
        header: "Record ID",
      },
      {
        accessorKey: "created_at",
        header: "Date Recorded",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        accessorKey: "client_type",
        header: "Client Type",
        cell: ({ row }) => row.original.client_type || "N/A",
      },
      {
        accessorKey: "method_used",
        header: "Method Used",
        cell: ({ row }) => {
          const method = row.original.method_used;
          const otherMethod = row.original.otherMethod;
          return method === "Others" && otherMethod ? otherMethod : method || "N/A";
        },
      },
      {
        accessorKey: "dateOfFollowUp",
        header: "Date of Follow-Up",
        cell: ({ row }) => formatDate(row.original.dateOfFollowUp || ""),
      },
      {
        accessorKey: "followv_status",
        header: "Follow-up Status",
        cell: ({ row }) => {
          const { status, className } = getFollowUpDisplayStatus(
            row.original.followv_status,
            row.original.dateOfFollowUp
          );
          
          return (
            <div className="items-center gap-2">
              <Badge 
                variant="outline" 
                className={className}
              >
                {status}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ViewButton
            onClick={() =>
              navigate("/familyplanning/view", {
                state: { fprecordId: row.original.fprecord },
              })
            }
          />
        ),
      },
    ],
    [navigate]
  );

  if (isLoadingFPRecords || isLoadingPatientInfo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading family planning records...</p>
      </div>
    );
  }

  if (isErrorFPRecords || isErrorPatientInfo) {
    return (
      <div className="text-center text-red-600 mt-8">
        <p>Error loading records: {errorFPRecords?.message || errorPatientInfo?.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Family Planning History</h1>
            <p className="text-gray-600">
              {displayPatientName} (ID: {patientId})
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCompareRecords}
            disabled={selectedRecords.length < 2}
            className="text-white"
          >
            <LayoutList className="h-5 w-5 mr-2" /> Compare Selected Records
          </Button>
          <Button
            onClick={() => handleCreateNewRecord({ gender: patientInfoForCard?.personal_info.per_sex || "Unknown" })}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-5 w-5 mr-2" /> New Record for Patient
          </Button>
        </div>
      </div>

      {patientInfoForCard && <PatientInfoCard patient={patientInfoForCard} />}

      {/* Updated warning banner to use the new logic */}
      {hasMissedFollowUps(fpPatientRecords) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <MessageCircleWarning className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-red-800 font-medium">
              This patient has missed follow-up appointments!
            </h3>
          </div>
          <ul className="list-disc pl-5 mt-2 text-red-700">
            {fpPatientRecords
              .filter((record) => {
                const { status } = getFollowUpDisplayStatus(record.followv_status, record.dateOfFollowUp);
                return status === "Missed";
              })
              .map((record, index) => (
                <li key={index}>
                  Missed follow-up on {formatDate(record.dateOfFollowUp ?? "")} (Record #{record.fprecord})
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <FileText size={20} />
          Family Planning Records
        </h2>
        {groupedRecords.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {groupedRecords.map(([patrecId, records], index) => {
              const isLatestGroup = index === 0; // First group is always the latest
              return (
                <AccordionItem key={patrecId} value={patrecId}>
                  <AccordionTrigger className="hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{getGroupHeader(records)}</span>
                        <Badge variant="secondary" className="ml-2">
                          {records.length} Records
                        </Badge>
                        {!isLatestGroup && (
                          <Badge variant="outline" className="ml-2 text-gray-500">
                            Historical
                          </Badge>
                        )}
                      </div>
                      {isLatestGroup ? (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddFollowUp(records[0]);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Follow-up
                        </Button>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled
                                className="text-gray-400"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Follow-up not available
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Follow-ups can only be added to the most recent method record</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <DataTable columns={tableColumns} data={records} />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No family planning records found for this patient.</p>
            <Button
              onClick={() => handleCreateNewRecord({ gender: patientInfoForCard?.personal_info.per_sex || "Unknown" })}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-5 w-5 mr-2" /> Create First Record
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualFamPlanningTable;