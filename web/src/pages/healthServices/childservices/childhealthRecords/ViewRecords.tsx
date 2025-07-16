"use client";

import { useMemo, useState, useEffect } from "react";
import React from "react";
import { Card, CardContent } from "@/components/ui/card/card";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  User,
  Users,
  AlertTriangle,
  HeartPulse,
  Soup,
  Syringe,
  Pill,
} from "lucide-react";
import { format, isSameDay, parseISO, isValid } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api2 } from "@/api/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";

interface PersonalInfo {
  per_id?: number;
  per_lname: string;
  per_fname: string;
  per_mname: string | null;
  per_suffix: string | null;
  per_dob: string;
  per_sex: string;
  per_status: string;
  per_edAttainment: string;
  per_religion: string;
  per_contact: string;
}

interface RPInfo {
  rp_id: string;
  per: PersonalInfo;
  rp_date_registered: string;
  staff: string;
}

interface FamilyHead {
  role: string;
  personal_info: PersonalInfo;
  rp_id?: string;
  composition_id?: number;
}

interface FamilyHeads {
  mother?: FamilyHead;
  father?: FamilyHead;
}

interface FamilyHeadInfo {
  fam_id: string | null;
  family_heads: FamilyHeads;
  has_mother: boolean;
  has_father: boolean;
  total_heads: number;
}

interface SpouseInfo {
  spouse_exists: boolean;
  allow_spouse_insertion?: boolean;
  reason?: string;
  spouse_id?: number;
  spouse_type?: string;
  spouse_lname?: string;
  spouse_fname?: string;
  spouse_mname?: string;
  spouse_occupation?: string;
  spouse_dob?: string;
  created_at?: string;
}

interface Address {
  add_street: string;
  add_barangay: string;
  add_city: string;
  add_province: string;
  add_sitio: string;
  full_address: string;
}

interface PatDetails {
  pat_id: string;
  personal_info: PersonalInfo;
  address: Address;
  rp_id: RPInfo | null;
  family_compositions: any[];
  households: any[];
  family: { fam_id: string; fc_role: string; fc_id: number } | null;
  family_head_info: FamilyHeadInfo;
  spouse_info: SpouseInfo;
  pat_type: string;
  pat_status: string;
  created_at: string;
  updated_at: string;
  trans_id: string | null;
}

interface PatRecDetails {
  patrec_id: number;
  pat_details: PatDetails;
  patrec_type: string;
  created_at: string;
  pat_id: string;
}

interface StaffDetails {
  staff_id: string;
  staff_assign_date: string;
  staff_type: string;
  rp: {
    rp_id: string;
    per: PersonalInfo;
    rp_date_registered: string;
    staff: string;
  };
  pos: {
    pos_id: number;
    pos_title: string;
    pos_max: number;
    pos_group: string;
    staff: string;
  };
  manager: string;
}

interface CHRecDetails {
  chrec_id: number;
  staff_details: StaffDetails;
  patrec_details: PatRecDetails;
  chr_date: string;
  ufc_no: string;
  family_no: string;
  mother_occupation: string;
  father_occupation: string;
  updated_at: string;
  type_of_feeding: string;
  place_of_delivery_type: string;
  birth_order: string;
  pod_location: string;
  staff: string;
  patrec: number;
}

interface DisabilityDetails {
  disability_id: number;
  disability_name: string;
  created_at: string;
}

interface Disability {
  pd_id: number;
  disability_details: DisabilityDetails;
  created_at: string;
  patrec: number;
  disability: number;
}

interface FollowVDetails {
  followv_id: number;
  followv_date: string;
  followv_status: string;
  followv_description: string;
  created_at: string;
  updated_at: string;
  patrec: number;
}

interface CHNotes {
  chnotes_id: number;
  chhist_details: any;
  followv_details: FollowVDetails | null;
  staff_details: StaffDetails;
  chn_notes: string;
  created_at: string;
  updated_at: string;
  chhist: number;
  followv: number | null;
  staff: string;
}

interface BMDetails {
  bm_id: number;
  age: string;
  height: string;
  weight: string;
  created_at: string;
  patrec: number;
  staff: string;
}

