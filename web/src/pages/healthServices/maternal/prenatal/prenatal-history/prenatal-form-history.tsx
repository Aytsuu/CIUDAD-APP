"use client"

import { useLocation } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePrenatalRecordComparison } from "../../queries/maternalFetchQueries"

import { capitalize } from "@/helpers/capitalize"

// Helper function to calculate age from DOB
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// Helper function to calculate BMI
const calculateBMI = (weight: number, height: number): { bmi: string; category: string } => {
  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)
  const bmiValue = bmi.toFixed(1)

  let category = ""
  if (bmi < 18.5) category = "Underweight"
  else if (bmi < 25) category = "Normal"
  else if (bmi < 30) category = "Overweight"
  else category = "Obese"

  return { bmi: bmiValue, category }
}

// Helper function to format date
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function PrenatalFormTableHistory() {
  const location = useLocation()
  const { pregnancyId, visitNumber } = location.state?.params || {}

  const { data: prenatalData, isLoading, error } = usePrenatalRecordComparison(pregnancyId || "")

  if (isLoading) {
    return null;
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">Failed to load prenatal records. Please try again.</div>
  }

  if (!prenatalData?.results || prenatalData.results.length === 0) {
    return <div className="text-center text-gray-500 p-4">No prenatal records found for this pregnancy.</div>
  }

  // Filter records to only show up to the selected visit number
  const allRecords = prenatalData.results
  const records = visitNumber 
    ? allRecords.slice(allRecords.length - visitNumber, allRecords.length)
    : allRecords

  return (
    <div className="p-4 text-xs">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Complete Prenatal History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Field</TableHead>
                {records.map((record: any, index: number) => (
                  <TableHead key={index} className="text-center">
                    Visit {records.length - index}
                    {index === 0 && <span className="text-blue-500 ml-1">[current]</span>}
                    <br />
                    <span className="text-xs text-gray-500">{formatDate(record.created_at)}</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Personal Information Section */}
              <TableRow className="bg-blue-100">
                <TableCell colSpan={records.length + 1} className="font-semibold">
                  Personal Information
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Family No.</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.patient_details?.family?.fam_id || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Name</TableCell>
                {records.map((record: any, index: number) => {
                  const info = record.patient_details?.personal_info
                  const fullName = `${info?.per_fname || ""} ${info?.per_mname || ""} ${info?.per_lname || ""}`.trim()
                  return (
                    <TableCell key={index} className="text-center">
                      {capitalize(fullName || "N/A")}
                    </TableCell>
                  )
                })}
              </TableRow>
              <TableRow>
                <TableCell>Age</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.patient_details?.personal_info?.per_dob
                      ? calculateAge(record.patient_details.personal_info.per_dob)
                      : "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Date of Birth</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {formatDate(record.patient_details?.personal_info?.per_dob)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Husband's Name</TableCell>
                {records.map((record: any, index: number) => {
                  const father = record.patient_details?.family?.family_heads?.father
                  const husbandName = father
                    ? `${father.personal_info?.per_fname || ""} ${father.personal_info?.per_mname || ""} ${father.personal_info?.per_lname || ""}`.trim()
                    : record.spouse_details?.spouse_fname
                      ? `${record.spouse_details.spouse_fname} ${record.spouse_details.spouse_mname || ""} ${record.spouse_details.spouse_lname}`.trim()
                      : "N/A"
                  return (
                    <TableCell key={index} className="text-center">
                      {capitalize(husbandName)}
                    </TableCell>
                  )
                })}
              </TableRow>
              <TableRow>
                <TableCell>Occupation</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.pf_occupation || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Address</TableCell>
                {records.map((record: any, index: number) => {
                  const addr = record.patient_details?.address
                  const fullAddress = addr
                    ? `${addr.add_street || ""}, ${addr.add_sitio || ""}, ${addr.add_barangay || ""}, ${addr.add_city || ""}`.trim()
                    : "N/A"
                  return (
                    <TableCell key={index} className="text-center">
                      {capitalize(fullAddress)}
                    </TableCell>
                  )
                })}
              </TableRow>
              <TableRow>
                <TableCell>Weight (kg)</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.body_measurement_details?.weight || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Height (cm)</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.body_measurement_details?.height || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>BMI</TableCell>
                {records.map((record: any, index: number) => {
                  const weight = record.body_measurement_details?.weight
                  const height = record.body_measurement_details?.height
                  if (weight && height) {
                    const { bmi, category } = calculateBMI(weight, height)
                    return (
                      <TableCell key={index} className="text-center">
                        {bmi}{" "}
                        <Badge variant="outline" className="ml-1">
                          {category}
                        </Badge>
                      </TableCell>
                    )
                  }
                  return (
                    <TableCell key={index} className="text-center">
                      N/A
                    </TableCell>
                  )
                })}
              </TableRow>

              {/* Obstetrical History Section */}
              <TableRow className="bg-blue-100">
                <TableCell colSpan={records.length + 1} className="font-semibold">
                  Obstetrical History
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Children Born Alive</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.obstetric_history?.obs_ch_born_alive ?? "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Living Children</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.obstetric_history?.obs_living_ch ?? "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Abortions</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.obstetric_history?.obs_abortion ?? "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Still Births</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.obstetric_history?.obs_still_birth ?? "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Large Babies (8LBS+)</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.obstetric_history?.obs_lg_babies ?? "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Diabetes History</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.obstetric_history?.obs_lg_babies_str ? "Yes" : "No"}
                  </TableCell>
                ))}
              </TableRow>

              {/* Medical History Section */}
              <TableRow className="bg-blue-100">
                <TableCell colSpan={records.length + 1} className="font-semibold">
                  Medical History
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Previous Illnesses</TableCell>
                {records.map((record: any, index: number) => {
                  const illnesses = record.medical_history || []
                  const uniqueIllnesses = Array.from(
                    new Map(
                      illnesses.map((item: any) => [
                        `${item.illness_name}-${item.ill_date}`,
                        `${item.illness_name} (${item.ill_date})`,
                      ]),
                    ).values(),
                  )
                  return (
                    <TableCell key={index} className="text-center">
                      {uniqueIllnesses.length > 0 ? (
                        <div className="space-y-1">
                          {uniqueIllnesses.map((illness, idx) => (
                            <div key={idx}>{String(illness)}</div>
                          ))}
                        </div>
                      ) : (
                        "None"
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
              <TableRow>
                <TableCell>Previous Hospitalizations</TableCell>
                {records.map((record: any, index: number) => {
                  const hospitalizations = record.previous_hospitalizations || []
                  return (
                    <TableCell key={index} className="text-center">
                      {hospitalizations.length > 0 ? (
                        <div className="space-y-1">
                          {hospitalizations.map((hosp: any, idx: number) => (
                            <div key={idx}>
                              {hosp.prev_hospitalization} ({hosp.prev_hospitalization_year})
                            </div>
                          ))}
                        </div>
                      ) : (
                        "None"
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
              <TableRow>
                <TableCell>Previous Complications</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.previous_complications || "None"}
                  </TableCell>
                ))}
              </TableRow>

              {/* Previous Pregnancy Section */}
              <TableRow className="bg-blue-100">
                <TableCell colSpan={records.length + 1} className="font-semibold">
                  Previous Pregnancy
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Date of Delivery</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {formatDate(record.previous_pregnancy?.date_of_delivery)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Outcome</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.previous_pregnancy?.outcome || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Type of Delivery</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.previous_pregnancy?.type_of_delivery || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Baby's Weight (lbs)</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.previous_pregnancy?.babys_wt || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Gender</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.previous_pregnancy?.gender || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Ballard Score</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.previous_pregnancy?.ballard_score ?? "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>APGAR Score</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.previous_pregnancy?.apgar_score ?? "N/A"}
                  </TableCell>
                ))}
              </TableRow>

              {/* Tetanus Toxoid Status Section */}
              <TableRow className="bg-blue-100">
                <TableCell colSpan={records.length + 1} className="font-semibold">
                  Tetanus Toxoid Status
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TT Status</TableCell>
                {records.map((record: any, index: number) => {
                  const ttStatuses = record.tt_statuses || []
                  return (
                    <TableCell key={index} className="text-center">
                      {ttStatuses.length > 0 ? (
                        <div className="space-y-1">
                          {ttStatuses.map((tt: any, idx: number) => (
                            <div key={idx}>
                              {tt.tts_status} - {formatDate(tt.tts_date_given)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "None"
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>

              {/* Vaccination Records Section */}
              {records.some((r: any) => r.vaccination_records?.length > 0) && (
                <>
                  <TableRow className="bg-blue-100">
                    <TableCell colSpan={records.length + 1} className="font-semibold">
                      Vaccination Records
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Vaccines Administered</TableCell>
                    {records.map((record: any, index: number) => {
                      const vaccines = record.vaccination_records || []
                      return (
                        <TableCell key={index} className="text-center text-xs">
                          {vaccines.length > 0 ? (
                            <div className="space-y-1">
                              {vaccines.map((vac: any, idx: number) => (
                                <div key={idx}>
                                  {vac.vaccine_name} (Dose {vac.dose_number}) - {formatDate(vac.date_administered)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            "None"
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                </>
              )}

              {/* Present Pregnancy Section */}
              <TableRow className="bg-blue-100">
                <TableCell colSpan={records.length + 1} className="font-semibold">
                  Present Pregnancy
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Gravida</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.obstetric_history?.obs_gravida ?? "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Para</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.obstetric_history?.obs_para ?? "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Fullterm</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.obstetric_history?.obs_fullterm ?? "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Preterm</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.obstetric_history?.obs_preterm ?? "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Last Menstrual Period</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {formatDate(record.obstetric_history?.obs_lmp)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Expected Date of Confinement (EDC)</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {formatDate(record.pf_edc)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Assessment & Planning Section */}
              <TableRow className="bg-blue-100">
                <TableCell colSpan={records.length + 1} className="font-semibold">
                  Assessment & Planning
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Laboratory Results</TableCell>
                {records.map((record: any, index: number) => {
                  const labs = record.laboratory_results || []
                  return (
                    <TableCell key={index} className="text-center">
                      {labs.length > 0 ? (
                        <div className="space-y-1">
                          {labs.map((lab: any, idx: number) => (
                            <div key={idx}>
                              {capitalize(lab.lab_type)} - {formatDate(lab.result_date)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "None"
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
              <TableRow>
                <TableCell>Pre-eclampsia Signs</TableCell>
                {records.map((record: any, index: number) => {
                  const checklist = record.checklist_data
                  const trueItems = checklist
                    ? Object.entries(checklist)
                        .filter(([key, value]) => value === true && key !== "pfc_id")
                        .map(([key]) => key.replace(/_/g, " "))
                    : []
                  return (
                    <TableCell key={index} className="text-center">
                      {trueItems.length > 0 ? capitalize(trueItems.join(", ")) : "None"}
                    </TableCell>
                  )
                })}
              </TableRow>
              <TableRow>
                <TableCell>Place of Delivery Plan</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.birth_plan_details?.place_of_delivery_plan || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Newborn Screening Plan</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {record.birth_plan_details?.newborn_screening_plan ? "Yes" : "No"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Micronutrient Supplementation</TableCell>
                {records.map((record: any, index: number) => {
                  const medicines = record.medicine_records || []
                  return (
                    <TableCell key={index} className="text-center text-xs">
                      {medicines.length > 0 ? (
                        <div className="space-y-1">
                          {medicines.map((med: any, idx: number) => (
                            <div key={idx}>
                              {med.medicine_name} ({med.quantity}) - {formatDate(med.requested_at)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "None"
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
              <TableRow>
                <TableCell>Risk Codes</TableCell>
                {records.map((record: any, index: number) => {
                  const risks = record.obstetric_risk_codes
                  const trueRisks = risks
                    ? Object.entries(risks)
                        .filter(([key, value]) => value === true && key !== "pforc_id")
                        .map(([key]) => key.replace(/pforc_/g, "").replace(/_/g, " "))
                    : []
                  return (
                    <TableCell key={index} className="text-center text-xs">
                      {trueRisks.length > 0 ? capitalize(trueRisks.join(", ")) : "None"}
                    </TableCell>
                  )
                })}
              </TableRow>
              <TableRow>
                <TableCell>Assessed By</TableCell>
                {records.map((record: any, index: number) => (
                  <TableCell key={index} className="text-center">
                    {capitalize(record.staff_details?.staff_name) || "N/A"}
                  </TableCell>
                ))}
              </TableRow>

              {/* Prenatal Care Visit Details Section */}
              {records.some((r: any) => r.prenatal_care_entries?.length > 0) && (
                <>
                  <TableRow className="bg-blue-100">
                    <TableCell colSpan={records.length + 1} className="font-semibold">
                      Prenatal Care Visit Details
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Age of Gestation (AOG)</TableCell>
                    {records.map((record: any, index: number) => {
                      const entries = record.prenatal_care_entries || []
                      return (
                        <TableCell key={index} className="text-center text-xs">
                          {entries.length > 0 ? (
                            <div className="space-y-1">
                              {entries.map((entry: any, idx: number) => (
                                <div key={idx}>
                                  {entry.pfpc_aog_wks || 0}w {entry.pfpc_aog_days || 0}d
                                </div>
                              ))}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell>Weight (kg)</TableCell>
                    {records.map((record: any, index: number) => {
                      const entries = record.prenatal_care_entries || []
                      return (
                        <TableCell key={index} className="text-center text-xs">
                          {entries.length > 0 && record.body_measurement_details?.weight
                            ? record.body_measurement_details.weight
                            : "N/A"}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell>Temperature (°C)</TableCell>
                    {records.map((record: any, index: number) => (
                      <TableCell key={index} className="text-center">
                        {record.vital_signs_details?.vital_temp || "N/A"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Pulse Rate (bpm)</TableCell>
                    {records.map((record: any, index: number) => (
                      <TableCell key={index} className="text-center">
                        {record.vital_signs_details?.vital_pulse_rate || "N/A"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Oxygen Saturation (%)</TableCell>
                    {records.map((record: any, index: number) => (
                      <TableCell key={index} className="text-center">
                        {record.vital_signs_details?.vital_o2 || "N/A"}
                      </TableCell>
                    ))}
                  </TableRow> 
                  <TableRow>
                    <TableCell>Respiratory Rate (brpm)</TableCell>
                    {records.map((record: any, index: number) => (
                      <TableCell key={index} className="text-center">
                        {record.vital_signs_details?.vital_rr || "N/A"}
                      </TableCell>
                    ))}
                  </TableRow> 
                  <TableRow>
                    <TableCell>Blood Pressure</TableCell>
                    {records.map((record: any, index: number) => (
                      <TableCell key={index} className="text-center">
                        {record.vital_signs_details?.vital_bp_systolic}/{record.vital_signs_details?.vital_bp_diastolic}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Leopold's Findings</TableCell>
                    {records.map((record: any, index: number) => {
                      const entries = record.prenatal_care_entries || []
                      return (
                        <TableCell key={index} className="text-center text-xs">
                          {entries.length > 0 ? (
                            <div className="space-y-1">
                              {entries.map((entry: any, idx: number) => (
                                <div key={idx}>
                                  FH: {entry.pfpc_fundal_ht || "N/A"}, FHR: {entry.pfpc_fetal_hr || "N/A"}, Fetal Position:{" "}
                                  {entry.pfpc_fetal_pos || "N/A"}
                                </div>
                              ))}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell>Complaints</TableCell>
                    {records.map((record: any, index: number) => {
                      const entries = record.prenatal_care_entries || []
                      return (
                        <TableCell key={index} className="text-center text-xs">
                          {entries.length > 0 ? (
                            <div className="space-y-1">
                              {entries.map((entry: any, idx: number) => (
                                <div key={idx}>{entry.pfpc_complaints || "None"}</div>
                              ))}
                            </div>
                          ) : (
                            "None"
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell>Advises</TableCell>
                    {records.map((record: any, index: number) => {
                      const entries = record.prenatal_care_entries || []
                      return (
                        <TableCell key={index} className="text-center text-xs">
                          {entries.length > 0 ? (
                            <div className="space-y-1">
                              {entries.map((entry: any, idx: number) => (
                                <div key={idx}>{entry.pfpc_advises || "None"}</div>
                              ))}
                            </div>
                          ) : (
                            "None"
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
