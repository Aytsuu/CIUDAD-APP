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

interface IndividualFPRecordDetail {
  patient_id: any;
  fprecord: any;
  otherMethod: any;
  patrec_id: any;
  client_id: string;
  patient_name: string;
  patient_age: number;
  sex: string;
  client_type: string;
  method_used: string;
  created_at: string;
  updated_at: string;
  dateOfVisit?: string;
  methodAccepted?: string;
  nameOfServiceProvider?: string;
  dateOfFollowUp?: string;
  methodQuantity?: string;
  serviceProviderSignature?: string;
  medicalFindings?: string;
  weight?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  violenceAgainstWomen?: {
    unpleasantRelationship?: boolean;
    partnerDisapproval?: boolean;
    domesticViolence?: boolean;
    referredTo?: string;
  };
  pregnancyCheck?: {
    breastfeeding?: boolean;
    abstained?: boolean;
    recent_baby?: boolean;
    recent_period?: boolean;
    recent_abortion?: boolean;
    using_contraceptive?: boolean;
  };
  riskSti?: {
    abnormalDischarge?: boolean;
    soresLesions?: boolean;
    itching?: boolean;
    stiHistory?: boolean;
    abnormalBleeding?: boolean;
    referredTo?: string;
  };
  riskVaw?: {
    unpleasantRelationship?: boolean;
    partnerDisapproval?: boolean;
    domesticViolence?: boolean;
    referredTo?: string;
  };
  physicalExam?: {
    skin?: string;
    extremities?: string;
    conjunctiva?: string;
    neck?: string;
    breast?: string;
    abdomen?: string;
    pelvicExam?: string;
  };
  obstetricalHistory?: {
    g_pregnancies?: number;
    p_pregnancies?: number;
    fullTerm?: number;
    premature?: number;
    abortion?: number;
    livingChildren?: number;
  };
}

