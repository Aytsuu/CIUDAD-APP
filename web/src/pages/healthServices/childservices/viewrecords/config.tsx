import { format, isValid, isSameDay } from "date-fns";
import {
  Disability,
  CHNotes,
  CHSupplement,
  EBFCheck,
  CHSSupplementStat,
  ChildHealthHistoryRecord,
  FieldConfig,
} from "./types";

export const recordOverviewFields: FieldConfig[] = [
  { label: "Record ID", path: ["chhist_id"] },
  {
    label: "Created At",
    path: ["created_at"],
    format: (val: string) =>
      val && isValid(new Date(val)) ? format(new Date(val), "PPP p") : "N/A",
  },
  { label: "TT Status", path: ["tt_status"] },
  { label: "Status", path: ["status"] },
];

export const childPersonalInfoFields: FieldConfig[] = [
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
    format: (val: string) =>
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

export const familyHeadInfoFields: FieldConfig[] = [
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
    format: (val: any) => (val ? `${val.per_fname} ${val.per_lname}` : "N/A"),
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
    format: (val: any) => (val ? `${val.per_fname} ${val.per_lname}` : "N/A"),
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

export const disabilitiesFields: FieldConfig[] = [
  {
    label: "Disabilities",
    path: ["disabilities"],
    format: (val: Disability[]) =>
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

export const vitalSignsFields: FieldConfig[] = [
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

export const nutritionStatusesFields: FieldConfig[] = [
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

export const notesFields: FieldConfig[] = [
  {
    label: "Notes",
    path: ["child_health_notes"],
    format: (val: CHNotes[]) =>
      val && val.length > 0
        ? val.map((note: CHNotes) => note.chn_notes || "N/A").join(" | ")
        : "No notes recorded",
  },
];

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

export const supplementsFields: FieldConfig[] = [
  {
    label: "Supplements",
    path: ["child_health_supplements"],
    format: (val) =>
      val && val.length > 0
        ? val.map(formatSupplement).join(" | ")
        : "No supplements recorded",
  },
];
export const exclusiveBfCheckFields: FieldConfig[] = [
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

export const immunizationTrackingFields: FieldConfig[] = [
  {
    label: "Immunizations",
    path: ["immunization_tracking"],
    format: (val: any[]) => {
      if (!val || val.length === 0) return "No immunization records";
      
      return val.map(imt => {
        const vacrec = imt.vacrec_details;
        if (!vacrec || !vacrec.vaccination_histories || vacrec.vaccination_histories.length === 0) {
          return "No vaccination details";
        }

        // Get the first vaccination history (assuming there's at least one)
        const vachist = vacrec.vaccination_histories[0];
        const vaccine = vachist.vaccine_stock?.vaccinelist;
        
        const doseNumber = vachist.vachist_doseNo;
        const doseSuffix =
          doseNumber === 1
            ? "1st dose"
            : doseNumber === 2
            ? "2nd dose"
            : doseNumber === 3
            ? "3rd dose"
            : `${doseNumber}th dose`;

        const details = [
          `Vaccine: ${vaccine?.vac_name || "Unknown"}`,
          `Dose: ${doseSuffix}/${vacrec.vacrec_totaldose}`,
          `Status: ${vachist.vachist_status}`,
          // `Date: ${new Date(vachist.created_at).toLocaleDateString()}`,
          // `Age at vaccination: ${vachist.vachist_age}`,
          `Next follow-up: ${
            vachist.follow_up_visit
              ? new Date(vachist.follow_up_visit.followv_date).toLocaleDateString()
              : "None"
          }`,
        ]
          .filter(Boolean)
          .join(" | ");

        return details;
      }).join('\n'); // Separate multiple immunizations with new lines
    }
  }
];

export const getSupplementStatusesFields = (
  fullHistoryData: ChildHealthHistoryRecord[]
): FieldConfig[] => [
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
        const hasAnemic = status?.status_type?.toLowerCase().includes("anemic");

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