interface CHVitalSigns {
  chvital_id: number;
  find_details: any;
  bm_details: BMDetails;
  chhist_details: any;
  temp: string;
  created_at: string;
  bm: number;
  find: any;
  chhist: number;
}

interface MedDetail {
  med_id: string;
  catlist: string;
  med_name: string;
  med_type: string;
  created_at: string;
  updated_at: string;
  cat: number;
}

interface MinvDetail {
  minv_id: number;
  inv_detail: any;
  med_detail: MedDetail;
  inv_id: string;
  med_id: string;
  minv_dsg: number;
  minv_dsg_unit: string;
  minv_form: string;
  minv_qty: number;
  minv_qty_unit: string;
  minv_pcs: number;
  minv_qty_avail: number;
}

interface MedRecDetail {
  medrec_id: number;
  minv_details: MinvDetail;
  medrec_qty: number;
  reason: string | null;
  requested_at: string;
  fulfilled_at: string;
  signature: string | null;
  patrec_id: number;
  minv_id: number;
  medreq_id: number | null;
  staff: string | null;
}

interface CHSupplement {
  chsupplement_id: number;
  medrec_details: MedRecDetail;
  chhist: number;
  medrec: number;
}

interface EBFCheck {
  ebf_id: number;
  chhist_details: any;
  ebf_date: string;
  chhist: number;
}

interface CHSSupplementStat {
  chssupplementstat_id: number;
  chsupp_details: any;
  birthwt: string | null;
  status_type: string;
  date_seen: string;
  date_given_iron: string;
  created_at: string;
  updated_at: string;
  chsupplement: number;
  date_completed?: string | null;
}

interface NutritionStatus {
  nutstat_id: number;
  chvital_details: any;
  wfa: string;
  lhfa: string;
  wfl: string;
  muac: string;
  created_at: string;
  chvital: number;
}

interface ChildHealthHistoryRecord {
  chhist_id: number;
  disabilities: Disability[];
  created_at: string;
  tt_status: string;
  status: string;
  chrec: number;
  chrec_details: CHRecDetails;
  child_health_notes: CHNotes[];
  child_health_vital_signs: CHVitalSigns[];
  child_health_supplements: CHSupplement[];
  exclusive_bf_checks: EBFCheck[];
  immunization_tracking: any[];
  supplements_statuses: CHSSupplementStat[];
  nutrition_statuses: NutritionStatus[];
}

interface FieldConfig {
  label: string;
  path: string[];
  format?: (
    value: any,
    record?: ChildHealthHistoryRecord
  ) => string | JSX.Element[] | string[];
}

