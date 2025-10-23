"use client"

import { useEffect, useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Search, Heart, Baby, Clock, CheckCircle, HeartHandshake, Loader2, RefreshCw, Plus, ClockAlert } from "lucide-react"

import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { SelectLayout } from "@/components/ui/select/select-layout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "@/hooks/use-debounce"

import { PatientInfoCard } from "@/components/ui/patientInfoCard"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { PregnancyAccordion } from "../maternal-components/pregnancy-accordion"
import PregnancyChart from "../maternal-components/pregnancy-chart"
import PregnancyVisitTracker from "../maternal-components/8anc-visit-chart"
import { formatDate } from "./appointments/columns"

import { usePregnancyDetails } from "../queries/maternalFetchQueries"
import { useAddCompletePregnancy, useAddPregnancyLoss } from "../queries/maternalAddQueries"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"


interface Patient {
  pat_id: string
  age: number
  personal_info: {
    per_fname: string;
    per_lname: string;
    per_mname: string;
    per_sex: string;
    per_dob?: string
    ageTime?: "yrs"
  }
  address?: {
    add_street?: string
    add_barangay?: string
    add_city?: string
    add_province?: string
    add_external_sitio?: string
    add_sitio?: string
  }
  pat_type: string
  patrec_type?: string
}

// accordion data types
interface MaternalRecord {
  id: string
  pregnancyId: string
  dateCreated: string
  address: string
  sitio: string
  type: "Transient" | "Resident"
  recordType: "Prenatal" | "Postpartum Care"
  status: "Active" | "Completed" | "Pregnancy Loss"
  gestationalWeek?: number
  gestationalFormatted?: string
  expectedDueDate?: string
  deliveryDate?: string
  prenatal_end_date?: string
  postpartum_end_date?: string
  notes?: string
  postpartum_assessment?: {
    ppa_id: string;
    ppa_date: string;
    ppa_lochial_discharges: string;
    ppa_blood_pressure: string;
    ppa_feedings: string;
    ppa_findings: string;
    ppa_nurses_notes: string;
    created_at: string;
    updated_at: string;
  }[]
}

interface PregnancyGroup {
  pregnancyId: string
  status: "Active" | "Completed" | "Pregnancy Loss"
  startDate: string
  expectedDueDate?: string
  deliveryDate?: string
  records: MaternalRecord[]
  hasPrenatal: boolean
  hasPostpartum: boolean
}

// pregnancy details types for fetching
interface PregnancyDataDetails{
  pregnancy_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  prenatal_end_date?: string;
  postpartum_end_date?: string;
  pat_id: string;
  prenatal_form?: {
    pf_id: string;
    pf_lmp: string;
    pf_edc: string;
    created_at: string;
  }[],
  prenatal_care?: {
    pf_id: string;
    pfpc_aog_wks: number;
    pfpc_aog_days: number;
  }[];
  postpartum_record?: {
    ppr_id:string;
    delivery_date: string | "Unknown";
    created_at: string;
    updated_at: string;
    postpartum_assessment?: {
      ppa_id: string;
      ppa_date: string;
      ppa_lochial_discharges: string;
      ppa_blood_pressure: string;
      ppa_feedings: string;
      ppa_findings: string;
      ppa_nurses_notes: string;
      created_at: string;
      updated_at: string;
    }[]
  }[]
}


