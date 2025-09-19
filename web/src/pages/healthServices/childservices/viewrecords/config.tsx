import { format, isValid, isSameDay } from "date-fns";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator"; // Import the helper

export const recordOverviewFields: any[] = [
  // { label: "Record ID", path: ["chhist_id"] },
  // {
  //   label: "Created At",
  //   path: ["created_at"],
  //   format: (val: string) =>
  //     val && isValid(new Date(val)) ? format(new Date(val), "PPP p") : "N/A",
  // },
  { label: "TT Status", path: ["tt_status"] }
  // { label: "Status", path: ["status"] },
];

const formatSupplement = (supplement: any): string => {
  const medDetails = supplement.medrec_details?.minv_details;
  if (!medDetails) return "N/A";
  const name = medDetails.med_detail?.med_name || "Unknown Medicine";
  const dosage = medDetails.minv_dsg ? `${medDetails.minv_dsg}${medDetails.minv_dsg_unit || ""}` : "N/A";
  const form = medDetails.minv_form || "N/A";
  const qty = supplement.medrec_details?.medrec_qty || "N/A";
  return `${name} - Dosage: ${dosage} - Form: ${form} - Qty: ${qty}`;
};

export const childPersonalInfoFields: any[] = [
  {
    label: "Patient ID",
    path: ["chrec_details", "patrec_details", "pat_details", "pat_id"]
  },
  {
    label: "Last Name",
    path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_lname"]
  },
  {
    label: "First Name",
    path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_fname"]
  },
  {
    label: "Middle Name",
    path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_mname"]
  },
  {
    label: "Date of Birth",
    path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_dob"],
    format: (val: string) => (val && isValid(new Date(val)) ? format(new Date(val), "PPP") : "N/A")
  },
  {
    label: "Sex",
    path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_sex"]
  },
  {
    label: "Contact",
    path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_contact"]
  }
];

export const familyHeadInfoFields: any[] = [
  {
    label: "Mother's Name",
    path: ["chrec_details", "patrec_details", "pat_details", "family_head_info", "family_heads", "mother", "personal_info"],
    format: (val: any) => (val ? `${val.per_fname} ${val.per_lname}` : "N/A")
  },
  {
    label: "Mother's Contact",
    path: ["chrec_details", "patrec_details", "pat_details", "family_head_info", "family_heads", "mother", "personal_info", "per_contact"]
  },
  {
    label: "Father's Name",
    path: ["chrec_details", "patrec_details", "pat_details", "family_head_info", "family_heads", "father", "personal_info"],
    format: (val: any) => (val ? `${val.per_fname} ${val.per_lname}` : "N/A")
  },
  {
    label: "Father's Contact",
    path: ["chrec_details", "patrec_details", "pat_details", "family_head_info", "family_heads", "father", "personal_info", "per_contact"]
  },
  { label: "Family No.", path: ["chrec_details", "family_no"] },
  {
    label: "Mother's Occupation",
    path: ["chrec_details", "mother_occupation"]
  },
  {
    label: "Father's Occupation",
    path: ["chrec_details", "father_occupation"]
  }
];

export const vitalSignsFields: any[] = [
  {
    label: "Age",
    path: ["child_health_vital_signs", "0", "bm_details", "age"],
    format: (__: any, record: any) => {
      const dob = record?.chrec_details?.patrec_details?.pat_details?.personal_info?.per_dob;
      const createdAt = record?.created_at;

      // Debug logging - remove this after fixing
      console.log("Debug Age Calculation:");
      console.log("DOB:", dob);
      console.log("CreatedAt:", createdAt);
      console.log("DOB valid:", dob && isValid(new Date(dob)));
      console.log("CreatedAt valid:", createdAt && isValid(new Date(createdAt)));
      console.log("Full record:", record);

      if (!dob || !createdAt || !isValid(new Date(dob)) || !isValid(new Date(createdAt))) {
        return "N/A";
      }
      return calculateAgeFromDOB(dob, createdAt).ageString;
    }
  },
  {
    label: "Weight (kg)",
    path: ["child_health_vital_signs", "0", "bm_details", "weight"]
  },
  {
    label: "Height (cm)",
    path: ["child_health_vital_signs", "0", "bm_details", "height"]
  },
  {
    label: "Temperature (°C)",
    path: ["child_health_vital_signs", "0", "temp"]
  }
];