const isFollowUpMissed = (followUpDate: string) => {
  if (!followUpDate || followUpDate === "N/A") return { missed: false, days: 0 };
  const followUp = new Date(followUpDate);
  const today = new Date("2025-08-11T12:10:00-07:00"); // Set to 12:10 PM PST, August 11, 2025
  followUp.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  if (followUp < today) {
    const diffTime = Math.abs(today.getTime() - followUp.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { missed: true, days: diffDays };
  }
  return { missed: false, days: 0 };
};

const getFollowUpStatus = (followUpDate: string) => {
  if (!followUpDate || followUpDate === "N/A") return { status: "No Follow-up", days: 0 };

  const today = new Date("2025-08-11T12:10:00-07:00"); // Set to 12:10 PM PST, August 11, 2025
  today.setHours(0, 0, 0, 0);
  const followUp = new Date(followUpDate);
  followUp.setHours(0, 0, 0, 0);

  if (followUp < today) {
    const diffTime = Math.abs(today.getTime() - followUp.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { status: "Missed", days: diffDays };
  }
  if (followUp.getTime() === today.getTime()) return { status: "Today", days: 0 };
  return { status: "Upcoming", days: 0 };
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
  } = useQuery({
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
      return `${patientInfoForCard.personal_info.per_fname} ${patientInfoForCard.personal_info.per_mname
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
      toast.error("Patient Record ID (patrec_id) not found for follow-up. Please check API response.");
      return;
    }
    navigate(
      `/familyplanning/new-record/${record.patient_id}?mode=followup&patrecId=${patrecIdToReuse}&prefillFromFpRecord=${record.fprecord}`
    );
  };

  const handleCompareRecords = () => {
    if (selectedRecords.length < 2) {
      toast.error("Please select at least two records to compare.");
      return;
    }
    const recordIdsToCompare = selectedRecords.map((record) => record.fprecord);
    console.log("Individual.tsx: IDs being sent to comparison page:", recordIdsToCompare);
    navigate("/familyplanning/compare-multiple", { state: { recordIds: recordIdsToCompare } });
  };

  const handleCreateNewRecord = () => {
    if (!patientId) {
      toast.error("Patient ID not found");
      return;
    }
    navigate(`/familyplanning/new-record/${patientId}?mode=create&prefill=true`);
  };

  // Group records by patrec_id
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
    // Sort groups by the latest created_at in each group
    const sortedGroups = Object.entries(groups).sort(([, aRecords], [, bRecords]) => {
      const aLatest = new Date(aRecords[0]?.created_at || 0).getTime();
      const bLatest = new Date(bRecords[0]?.created_at || 0).getTime();
      return bLatest - aLatest; // Newest group first
    });
    return Object.fromEntries(sortedGroups);
  }, [fpPatientRecords]);

  // Function to format date as DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Function to get latest record info for group header
  const getGroupHeader = (records: IndividualFPRecordDetail[]) => {
    if (records.length === 0) return "Unknown";
    const latestRecord = records[0]; // Since sorted descending by created_at
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
        cell: ({ row }) => row.original.client_type,
      },
      {
        accessorKey: "method_used",
        header: "Method Used",
        cell: ({ row }) => {
          const method = row.original.method_used;
          const otherMethod = row.original.other_method;
          return method === "Others" && otherMethod ? otherMethod : method || "N/A";
        },
      },
      {
        accessorKey: "dateOfFollowUp",
        header: "Date of Follow-Up",
        cell: ({ row }) => {
          const date = row.original.dateOfFollowUp;
          if (date && date !== "N/A") {
            const formattedDate = formatDate(date);
            return formattedDate;
          }
          return "N/A";
        },
      },
      {
        accessorKey: "dateOfFollowUp",
        header: "Follow-up Status",
        cell: ({ row }) => {
          const date = row.original.dateOfFollowUp;
          const { status, days } = getFollowUpStatus(date);

          if (!date || date === "N/A") {
            return <span className="text-gray-500">No Follow-up</span>;
          }

          const formattedDate = formatDate(date);

          return (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  status === "Missed"
                    ? "bg-red-100 text-red-800 border-red-300"
                    : status === "Today"
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "bg-green-100 text-green-800 border-green-300"
                }
              >
                {formattedDate}
              </Badge>
              {status === "Missed" && (
                <span className="text-red-600 text-sm font-medium">({days} days missed)</span>
              )}
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
            onClick={handleCreateNewRecord}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-5 w-5 mr-2" /> New Record for Patient
          </Button>
        </div>
      </div>

      {patientInfoForCard && <PatientInfoCard patient={patientInfoForCard} />}

      {Object.values(groupedRecords).flat().some(record =>
        isFollowUpMissed(record.dateOfFollowUp ?? "").missed
      ) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <MessageCircleWarning className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-red-800 font-medium">
              This patient has missed follow-up appointments!
            </h3>
          </div>
          <ul className="list-disc pl-5 mt-2 text-red-700">
            {Object.values(groupedRecords)
              .flat()
              .filter(record => isFollowUpMissed(record.dateOfFollowUp ?? "").missed)
              .map((record, index) => {
                const { days } = isFollowUpMissed(record.dateOfFollowUp ?? "");
                return (
                  <li key={index}>
                    Missed follow-up on {formatDate(record.dateOfFollowUp ?? "")} (Record #{record.fprecord}) - {days} days missed
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <FileText size={20} />
          Family Planning Records
        </h2>
        {Object.keys(groupedRecords).length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(groupedRecords).map(([patrecId, records]) => (
              <AccordionItem key={patrecId} value={patrecId}>
                <AccordionTrigger className="hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{getGroupHeader(records)}</span>
                      <Badge variant="secondary" className="ml-2">
                        {records.length} Records
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent accordion toggle
                        handleAddFollowUp(records[0]); // Use the latest record in the group
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Follow-up
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <DataTable columns={tableColumns} data={records} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No family planning records found for this patient.</p>
            <Button
              onClick={handleCreateNewRecord}
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