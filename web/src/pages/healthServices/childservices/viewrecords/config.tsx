import { format, isValid, isSameDay } from "date-fns";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator"; // Import the helper
import { toTitleCase } from "../../../../helpers/ToTitleCase";

// Updated all fields to enforce consistent width and alignment
const fixedWidthStyle = "px-6 py-4 w-96 flex items-center justify-center text-center overflow-hidden whitespace-nowrap text-ellipsis"; // Fixed width with alignment and overflow handling

// General Record Overview Fields
export const recordOverviewFields: any[] = [
  {
    label: "TT Status",
    path: ["tt_status"],
    format: (val: string | null) => {
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{val || "N/A"}</span>
        </div>
      );
    },
  },
];

// Placeholder for No Record Found
export const norecord = (
  <div className="flex justify-center items-center flex-col text-left px-6 py-4 w-[500px] border">
    <span className="text-lg font-semibold text-gray-400">No record found</span>
  </div>
);

// Child Personal Information Fields
export const childPersonalInfoFields: any[] = [
  {
    label: "Patient ID",
    path: ["chrec_details", "patrec_details", "pat_details", "pat_id"],
    format: (val: string | null) => {
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{val || "N/A"}</span>
        </div>
      );
    },
  },
  {
    label: "Last Name",
    path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_lname"],
    format: (val: string | null) => {
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{val || "N/A"}</span>
        </div>
      );
    },
  },
  {
    label: "First Name",
    path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_fname"],
    format: (val: string | null) => {
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{val || "N/A"}</span>
        </div>
      );
    },
  },
  {
    label: "Middle Name",
    path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_mname"],
    format: (val: string | null) => {
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{val || "N/A"}</span>
        </div>
      );
    },
  },
  {
    label: "Date of Birth",
    path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_dob"],
    format: (val: string | null) => {
      const formattedVal = val && isValid(new Date(val)) ? format(new Date(val), "PPP") : "";
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{formattedVal || "N/A"}</span>
        </div>
      );
    },
  },
  {
    label: "Sex",
    path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_sex"],
    format: (val: string | null) => {
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{val || "N/A"}</span>
        </div>
      );
    },
  },
  {
    label: "Contact",
    path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_contact"],
    format: (val: string | null) => {
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{val || "N/A"}</span>
        </div>
      );
    },
  },
];

// Family Head Information Fields
export const familyHeadInfoFields: any[] = [
  {
    label: "Mother's Name",
    path: ["chrec_details", "patrec_details", "pat_details", "family_head_info", "family_heads", "mother", "personal_info"],
    format: (val: any) => {
      const name = val ? `${val.per_fname} ${val.per_lname}` : "";
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{name || "N/A"}</span>
        </div>
      );
    },
  },
  {
    label: "Mother's Contact",
    path: ["chrec_details", "patrec_details", "pat_details", "family_head_info", "family_heads", "mother", "personal_info", "per_contact"],
    format: (val: string | null) => {
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{val || "N/A"}</span>
        </div>
      );
    },
  },
  {
    label: "Father's Name",
    path: ["chrec_details", "patrec_details", "pat_details", "family_head_info", "family_heads", "father", "personal_info"],
    format: (val: any) => {
      const name = val ? `${val.per_fname} ${val.per_lname}` : "";
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{name || "N/A"}</span>
        </div>
      );
    },
  },
  {
    label: "Father's Contact",
    path: ["chrec_details", "patrec_details", "pat_details", "family_head_info", "family_heads", "father", "personal_info", "per_contact"],
    format: (val: string | null) => {
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{val || "N/A"}</span>
        </div>
      );
    },
  },
  {
    label: "Family No.",
    path: ["chrec_details", "family_no"],
    format: (val: string | null) => {
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{val || "N/A"}</span>
        </div>
      );
    },
  },
  {
    label: "Mother's Occupation",
    path: ["chrec_details", "mother_occupation"],
    format: (val: string | null) => {
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{val || "N/A"}</span>
        </div>
      );
    },
  },
  {
    label: "Father's Occupation",
    path: ["chrec_details", "father_occupation"],
    format: (val: string | null) => {
      return (
        <div className={fixedWidthStyle}>
          <span className="text-black">{val || "N/A"}</span>
        </div>
      );
    },
  },
];