export const findingsFields: any[] = [
  {
    label: "Assessment Summary",
    path: ["child_health_vital_signs", "0", "find_details", "assessment_summary"],
    format: (val: string): JSX.Element[] => {
      if (!val || val.trim() === "") {
        return [
          <div key="no-assessment" className="text-center">
            <span>No assessment summary found</span>
          </div>
        ];
      }

      // Split by new lines and filter empty lines
      const lines = val.split("\n").filter((line) => line.trim() !== "");

      return lines.map((line, index) => (
        <div key={`assessment-${index}`} className="flex justify-center mb-1">
          <div className="text-left">{line.startsWith(",") ? <div>- {line.substring(1).trim()}</div> : <div>{line}</div>}</div>
        </div>
      ));
    }
  },
  {
    label: "Objective Findings",
    path: ["child_health_vital_signs", "0", "find_details", "obj_summary"],
    format: (val: string) => {
      if (!val || val.trim() === "") {
        return [
          <div key="no-objective" className="text-center">
            <span>No objective findings</span>
          </div>
        ];
      }

      const lines = val.split("\n").filter((line) => line.trim() !== "");

      return lines.map((line, index) => (
        <div key={`objective-${index}`} className="flex justify-center mb-1">
          <div className="text-left">{line.startsWith("-") ? <div>- {line.substring(1).trim()}</div> : <div>{line}</div>}</div>
        </div>
      ));
    }
  },
  {
    label: "Subjective Findings",
    path: ["child_health_vital_signs", "0", "find_details", "subj_summary"],
    format: (val: string) => {
      if (!val || val.trim() === "") {
        return [
          <div key="no-subjective" className="text-center">
            <span>No subjective findings</span>
          </div>
        ];
      }

      return [
        <div key="subjective" className="flex justify-center">
          <div className="text-left">{val}</div>
        </div>
      ];
    }
  },
  {
    label: "Plan/Treatment",
    path: ["child_health_vital_signs", "0", "find_details", "plantreatment_summary"],
    format: (val: string): JSX.Element[] => {
      if (!val || val.trim() === "") {
        return [
          <div key="no-plan" className="text-center">
            <span>No treatment plan found</span>
          </div>
        ];
      }

      const lines = val.split("\n").filter((line) => line.trim() !== "");

      return lines.map((line, index) => (
        <div key={`plan-${index}`} className="flex justify-center mb-1">
          <div className="text-left">{line.startsWith("-") ? <div>- {line.substring(1).trim()}</div> : <div>{line}</div>}</div>
        </div>
      ));
    }
  }
];

export const nutritionStatusesFields: any[] = [
  { label: "Weight-for-Age (WFA)", path: ["nutrition_statuses", "0", "wfa"] },
  {
    label: "Length/Height-for-Age (LHFA)",
    path: ["nutrition_statuses", "0", "lhfa"]
  },
  {
    label: "Weight-for-Length (WFL)",
    path: ["nutrition_statuses", "0", "wfl"]
  },
  { label: "MUAC", path: ["nutrition_statuses", "0", "muac"] },
  { label: "MUAC Status", path: ["nutrition_statuses", "0", "muac_status"] }
];

