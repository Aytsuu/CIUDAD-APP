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

      // Group pe_results by section title
      const groupedResults: { [key: string]: string[] } = {};
      val.pe_results?.forEach((result: any) => {
        const sectionTitle = result.pe_option_details?.pe_section_details?.title || "Other";
        const text = result.pe_option_details?.text || "";

        if (!groupedResults[sectionTitle]) {
          groupedResults[sectionTitle] = [];
        }
        groupedResults[sectionTitle].push(text);
      });

      // Extract lab details and map to labels
      const labDetails = val.lab_details;
      const labTests = {
        asRequired: [
          { name: "is_cbc", label: "CBC w/ platelet count" },
          { name: "is_urinalysis", label: "Urinalysis" },
          { name: "is_fecalysis", label: "Fecalysis" },
          { name: "is_sputum_microscopy", label: "Sputum Microscopy" },
          { name: "is_creatine", label: "Creatinine" },
          { name: "is_hba1c", label: "HbA1C" },
        ],
        mandatory: [
          { name: "is_chestxray", label: "Chest X-Ray", age: "≥10" },
          { name: "is_papsmear", label: "Pap smear", age: "≥20" },
          { name: "is_fbs", label: "FBS", age: "≥40" },
          { name: "is_oralglucose", label: "Oral Glucose Tolerance Test", age: "≥40" },
          { name: "is_lipidprofile", label: "Lipid profile (Total Cholesterol, HDL and LDL Cholesterol, Triglycerides)", age: "≥40" },
          { name: "is_fecal_occult_blood", label: "Fecal Occult Blood", age: "≥50" },
          { name: "is_ecg", label: "ECG", age: "≥60" },
        ],
      };

      const displayedLabTests = [
        ...labTests.asRequired.filter((test) => labDetails?.[test.name]),
        ...labTests.mandatory.filter((test) => labDetails?.[test.name]),
      ];

      return (
        <div className="text-left px-6 py-4 w-[500px]">
          <div className="flex flex-col gap-2 text-lg text-gray-800">
            {/* Display grouped physical exam results */}
            {Object.keys(groupedResults).length > 0 && (
              <div>
                <span className="font-semibold">Physical Exam Results:</span>
                {Object.entries(groupedResults).map(([section, texts], idx) => (
                  <div key={`pe-group-${section}-${idx}`} className="ml-2">
                    <span className="font-semibold">{section}:</span> {texts.join(", ")}
                  </div>
                ))}
              </div>
            )}

           

            {/* Display other summaries */}
            {val.assessment_summary && (
              <div>
                <hr className="mt-4 mb-4 border-2" />
                <span className="font-semibold">Assessment Summary:</span>
                <div className="ml-2">{val.assessment_summary}</div>
              </div>
            )}
            {val.subj_summary && (
              <div>
                <hr className="mt-4 mb-4 border-2" />
                <span className="font-semibold">Subjective Findings:</span>
                <div className="ml-2">{val.subj_summary}</div>
              </div>
            )}
            {val.plantreatment_summary && (
              <div>
                <hr className="mt-4 mb-4 border-2" />
                <span className="font-semibold">Plan/Treatment:</span>
                <div className="ml-2">{val.plantreatment_summary}</div>
              </div>
            )}

             {/* Display lab details if present */}
            {displayedLabTests.length > 0 && (
              <div>
                <hr className="mt-4 mb-4 border-2" />
                <span className="font-semibold">Laboratory Details:</span>
                <div className="ml-2">
                  {displayedLabTests.map((test, index) => (
                    <div key={`lab-test-${index}`}>
                      <span className="font-semibold">{test.label}</span>
                    </div>
                  ))}
                </div>
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
      console.log("child_health_supplements data:", val);
      console.log("current record supplements_statuses:", record?.supplements_statuses);

      if (!val || val.length === 0) {
        console.warn("No supplements data found or empty array.");
        return norecord;
      }

      // Combine supplement items and supplement statuses if fullHistoryData is provided
      let supplementStatuses: any[] = [];
      
      // First, always include direct statuses from current record
      const directStatuses = record?.supplements_statuses && record.supplements_statuses.length > 0 ? record.supplements_statuses : [];
      console.log("Direct statuses from current record:", directStatuses);
      
      if (fullHistoryData) {
        // Find matching statuses from other records - REMOVED the strict date_completed condition
        const matchingStatuses: any[] = [];
        fullHistoryData.forEach((otherRecord) => {
          if (otherRecord.chhist_id !== record.chhist_id && otherRecord.supplements_statuses) {
            otherRecord.supplements_statuses.forEach((status: any) => {
              // SIMPLIFIED: Only check if dates are valid, don't require date_completed
              if (
                status.updated_at &&
                record.created_at &&
                isValid(new Date(status.updated_at)) &&
                isValid(new Date(record.created_at)) &&
                isSameDay(new Date(status.updated_at), new Date(record.created_at))
              ) {
                matchingStatuses.push(status);
              }
            });
          }
        });
        console.log("Matching statuses from other records:", matchingStatuses);
        supplementStatuses = [...directStatuses, ...matchingStatuses];
      } else {
        // If no fullHistoryData, just use direct statuses
        supplementStatuses = directStatuses;
      }

      console.log("Final supplementStatuses to display:", supplementStatuses);

      const supplementItems = val.map((supplement, index) => {
        const medreqitemDetails = supplement.medreqitem_details;

        if (!medreqitemDetails || medreqitemDetails.length === 0) {
          console.warn("No medreqitem_details found for supplement:", supplement);
          return null;
        }

        return medreqitemDetails.map((item: any, itemIndex: number) => {
          const medDetails = item?.medicine;
          if (!medDetails) {
            console.warn("No medicine details found for item:", item);
            return null;
          }

          const name = medDetails.med_name || "Unknown Medicine";
          const dosage = medDetails.med_dsg ? `${medDetails.med_dsg}${medDetails.med_dsg_unit || ""}` : "N/A";
          const form = medDetails.med_form || "N/A";
          const qty = item?.total_quantity ?? "N/A";
          const unit = item?.unit || "N/A";
          const reason = item?.reason || "";

          return (
            <div key={`supplement-${index}-${itemIndex}`} className="mb-6 flex justify-center w-[500px]">
              <div className="text-left px-6 py-4 w-full max-w-xl">
                <div className="font-bold text-xl mb-2">
                  {name}{" "}
                  <span className="text-lg font-normal text-gray-700">
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
      }).flat().filter(Boolean);

      // Define `statusItems` - SIMPLIFIED conditions
      const statusItems =
        supplementStatuses.length > 0
          ? supplementStatuses.map((status: any, index: number) => {
              const dateCompleted = status?.date_completed && isValid(new Date(status.date_completed)) ? format(new Date(status.date_completed), "PPP") : "";
              const dateSeen = status?.date_seen && isValid(new Date(status.date_seen)) ? format(new Date(status.date_seen), "PPP") : "";
              const dateGivenIron = status?.date_given_iron && isValid(new Date(status.date_given_iron)) ? format(new Date(status.date_given_iron), "PPP") : "";

              // REMOVED: showCompletedDate condition since date_completed is often null
              const hasBirthwt = status?.status_type?.toLowerCase().includes("birthwt") || status?.status_type?.toLowerCase().includes("birth weight");
              
              return (
                <div className="flex justify-center mb-4 w-[500px]" key={`${status.chssupplementstat_id}-${index}`}>
                  <div className="px-6 py-4 w-full max-w-xl">
                    <div className="font-bold text-xl mb-2">{status?.status_type || "Status"}</div>
                    {hasBirthwt && (
                      <div className="ml-4 text-lg text-gray-800">
                        - {status?.status_type?.toLowerCase() === "anemic" ? "Anemic" : "Low Birth Weight"}
                        {status?.birthwt && `: ${status.birthwt}`}
                      </div>
                    )}
                    {dateSeen && (
                      <div className="ml-4 text-lg text-gray-800">- Seen: {dateSeen}</div>
                    )}
                    {dateGivenIron && (
                      <div className="ml-4 text-lg text-gray-800">- Given Iron: {dateGivenIron}</div>
                    )}
                    {dateCompleted && (
                      <div className="ml-4 text-left bg-green-100 rounded-md p-1 text-green-700 text-lg">- Completed: {dateCompleted}</div>
                    )}
                    {/* Show a message if no specific dates are available but status exists */}
                    {!dateSeen && !dateGivenIron && !dateCompleted && (
                      <div className="ml-4 text-lg text-gray-500">- Status recorded</div>
                    )}
                  </div>
                </div>
              );
            })
          : [];

      console.log("Generated statusItems count:", statusItems.length);

      // Check if we have any items to display
      const allItems = [...supplementItems, ...statusItems];
      
      if (allItems.length === 0) {
        return norecord;
      }

      return allItems;
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