// Vital Signs and Nutritional Status Fields
export const vitalSignsFields: any[] = [
  {
    label: "Vital Signs & Nutritional Status",
    path: ["child_health_vital_signs", "0", "bm_details"],
    format: (_: any, record: any) => {
      const bmDetails = record?.child_health_vital_signs?.[0]?.bm_details || {};
      const temp = record?.child_health_vital_signs?.[0]?.temp;
      const dob = record?.chrec_details?.patrec_details?.pat_details?.personal_info?.per_dob;
      const createdAt = record?.created_at;
      const age = dob && createdAt && isValid(new Date(dob)) && isValid(new Date(createdAt)) ? calculateAgeFromDOB(dob, createdAt).ageString : "";

      return (
        <div className="flex flex-col gap-2 text-lg text-gray-800 w-[500px]">
          <div>
            <span className="font-semibold">Age:</span> <span>{age}</span>
          </div>
          <div>
            <span className="font-semibold">Weight (kg):</span> <span>{bmDetails.weight ?? "N/A"}</span>
          </div>
          <div>
            <span className="font-semibold">Height (cm):</span> <span>{bmDetails.height ?? "N/A"}</span>
          </div>
          <div>
            <span className="font-semibold">Temp (°C):</span> <span>{temp ?? "N/A"}</span>
          </div>
          <div>
            <span className="font-semibold">Weight-for-Age:</span> <span>{bmDetails.wfa ?? "N/A"}</span>
          </div>
          <div>
            <span className="font-semibold">Length/Height-for-Age</span> <span>{bmDetails.lhfa ?? "N/A"}</span>
          </div>
          <div>
            <span className="font-semibold">Weight-for-Length:</span> <span>{bmDetails.wfl ?? "N/A"}</span>
          </div>
          {bmDetails.muac && bmDetails.muac !== "" && bmDetails.muac !== "None" && (
            <div>
              <span className="font-semibold">MUAC:</span> <span>{bmDetails.muac}</span>
            </div>
          )}
          {bmDetails.muac_status && bmDetails.muac_status !== "" && bmDetails.muac_status !== "None" && (
            <div>
              <span className="font-semibold">MUAC Status:</span> <span>{bmDetails.muac_status}</span>
            </div>
          )}
          <hr className="mt-4  mb-4 border-2" />
        </div>
      );
    },
  },
];

