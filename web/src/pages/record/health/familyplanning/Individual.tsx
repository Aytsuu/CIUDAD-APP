import type React from "react";
import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFPRecordsForPatient } from "@/pages/familyplanning/request-db/GetRequest";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, FileText, LayoutList, Plus, MessageCircleWarning, Calendar, Clock, AlertCircle } from "lucide-react";
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
import type { IndividualFPRecordDetail } from "@/pages/familyplanning/request-db/GetRequest";
import { PatientOverviewStats } from "@/components/patient-overviewStats";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog/alert-dialog";
import { getFollowUpDisplayStatus, shouldShowFollowUpWarning, hasLatestGroupMissedFollowUps, getLatestGroupMissedFollowUps, getGroupHeader } from "./helper/helpers";
import { formatDate } from "@/helpers/dateHelper";

const IndividualFamPlanningTable: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId,patientData } = location.state || {};
  const [selectedRecords, setSelectedRecords] = useState<IndividualFPRecordDetail[]>([]);
  const [showFollowUpConfirm, setShowFollowUpConfirm] = useState(false);
  const [selectedRecordForFollowUp, setSelectedRecordForFollowUp] = useState<IndividualFPRecordDetail | null>(null);
 const actualPatientId = patientId || patientData?.pat_id;

  const {
    data: fpPatientRecords = [], isLoading: isLoadingFPRecords, isError: isErrorFPRecords,error: errorFPRecords } = useQuery<IndividualFPRecordDetail[]>({
    queryKey: ["individualFPRecordsList", actualPatientId],
    queryFn: () => getFPRecordsForPatient(actualPatientId),
    enabled: !!actualPatientId
  });

  const { data: patientInfoForCard, isLoading: isLoadingPatientInfo, isError: isErrorPatientInfo,error: errorPatientInfo } = useQuery({
    queryKey: ["patientDetails", actualPatientId],
    queryFn: () => getPatientDetails(actualPatientId!),
    enabled: !!actualPatientId
  });

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

  const isRecordSelected = (record: IndividualFPRecordDetail) => {
    return selectedRecords.some((selected) => selected.fprecord === record.fprecord);
  };

  const handleAddFollowUp = (record: IndividualFPRecordDetail) => {
    const { showWarning } = shouldShowFollowUpWarning(record);
    console.log("🔄 [Individual] Adding follow-up with state:", {
      patientId,
      patrecId: record.patrec_id,
      prefillFromFpRecord: record.fprecord,
      gender: record.sex || patientInfoForCard?.personal_info.per_sex || "Unknown",
      timestamp: Date.now() // CRITICAL: Add timestamp
    });
    if (showWarning) {
      setSelectedRecordForFollowUp(record);
      setShowFollowUpConfirm(true);
    } else {
      proceedWithFollowUp(record);
    }
  };

  const proceedWithFollowUp = (record: IndividualFPRecordDetail) => {
    if (!record.fprecord) {
      toast.error("Record ID not found for follow-up.");
      return;
    }
    const patrecIdToReuse = record.patrec_id;
    if (!patrecIdToReuse) {
      toast.error("Patient Record not found for follow-up.");
      return;
    }
    navigate("/services/familyplanning/new-record", {
      state: {
        mode: "followup",
        patientId: patientId,
        patrecId: record.patrec_id,
        prefillFromFpRecord: record.fprecord,
        gender: record.sex || patientInfoForCard?.personal_info.per_sex || "Unknown",
        timestamp: Date.now()
      }
    });
  };

  const handleCompareRecords = () => {
    if (selectedRecords.length < 2) {
      toast.error("Please select at least two records to compare.");
      return;
    }
    navigate("/services/familyplanning/compare-multiple", {
      state: { recordIds: selectedRecords.map((record) => record.fprecord) }
    });
  };

  const handleCreateNewRecord = () => {
    if (!patientId) {
      toast.error("Patient ID not found");
      return;
    }
    console.log("🔄 [Individual] Creating new record with state:", {
      patientId,
      isNewMethod: true,
      prefill: true,
      gender: patientInfoForCard?.personal_info.per_sex || "Unknown",
      patrecId: groupedRecords.length > 0 ? groupedRecords[0][1][0]?.patrec_id : undefined,
      timestamp: Date.now() // CRITICAL: Add timestamp to force re-render
    });
    
    navigate("/services/familyplanning/new-record", {
      state: {
        mode: "create",
        patientId: patientId,
        isNewMethod: true,
        prefill: true,
        gender: patientInfoForCard?.personal_info.per_sex || "Unknown",
        patrecId: groupedRecords.length > 0 ? groupedRecords[0][1][0]?.patrec_id : undefined,
        timestamp: Date.now()
      },
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

    Object.keys(groups).forEach((patrecId) => {
      groups[patrecId].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });

    return Object.entries(groups).sort(([, aRecords], [, bRecords]) => {
      const aLatest = new Date(aRecords[0]?.created_at || 0).getTime();
      const bLatest = new Date(bRecords[0]?.created_at || 0).getTime();
      return bLatest - aLatest;
    });
  }, [fpPatientRecords]);



  const tableColumns = useMemo<ColumnDef<IndividualFPRecordDetail>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => {
          const visibleRows = table.getRowModel().rows;
          const allSelected = visibleRows.length > 0 && visibleRows.every((row) => isRecordSelected(row.original));
          const someSelected = visibleRows.some((row) => isRecordSelected(row.original));
          return (
            <Checkbox
              checked={allSelected}
              ref={(ref) => {
                if (ref && ref instanceof HTMLInputElement) ref.indeterminate = someSelected && !allSelected;
              }}
              onCheckedChange={(value) => {
                if (value) {
                  const remainingSlots = 5 - selectedRecords.length;
                  const toSelect = visibleRows
                    .filter((row) => !isRecordSelected(row.original))
                    .slice(0, remainingSlots)
                    .map((row) => row.original);
                  if (toSelect.length + selectedRecords.length > 5) {
                    toast.warning("You can select a maximum of 5 records for comparison.");
                  }
                  setSelectedRecords((prev) => [...prev, ...toSelect]);
                } else {
                  const visibleRecordIds = visibleRows.map((row) => row.original.fprecord);
                  setSelectedRecords((prev) => prev.filter((record) => !visibleRecordIds.includes(record.fprecord)));
                }
              }}
              aria-label="Select all"
            />
          );
        },
        cell: ({ row }) => <Checkbox checked={isRecordSelected(row.original)} onCheckedChange={(value) => handleCheckboxChange(row.original, !!value)} aria-label="Select row" />,
        enableSorting: false,
        enableHiding: false
      },
      {
        accessorKey: "fprecord",
        header: "Record ID"
      },
      {
        accessorKey: "created_at",
        header: "Date Recorded",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-500" />
            {formatDate(row.original.created_at)}
          </div>
        )
      },
      {
        accessorKey: "client_type",
        header: "Client Type",
        cell: ({ row }) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.client_type === "New Acceptor"
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700'
            }`}>
            {row.original.client_type || "N/A"}
          </span>
        )
      },
      {
        accessorKey: "method_used",
        header: "Method Used",
        cell: ({ row }) => {
          const method = row.original.method_used;
          const otherMethod = row.original.otherMethod;
          return method === "Others" && otherMethod ? otherMethod : method || "N/A";
        }
      },
      {
        accessorKey: "dateOfFollowUp",
        header: "Next Follow-up Visit",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-orange-500" />
            {formatDate(row.original.dateOfFollowUp || "No follow-up visit date")}
          </div>
        )
      },
      {
        accessorKey: "followv_status",
        header: "Follow-up Status",
        cell: ({ row }) => {
          const { status, className } = getFollowUpDisplayStatus(row.original.followv_status, row.original.dateOfFollowUp);
          return (
            <Badge variant="outline" className={className}>
              {status}
            </Badge>
          );
        }
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ViewButton
            onClick={() =>
              navigate("/services/familyplanning/view", {
                state: { fprecordId: row.original.fprecord }
              })
            }
          />
        )
      }
    ],
    [navigate, selectedRecords, isRecordSelected]
  );

  if (isLoadingFPRecords || isLoadingPatientInfo) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading family planning records...</p>
      </div>
    );
  }

  if (isErrorFPRecords || isErrorPatientInfo) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <p className="text-red-600 font-semibold text-lg">
          Error loading records: {errorFPRecords?.message || errorPatientInfo?.message}
        </p>
      </div>
    );
  }

  const latestGroupDaysLeft = groupedRecords.length > 0
    ? shouldShowFollowUpWarning(groupedRecords[0][1][0]).daysLeft
    : Infinity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="hover:bg-purple-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Family Planning History</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCompareRecords}
              disabled={selectedRecords.length < 2}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <LayoutList className="h-5 w-5 mr-2" /> Compare Records ({selectedRecords.length})
            </Button>
            <Button
              onClick={() => handleCreateNewRecord()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-5 w-5 mr-2" /> New Method for Patient
            </Button>
          </div>
        </div>

        {patientInfoForCard && <PatientInfoCard patient={patientInfoForCard} />}

        <div className="mt-6"></div>
        <PatientOverviewStats records={fpPatientRecords} />

        {/* Upcoming Follow-up Visit */}
          {groupedRecords.length > 0 && groupedRecords[0][1][0]?.dateOfFollowUp && (
  <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-green-500" />
        <h3 className="text-green-800 font-medium">Follow-up visit</h3>
      </div>
      <span className="text-green-600 font-semibold">
        Date: {formatDate(groupedRecords[0][1][0].dateOfFollowUp!)}
        {groupedRecords[0][1][0].followv_status === "Pending" && (
          <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
            Pending
          </Badge>
        )}
      </span>
    </div>
  </div>
)}

        {/* Warning Banner */}
        {hasLatestGroupMissedFollowUps(groupedRecords) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <MessageCircleWarning className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-red-800 font-medium">This patient has missed follow-up appointments for their current method!</h3>
            </div>
            <ul className="list-disc pl-5 mt-2 text-red-700">
              {getLatestGroupMissedFollowUps(groupedRecords).map((record, index) => (
                <li key={index}>
                  Missed follow-up on {formatDate(record.dateOfFollowUp ?? "")} (Record #{record.fprecord})
                </li>
              ))}
            </ul>
            {latestGroupDaysLeft < 0 && latestGroupDaysLeft > -4 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center">
                <Calendar className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-amber-800 font-medium">
                  Follow-up will show warning after 3 days of inactivity.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Records Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
            <FileText size={24} className="text-blue-600" />
            Family Planning Records
          </h2>
          {groupedRecords.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {groupedRecords.map(([patrecId, records], index) => {
                const isLatestGroup = index === 0;
                const { showWarning } = shouldShowFollowUpWarning(records[0]);

                return (
                  <AccordionItem
                    key={patrecId}
                    value={patrecId}
                    className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 transition-all"
                  >
                    <AccordionTrigger className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors px-6 py-4">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLatestGroup
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                            }`}>
                            {index + 1}
                          </div>
                          <div className="text-left">
                            <span className="font-bold text-lg">{getGroupHeader(records)}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                {records.length} {records.length === 1 ? 'visit' : 'visits'}
                              </Badge>
                              {/* {isLatestGroup && (
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                  Current Method
                                </Badge>
                              )} */}
                            </div>
                          </div>
                        </div>
                        {isLatestGroup ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Button
                                    size="sm"
                                    onClick={(e: any) => {
                                      e.stopPropagation();
                                      handleAddFollowUp(records[0]);
                                    }}
                                    className={`${showWarning
                                        ? "bg-yellow-600 hover:bg-yellow-700"
                                        : "bg-green-600 hover:bg-green-700"
                                      } text-white shadow-md`}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Follow-up
                                  </Button>
                                </div>
                              </TooltipTrigger>
                              {showWarning && (
                                <TooltipContent>
                                  <p>This follow-up is overdue. Continuing will create a late follow-up record.</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled
                                  className="text-gray-400"
                                  onClick={(e: any) => e.stopPropagation()}
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
                    <AccordionContent className="px-6 py-4 bg-gray-50">
                      <DataTable columns={tableColumns} data={records} />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl">
              <AlertCircle size={64} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-4">No family planning records found for this patient.</p>
              <Button
                onClick={() => handleCreateNewRecord()}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" /> Create First Record
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Follow-up Confirmation Dialog */}
      <AlertDialog open={showFollowUpConfirm} onOpenChange={setShowFollowUpConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MessageCircleWarning className="h-5 w-5 text-yellow-600" />
              Missed Follow-up Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              This follow-up appointment was missed (more than 3 days late).
              Proceeding will continue the record anyway. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedRecordForFollowUp) {
                  proceedWithFollowUp(selectedRecordForFollowUp);
                }
                setShowFollowUpConfirm(false);
              }}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IndividualFamPlanningTable;
