import type React from "react"
import { useMemo, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getFPRecordsForPatient } from "@/pages/familyplanning/request-db/GetRequest"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowLeft, FileText, LayoutList, Plus } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { DataTable } from "@/components/ui/table/data-table"
import { PatientInfoCard } from "@/components/ui/patientInfoCard"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { getPatientDetails } from "../patientsRecord/restful-api/get"

interface IndividualFPRecordDetail {
  otherMethod: any
  fprecord_id: number
  client_id: string
  patient_name: string
  patient_age: number
  sex: string
  client_type: string
  method_used: string
  created_at: string
  updated_at: string
  dateOfVisit?: string
  methodAccepted?: string
  nameOfServiceProvider?: string
  dateOfFollowUp?: string
  methodQuantity?: string
  serviceProviderSignature?: string
  medicalFindings?: string
  weight?: number
  bp_systolic?: number
  bp_diastolic?: number
  violenceAgainstWomen?: {
    unpleasantRelationship?: boolean
    partnerDisapproval?: boolean
    domesticViolence?: boolean
    referredTo?: string
  }
  pregnancyCheck?: {
    breastfeeding?: boolean
    abstained?: boolean
    recent_baby?: boolean
    recent_period?: boolean
    recent_abortion?: boolean
    using_contraceptive?: boolean
  }
  riskSti?: {
    abnormalDischarge?: boolean
    soresLesions?: boolean
    itching?: boolean
    stiHistory?: boolean
    abnormalBleeding?: boolean
    referredTo?: string
  }
  riskVaw?: {
    unpleasantRelationship?: boolean
    partnerDisapproval?: boolean
    domesticViolence?: boolean
    referredTo?: string
  }
  physicalExam?: {
    skin?: string
    extremities?: string
    conjunctiva?: string
    neck?: string
    breast?: string
    abdomen?: string
    pelvicExam?: string
  }
  obstetricalHistory?: {
    g_pregnancies?: number
    p_pregnancies?: number
    fullTerm?: number
    premature?: number
    abortion?: number
    livingChildren?: number
  }
}

const IndividualFamPlanningTable: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()

  const [selectedRecords, setSelectedRecords] = useState<IndividualFPRecordDetail[]>([])

  const {
    data: fpPatientRecords = [],
    isLoading: isLoadingFPRecords,
    isError: isErrorFPRecords,
    error: errorFPRecords,
  } = useQuery<IndividualFPRecordDetail[]>({
    queryKey: ["fpRecordsForPatient", patientId],
    queryFn: () => getFPRecordsForPatient(patientId!),
    enabled: !!patientId,
  })

  const {
    data: patientInfoForCard,
    isLoading: isLoadingPatientInfo,
    isError: isErrorPatientInfo,
    error: errorPatientInfo,
  } = useQuery({
    queryKey: ["patientDetails", patientId],
    queryFn: () => getPatientDetails(patientId!),
    enabled: !!patientId,
  })

  const displayPatientName = useMemo(() => {
    if (patientInfoForCard) {
      return `${patientInfoForCard.personal_info.per_fname} ${
        patientInfoForCard.personal_info.per_mname ? patientInfoForCard.personal_info.per_mname + " " : ""
      }${patientInfoForCard.personal_info.per_lname}`
    }
    return "Loading patient name..."
  }, [patientInfoForCard])

  const handleCheckboxChange = (record: IndividualFPRecordDetail, isChecked: boolean) => {
    setSelectedRecords((prevSelected) => {
      if (isChecked) {
        if (prevSelected.length >= 5) {
          toast.warning("You can select a maximum of 5 records for comparison.")
          return prevSelected
        }
        return [...prevSelected, record]
      } else {
        return prevSelected.filter((r) => r.fprecord_id !== record.fprecord_id)
      }
    })
  }

  const handleCompareRecords = () => {
    if (selectedRecords.length < 2) {
      toast.error("Please select at least two records to compare.")
      return
    }
    const recordIdsToCompare = selectedRecords.map((record) => record.fprecord)
    console.log("Individual.tsx: IDs being sent to comparison page:", recordIdsToCompare)
    navigate("/familyplanning/compare-multiple", { state: { recordIds: recordIdsToCompare } })
  }

  // NEW: Handle creating a new record for this patient
  const handleCreateNewRecord = () => {
    if (!patientId) {
      toast.error("Patient ID not found")
      return
    }

    // Navigate to the new record creation page with the patient ID
    // This will pre-fill the form with the patient's latest data
    navigate(`/familyplanning/new-record/${patientId}?mode=create&prefill=true`)
  }

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
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
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
          const method = row.original.method_used
          const otherMethod = row.original.other_method
          return method === "Others" && otherMethod ? otherMethod : method || "N/A"
        },
      },
    {
  accessorKey: "dateOfFollowUp",
  header: "Date of Follow-Up",
  cell: ({ row }) => {
    const date = row.original.dateOfFollowUp;
    
    // Check if the date is valid before rendering
    if (date && date !== "N/A") {
      const formattedDate = new Date(date).toLocaleDateString();
      return (
        <span className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'>
          {formattedDate}
        </span>
      );
    }
    
    // Return "N/A" without the background color
    return "N/A";
  },
},
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="space-x-2">
            <Link to={`/familyplanning/view/${row.original.fprecord}`}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [patientId],
  )

  if (isLoadingFPRecords || isLoadingPatientInfo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading family planning records...</p>
      </div>
    )
  }

  if (isErrorFPRecords || isErrorPatientInfo) {
    return (
      <div className="text-center text-red-600 mt-8">
        <p>Error loading records: {errorFPRecords?.message || errorPatientInfo?.message}</p>
      </div>
    )
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
          <Button onClick={handleCompareRecords} disabled={selectedRecords.length < 2} className="text-white">
            <LayoutList className="h-5 w-5 mr-2" /> Compare Selected Records
          </Button>
          {/* NEW: Button to create a new record for this patient */}
          <Button onClick={handleCreateNewRecord} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-5 w-5 mr-2" /> New Record for Patient
          </Button>
        </div>
      </div>

      {patientInfoForCard && <PatientInfoCard patient={patientInfoForCard} />}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <FileText size={20} />
          Family Planning Records
        </h2>
        {fpPatientRecords.length > 0 ? (
          <DataTable columns={tableColumns} data={fpPatientRecords} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No family planning records found for this patient.</p>
            <Button onClick={handleCreateNewRecord} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-5 w-5 mr-2" /> Create First Record
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default IndividualFamPlanningTable