export default function ChildHealthHistoryDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patId, chrecId, chhistId } = location.state?.params || {};

  const [fullHistoryData, setFullHistoryData] = useState<
    ChildHealthHistoryRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(2);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const historyResponse = await api2.get(
          `/child-health/history/${chrecId}/`
        );
        const sortedHistory = (
          historyResponse.data[0]?.child_health_histories || []
        ).sort(
          (a: ChildHealthHistoryRecord, b: ChildHealthHistoryRecord) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setFullHistoryData(sortedHistory);
        // Set initial index to the selected record
        const initialIndex: number = sortedHistory.findIndex(
          (record: ChildHealthHistoryRecord) => record.chhist_id === chhistId
        );
        setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
      } catch (error) {
        console.error("Error fetching child health history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (patId) {
      fetchAllData();
    }
  }, [patId, chrecId, chhistId]);

  const recordsToDisplay = useMemo(() => {
    if (fullHistoryData.length === 0) return [];
    return fullHistoryData.slice(currentIndex, currentIndex + recordsPerPage);
  }, [fullHistoryData, currentIndex, recordsPerPage]);

  const handleSwipeLeft = () => {
    if (currentIndex < fullHistoryData.length - recordsPerPage) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRecordsPerPageChange = (value: string) => {
    const newRecordsPerPage = parseInt(value);
    setRecordsPerPage(newRecordsPerPage);
    // Adjust currentIndex if necessary to prevent empty display
    if (currentIndex > fullHistoryData.length - newRecordsPerPage) {
      setCurrentIndex(Math.max(0, fullHistoryData.length - newRecordsPerPage));
    }
  };

  const getValueByPath = (obj: any, path: string[]): any => {
    return path.reduce((acc, part) => {
      if (acc === undefined || acc === null) return undefined;
      if (Array.isArray(acc) && !isNaN(Number(part))) {
        return acc[Number(part)];
      }
      return acc[part];
    }, obj);
  };

  const getDiffClass = (
    currentColumnValue: any,
    previousRecordValue: any,
    isCurrentRecord: boolean
  ): string => {
    const normalizeValue = (val: any) =>
      val === null || val === undefined || val === "" ? null : val;
    const normalizedCurrent = normalizeValue(currentColumnValue);
    const normalizedPrevious = normalizeValue(previousRecordValue);

    if (!isCurrentRecord || normalizedPrevious === undefined) {
      return "";
    }

    if (normalizedCurrent === null && normalizedPrevious === null) {
      return "";
    }

    if (
      typeof normalizedCurrent === "string" &&
      typeof normalizedPrevious === "string" &&
      (normalizedCurrent.match(/^\d{4}-\d{2}-\d{2}/) ||
        normalizedCurrent.match(/^\d{4}-\d{2}-\d{2}T/)) &&
      (normalizedPrevious.match(/^\d{4}-\d{2}-\d{2}/) ||
        normalizedPrevious.match(/^\d{4}-\d{2}-\d{2}T/))
    ) {
      const currentDate = parseISO(normalizedCurrent);
      const previousDate = parseISO(normalizedPrevious);
      return isValid(currentDate) &&
        isValid(previousDate) &&
        !isSameDay(currentDate, previousDate)
        ? "text-red-500 font-semibold"
        : "";
    }

    if (Array.isArray(normalizedCurrent) && Array.isArray(normalizedPrevious)) {
      return JSON.stringify(normalizedCurrent) !==
        JSON.stringify(normalizedPrevious)
        ? "text-red-500 font-semibold"
        : "";
    }

    return normalizedCurrent !== normalizedPrevious
      ? "text-red-500 font-semibold"
      : "";
  };

  const formatSupplement = (supplement: CHSupplement): string => {
    const medDetails = supplement.medrec_details?.minv_details;
    if (!medDetails) return "N/A";
    const name = medDetails.med_detail?.med_name || "Unknown Medicine";
    const dosage = medDetails.minv_dsg
      ? `${medDetails.minv_dsg}${medDetails.minv_dsg_unit || ""}`
      : "N/A";
    const form = medDetails.minv_form || "N/A";
    const qty = supplement.medrec_details?.medrec_qty || "N/A";
    return `${name} - Dosage: ${dosage} - Form: ${form} - Qty: ${qty}`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full p-6">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  const recordOverviewFields: FieldConfig[] = [
    { label: "Record ID", path: ["chhist_id"] },
    {
      label: "Created At",
      path: ["created_at"],
      format: (val) =>
        val && isValid(new Date(val)) ? format(new Date(val), "PPP p") : "N/A",
    },
    { label: "TT Status", path: ["tt_status"] },
    { label: "Status", path: ["status"] },
  ];

  const childPersonalInfoFields: FieldConfig[] = [
    {
      label: "Patient ID",
      path: ["chrec_details", "patrec_details", "pat_details", "pat_id"],
    },
    {
      label: "Last Name",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "personal_info",
        "per_lname",
      ],
    },
    {
      label: "First Name",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "personal_info",
        "per_fname",
      ],
    },
    {
      label: "Middle Name",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "personal_info",
        "per_mname",
      ],
    },
    {
      label: "Date of Birth",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "personal_info",
        "per_dob",
      ],
      format: (val) =>
        val && isValid(new Date(val)) ? format(new Date(val), "PPP") : "N/A",
    },
    {
      label: "Sex",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "personal_info",
        "per_sex",
      ],
    },
    {
      label: "Contact",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "personal_info",
        "per_contact",
      ],
    },
  ];

  const familyHeadInfoFields: FieldConfig[] = [
    {
      label: "Mother's Name",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "family_head_info",
        "family_heads",
        "mother",
        "personal_info",
      ],
      format: (val) => (val ? `${val.per_fname} ${val.per_lname}` : "N/A"),
    },
    {
      label: "Mother's Contact",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "family_head_info",
        "family_heads",
        "mother",
        "personal_info",
        "per_contact",
      ],
    },
    {
      label: "Father's Name",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "family_head_info",
        "family_heads",
        "father",
        "personal_info",
      ],
      format: (val) => (val ? `${val.per_fname} ${val.per_lname}` : "N/A"),
    },
    {
      label: "Father's Contact",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "family_head_info",
        "family_heads",
        "father",
        "personal_info",
        "per_contact",
      ],
    },
    { label: "Family No.", path: ["chrec_details", "family_no"] },
    {
      label: "Mother's Occupation",
      path: ["chrec_details", "mother_occupation"],
    },
    {
      label: "Father's Occupation",
      path: ["chrec_details", "father_occupation"],
    },
  ];

  const disabilitiesFields: FieldConfig[] = [
    {
      label: "Disabilities",
      path: ["disabilities"],
      format: (val) =>
        val && val.length > 0
          ? val
              .map(
                (d: Disability) =>
                  d.disability_details?.disability_name || "Unknown"
              )
              .join(", ")
          : "No disabilities recorded",
    },
  ];

  const vitalSignsFields: FieldConfig[] = [
    {
      label: "Age",
      path: ["child_health_vital_signs", "0", "bm_details", "age"],
    },
    {
      label: "Weight (kg)",
      path: ["child_health_vital_signs", "0", "bm_details", "weight"],
    },
    {
      label: "Height (cm)",
      path: ["child_health_vital_signs", "0", "bm_details", "height"],
    },
    {
      label: "Temperature (°C)",
      path: ["child_health_vital_signs", "0", "temp"],
    },
  ];

  const nutritionStatusesFields: FieldConfig[] = [
    { label: "Weight-for-Age (WFA)", path: ["nutrition_statuses", "0", "wfa"] },
    {
      label: "Length/Height-for-Age (LHFA)",
      path: ["nutrition_statuses", "0", "lhfa"],
    },
    {
      label: "Weight-for-Length (WFL)",
      path: ["nutrition_statuses", "0", "wfl"],
    },
    { label: "MUAC", path: ["nutrition_statuses", "0", "muac"] },
  ];

  const notesFields: FieldConfig[] = [
    {
      label: "Notes",
      path: ["child_health_notes"],
      format: (val) =>
        val && val.length > 0
          ? val.map((note: CHNotes) => note.chn_notes || "N/A").join(" | ")
          : "No notes recorded",
    },
  ];

  const supplementsFields: FieldConfig[] = [
    {
      label: "Supplements",
      path: ["child_health_supplements"],
      format: (val) =>
        val && val.length > 0
          ? val.map(formatSupplement).join(" | ")
          : "No supplements recorded",
    },
  ];

  const exclusiveBfCheckFields: FieldConfig[] = [
    {
      label: "EBF Check Dates",
      path: ["exclusive_bf_checks"],
      format: (val) =>
        val && val.length > 0
          ? val.map((ebf: EBFCheck) => ({
              date:
                ebf.ebf_date && isValid(new Date(ebf.ebf_date))
                  ? format(new Date(ebf.ebf_date), "PPP")
                  : "N/A",
              id: ebf.ebf_id,
            }))
          : [],
    },
  ];

  const immunizationTrackingFields: FieldConfig[] = [
    {
      label: "Immunizations",
      path: ["immunization_tracking"],
      format: (val) =>
        val && val.length > 0
          ? val.map((imm: any) => imm.name || JSON.stringify(imm)).join(", ")
          : "No immunization records",
    },
  ];
  const supplementStatusesFields: FieldConfig[] = [
    {
      label: "Supplement Statuses",
      path: ["supplements_statuses"],
      format: (val, record) => {
        if (!record)
          return [<span key="no-status">No supplement statuses recorded</span>];

        // Get statuses directly associated with this record
        const directStatuses = val && val.length > 0 ? val : [];

        // Find statuses from other records where updated_at matches this record's created_at and date_completed is not null
        const matchingStatuses: CHSSupplementStat[] = [];
        fullHistoryData.forEach((otherRecord) => {
          if (otherRecord.chhist_id !== record.chhist_id) {
            otherRecord.supplements_statuses.forEach((status) => {
              if (
                status.updated_at &&
                record.created_at &&
                isValid(new Date(status.updated_at)) &&
                isValid(new Date(record.created_at)) &&
                isSameDay(
                  new Date(status.updated_at),
                  new Date(record.created_at)
                ) &&
                status.date_completed && // Only include statuses with a valid date_completed
                isValid(new Date(status.date_completed))
              ) {
                matchingStatuses.push(status);
              }
            });
          }
        });

        const allStatuses = [...directStatuses, ...matchingStatuses];

        if (allStatuses.length === 0)
          return [<span key="no-status">No supplement statuses recorded</span>];

        return allStatuses.map((status: CHSSupplementStat, index: number) => {
          const statusUpdatedAt =
            status?.updated_at && isValid(new Date(status.updated_at))
              ? format(new Date(status.updated_at), "PPP")
              : "N/A";
          const dateCompleted =
            status?.date_completed && isValid(new Date(status.date_completed))
              ? format(new Date(status.date_completed), "PPP")
              : "N/A";
          const isMatchingStatus = matchingStatuses.includes(status);

          // Check if updated_at matches created_at
          const showCompletedDate =
            status.updated_at &&
            record.created_at &&
            isSameDay(new Date(status.updated_at), new Date(record.created_at));

          // Check if status contains keywords
          const hasBirthwt =
            status?.status_type?.toLowerCase().includes("birthwt") ||
            status?.status_type?.toLowerCase().includes("birth weight");
          const hasAnemic = status?.status_type
            ?.toLowerCase()
            .includes("anemic");

          return (
            <div className="flex justify-center">
              <div
                key={`${status.chssupplementstat_id}-${index}`}
                className={isMatchingStatus ? "text-red-500 font-semibold" : ""}
              >
                <div className="font-medium text-left">
                  {status?.status_type || "N/A"}
                </div>
                {hasBirthwt && (
                  <div className="ml-4 text-left">
                    - Birth Weight: {status?.birthwt || "N/A"}
                  </div>
                )}

                <div className="ml-4 text-left">
                  - Seen:{" "}
                  {status?.date_seen && isValid(new Date(status.date_seen))
                    ? format(new Date(status.date_seen), "PPP")
                    : "N/A"}
                </div>
                <div className="ml-4 text-left">
                  - Given Iron:{" "}
                  {status?.date_given_iron &&
                  isValid(new Date(status.date_given_iron))
                    ? format(new Date(status.date_given_iron), "PPP")
                    : "N/A"}
                </div>
                {showCompletedDate && (
                  <div className="ml-4 text-left">
                    - Completed: {dateCompleted}
                  </div>
                )}
              </div>
            </div>
          );
        });
      },
    },
  ];
  const renderSectionContent = (fields: FieldConfig[]) => (
    <div
      className="grid gap-4 items-start w-full"
      style={{
        gridTemplateColumns: `minmax(150px, 1fr) repeat(${recordsToDisplay.length}, minmax(180px, 1fr))`,
      }}
    >
      <div className="font-bold text-gray-700 sticky left-0 bg-white py-2 border-gray-100"></div>
      {recordsToDisplay.map((record, idx) => {
        const isCurrentRecord = record.chhist_id === chhistId;
        return (
          <div
            key={record.chhist_id}
            className="font-bold text-center text-gray-700 py-2 border-gray-100"
          >
            {isCurrentRecord ? "Current Record" : "Previous Record"}
            <br />
            <span className="text-sm font-normal text-gray-500">
              {format(new Date(record.created_at), "MMM dd, yyyy")}
            </span>
          </div>
        );
      })}
      {fields.map((field, fieldIdx) => (
        <React.Fragment key={fieldIdx}>
          <div className="font-medium text-gray-700 py-2 border-t border-gray-100 sticky left-0 bg-white ">
            {field.label}
          </div>
          {recordsToDisplay.map((recordInColumn, recordInColumnIdx) => {
            const valueInCurrentColumn = getValueByPath(
              recordInColumn,
              field.path
            );
            const valueInPreviousRecord = recordsToDisplay[1]
              ? getValueByPath(recordsToDisplay[1], field.path)
              : undefined;
            const displayValue = field.format
              ? field.format(valueInCurrentColumn, recordInColumn)
              : valueInCurrentColumn !== undefined &&
                valueInCurrentColumn !== null &&
                valueInCurrentColumn !== ""
              ? typeof valueInCurrentColumn === "string" &&
                valueInCurrentColumn.match(/^\d{4}-\d{2}-\d{2}/)
                ? isValid(new Date(valueInCurrentColumn))
                  ? format(new Date(valueInCurrentColumn), "PPP")
                  : "N/A"
                : Array.isArray(valueInCurrentColumn)
                ? valueInCurrentColumn.length > 0
                  ? valueInCurrentColumn
                      .map(
                        (item: any) =>
                          item.name ||
                          item.disability_details?.disability_name ||
                          JSON.stringify(item)
                      )
                      .join(", ")
                  : "N/A"
                : valueInCurrentColumn
              : "N/A";

            const isCurrentRecord = recordInColumnIdx === 0;

            return (
              <div
                key={recordInColumnIdx}
                className="text-center py-2 border-t border-gray-100 break-words"
              >
                <span
                  className={getDiffClass(
                    valueInCurrentColumn,
                    valueInPreviousRecord,
                    isCurrentRecord
                  )}
                >
                  {displayValue}
                </span>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );

  const renderEBFContent = () => (
    <div
      className="grid gap-4 items-start w-full"
      style={{
        gridTemplateColumns: `minmax(150px, 1fr) repeat(${recordsToDisplay.length}, minmax(180px, 1fr))`,
      }}
    >
      <div className="font-bold text-gray-700  left-0 bg-white  py-2 border-gray-100"></div>
      {recordsToDisplay.map((record, idx) => {
        const isCurrentRecord = record.chhist_id === chhistId;
        return (
          <div
            key={record.chhist_id}
            className="font-bold text-center text-gray-700 py-2 border-gray-100"
          >
            {isCurrentRecord ? "Current Record" : "Previous Record"}
            <br />
            <span className="text-sm font-normal text-gray-500">
              {format(new Date(record.created_at), "MMM dd, yyyy")}
            </span>
          </div>
        );
      })}
      {exclusiveBfCheckFields.map((field, fieldIdx) => (
        <React.Fragment key={fieldIdx}>
          <div className="font-medium text-gray-700 py-2 border-t border-gray-100 sticky left-0 bg-white ">
            {field.label}
          </div>
          {recordsToDisplay.map((recordInColumn, recordInColumnIdx) => {
            const valueInCurrentColumn = getValueByPath(
              recordInColumn,
              field.path
            );
            const displayValue = field.format
              ? field.format(valueInCurrentColumn)
              : valueInCurrentColumn;
            const isCurrentRecord = recordInColumnIdx === 0;

            return (
              <div
                key={recordInColumnIdx}
                className="text-center py-2 border-t border-gray-100"
              >
                {displayValue.length > 0 ? (
                  <div className="space-y-1">
                    {displayValue.map((ebf: { id: number; date: string }) => {
                      const shouldHighlight =
                        isCurrentRecord &&
                        !recordsToDisplay[1]?.exclusive_bf_checks?.some(
                          (prevEbf: EBFCheck) =>
                            prevEbf.ebf_date &&
                            ebf.date &&
                            isSameDay(
                              new Date(prevEbf.ebf_date),
                              new Date(ebf.date)
                            )
                        );

                      return (
                        <div
                          key={ebf.id}
                          className={
                            shouldHighlight ? "text-red-500 font-semibold" : ""
                          }
                        >
                          {ebf.date}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-gray-400">No EBF checks recorded</span>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );

  // First, find the index of the current record in the full history data
  const currentRecordIndex = fullHistoryData.findIndex(
    (record) => record.chhist_id === chhistId
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-center relative">
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
            View and compare child's health history
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />



      <div className="bg-white p-6 mb-8 border rounded-lg shadow-sm">
  <div className="flex justify-between items-start mb-4">
    <h2 className="text-xl font-semibold text-darkBlue2">CHILD HEALTH RECORD</h2>
    <div>
      <p><strong>FAMILY NO.:</strong> {getValueByPath(recordsToDisplay[0], ['chrec_details', 'family_no']) || 'N/A'}</p>
    </div>
  </div>
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div>
      <p><strong>NAME OF BIRTH:</strong> {getValueByPath(recordsToDisplay[0], ['chrec_details', 'patrec_details', 'pat_details', 'personal_info', 'per_fname']) || 'N/A'} {getValueByPath(recordsToDisplay[0], ['chrec_details', 'patrec_details', 'pat_details', 'personal_info', 'per_lname']) || ''}</p>
      <p><strong>DATE OF BIRTH:</strong> {getValueByPath(recordsToDisplay[0], ['chrec_details', 'patrec_details', 'pat_details', 'personal_info', 'per_dob']) && isValid(new Date(getValueByPath(recordsToDisplay[0], ['chrec_details', 'patrec_details', 'pat_details', 'personal_info', 'per_dob']))) ? format(new Date(getValueByPath(recordsToDisplay[0], ['chrec_details', 'patrec_details', 'pat_details', 'personal_info', 'per_dob'])), 'PPP') : 'N/A'}</p>
      <p><strong>PLACE OF DELIVERY:</strong> {getValueByPath(recordsToDisplay[0], ['chrec_details', 'place_of_delivery_type']) || 'N/A'}</p>
    </div>
    <div>
      <p><strong>MOTHER:</strong> {getValueByPath(recordsToDisplay[0], ['chrec_details', 'patrec_details', 'pat_details', 'family_head_info', 'family_heads', 'mother', 'personal_info']) ? `${getValueByPath(recordsToDisplay[0], ['chrec_details', 'patrec_details', 'pat_details', 'family_head_info', 'family_heads', 'mother', 'personal_info', 'per_fname']) || ''} ${getValueByPath(recordsToDisplay[0], ['chrec_details', 'patrec_details', 'pat_details', 'family_head_info', 'family_heads', 'mother', 'personal_info', 'per_lname']) || ''}` : 'N/A'}</p>
      <p><strong>FATHER:</strong> {getValueByPath(recordsToDisplay[0], ['chrec_details', 'patrec_details', 'pat_details', 'family_head_info', 'family_heads', 'father', 'personal_info']) ? `${getValueByPath(recordsToDisplay[0], ['chrec_details', 'patrec_details', 'pat_details', 'family_head_info', 'family_heads', 'father', 'personal_info', 'per_fname']) || ''} ${getValueByPath(recordsToDisplay[0], ['chrec_details', 'patrec_details', 'pat_details', 'family_head_info', 'family_heads', 'father', 'personal_info', 'per_lname']) || ''}` : 'N/A'}</p>
      <p><strong>OCCUPATION:</strong> {getValueByPath(recordsToDisplay[0], ['chrec_details', 'mother_occupation']) || 'N/A'} / {getValueByPath(recordsToDisplay[0], ['chrec_details', 'father_occupation']) || 'N/A'}</p>
    </div>
  </div>
  <div className="mb-4">
    <p><strong>TYPE OF FEEDING:</strong> {getValueByPath(recordsToDisplay[0], ['chrec_details', 'type_of_feeding']) || 'N/A'}</p>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">DATE</th>
          <th className="border p-2">AGE</th>
          <th className="border p-2">WT</th>
          <th className="border p-2">TEMP</th>
          <th className="border p-2">HT</th>
          <th className="border p-2">FINDINGS</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border p-2">{getValueByPath(recordsToDisplay[0], ['created_at']) && isValid(new Date(getValueByPath(recordsToDisplay[0], ['created_at']))) ? format(new Date(getValueByPath(recordsToDisplay[0], ['created_at'])), 'PPP') : 'N/A'}</td>
          <td className="border p-2">{getValueByPath(recordsToDisplay[0], ['child_health_vital_signs', '0', 'bm_details', 'age']) || 'N/A'}</td>
          <td className="border p-2">{getValueByPath(recordsToDisplay[0], ['child_health_vital_signs', '0', 'bm_details', 'weight']) || 'N/A'}</td>
          <td className="border p-2">{getValueByPath(recordsToDisplay[0], ['child_health_vital_signs', '0', 'temp']) || 'N/A'}</td>
          <td className="border p-2">{getValueByPath(recordsToDisplay[0], ['child_health_vital_signs', '0', 'bm_details', 'height']) || 'N/A'}</td>
          <td className="border p-2">{getValueByPath(recordsToDisplay[0], ['child_health_notes', '0', 'chn_notes']) || 'N/A'}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
      {recordsToDisplay.length === 0 ? (
        <div className="p-6 text-center text-gray-600">
          <p>No health history found for this child.</p>
        </div>
      ) : (
        <div className="bg-white py-10 ">
          <div className="flex justify-center items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwipeRight}
              disabled={currentIndex === 0}
              className="bg-white shadow-lg text-black hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
              {" "}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-700">Records per page:</span>
                <Select
                  value={recordsPerPage.toString()}
                  onValueChange={handleRecordsPerPageChange}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwipeLeft}
              disabled={currentIndex >= fullHistoryData.length - recordsPerPage}
              className="bg-white shadow-lg text-black hover:bg-gray-100"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          <div className="container mx-auto max-w-6xl px-10">
            <Accordion
              type="multiple"
              className="w-full space-y-4"
              defaultValue={["record-overview", "child-details"]}
            >
              <AccordionItem
                value="record-overview"
                className="border rounded-lg shadow-sm bg-white"
              >
                <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center">
                    <ClipboardList className="h-5 w-5 mr-3 text-gray-600" />
                    Record Overview
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="mb-0 border-t rounded-t-none shadow-none">
                    <CardContent className="overflow-x-auto p-6">
                      {renderSectionContent(recordOverviewFields)}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="child-details"
                className="border rounded-lg shadow-sm bg-white"
              >
                <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3 text-gray-600" />
                    Child Details
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="mb-0 border-t rounded-t-none shadow-none">
                    <CardContent className="overflow-x-auto p-6">
                      {renderSectionContent(childPersonalInfoFields)}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="parent-newborn"
                className="border rounded-lg shadow-sm bg-white"
              >
                <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-gray-600" />
                    Parent & Newborn Screening
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="mb-0 border-t rounded-t-none shadow-none">
                    <CardContent className="overflow-x-auto p-6">
                      {renderSectionContent(familyHeadInfoFields)}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="exclusive-bf-checks"
                className="border rounded-lg shadow-sm bg-white"
              >
                <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center">
                    <HeartPulse className="h-5 w-5 mr-3 text-gray-600" />
                    Exclusive Breastfeeding Checks
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="mb-0 border-t rounded-t-none shadow-none">
                    <CardContent className="overflow-x-auto p-6">
                      {renderEBFContent()}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="disabilities"
                className="border rounded-lg shadow-sm bg-white"
              >
                <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-3 text-gray-600" />
                    Disabilities
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="mb-0 border-t rounded-t-none shadow-none">
                    <CardContent className="overflow-x-auto p-6">
                      {renderSectionContent(disabilitiesFields)}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="vital-signs-notes"
                className="border rounded-lg shadow-sm bg-white"
              >
                <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center">
                    <HeartPulse className="h-5 w-5 mr-3 text-gray-600" />
                    Vital Signs & Notes
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="mb-0 border-t rounded-t-none shadow-none">
                    <CardContent className="overflow-x-auto p-6">
                      {renderSectionContent([
                        ...vitalSignsFields,
                        ...notesFields,
                      ])}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="nutritional-status"
                className="border rounded-lg shadow-sm bg-white"
              >
                <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center">
                    <Soup className="h-5 w-5 mr-3 text-gray-600" />
                    Nutritional Status
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="mb-0 border-t rounded-t-none shadow-none">
                    <CardContent className="overflow-x-auto p-6">
                      {renderSectionContent(nutritionStatusesFields)}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="immunization"
                className="border rounded-lg shadow-sm bg-white"
              >
                <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center">
                    <Syringe className="h-5 w-5 mr-3 text-gray-600" />
                    Immunization
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="mb-0 border-t rounded-t-none shadow-none">
                    <CardContent className="overflow-x-auto p-6">
                      {renderSectionContent(immunizationTrackingFields)}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="supplements-status"
                className="border rounded-lg shadow-sm bg-white"
              >
                <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center">
                    <Pill className="h-5 w-5 mr-3 text-gray-600" />
                    Supplements & Supplement Status
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="mb-0 border-t rounded-t-none shadow-none">
                    <CardContent className="overflow-x-auto p-6">
                      {renderSectionContent([
                        ...supplementsFields,
                        ...supplementStatusesFields,
                      ])}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      )}
    </>
  );
}