export const notesFields: any[] = [
  {
    label: "Clinical Notes",
    path: ["child_health_notes"],
    format: (val: any[]) => {
      if (!val || val.length === 0) {
        return [
          <div key="no-notes" className="text-center" style={{ color: "#374151" }}>
            <span>No clinical notes found</span>
          </div>
        ];
      }

      // Collect all notes from history (including current notes)
      const allNotes: Array<{
        content: string;
        staffName: string;
        date: string;
        isLatest: boolean;
        chnotes_id: number;
        historyType: string;
      }> = [];

      val.forEach((note) => {
        if (note && note.history && note.history.length > 0) {
          // Add all historical notes
          note.history.forEach((historyItem: any, historyIndex: any) => {
            if (historyItem.chn_notes && historyItem.chn_notes.trim() !== "") {
              // Determine staff name - use "Updated by staff" if staff_name is null and it's an update
              let staffName = historyItem.staff_name;
              if (!staffName) {
                staffName = historyItem.history_type === "~" ? "Updated by staff" : "Created by staff";
              }

              allNotes.push({
                content: historyItem.chn_notes,
                staffName: staffName,
                date: historyItem.history_date ? new Date(historyItem.history_date).toLocaleString() : "Unknown time",
                isLatest: historyIndex === 0, // First item in history is the latest
                chnotes_id: note.chnotes_id || 0,
                historyType: historyItem.history_type || ""
              });
            }
          });
        } else if (note && note.chn_notes && note.chn_notes.trim() !== "") {
          // Fallback: if no history, show current note
          const staffName = note.history?.staff?.rp?.per ? `${note.history?.staff.rp.per.per_fname} ${note.history?.staff.rp.per.per_lname}` : "Created by staff";

          allNotes.push({
            content: note.chn_notes,
            staffName,
            date: note.updated_at ? new Date(note.updated_at).toLocaleString() : "Unknown time",
            isLatest: true,
            chnotes_id: note.chnotes_id || 0,
            historyType: ""
          });
        }
      });

      // Sort by date (most recent first)
      allNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Return empty state if no notes found
      if (allNotes.length === 0) {
        return [
          <div key="no-valid-notes" className="text-center" style={{ color: "#374151" }}>
            <span>No clinical notes found</span>
          </div>
        ];
      }

      return allNotes.map((noteData, index) => (
        <div key={`note-${noteData.chnotes_id}-${index}`} className="mb-3 flex justify-center text-black">
          <div className="text-left w-full max-w-md text-black">
            <div className="mb-1 text-black flex items-center">
              - {noteData.content}
              {noteData.isLatest && <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Latest</span>}
            </div>
            <div className="text-xs text-gray-600 ml-4">
              {noteData.staffName} at {noteData.date}
            </div>
          </div>
        </div>
      ));
    }
  },
  {
    label: "Follow-ups",
    path: ["child_health_notes"],
    format: (val: any[]) => {
      if (!val || val.length === 0) {
        return [
          <div key="no-followups" className="text-center" style={{ color: "#374151" }}>
            <span>No follow-ups scheduled</span>
          </div>
        ];
      }

      // Filter for notes that have follow-up details
      const followUps = val.filter((note) => note && note.followv_details);

      if (followUps.length === 0) {
        return [
          <div key="no-followups" className="text-center" style={{ color: "#374151" }}>
            <span>No follow-ups scheduled</span>
          </div>
        ];
      }

      return followUps.map((note, index) => {
        const followv = note.followv_details!;
        const followDate = followv.followv_date ? new Date(followv.followv_date).toLocaleDateString() : "Unknown date";

        return (
          <div key={`followup-${index}`} className="mb-3 flex justify-center text-black">
            <div className="text-left w-full max-w-md text-black">
              <div className="mb-1 text-black">- {followv.followv_description || "No description provided"}</div>
              <div className="ml-4 text-sm text-gray-600">
                <div>Scheduled on {followDate}</div>
                <div className="text-xs">[Status: {followv.followv_status || "Unknown"}]</div>
              </div>
            </div>
          </div>
        );
      });
    }
  }
];

export const supplementsFields: any[] = [
  {
    label: "Supplements",
    path: ["child_health_supplements"],
    format: (val: any[]) => {
      if (!val || val.length === 0) {
        return [
          <div key="no-supplements" className="text-center">
            <span>No supplements recorded</span>
          </div>
        ];
      }

      return val.map((supplement, index) => {
        const formatted = formatSupplement(supplement);
        if (formatted === "N/A") {
          return (
            <div key={`supplement-na-${index}`} className="text-center">
              <span>N/A</span>
            </div>
          );
        }

        return (
          <div key={`supplement-${index}`} className="mb-2 flex justify-center">
            <div className="text-left">
              <div className="font-medium">
                {supplement.medrec_details?.minv_details?.med_detail?.med_name || "Unknown Medicine"} {formatDosage(supplement)}
              </div>

              <div className="ml-4 flex flex-col gap-1 text-sm">
                <div className="">({supplement.medrec_details?.minv_details?.minv_form || "N/A"})</div>
                <div>
                  <span className="font-semibold">Quantity:</span> {supplement.medrec_details?.medrec_qty || "N/A"}
                </div>
              </div>
            </div>
          </div>
        );
      });
    }
  }
];

const formatDosage = (supplement: any): string => {
  const medDetails = supplement.medrec_details?.minv_details;
  if (!medDetails) return "N/A";
  return medDetails.minv_dsg ? `${medDetails.minv_dsg}${medDetails.minv_dsg_unit || ""}` : "N/A";
};

export const exclusiveBfCheckFields: any[] = [
  {
    label: "EBF Check Dates",
    path: ["exclusive_bf_checks"],
    format: (val: any) =>
      val && val.length > 0
        ? val.map((ebf: any) => ({
            date: ebf.ebf_date && isValid(new Date(ebf.ebf_date)) ? format(new Date(ebf.ebf_date), "PPP") : "N/A",
            id: ebf.ebf_id
          }))
        : []
  }
];