// Findings Fields
export const findingsFields: any[] = [
  {
    label: "Findings",
    path: ["child_health_vital_signs", "0", "find_details"],
    format: (val: any): JSX.Element => {
      if (!val || Object.values(val).every((v) => !v || (typeof v === "string" && v.trim() === ""))) {
        return norecord;
      }

      const assessmentLines = val.assessment_summary && val.assessment_summary.trim() !== "" ? val.assessment_summary.split("\n").filter((line: string) => line.trim() !== "") : [];

      const objectiveLines =
        val.obj_summary && val.obj_summary.trim() !== ""
          ? val.obj_summary
              .split("-")
              .map((item: string) => item.trim())
              .filter(Boolean)
          : [];

      const grouped: { [key: string]: string[] } = {};
      objectiveLines.forEach((item: string) => {
        const colonIndex = item.indexOf(":");
        if (colonIndex > -1) {
          const keyword = item.substring(0, colonIndex).trim();
          const itemValue = item.substring(colonIndex + 1).trim();
          if (!grouped[keyword]) {
            grouped[keyword] = [];
          }
          grouped[keyword].push(itemValue);
        } else {
          if (!grouped["Other"]) {
            grouped["Other"] = [];
          }
          grouped["Other"].push(item);
        }
      });

      const subjectiveText = val.subj_summary && val.subj_summary.trim() !== "" ? val.subj_summary : "";
      const planLines = val.plantreatment_summary && val.plantreatment_summary.trim() !== "" ? val.plantreatment_summary.split("\n").filter((line: string) => line.trim() !== "") : [];

      return (
        <div className="text-left px-6 py-4 w-[500px]">
          <div className="flex flex-col gap-2 text-lg text-gray-800">
            {assessmentLines.length > 0 && (
              <div>
                <span className="font-semibold">Assessment Summary:</span>
                {assessmentLines.map((line: string, index: number) => (
                  <div key={`assessment-${index}`} className="ml-2">
                    {line.startsWith(",") ? `- ${line.substring(1).trim()}` : line}
                  </div>
                ))}
              </div>
            )}
            {Object.keys(grouped).length > 0 && (
              <div>
                <hr className="mt-4  mb-4 border-2" />

                <span className="font-semibold">Objective Findings:</span>
                {Object.entries(grouped).map(([keyword, values], idx) => (
                  <div key={`objective-group-${keyword}-${idx}`} className="ml-2">
                    <span className="font-semibold">{keyword}:</span>{" "}
                    {values.map((v, i) => (
                      <span key={`objective-value-${keyword}-${i}`}>
                        {v}
                        {i < values.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {subjectiveText && (
              <div>
                <hr className="mt-4  mb-4 border-2" />

                <span className="font-semibold">Subjective Findings:</span>
                <div className="ml-2">{subjectiveText}</div>
              </div>
            )}
            {planLines.length > 0 && (
              <div>
                <hr className="mt-4  mb-4 border-2" />

                <span className="font-semibold">Plan/Treatment:</span>
                {planLines.map((line: string, index: number) => (
                  <div key={`plan-${index}`} className="ml-2">
                    {line.startsWith("-") ? `- ${line.substring(1).trim()}` : line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
];

export const notesFields: any[] = [
  {
    label: "Notes",
    path: ["child_health_notes"],
    format: (val: any[]) => {
      if (!val || val.length === 0) {
        return [norecord];
      }
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
          note.history.forEach((historyItem: any, historyIndex: any) => {
            if (historyItem.chn_notes && historyItem.chn_notes.trim() !== "") {
              let staffName = historyItem.staff_name;
              if (!staffName) {
                staffName = historyItem.history_type === "~" ? "Updated by staff" : "Created by staff";
              }
              allNotes.push({
                content: historyItem.chn_notes,
                staffName: staffName,
                date: historyItem.history_date ? new Date(historyItem.history_date).toLocaleString() : "Unknown time",
                isLatest: historyIndex === 0,
                chnotes_id: note.chnotes_id || 0,
                historyType: historyItem.history_type || "",
              });
            }
          });
        } else if (note && note.chn_notes && note.chn_notes.trim() !== "") {
          const staffName = note.history?.staff?.rp?.per ? `${note.history?.staff.rp.per.per_fname} ${note.history?.staff.rp.per.per_lname}` : "Created by staff";
          allNotes.push({
            content: note.chn_notes,
            staffName,
            date: note.updated_at ? new Date(note.updated_at).toLocaleString() : "Unknown time",
            isLatest: true,
            chnotes_id: note.chnotes_id || 0,
            historyType: "",
          });
        }
      });
      allNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (allNotes.length === 0) {
        return [norecord];
      }

      return allNotes.map((noteData, index) => (
        <div key={`note-${noteData.chnotes_id}-${index}`} className="mb-4 text-black w-[500px] border">
          <div className="text-left px-6 py-4 ">
            <div className="mb-2 text-lg font-semibold flex items-center">{noteData.content}</div>
            <div className="text-lg text-gray-700 ml-4">
              {noteData.historyType === "+" ? (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-2">Created</span>
              ) : noteData.historyType === "~" ? (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded mr-2">Updated</span>
              ) : null}
              {toTitleCase(noteData.staffName)} at
              <span className="text-sm"> {noteData.date}</span>
            </div>
          </div>
        </div>
      ));
    },
  },
  {
    label: "Follow-ups",
    path: ["child_health_notes"],
    format: (val: any[]) => {
      if (!val || val.length === 0) {
        return [norecord];
      }
      const followUps = val.filter((note) => note && note.followv_details);
      if (followUps.length === 0) {
        return [
          <div key="no-followups" className="text-center py-4">
            <span className="text-lg font-semibold text-gray-900">No follow-ups scheduled</span>
          </div>,
        ];
      }

      return followUps.map((note, index) => {
        const followv = note.followv_details!;
        const followDate = followv.followv_date ? new Date(followv.followv_date).toLocaleDateString() : "Unknown date";
        return (
          <>
          <div key={`followup-${index}`} className="mb-4 text-black w-[500px] border">
              <div className="text-left px-6 py-4 ">
                <div className="mb-2 text-xl font-bold ">{followv.followv_description || "No description provided"}</div>
                <div className="ml-2 text-lg text-gray-700 w-fit">
                  <div>
                    <span className="font-semibold"> Scheduled on: </span>
                    {followDate}
                  </div>
                  <div className="text-lg text-gray-700">
                    <span className="font-semibold"> Status: </span>
                    {followv.followv_status === "completed" ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded mr-2">Completed</span>
                    ) : followv.followv_status === "ending" ? (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded mr-2">Ending</span>
                    ) : followv.followv_status === "missed" ? (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded mr-2">Missed</span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded mr-2">Unknown</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      });
    },
  },
];

export const supplementsFields: any[] = [
  {
    label: "",
    path: ["child_health_supplements"],
    format: (val: any[], record: any, fullHistoryData?: any[]) => {
      if (!val || val.length === 0) {
        return [norecord];
      }

      // Combine supplement items and supplement statuses if fullHistoryData is provided
      let supplementStatuses: any[] = [];
      if (fullHistoryData) {
        // Find direct statuses from current record
        const directStatuses = record?.supplements_statuses && record.supplements_statuses.length > 0 ? record.supplements_statuses : [];
        // Find matching statuses from other records
        const matchingStatuses: any[] = [];
        fullHistoryData.forEach((otherRecord) => {
          if (otherRecord.chhist_id !== record.chhist_id && otherRecord.supplements_statuses) {
            otherRecord.supplements_statuses.forEach((status: any) => {
              if (
                status.updated_at &&
                record.created_at &&
                isValid(new Date(status.updated_at)) &&
                isValid(new Date(record.created_at)) &&
                isSameDay(new Date(status.updated_at), new Date(record.created_at)) &&
                status.date_completed &&
                isValid(new Date(status.date_completed))
              ) {
                matchingStatuses.push(status);
              }
            });
          }
        });
        supplementStatuses = [...directStatuses, ...matchingStatuses];
      }

      const supplementItems = val.map((supplement, index) => {
        const medDetails = supplement.medreqitem_details?.med_details;
        if (!medDetails) {
          return (
            <div key={`supplement-na-${index}`} className="text-center py-4">
              <span className="text-lg font-semibold text-gray-900">N/A</span>
            </div>
          );
        }
        const name = medDetails.med_name || "Unknown Medicine";
        const dosage = medDetails.med_dsg ? `${medDetails.med_dsg}${medDetails.med_dsg_unit || ""}` : "N/A";
        const form = medDetails.med_form || "N/A";
        const qty = supplement.medreqitem_details?.total_allocated_qty ?? supplement.medreqitem_details?.medrec_qty ?? "N/A";
        const unit = supplement.medreqitem_details?.unit || "N/A";
        const reason = supplement.medreqitem_details?.reason || "";
        return (
          <div key={`supplement-${index}`} className="mb-6 flex justify-center w-[500px]">
            <div className="text-left px-6 py-4 w-full max-w-xl ">
              <div className="font-bold text-xl  mb-2">
                {name}{" "}
                <span className="text-lg font-normal text-gray-700">
                  {" "}
                  {dosage.toLowerCase()} . {form.toLowerCase()}
                </span>
              </div>
              <div className="ml-2 flex flex-col gap-2 text-lg text-gray-800">
                <div>
                  <span className="font-semibold">Quantity:</span> <span className="">{qty}</span> <span className="text-gray-700">{unit}</span>
                </div>
                {reason && (
                  <div>
                    <span className="font-semibold">Reason:</span> <span className="text-gray-900">{reason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      });

      // Define `statusItems` to fix the error
      const statusItems =
        supplementStatuses.length > 0
          ? supplementStatuses.map((status: any, index: number) => {
              const dateCompleted = status?.date_completed && isValid(new Date(status.date_completed)) ? format(new Date(status.date_completed), "PPP") : "";

              const showCompletedDate = status.updated_at && record.created_at && isSameDay(new Date(status.updated_at), new Date(record.created_at));
              const hasBirthwt = status?.status_type?.toLowerCase().includes("birthwt") || status?.status_type?.toLowerCase().includes("birth weight");
              return (
                <div className="flex justify-center mb-4 w-[500px]" key={`${status.chssupplementstat_id}-${index}`}>
                  <div className="px-6 py-4 w-full max-w-xl">
                    <div className="font-bold text-xl  mb-2">{status?.status_type || ""}</div>
                    {hasBirthwt && <div className="ml-4 text-lg text-gray-800">- Birth Weight: {status?.birthwt || ""}</div>}
                    <div className="ml-4 text-lg text-gray-800">- Seen: {status?.date_seen && isValid(new Date(status.date_seen)) ? format(new Date(status.date_seen), "PPP") : ""}</div>
                    <div className="ml-4 text-lg text-gray-800">
                      - Given Iron: {status?.date_given_iron && isValid(new Date(status.date_given_iron)) ? format(new Date(status.date_given_iron), "PPP") : ""}
                    </div>
                    {showCompletedDate && <div className="ml-4 text-left bg-red-100 rounded-md p-1 text-red-500 text-lg">- Completed: {dateCompleted}</div>}
                  </div>
                </div>
              );
            })
          : [];

      return [...supplementItems, ...statusItems];
    },
  },
];

export const exclusiveBfCheckFields = [
  {
    label: "",
    path: ["exclusive_bf_checks"],
    format: (val: any[]) => {
      if (!val || val.length === 0) {
        return [norecord];
      }

      return val.map((ebf: any, index: number) => (
        <div key={ebf.ebf_id || index} className="flex justify-start  flex-col mb-4 w-[500px]">
          <div className="text-left flex flex-col px-6 py-4 ">
            <span className="font-bold">{ebf.created_at && isValid(new Date(ebf.ebf_date)) ? format(new Date(ebf.ebf_date), "MMMM yyyy") : ""}</span>
            {ebf.type_of_feeding && <span className=" font-semibold text-lg">[{ebf.type_of_feeding}]</span>}
          </div>
        </div>
      ));
    },
  },
];

// Immunization Tracking Fields
export const immunizationTrackingFields: any[] = [
  {
    label: "",
    path: ["immunization_tracking"],
    format: (val: any[]) => {
      if (!val || val.length === 0) {
        return [norecord];
      }

      return val.map((imt, index) => {
        const vachist = imt.vachist_details;
        if (!vachist) {
          return (
            <div key={`no-details-${index}`} className="text-center py-4">
              <span className="text-lg font-semibold text-gray-900">No vaccination details</span>
            </div>
          );
        }
        const vaccine = vachist.vaccine_stock?.vaccinelist;
        const doseNumber = vachist.vachist_doseNo;
        const doseSuffix = doseNumber === 1 ? "1st dose" : doseNumber === 2 ? "2nd dose" : doseNumber === 3 ? "3rd dose" : `${doseNumber}th dose`;

        const assessedBy = vachist.assessed_by ? `${vachist.assessed_by.fname || ""} ${vachist.assessed_by.lname || ""}`.trim() : null;
        const administeredBy = vachist.administered_by ? `${vachist.administered_by.fname || ""} ${vachist.administered_by.lname || ""}`.trim() : null;

        return (
          <div className="flex justify-center mb-4 w-[500px]">
            <div className="text-left px-6 py-4 w-full max-w-xl ">
              <div className="font-bold text-xl  mb-2">
                - {vaccine?.vac_name || vachist.vac_details?.vac_name} ({doseSuffix})
              </div>
              <div className="ml-2 flex flex-col gap-2 text-lg text-gray-800">
                <div>
                  <span className="font-semibold">Date:</span> {new Date(vachist.created_at).toLocaleDateString()}
                </div>
                {imt.vachist_details?.vacStck_id ? (
                  <>
                    {assessedBy && (
                      <div>
                        <span className="font-semibold">Assessed by:</span> {toTitleCase(assessedBy)}
                      </div>
                    )}
                    {administeredBy && (
                      <div>
                        <span className="font-semibold">Administered by:</span>
                        {toTitleCase(administeredBy)}
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <span className="font-semibold">Administered from:</span> Health Service Outreach
                  </div>
                )}
                <div className="text-lg text-gray-700">
                  <span className="font-semibold">Status:</span>
                  {vachist.vachist_status === "completed" ? <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded mr-2">Completed</span> : null}
                </div>
              </div>
            </div>
          </div>
        );
      });
    },
  },
];
