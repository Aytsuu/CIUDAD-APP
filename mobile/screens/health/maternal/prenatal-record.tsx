import React from "react"
import { View, ScrollView, TouchableOpacity } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { FileText, ChevronLeft } from "lucide-react-native"

import { Text } from "@/components/ui/text"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingState } from "@/components/ui/loading-state"
import PageLayout from "@/screens/_PageLayout"
import { usePrenatalRecordComplete } from "../admin/admin-maternal/queries/maternalFETCH"
import { capitalize } from "@/helpers/capitalize"

interface PrenatalRecordProps {
  pfId?: string
}

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

export default function PrenatalRecordHistory({ pfId: propPfId }: PrenatalRecordProps) {
  const params = useLocalSearchParams()
  
  // Get prenatal form ID from props or route params
  const pfId = propPfId || (params?.pfId as string) || ""

  // Fetch prenatal record using the hook
  const { data: prenatalData, isLoading, error } = usePrenatalRecordComplete(pfId)

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">Prenatal Record</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-sm text-red-600 text-center px-4">Failed to load prenatal record. Please try again.</Text>
        </View>
      </PageLayout>
    )
  }

  if (!prenatalData?.prenatal_form) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">Prenatal Record</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <Card className="bg-white border-slate-200 m-4">
          <CardContent className="items-center py-16 px-4">
            <FileText size={64} color="#CBD5E1" />
            <Text className="text-lg font-medium text-slate-700 mb-2 mt-4">No Prenatal Record Available</Text>
            <Text className="text-sm text-slate-600 text-center">No prenatal record found for this pregnancy.</Text>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  const record = prenatalData.prenatal_form
  const personalInfo = record.patient_details?.personal_info
  const address = record.patient_details?.address
  const family = record.patient_details?.family
  const father = family?.family_heads?.father
  const spouse = record.spouse_details
  const bodyMeasurement = record.body_measurement_details
  const obsHistory = record.obstetric_history
  const vitalSigns = record.vital_signs_details
  const birthPlan = record.birth_plan_details
  const prevPregnancy = record.previous_pregnancy

  // Calculate age
  const age = personalInfo?.per_dob ? calculateAge(personalInfo.per_dob) : "N/A"

  // Calculate BMI
  const bmiData = bodyMeasurement?.weight && bodyMeasurement?.height 
    ? calculateBMI(bodyMeasurement.weight, bodyMeasurement.height) 
    : null

  // Format husband name
  const husbandName = father
    ? `${father.personal_info?.per_fname || ""} ${father.personal_info?.per_mname || ""} ${father.personal_info?.per_lname || ""}`.trim()
    : spouse
    ? `${spouse.spouse_fname} ${spouse.spouse_mname || ""} ${spouse.spouse_lname}`.trim()
    : "N/A"

  // Format address
  const fullAddress = address
    ? `${address.add_street || ""}, ${address.add_sitio || ""}, ${address.add_barangay || ""}, ${address.add_city || ""}`.trim()
    : "N/A"

  // Format checklist items
  const checklistData = record.checklist_data
  const preeclampsiaSignsArray = checklistData
    ? Object.entries(checklistData)
        .filter(([key, value]) => value === true && key !== "pfc_id")
        .map(([key]) => key.replace(/_/g, " "))
    : []

  // Format risk codes
  const riskCodes = record.obstetric_risk_codes
  const riskCodesArray = riskCodes
    ? Object.entries(riskCodes)
        .filter(([key, value]) => value === true && key !== "pforc_id")
        .map(([key]) => key.replace(/pforc_/g, "").replace(/_/g, " "))
    : []

  const DataRow = ({ label, value }: { label: string; value: string | number }) => (
    <View className="flex-row border-b border-gray-200 bg-white">
      <View className="flex-1 px-4 py-3 border-r border-gray-300 justify-center">
        <Text className="text-[13px] font-medium text-gray-700">{label}</Text>
      </View>
      <View className="flex-[1.5] px-4 py-3 justify-center">
        <Text className="text-[13px] text-gray-900">{value || "N/A"}</Text>
      </View>
    </View>
  )

  const SectionHeader = ({ title }: { title: string }) => (
    <View className="bg-blue-50 px-4 py-3 border-b border-gray-300">
      <Text className="text-sm font-semibold text-gray-800">{title}</Text>
    </View>
  )

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Prenatal Record</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm mb-4">
          <SectionHeader title="Personal Information" />
          <DataRow label="Family No." value={family?.fam_id || "N/A"} />
          <DataRow label="Name" value={capitalize(`${personalInfo?.per_fname || ""} ${personalInfo?.per_mname || ""} ${personalInfo?.per_lname || ""}`.trim()) || "N/A"} />
          <DataRow label="Age" value={age.toString()} />
          <DataRow label="Date of Birth" value={formatDate(personalInfo?.per_dob || null)} />
          <DataRow label="Husband's Name" value={capitalize(husbandName) || "N/A"} />
          <DataRow label="Occupation" value={record.pf_occupation || "N/A"} />
          <DataRow label="Address" value={capitalize(fullAddress) || ""} />
          <DataRow label="Weight (kg)" value={bodyMeasurement?.weight?.toString() || "N/A"} />
          <DataRow label="Height (cm)" value={bodyMeasurement?.height?.toString() || "N/A"} />
          <DataRow label="BMI" value={bmiData ? `${bmiData.bmi} (${bmiData.category})` : "N/A"} />
        </View>

        <View className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm mb-4">
          <SectionHeader title="Obstetrical History" />
          <DataRow label="Children Born Alive" value={obsHistory?.obs_ch_born_alive?.toString() || "N/A"} />
          <DataRow label="Living Children" value={obsHistory?.obs_living_ch?.toString() || "N/A"} />
          <DataRow label="Abortions" value={obsHistory?.obs_abortion?.toString() || "N/A"} />
          <DataRow label="Still Births" value={obsHistory?.obs_still_birth?.toString() || "N/A"} />
          <DataRow label="Large Babies (8LBS+)" value={obsHistory?.obs_lg_babies?.toString() || "N/A"} />
          <DataRow label="Diabetes History" value={obsHistory?.obs_lg_babies_str ? "Yes" : "No"} />
        </View>

        <View className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm mb-4">
          <SectionHeader title="Medical History" />
          <View className="flex-row border-b border-gray-200 bg-white">
            <View className="flex-1 px-4 py-3 border-r border-gray-300 justify-center">
              <Text className="text-[13px] font-medium text-gray-700">Previous Illnesses</Text>
            </View>
            <View className="flex-[1.5] px-4 py-3 justify-center">
              {record.medical_history && record.medical_history.length > 0 ? (
                <View className="space-y-1">
                  {Array.from(new Map(record.medical_history.map((item: any) => [
                    `${item.illness_name}-${item.ill_date}`,
                    `${item.illness_name} (${item.ill_date})`
                  ])).values()).map((illness, idx) => (
                    <Text key={idx} className="text-[13px] text-gray-900">{String(illness)}</Text>
                  ))}
                </View>
              ) : (
                <Text className="text-[13px] text-gray-900">None</Text>
              )}
            </View>
          </View>
          <View className="flex-row border-b border-gray-200 bg-white">
            <View className="flex-1 px-4 py-3 border-r border-gray-300 justify-center">
              <Text className="text-[13px] font-medium text-gray-700">Previous Hospitalizations</Text>
            </View>
            <View className="flex-[1.5] px-4 py-3 justify-center">
              {record.previous_hospitalizations && record.previous_hospitalizations.length > 0 ? (
                <View className="space-y-1">
                  {record.previous_hospitalizations.map((hosp: any, idx: number) => (
                    <Text key={idx} className="text-[13px] text-gray-900">
                      {hosp.prev_hospitalization} ({hosp.prev_hospitalization_year})
                    </Text>
                  ))}
                </View>
              ) : (
                <Text className="text-[13px] text-gray-900">None</Text>
              )}
            </View>
          </View>
          <DataRow label="Previous Complications" value={record.previous_complications || "None"} />
        </View>

        <View className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm mb-4">
          <SectionHeader title="Previous Pregnancy" />
          <DataRow label="Date of Delivery" value={formatDate(prevPregnancy?.date_of_delivery || null)} />
          <DataRow label="Outcome" value={prevPregnancy?.outcome || "N/A"} />
          <DataRow label="Type of Delivery" value={prevPregnancy?.type_of_delivery || "N/A"} />
          <DataRow label="Baby's Weight (lbs)" value={prevPregnancy?.babys_wt?.toString() || "N/A"} />
          <DataRow label="Gender" value={prevPregnancy?.gender || "N/A"} />
          <DataRow label="Ballard Score" value={prevPregnancy?.ballard_score?.toString() || "N/A"} />
          <DataRow label="APGAR Score" value={prevPregnancy?.apgar_score?.toString() || "N/A"} />
        </View>

        <View className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm mb-4">
          <SectionHeader title="Tetanus Toxoid Status" />
          <View className="flex-row border-b border-gray-200 bg-white">
            <View className="flex-1 px-4 py-3 border-r border-gray-300 justify-center">
              <Text className="text-[13px] font-medium text-gray-700">TT Status</Text>
            </View>
            <View className="flex-[1.5] px-4 py-3 justify-center">
              {record.tt_statuses && record.tt_statuses.length > 0 ? (
                <View className="space-y-1">
                  {record.tt_statuses.map((tt: any, idx: number) => (
                    <Text key={idx} className="text-[13px] text-gray-900">
                      {tt.tts_status} - {formatDate(tt.tts_date_given)}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text className="text-[13px] text-gray-900">None</Text>
              )}
            </View>
          </View>
        </View>

        <View className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm mb-4">
          <SectionHeader title="Present Pregnancy" />
          <DataRow label="Gravida" value={obsHistory?.obs_gravida?.toString() || "N/A"} />
          <DataRow label="Para" value={obsHistory?.obs_para?.toString() || "N/A"} />
          <DataRow label="Fullterm" value={obsHistory?.obs_fullterm?.toString() || "N/A"} />
          <DataRow label="Preterm" value={obsHistory?.obs_preterm?.toString() || "N/A"} />
          <DataRow label="Last Menstrual Period" value={formatDate(obsHistory?.obs_lmp || null)} />
          <DataRow label="Expected Date of Confinement" value={formatDate(record.pf_edc || null)} />
        </View>

        <View className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm mb-4">
          <SectionHeader title="Assessment & Planning" />
          <View className="flex-row border-b border-gray-200 bg-white">
            <View className="flex-1 px-4 py-3 border-r border-gray-300 justify-center">
              <Text className="text-[13px] font-medium text-gray-700">Laboratory Results</Text>
            </View>
            <View className="flex-[1.5] px-4 py-3 justify-center">
              {record.laboratory_results && record.laboratory_results.length > 0 ? (
                <View className="space-y-1">
                  {record.laboratory_results.map((lab: any, idx: number) => (
                    <Text key={idx} className="text-[13px] text-gray-900">
                      {capitalize(lab.lab_type)} - {formatDate(lab.result_date)}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text className="text-[13px] text-gray-900">None</Text>
              )}
            </View>
          </View>
          <DataRow label="Pre-eclampsia Signs" value={preeclampsiaSignsArray.length > 0 ? capitalize(preeclampsiaSignsArray.join(", ")) ?? "None" : "None"} />
          <DataRow label="Place of Delivery Plan" value={birthPlan?.place_of_delivery_plan || "N/A"} />
          <DataRow label="Newborn Screening Plan" value={birthPlan?.newborn_screening_plan ? "Yes" : "No"} />
          <View className="flex-row border-b border-gray-200 bg-white">
            <View className="flex-1 px-4 py-3 border-r border-gray-300 justify-center">
              <Text className="text-[13px] font-medium text-gray-700">Micronutrient Supplementation</Text>
            </View>
            <View className="flex-[1.5] px-4 py-3 justify-center">
              {record.medicine_records && record.medicine_records.length > 0 ? (
                <View className="space-y-1">
                  {record.medicine_records.map((med: any, idx: number) => (
                    <Text key={idx} className="text-[13px] text-gray-900">
                      {med.medicine_name} ({med.quantity}) - {formatDate(med.requested_at)}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text className="text-[13px] text-gray-900">None</Text>
              )}
            </View>
          </View>
          <DataRow label="Risk Codes" value={riskCodesArray.length > 0 ? riskCodesArray.join(", ") : "None"} />
          <DataRow label="Assessed By" value={record.staff_details?.staff_name || "N/A"} />
        </View>

        {record.prenatal_care_entries && record.prenatal_care_entries.length > 0 && (
          <View className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm mb-4">
            <SectionHeader title="Prenatal Care Visit Details" />
            <View className="flex-row border-b border-gray-200 bg-white">
              <View className="flex-1 px-4 py-3 border-r border-gray-300 justify-center">
                <Text className="text-[13px] font-medium text-gray-700">Age of Gestation</Text>
              </View>
              <View className="flex-[1.5] px-4 py-3 justify-center">
                <View className="space-y-1">
                  {record.prenatal_care_entries.map((entry: any, idx: number) => (
                    <Text key={idx} className="text-[13px] text-gray-900">
                      {entry.pfpc_aog_wks || 0}w {entry.pfpc_aog_days || 0}d
                    </Text>
                  ))}
                </View>
              </View>
            </View>
            <DataRow label="Weight (kg)" value={bodyMeasurement?.weight?.toString() || "N/A"} />
            <DataRow label="Blood Pressure" value={`${vitalSigns?.vital_bp_systolic || "N/A"}/${vitalSigns?.vital_bp_diastolic || "N/A"}`} />
            <View className="flex-row border-b border-gray-200 bg-white">
              <View className="flex-1 px-4 py-3 border-r border-gray-300 justify-center">
                <Text className="text-[13px] font-medium text-gray-700">Leopold's Findings</Text>
              </View>
              <View className="flex-[1.5] px-4 py-3 justify-center">
                <View className="space-y-1">
                  {record.prenatal_care_entries.map((entry: any, idx: number) => (
                    <Text key={idx} className="text-[13px] text-gray-900">
                      FH: {entry.pfpc_fundal_ht || "N/A"}, FHR: {entry.pfpc_fetal_hr || "N/A"}, Pos: {entry.pfpc_fetal_pos || "N/A"}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
            <View className="flex-row border-b border-gray-200 bg-white">
              <View className="flex-1 px-4 py-3 border-r border-gray-300 justify-center">
                <Text className="text-[13px] font-medium text-gray-700">Complaints</Text>
              </View>
              <View className="flex-[1.5] px-4 py-3 justify-center">
                <View className="space-y-1">
                  {record.prenatal_care_entries.map((entry: any, idx: number) => (
                    <Text key={idx} className="text-[13px] text-gray-900">{entry.pfpc_complaints || "None"}</Text>
                  ))}
                </View>
              </View>
            </View>
            <View className="flex-row border-b border-gray-200 bg-white">
              <View className="flex-1 px-4 py-3 border-r border-gray-300 justify-center">
                <Text className="text-[13px] font-medium text-gray-700">Advises</Text>
              </View>
              <View className="flex-[1.5] px-4 py-3 justify-center">
                <View className="space-y-1">
                  {record.prenatal_care_entries.map((entry: any, idx: number) => (
                    <Text key={idx} className="text-[13px] text-gray-900">{entry.pfpc_advises || "None"}</Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {record.vaccination_records && record.vaccination_records.length > 0 && (
          <View className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm mb-4">
            <SectionHeader title="Vaccination Records" />
            <View className="flex-row border-b border-gray-200 bg-white">
              <View className="flex-1 px-4 py-3 border-r border-gray-300 justify-center">
                <Text className="text-[13px] font-medium text-gray-700">Vaccines Administered</Text>
              </View>
              <View className="flex-[1.5] px-4 py-3 justify-center">
                <View className="space-y-1">
                  {record.vaccination_records.map((vac: any, idx: number) => (
                    <Text key={idx} className="text-[13px] text-gray-900">
                      {vac.vaccine_name} (Dose {vac.dose_number}) - {formatDate(vac.date_administered)}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </PageLayout>
  )
}