export const immunizationTrackingFields: any[] = [
  {
    label: "Immunizations",
    path: ["immunization_tracking"],
    format: (val: any[]) => {
      if (!val || val.length === 0) {
        return [
          <div key="no-immunizations" className="text-center">
            <span>No immunization records</span>
          </div>
        ];
      }

      return val.map((imt, index) => {
        const vachist = imt.vachist_details;
        if (!vachist) {
          return (
            <div key={`no-details-${index}`} className="text-center">
              <span>No vaccination details</span>
            </div>
          );
        }

        const vaccine = vachist.vaccine_stock?.vaccinelist;
        const doseNumber = vachist.vachist_doseNo;
        const doseSuffix = doseNumber === 1 ? "1st dose" : doseNumber === 2 ? "2nd dose" : doseNumber === 3 ? "3rd dose" : `${doseNumber}th dose`;

        return (
          <div key={`immunization-${index}`} className="mb-2 flex justify-center">
            <div className="text-left">
              <div className="font-medium">
                - {vaccine?.vac_name || vachist.vac_details?.vac_name} ({doseSuffix})
              </div>

              <div className="ml-4 flex flex-col gap-1 text-sm">
                <div>
                  <span className="font-semibold">Status:</span> {vachist.vachist_status}
                </div>
                <div>
                  <span className="font-semibold">Date:</span> {new Date(vachist.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Age at vaccination:</span> {vachist.vachist_age}
                </div>
                {/* {vachist.follow_up_visit && (
                  <div className=" bg-red-100 rounded-md p-1 text-red-500">
                    <span className="font-semibold ">Next follow-up:</span> {new Date(vachist.follow_up_visit.followv_date).toLocaleDateString()}
                  </div>
                )} */}
              </div>
            </div>
          </div>
        );
      });
    }
  }
];

export const getSupplementStatusesFields = (fullHistoryData: any[]): any[] => [
  {
    label: "Supplement Statuses",
    path: ["supplements_statuses"],
    format: (val: any, record: any) => {
      if (!record) return [<span key="no-status">No supplement statuses recorded</span>];

      // Get statuses directly associated with this record
      const directStatuses = val && val.length > 0 ? val : [];

      // Find statuses from other records where updated_at matches this record's created_at and date_completed is not null
      const matchingStatuses: any[] = [];
      fullHistoryData.forEach((otherRecord) => {
        if (otherRecord.chhist_id !== record.chhist_id) {
          otherRecord.supplements_statuses.forEach((status: any) => {
            if (
              status.updated_at &&
              record.created_at &&
              isValid(new Date(status.updated_at)) &&
              isValid(new Date(record.created_at)) &&
              isSameDay(new Date(status.updated_at), new Date(record.created_at)) &&
              status.date_completed && // Only include statuses with a valid date_completed
              isValid(new Date(status.date_completed))
            ) {
              matchingStatuses.push(status);
            }
          });
        }
      });

      const allStatuses = [...directStatuses, ...matchingStatuses];

      if (allStatuses.length === 0) return [<span key="no-status">No supplement statuses recorded</span>];

      return allStatuses.map((status: any, index: number) => {
        // const statusUpdatedAt =
        //   status?.updated_at && isValid(new Date(status.updated_at))
        //     ? format(new Date(status.updated_at), "PPP")
        //     : "N/A";
        const dateCompleted = status?.date_completed && isValid(new Date(status.date_completed)) ? format(new Date(status.date_completed), "PPP") : "N/A";
        const isMatchingStatus = matchingStatuses.includes(status);

        // Check if updated_at matches created_at
        const showCompletedDate = status.updated_at && record.created_at && isSameDay(new Date(status.updated_at), new Date(record.created_at));

        // Check if status contains keywords
        const hasBirthwt = status?.status_type?.toLowerCase().includes("birthwt") || status?.status_type?.toLowerCase().includes("birth weight");
        // const hasAnemic = status?.status_type?.toLowerCase().includes("anemic");

        return (
          <div className="flex justify-center">
            <div key={`${status.chssupplementstat_id}-${index}`} className={isMatchingStatus ? "text-red-500 font-semibold" : ""}>
              <div className="font-medium text-left">{status?.status_type || "N/A"}</div>
              {hasBirthwt && <div className="ml-4 text-left">- Birth Weight: {status?.birthwt || "N/A"}</div>}

              <div className="ml-4 text-left">- Seen: {status?.date_seen && isValid(new Date(status.date_seen)) ? format(new Date(status.date_seen), "PPP") : "N/A"}</div>
              <div className="ml-4 text-left">- Given Iron: {status?.date_given_iron && isValid(new Date(status.date_given_iron)) ? format(new Date(status.date_given_iron), "PPP") : "N/A"}</div>
              {showCompletedDate && <div className="ml-4 text-left bg-red-100 rounded-md p-1 text-red-500">- Completed: {dateCompleted}</div>}
            </div>
          </div>
        );
      });
    }
  }
];