export default function MaternalIndivRecords() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isRefetching, setIsRefetching] = useState(false)
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const location = useLocation()

  const { data: pregnancyData, isLoading: pregnancyDataLoading, refetch } = usePregnancyDetails(
    selectedPatient?.pat_id || "", 
    page,
    pageSize,
    selectedFilter === "All" ? "" : selectedFilter,
    debouncedSearchTerm
  )
  const { mutate: completePregnancy } = useAddCompletePregnancy()
  const { mutate: addPregnancyLoss } = useAddPregnancyLoss()

  const totalPages = Math.ceil((pregnancyData?.count || 0) / pageSize);


  // searching, pagination, status filter handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSearch = (search: string) => {
    setSearchTerm(search)
    setPage(1)
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    setPage(1) 
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) 
  }

  const getLatestFollowupVisit = () => {
    let followUpData = [];
    
    if (pregnancyData && typeof pregnancyData === 'object' && 'results' in pregnancyData) {
      const results = (pregnancyData as any).results;
      if (Array.isArray(results) && results.length > 0) {
        followUpData = results[0]?.follow_up || [];
      }
    } else if (Array.isArray(pregnancyData) && pregnancyData.length > 0) {
      followUpData = pregnancyData[0]?.follow_up || [];
    }
    
    return followUpData;
  };

  const latestFollowupVisit = getLatestFollowupVisit();
  const nextFollowVisit = [...latestFollowupVisit]
    .filter(visit => visit.followv_status === 'pending') // Only show pending visits
    .sort((a, b) => new Date(a.followv_date).getTime() - new Date(b.followv_date).getTime())[0];
  console.log('Next Follow-up Visit:', nextFollowVisit);

  useEffect(() => {
    if (location.state?.params?.patientData) {
      const patientData = location.state.params.patientData
      setSelectedPatient(patientData)
    }
  }, [location.state])

  const groupPregnancies = (
  pregnancies: PregnancyDataDetails[],
  patientType: string,
  patientAddress: Patient["address"] | undefined,
): PregnancyGroup[] => {
  const grouped: Record<string, PregnancyGroup> = {}

  if (!pregnancies || !Array.isArray(pregnancies) || pregnancies.length === 0) {
    console.log('No valid pregnancies data:', pregnancies);
    return []
  }

  pregnancies.forEach((pregnancy) => {
    if (!pregnancy || !pregnancy.pregnancy_id) {
      console.warn('Invalid pregnancy object:', pregnancy);
      return;
    }

    if(!grouped[pregnancy.pregnancy_id]) {
      grouped[pregnancy.pregnancy_id] = {
        pregnancyId: pregnancy.pregnancy_id,
        status: normalizeStatus(pregnancy.status),
        startDate: pregnancy.created_at ? pregnancy.created_at.split("T")[0] : "Unknown",
        expectedDueDate: pregnancy.prenatal_form?.[0]?.pf_edc || undefined,
        deliveryDate: pregnancy.postpartum_record?.[0]?.delivery_date || undefined,
        records: [],
        hasPrenatal: false,
        hasPostpartum: false,
      }
    }

    const currPregnancyGroup = grouped[pregnancy.pregnancy_id]

    // Rest of your existing forEach logic...
    pregnancy.prenatal_form?.forEach((pf) => {
      const addressParts = [
        patientAddress?.add_street,
        patientAddress?.add_barangay,
        patientAddress?.add_city,
        patientAddress?.add_province
      ].filter(Boolean);

      const correspondingCare = pregnancy.prenatal_care?.find(care => care.pf_id === pf.pf_id);
      const aogWks = correspondingCare?.pfpc_aog_wks;
      const aogDays = correspondingCare?.pfpc_aog_days;
      const gestationalFormatted = aogWks !== undefined && aogDays !== undefined 
        ? `${aogWks} weeks ${aogDays} days` 
        : undefined;

      currPregnancyGroup.records.push({
        id: pf.pf_id,
        pregnancyId: pregnancy.pregnancy_id,
        dateCreated: pf.created_at ? pf.created_at.split("T")[0] : "Unknown",
        address: addressParts.length > 0 ? addressParts.join(", ") : "Not Provided",
        sitio: patientAddress?.add_external_sitio || patientAddress?.add_sitio || "Not Provided",
        type: patientType as "Transient" | "Resident",
        recordType: "Prenatal",
        status: normalizeStatus(pregnancy.status),
        gestationalWeek: aogWks,
        gestationalFormatted: gestationalFormatted,
        expectedDueDate: pf.pf_edc,
        prenatal_end_date: pregnancy.prenatal_end_date,
        notes: `${pf.created_at ? formatDate(pf.created_at) : "Unknown"}`,
      })
      currPregnancyGroup.hasPrenatal = true
      if(pf.pf_edc && !currPregnancyGroup.expectedDueDate) {
        currPregnancyGroup.expectedDueDate = pf.pf_edc
      }
    })

    pregnancy.postpartum_record?.forEach((ppr) => {
      const addressParts = [
        patientAddress?.add_street,
        patientAddress?.add_barangay,
        patientAddress?.add_city,
        patientAddress?.add_province
      ].filter(Boolean);

      currPregnancyGroup.records.push({
        id: ppr.ppr_id,
        pregnancyId: pregnancy.pregnancy_id,
        dateCreated: ppr.created_at ? ppr.created_at.split("T")[0] : "Unknown",
        address: addressParts.length > 0 ? addressParts.join(", ") : "Not Provided",
        sitio: patientAddress?.add_sitio || "Not Provided",
        type: patientType as "Transient" | "Resident",
        recordType: "Postpartum Care",
        status: normalizeStatus(pregnancy.status),
        deliveryDate: ppr.delivery_date,
        postpartum_end_date: pregnancy.postpartum_end_date,
        notes: `Postpartum care on ${ppr.created_at ? ppr.created_at.split("T")[0] : "Unknown"}`,
        postpartum_assessment: ppr.postpartum_assessment || []
      })
      currPregnancyGroup.hasPostpartum = true
      if (ppr.delivery_date && !currPregnancyGroup.deliveryDate) {
        currPregnancyGroup.deliveryDate = ppr.delivery_date
      }
    })

    currPregnancyGroup.records.sort(
      (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
    )
    
    currPregnancyGroup.records.sort((a, b) => {
      if (a.recordType === "Postpartum Care" && b.recordType === "Prenatal") {
        return -1;
      }
      if (a.recordType === "Prenatal" && b.recordType === "Postpartum Care") {
        return 1;
      }
      return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
    });
  })
  
  return Object.values(grouped).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
}

  const normalizeStatus = (statusRaw: string | undefined): "Active" | "Completed" | "Pregnancy Loss" => {
  if (!statusRaw) return "Pregnancy Loss";
  const s = statusRaw.toLowerCase()
  if (s === "active") return "Active"
  if (s === "completed") return "Completed"
  return "Pregnancy Loss" 
}

// using memo for grouped pregnancies
const pregnancyGroups: PregnancyGroup[] = useMemo(() => {
  if (pregnancyData && selectedPatient) {
    console.log('Raw pregnancyData:', pregnancyData); // debug
    
    let pregnanciesArray: PregnancyDataDetails[] = [];
    
    if (pregnancyData && typeof pregnancyData === 'object' && 'results' in pregnancyData) {
      const results = (pregnancyData as any).results;
      if (Array.isArray(results)) {
        pregnanciesArray = results;
      }
    } else if (Array.isArray(pregnancyData)) {
      pregnanciesArray = pregnancyData;
    } else if (pregnancyData && typeof pregnancyData === 'object') {
      pregnanciesArray = [pregnancyData as PregnancyDataDetails];
    }

    console.log('Processed pregnanciesArray:', pregnanciesArray); // debug

    return groupPregnancies(
      pregnanciesArray,
      selectedPatient.pat_type,
      selectedPatient.address,
    )
  }
  return []
}, [pregnancyData, selectedPatient])

  const filter = [
    { id: "all", name: "All" },
    { id: "active", name: "Active" },
    { id: "completed", name: "Completed" },
    { id: "pregnancy_loss", name: "Pregnancy Loss" },
  ]

  const filteredGroups = pregnancyGroups.filter((group) => {
    switch (selectedFilter) {
      case "All":
        return true
      case "Active":
        return group.status === "Active"
      case "Completed":
        return group.status === "Completed"
      case "Pregnancy Loss":
        return group.status === "Pregnancy Loss"
      default:
        return true
    }
  })


  const getStatusBadge = (status: "Active" | "Completed" | "Pregnancy Loss") => {
    if (status === "Active") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Clock className="w-3 h-3 mr-1" />
          Active
        </Badge>
      )
    } else if (status === "Completed") {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      )
    } else if (status === "Pregnancy Loss") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <HeartHandshake className="w-3 h-3 mr-1" />
          Pregnancy Loss
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        Unknown
      </Badge>
    )
  }


  const getRecordTypeBadge = (recordType: "Prenatal" | "Postpartum Care") => {
    return recordType === "Prenatal" ? (
      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
        <Heart className="w-3 h-3 mr-1" />
        Prenatal
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Baby className="w-3 h-3 mr-1" />
        Postpartum
      </Badge>
    )
  }

  
  const handleCompletePregnancy = (pregnancyId: string) => {
    if(!selectedPatient?.pat_id) return;
    completePregnancy({ pat_id: selectedPatient.pat_id, pregnancy_id: pregnancyId })
    console.log(`Pregnancy ${pregnancyId} marked as completed`)
  }

  const handleCompleteRecord = (recordId: string, recordType: "Prenatal" | "Postpartum Care") => {
    console.log(`Record ${recordId} of type ${recordType} marked as completed`)
  }

  const handlePregnancyLossRecord = (pregnancyId: string) => {
    if(!selectedPatient?.pat_id) return;
    addPregnancyLoss({ pat_id: selectedPatient.pat_id, pregnancy_id: pregnancyId });
    console.log(`Pregnancy ${pregnancyId} marked as pregnancy loss`);
  }

  const handleRefetching = async () => {
    try {
      setIsRefetching(true);
      await refetch();

    } catch (error){
      console.error("Error fetching records")

    } finally {
      setIsRefetching(false);
    }
  }

  if(pregnancyDataLoading) {
    return (
      <LayoutWithBack title="Maternal Records" description="Manage mother's individual maternal records">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading records...</span>
        </div>
      </LayoutWithBack>
    )
  }

  return (
    <LayoutWithBack title="Maternal Records" description="Manage mother's individual maternal records">
      <div className="w-full px-2 sm:px-4 md:px-6 bg-snow">
        {selectedPatient ? (
          <div className="mb-5 gap-1">
            <PatientInfoCard patient={selectedPatient} />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <PregnancyChart pregnancies={pregnancyData?.results || pregnancyData}/>
              <PregnancyVisitTracker pregnancies={pregnancyData?.results || pregnancyData}/>
            </div>
          </div>
        ) : (
          <div className="mb-5 rounded">
            <p className="text-center text-gray-500">No patient selected</p>
          </div>
        )}

        <div className="flex rounded-md w-full border border-blue-400 rounded-mb mb-5 bg-blue-200 shadow-md">
          {nextFollowVisit ? (
            <div className="p-3 flex justify-between items-center w-full text-blue-700">
              <h3 className="flex items-center font-semibold"><ClockAlert className="mr-2"/> Upcoming follow-up visit</h3>
              <p className="text-sm italic"> 
                {nextFollowVisit?.followv_description} on <b>{formatDate(nextFollowVisit?.followv_date)}</b>
              </p>
            </div>
          ) : (
            <div className="p-3">
              <h3 className="font-semibold text-white">No follow-up visit</h3>
            </div>
          )}
        </div>

        <div className="relative w-full hidden lg:flex justify-between items-center mb-4 gap-2">
          {/* Search Input and Filter Dropdown */}
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <div>
              <Button 
                className="hover:bg-gray-100 transition-colors duration-200 ease-in-out" 
                variant="outline" 
                onClick={handleRefetching} 
                disabled={isRefetching || pregnancyDataLoading}
              >
                <RefreshCw className={`${isRefetching ? 'animate-spin' : ''}`} size={20} />
              </Button>
            </div>
            <div className="flex w-full gap-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                <Input placeholder="Search..." className="pl-10 w-full bg-white" onChange={(e) => handleSearch(e.target.value)}/>
              </div>
              <SelectLayout
                className="w-full md:w-[200px] bg-white"
                label="All"
                placeholder="Select Filter"
                options={filter}
                value={selectedFilter}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default">
                  <Plus size={15} /> Add Record
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link 
                    to="/services/maternal/prenatal/form" 
                    state={{ 
                      params : {
                        pregnancyData: selectedPatient, 
                        pregnancyId: pregnancyGroups.find(group => group.status === "Active")?.pregnancyId || null
                      }
                    }}
                  >
                    Prenatal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link 
                    to="/services/maternal/postpartum/form" 
                    state={{ 
                      params : {
                        pregnancyData: selectedPatient, 
                        pregnancyId: pregnancyGroups.find(group => group.status === "Completed" || group.status === "Active")?.pregnancyId || null
                      }
                    }}
                  >
                    Postpartum
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Accordion Container */}
        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0 rounded-t-md">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-14 h-6"
                defaultValue={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
          </div>

          <div className="bg-white w-full">
            {filteredGroups.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No pregnancy records found</p>
              </div>
            ) : (
              <PregnancyAccordion
                pregnancyGroups={filteredGroups}
                selectedPatient={selectedPatient}
                getStatusBadge={getStatusBadge}
                getRecordTypeBadge={getRecordTypeBadge}
                onCompletePregnancy={handleCompletePregnancy}
                onCompleteRecord={handleCompleteRecord}
                onPregnancyLossRecord={handlePregnancyLossRecord}
              />
            )}
          </div>
        </div>
        <div className="bg-white flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 border-t">
          {/* Showing Rows Info */}
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, pregnancyData?.count) || 0} of {pregnancyData?.count} rows
          </p>

          {/* Pagination */}
          <div className="w-full sm:w-auto flex justify-center">
            {totalPages > 0 && (
              <PaginationLayout
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </LayoutWithBack>
  )
}