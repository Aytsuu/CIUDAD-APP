import { formatDate } from "@/helpers/dateHelper"
import { isNhts, isNonNhts, isIndigenous, isNonIp, norm } from "./utils"
import PrintFormField from "./PrintFormField"

interface DemographicDataProps {
  data: any
  householdData: any
  householdHead: any
  fatherData: any
  motherData: any
  childrenUnder5: any[]
  childrenOver5: any[]
  surveyData: any
}

const DemographicData = ({
  data,
  householdData,
  householdHead,
  fatherData,
  motherData,
  childrenUnder5,
  childrenOver5,
  surveyData,
}: DemographicDataProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold mb-3 bg-gray-200 p-1">DEMOGRAPHIC DATA</h2>

      {/* Household and Quarter Information */}
      <div className="grid grid-cols-3 gap-8 mb-4">
        <div className="grid grid-rows-2 gap-2">
          <PrintFormField label="Household No." value={householdData?.household_id} width="full" />
          <PrintFormField label="Family No." value={data.family_info.family_id} width="full" />
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs">Quarter:</span>
          <div className="flex gap-1">
            <label className="flex text-xs items-center">
              <input type="checkbox" className="mr-1" /> First (1st)
            </label>
            <label className="flex text-xs items-center">
              <input type="checkbox" className="mr-1" /> Second (2nd)
            </label>
            <label className="flex text-xs items-center">
              <input type="checkbox" className="mr-1" /> Third (3rd)
            </label>
            <label className="flex text-xs items-center">
              <input type="checkbox" className="mr-1" /> Fourth (4th)
            </label>
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-xs">Date of Visit:</span>
          <div className="flex gap-1">
            {surveyData?.date ? (
              (() => {
                const dateObj = new Date(surveyData.date)
                const month = String(dateObj.getMonth() + 1).padStart(2, "0")
                const day = String(dateObj.getDate()).padStart(2, "0")
                const year = String(dateObj.getFullYear())
                return (
                  <>
                    <input
                      type="text"
                      value={month.charAt(0)}
                      readOnly
                      className="border border-black w-6 h-4 text-center text-xs"
                    />
                    <input
                      type="text"
                      value={month.charAt(1)}
                      readOnly
                      className="border border-black w-6 h-4 text-center text-xs"
                    />
                    <span className="text-xs">/</span>
                    <input
                      type="text"
                      value={day.charAt(0)}
                      readOnly
                      className="border border-black w-6 h-4 text-center text-xs"
                    />
                    <input
                      type="text"
                      value={day.charAt(1)}
                      readOnly
                      className="border border-black w-6 h-4 text-center text-xs"
                    />
                    <span className="text-xs">/</span>
                    <input
                      type="text"
                      value={year}
                      readOnly
                      className="border border-black w-10 h-4 text-center text-xs"
                    />
                  </>
                )
              })()
            ) : (
              <>
                <input type="text" className="border border-black w-8 h-6 text-center text-xs" />
                <input type="text" className="border border-black w-8 h-6 text-center text-xs" />
                <span className="text-xs">/</span>
                <input type="text" className="border border-black w-8 h-6 text-center text-xs" />
                <input type="text" className="border border-black w-8 h-6 text-center text-xs" />
                <span className="text-xs">/</span>
                <input type="text" className="border border-black w-12 h-6 text-center text-xs" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Address and Contact */}
      <div className="space-y-2 mb-4">
        <div className="flex gap-4">
          <PrintFormField label="Respondent Name" value={surveyData?.informant || ""} width="half" />
          <PrintFormField label="Contact Number" value={surveyData?.informant_contact || ""} width="half" />
        </div>
        <PrintFormField
          label="Address"
          value={`${householdData?.address?.street || ""}, ${householdData?.address?.sitio || ""}, ${householdData?.address?.barangay || ""}, ${householdData?.address?.city || ""}`}
          width="full"
        />

        <div className="flex gap-4">
          <PrintFormField
            label="Name of Household Head"
            value={
              householdHead
                ? `${householdHead.personal_info.last_name}, ${householdHead.personal_info.first_name} ${householdHead.personal_info.middle_name || ""}`.trim()
                : ""
            }
            width="half"
          />
          <PrintFormField label="Contact Number" value={householdHead?.personal_info.contact} width="half" />
        </div>
      </div>

      {/* NHTS and Indigenous Status */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold">NHTS Household:</span>
          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              className="mr-1"
              checked={(() => {
                const raw = householdData?.nhts_status ?? householdData?.nhts
                if (raw == null || String(raw).trim() === "") return false
                return isNonNhts(raw)
              })()}
              readOnly
            />
            Non-NHTS
          </label>
          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              className="mr-1"
              checked={(() => {
                const raw = householdData?.nhts_status ?? householdData?.nhts
                if (raw == null || String(raw).trim() === "") return false
                return isNhts(raw)
              })()}
              readOnly
            />
            NHTS (4Ps)
          </label>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold">Indigenous People:</span>
          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              className="mr-1"
              checked={(() => {
                const raw = data.family_info.family_indigenous
                if (raw == null || String(raw).trim() === "") return false
                return isIndigenous(raw)
              })()}
              readOnly
            />{" "}
            IP
          </label>
          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              className="mr-1"
              checked={(() => {
                const raw = data.family_info.family_indigenous
                if (raw == null || String(raw).trim() === "") return false
                return isNonIp(raw)
              })()}
              readOnly
            />{" "}
            Non-IP
          </label>
        </div>
      </div>

      {/* Father's Information */}
      {fatherData && (
        <div className="border border-black mb-4 p-2">
          <h3 className="text-sm font-bold mb-2">Father's Information</h3>
          <div className="grid grid-cols-6 gap-4 mb-2">
            <div className="col-span-3">
              <PrintFormField
                label="Father's Name"
                value={`${fatherData.personal_info.last_name}, ${fatherData.personal_info.first_name} ${fatherData.personal_info.middle_name || ""}`.trim()}
              />
            </div>
            <div className="col-span-1">
              <PrintFormField
                label="Age"
                value={
                  fatherData.personal_info.date_of_birth
                    ? `${new Date().getFullYear() - new Date(fatherData.personal_info.date_of_birth).getFullYear()}`
                    : ""
                }
              />
            </div>
            <div className="col-span-2">
              <PrintFormField
                label="Birthday"
                value={
                  fatherData.personal_info.date_of_birth
                    ? formatDate(fatherData.personal_info.date_of_birth, "short")
                    : ""
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-2">
            <PrintFormField label="Civil Status" value={fatherData.personal_info.civil_status} />
            <PrintFormField label="Educational Attainment" value={fatherData.personal_info.education} />
            <PrintFormField label="Religion" value={fatherData.personal_info.religion} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <PrintFormField label="Blood Type" value={fatherData.health_details?.blood_type} />
            <PrintFormField
              label="PhilHealth ID"
              value={
                fatherData.per_additional_details?.per_add_philhealth_id ||
                fatherData.health_details?.philhealth_id ||
                ""
              }
            />
            <PrintFormField
              label="COVID Vaccination Status"
              value={
                fatherData.per_additional_details?.per_add_covid_vax_status ||
                fatherData.health_details?.covid_vax_status ||
                ""
              }
            />
          </div>
        </div>
      )}

      {/* Mother's Information */}
      {motherData && (
        <div className="border border-black mb-4 p-2">
          <h3 className="text-sm font-bold mb-2">Mother's Information</h3>
          <div className="grid grid-cols-6 gap-2 mb-2">
            <div className="col-span-3">
              <PrintFormField
                label="Mother's Name"
                value={`${motherData.personal_info.last_name}, ${motherData.personal_info.first_name} ${motherData.personal_info.middle_name || ""}`.trim()}
              />
            </div>
            <div className="col-span-1">
              <PrintFormField
                label="Age"
                value={
                  motherData.personal_info.date_of_birth
                    ? `${new Date().getFullYear() - new Date(motherData.personal_info.date_of_birth).getFullYear()}`
                    : ""
                }
              />
            </div>
            <div className="col-span-2">
              <PrintFormField
                label="Birthday"
                value={
                  motherData.personal_info.date_of_birth
                    ? formatDate(motherData.personal_info.date_of_birth, "short")
                    : ""
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-2">
            <PrintFormField label="Civil Status" value={motherData.personal_info.civil_status} />
            <PrintFormField label="Educational Attainment" value={motherData.personal_info.education} />
            <PrintFormField label="Religion" value={motherData.personal_info.religion} />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-2">
            <PrintFormField label="Blood Type" value={motherData.health_details?.blood_type} />
            <PrintFormField
              label="PhilHealth ID"
              value={
                motherData.per_additional_details?.per_add_philhealth_id ||
                motherData.health_details?.philhealth_id ||
                ""
              }
            />
            <PrintFormField
              label="COVID Vaccination Status"
              value={
                motherData.per_additional_details?.per_add_covid_vax_status ||
                motherData.health_details?.covid_vax_status ||
                ""
              }
            />
          </div>

          {/* Mother Health Info */}
          {motherData.mother_health_info && (
            <div className="mt-4">
              <h4 className="text-xs font-bold mb-2">Health Risk Classification & Family Planning</h4>
              <div className="grid grid-cols-3 gap-4 mb-2">
                <PrintFormField
                  label="LMP Date"
                  value={
                    motherData.mother_health_info.lmp_date
                      ? formatDate(motherData.mother_health_info.lmp_date, "short")
                      : ""
                  }
                />
                <PrintFormField label="Health Risk Class" value={motherData.mother_health_info.health_risk_class} />
                <PrintFormField
                  label="Immunization Status"
                  value={motherData.mother_health_info.immunization_status}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-1">
                <PrintFormField
                  label="Family Planning Method"
                  value={motherData.mother_health_info.family_planning_method}
                />
                <PrintFormField
                  label="Family Planning Source"
                  value={motherData.mother_health_info.family_planning_source}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Children Under 5 Table */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-2 bg-gray-200 p-1">MGA BATA/MGA 0-59 KA BULAN (Under five)</h3>
        <table className="w-full border border-black text-xs">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r border-black p-1 text-left">Pangalan (Magulang sa Magulang)</th>
              <th className="border-r border-black p-1">Kasarian (M/F)</th>
              <th className="border-r border-black p-1">Edad</th>
              <th className="border-r border-black p-1">Birthday (mm/dd/yy)</th>
              <th className="border-r border-black p-1">Relasyon sa HH Head</th>
              <th className="border-r border-black p-1">FIC (encircle)</th>
              <th className="border-r border-black p-1">Nutritional Status</th>
              <th className="p-1">Exclusive BF (encircle)</th>
            </tr>
          </thead>
          <tbody>
            {childrenUnder5.map((child: any, index: number) => (
              <tr key={index} className="border-b border-black">
                <td className="border-r border-black p-1">
                  {`${child.personal_info.last_name}, ${child.personal_info.first_name} ${child.personal_info.middle_name || ""}`.trim()}
                </td>
                <td className="border-r border-black p-1 text-center">{child.personal_info.sex}</td>
                <td className="border-r border-black p-1 text-center">
                  {child.personal_info.date_of_birth
                    ? new Date().getFullYear() - new Date(child.personal_info.date_of_birth).getFullYear()
                    : ""}
                </td>
                <td className="border-r border-black p-1 text-center">
                  {child.personal_info.date_of_birth ? formatDate(child.personal_info.date_of_birth, "short") : ""}
                </td>
                <td className="border-r border-black p-1 text-center">{norm(child.health_details?.relationship_to_hh_head) || 'NONE'}</td>
                <td className="border-r border-black p-1 text-center">{child.under_five?.fic || ''}</td>
                <td className="border-r border-black p-1 text-center">{child.under_five?.nutritional_status || ''}</td>
                <td className="p-1 text-center">{child.under_five?.exclusive_bf || ''}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 3 - childrenUnder5.length) }).map((_, i) => (
              <tr key={`u5-empty-${i}`} className="border-b border-black">
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="p-1">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Children Over 5 Table */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-2 bg-gray-200 p-1">MGA BATA/ANAk NGA 5 KA TUIG PATAAS (Over 5)</h3>
        <table className="w-full border border-black text-xs">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r border-black p-1 text-left">Pangalan (Magulang sa Magulang)</th>
              <th className="border-r border-black p-1">Kasarian (M/F)</th>
              <th className="border-r border-black p-1">Edad</th>
              <th className="border-r border-black p-1">Birthday (mm/dd/yy)</th>
              <th className="border-r border-black p-1">Relasyon sa HH Head</th>
              <th className="border-r border-black p-1">Blood Type</th>
              <th className="border-r border-black p-1">Covid Vax Status</th>
              <th className="p-1">Philhealth ID No.</th>
            </tr>
          </thead>
          <tbody>
            {childrenOver5.map((child: any, index: number) => (
              <tr key={index} className="border-b border-black">
                <td className="border-r border-black p-1">
                  {`${child.personal_info.last_name}, ${child.personal_info.first_name} ${child.personal_info.middle_name || ""}`.trim()}
                </td>
                <td className="border-r border-black p-1 text-center">{child.personal_info.sex}</td>
                <td className="border-r border-black p-1 text-center">
                  {child.personal_info.date_of_birth
                    ? new Date().getFullYear() - new Date(child.personal_info.date_of_birth).getFullYear()
                    : ""}
                </td>
                <td className="border-r border-black p-1 text-center">
                  {child.personal_info.date_of_birth ? formatDate(child.personal_info.date_of_birth, "short") : ""}
                </td>
                <td className="border-r border-black p-1 text-center">{norm(child.health_details?.relationship_to_hh_head) || 'NONE'}</td>
                <td className="border-r border-black p-1 text-center">{child.health_details?.blood_type || ""}</td>
                <td className="border-r border-black p-1 text-center">
                  {child.per_additional_details?.per_add_covid_vax_status || child.health_details?.covid_vax_status || ""}
                </td>
                <td className="p-1 text-center">{child.per_additional_details?.per_add_philhealth_id || child.health_details?.philhealth_id || ""}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 3 - childrenOver5.length) }).map((_, i) => (
              <tr key={`o5-empty-${i}`} className="border-b border-black">
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="border-r border-black p-1">&nbsp;</td>
                <td className="p-1">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DemographicData