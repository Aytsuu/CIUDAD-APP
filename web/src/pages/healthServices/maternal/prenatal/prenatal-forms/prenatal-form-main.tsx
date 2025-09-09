"use client"
import { useState, useEffect } from "react"

import { FormProvider } from "react-hook-form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useLocation } from "react-router"

import { type Patient } from "@/components/ui/patientSearch"

import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"
import PrenatalFormFirstPg from "./prenatal-form-page1"
import PrenatalFormSecPg from "./prenatal-form-page2"
import PrenatalFormThirdPg from "./prenatal-form-page3"
import PrenatalFormFourthPq from "./prenatal-form-page4"

import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { capitalize } from "@/helpers/capitalize"
import { useAddPrenatalRecord } from "../../queries/maternalAddQueries" 
import type { PrenatalRecord } from "../../restful-api/maternalPOST" 


const forceCapitalize = (str: string | null | undefined): string => {
  if (!str || str.length === 0) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

interface TTStatusRecord {
  tts_status: string
  tts_date_given: string | null
  // tts_tdap: boolean
}

export default function PrenatalForm() {
  const defaultValues = generateDefaultValues(PrenatalFormSchema)
  const [currentPage, setCurrentPage] = useState(1)
  const [isFromIndividualRecord, setIsFromIndividualRecord] = useState(false)
  const [preselectedPatient, setPreselectedPatient] = useState<Patient | null>(null)
  const [activePregnancyId, setActivePregnancyId] = useState<string | null>(null)

  const navigate = useNavigate()
  const location = useLocation()

  const addPrenatalMutation = useAddPrenatalRecord()

  useEffect(() => {
    if (location.state?.params) {
      const { pregnancyData, pregnancyId } = location.state.params
      
      if (pregnancyData) {
        setIsFromIndividualRecord(true)
        setPreselectedPatient(pregnancyData)
        setActivePregnancyId(pregnancyId)

      } else {
        setIsFromIndividualRecord(false)
        setPreselectedPatient(null)
        setActivePregnancyId(null)
      }
    }
  }, [location.state])

  const form = useForm<z.infer<typeof PrenatalFormSchema>>({
    resolver: zodResolver(PrenatalFormSchema),
    defaultValues,
  })

  const transformData = (data: z.infer<typeof PrenatalFormSchema>): PrenatalRecord => {
    const toNullIfEmpty = (value: string | null | undefined) => (value === "" ? null : value)

    // helper to check if an object has any non-empty/non-null values
    const hasMeaningfulData = (obj: any) => {
      if (!obj) return false
      for (const key in obj) {
        if (
          obj[key] !== null &&
          obj[key] !== undefined &&
          obj[key] !== "" &&
          !(Array.isArray(obj[key]) && obj[key].length === 0)
        ) {
          return true
        }
      }
      return false
    }

    const spouseData = hasMeaningfulData(
      data.motherPersonalInfo.husbandLName ||
      data.motherPersonalInfo.husbandFName ||
      data.motherPersonalInfo.husbandMName ||
      data.motherPersonalInfo.husbandDob,
    )
      ? {
          spouse_type: "Husband",
          spouse_fname: forceCapitalize(data.motherPersonalInfo.husbandFName) || "",
          spouse_mname: forceCapitalize(data.motherPersonalInfo.husbandMName) || "",
          spouse_lname: forceCapitalize(data.motherPersonalInfo.husbandLName) || "",
          spouse_dob: toNullIfEmpty(data.motherPersonalInfo.husbandDob) ?? null,
          spouse_occupation: capitalize(data.motherPersonalInfo.occupation) || "N/A", 
        }
      : undefined

    const previousPregnancyData = hasMeaningfulData(data.previousPregnancy)
      ? {
          date_of_delivery: toNullIfEmpty(data.previousPregnancy.dateOfDelivery) ?? null,
          outcome: forceCapitalize(data.previousPregnancy.outcome) || null, 
          type_of_delivery: forceCapitalize(data.previousPregnancy.typeOfDelivery) || null,
          babys_wt: data.previousPregnancy.babysWt ? parseFloat(data.previousPregnancy.babysWt.toString()) : null,
          gender: forceCapitalize(data.previousPregnancy.gender) || null,
          ballard_score: data.previousPregnancy.ballardScore ? parseFloat(data.previousPregnancy.babysWt.toString()) : null,
          apgar_score: data.previousPregnancy.apgarScore ? parseFloat(data.previousPregnancy.apgarScore.toString()) : null,
        }
      : undefined

    const ancVisitData = hasMeaningfulData(data.ancVisits)
      ? {
          pfav_1st_tri: toNullIfEmpty(data.ancVisits.firstTri) ?? null,
          pfav_2nd_tri: toNullIfEmpty(data.ancVisits.secondTri) ?? null,
          pfav_3rd_tri_one: toNullIfEmpty(data.ancVisits.thirdTriOne) ?? null,
          pfav_3rd_tri_two: toNullIfEmpty(data.ancVisits.thirdTriTwo) ?? null,
        }
      : undefined

    const ttStatusesArray: TTStatusRecord[] = []

    if (data.prenatalVaccineInfo.ttRecordsHistory && data.prenatalVaccineInfo.ttRecordsHistory.length > 0) {
      data.prenatalVaccineInfo.ttRecordsHistory.forEach((record) => {
        if (record.ttStatus && record.ttStatus.trim() !== '') {
          ttStatusesArray.push({
            tts_status: record.ttStatus.trim(),
            tts_date_given: toNullIfEmpty(record.ttDateGiven) ?? null,
          })
        }
      })
    }
    
    if (data.prenatalVaccineInfo.ttStatus && data.prenatalVaccineInfo.ttStatus.trim() !== '') {
      const currentTTRecord = {
        tts_status: data.prenatalVaccineInfo.ttStatus.trim(),
        tts_date_given: toNullIfEmpty(data.prenatalVaccineInfo.ttDateGiven) ?? null,
        tts_tdap: data.prenatalVaccineInfo.isTDAPAdministered === true
      }
      
      const isDuplicateOfHistory = ttStatusesArray.some(existingRecord => 
        existingRecord.tts_status === currentTTRecord.tts_status && 
        existingRecord.tts_date_given === currentTTRecord.tts_date_given
      )
      
      if (!isDuplicateOfHistory) {
        ttStatusesArray.push(currentTTRecord)
        console.log("Adding current form TT record:", currentTTRecord)
      } else {
        console.log("Skipping current form TT record (already in history):", currentTTRecord)
      }
    } else {
      console.log("No current TT record to add (empty or missing)")
    }

    return {
      pat_id: data.pat_id as string, 
      patrec_type: "Prenatal",
      pf_occupation: capitalize(data.motherPersonalInfo.occupation) || "",
      pf_lmp: toNullIfEmpty(data.presentPregnancy.pf_lmp) ?? null,
      pf_edc: toNullIfEmpty(data.presentPregnancy.pf_edc) ?? null,
      previous_complications: forceCapitalize(data.medicalHistory.previousComplications) || null,

      spouse_data: spouseData,

      body_measurement: {
        weight: data.motherPersonalInfo.motherWt || null,
        height: data.motherPersonalInfo.motherHt || null,
      },

      obstetrical_history: {
        obs_ch_born_alive: data.obstetricHistory?.noOfChBornAlive || null,
        obs_living_ch: data.obstetricHistory?.noOfLivingCh || null,
        obs_abortion: data.obstetricHistory?.noOfAbortion  || null,
        obs_still_birth: data.obstetricHistory?.noOfStillBirths || null,
        obs_lg_babies: data.obstetricHistory?.historyOfLBabies || null,
        obs_lg_babies_str: data.obstetricHistory?.historyOfLBabiesStr ?? false,
        obs_gravida: data.presentPregnancy.gravida || null,
        obs_para: data.presentPregnancy.para || null,
        obs_fullterm: data.presentPregnancy.fullterm || null,
        obs_preterm: data.presentPregnancy.preterm || null,
        obs_record_from: "Prenatal", 
      },
      
      medical_history:
      data.medicalHistory.prevIllnessData?.map((item) => ({
        year: item.prevIllnessYr || null,
        ill: typeof item.ill_id === "number"
          ? item.ill_id
          : (typeof item.prevIllness === "number" ? item.prevIllness : null)
      })),

      previous_hospitalizations:
        data.medicalHistory.prevHospitalizationData?.map((item) => ({
          prev_hospitalization: forceCapitalize(item.prevHospitalization) ?? "",
          prev_hospitalization_year: item.prevHospitalizationYr || null,
        })) || [],

      previous_pregnancy_data: previousPregnancyData,

      tt_statuses: ttStatusesArray, 

      lab_results_data:
        data.labResults?.labResultsData?.map((result) => ({
          lab_type: result.lab_type,
          result_date: toNullIfEmpty(result.resultDate) ?? null, 
          to_be_followed: result.toBeFollowed ?? false, 
          document_path: result.documentPath || "",
          remarks: result.labRemarks || "",
          images: result.images || [],
        })) || [],

      anc_visit_data: ancVisitData,

      followup_date: toNullIfEmpty(data.followUpSchedule.followUpDate) ?? null,
      followup_description: "Prenatal Follow-up Visit",

      checklist_data: {
        increased_bp: data.assessmentChecklist.increasedBP ?? false, 
        epigastric_pain: data.assessmentChecklist.epigastricPain ?? false,
        nausea: data.assessmentChecklist.nausea ?? false,
        blurring_vision: data.assessmentChecklist.blurringOfVision ?? false,
        edema: data.assessmentChecklist.edema ?? false,
        severe_headache: data.assessmentChecklist.severeHeadache ?? false,
        abno_vaginal_disch: data.assessmentChecklist.abnormalVaginalDischarges ?? false, // API expects snake_case
        vaginal_bleeding: data.assessmentChecklist.vaginalBleeding ?? false,
        chills_fever: data.assessmentChecklist.chillsFever ?? false,
        diff_in_breathing: data.assessmentChecklist.diffInBreathing ?? false, // Corrected from diff_in_bleeding
        varicosities: data.assessmentChecklist.varicosities ?? false,
        abdominal_pain: data.assessmentChecklist.abdominalPain ?? false,
      },

      birth_plan_data: {
        place_of_delivery_plan: capitalize(data.pregnancyPlan.planPlaceOfDel) || "", 
        newborn_screening_plan: data.pregnancyPlan.planNewbornScreening ?? false, 
      },

      obstetric_risk_code_data: {
        pforc_prev_c_section: data.riskCodes.hasOneOrMoreOfTheFF.prevCaesarian || false,
        pforc_3_consecutive_miscarriages: data.riskCodes.hasOneOrMoreOfTheFF.miscarriages || false,
        pforc_postpartum_hemorrhage: data.riskCodes.hasOneOrMoreOfTheFF.postpartumHemorrhage || false,
      },

      prenatal_care_data:
        data.prenatalCare?.map((item) => ({
          pfpc_date: item.date ?? "",
          pfpc_aog_wks: item.aog.aogWeeks != null && !isNaN(Number(item.aog.aogWeeks)) ? Number(item.aog.aogWeeks) : null,
          pfpc_aog_days: item.aog.aogDays != null && !isNaN(Number(item.aog.aogDays)) ? Number(item.aog.aogDays) : null,
          pfpc_fundal_ht: item.leopoldsFindings.fundalHeight || null,
          pfpc_fetal_hr: item.leopoldsFindings.fetalHeartRate || null,
          pfpc_fetal_pos: item.leopoldsFindings.fetalPosition || "", 
          pfpc_complaints: forceCapitalize(item.notes.complaints) || null, 
          pfpc_advises: forceCapitalize(item.notes.advises) || null, 
        })) || [],

      // Extract BP values from the first prenatal care entry for VitalSigns
      vital_bp_systolic: (data.prenatalCare?.[0]?.bp.systolic != null && !isNaN(data.prenatalCare[0].bp.systolic)) 
        ? data.prenatalCare[0].bp.systolic 
        : null,
      vital_bp_diastolic: (data.prenatalCare?.[0]?.bp.diastolic != null && !isNaN(data.prenatalCare?.[0]?.bp.diastolic))
        ? data.prenatalCare[0].bp.diastolic
        : null,
    }
  }

  // set to next page
  const nextPage = () => {
    setCurrentPage((prev) => prev + 1)

    window.scrollTo(0,0)
  }
  // set to prev page
  const prevPage = () => {
    setCurrentPage((prev) => prev - 1)
  }

  const handleFinalSubmit = async (data: z.infer<typeof PrenatalFormSchema>) => {
    try {
      const validated_data = PrenatalFormSchema.parse(data)
      const transformedData = transformData(validated_data)

      console.log("Transformed Data for API:", transformedData) // Debug log

      await addPrenatalMutation.mutateAsync(transformedData)

    } catch (error) {
      console.error("Error submitting prenatal form: ", error)
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors)
      }
    }
  }

  const handlePatientSubmit = async (pageNumber: number) => {
    let isValid = false
    if (pageNumber === 1) {
      isValid = await form.trigger(["pat_id", "motherPersonalInfo", "obstetricHistory", "medicalHistory"])
      console.log(`Page 1 validation result: ${isValid}, patId: ${form.getValues("pat_id")}`)
      if (!isValid) {
        console.error("Page 1 validation errors:", form.formState.errors)
      }

    } else if (pageNumber === 2) {
      isValid = true
      console.log(`Page 2 validation result: ${isValid}`)

    } else if (pageNumber === 3) {
      isValid = await form.trigger([
        "followUpSchedule",
        "ancVisits",
        "assessmentChecklist",
        "pregnancyPlan",
        "riskCodes",
        "assessedBy",
      ])
      console.log(`Page 3 validation result: ${isValid}`, form.getValues())

    } else if (pageNumber === 4) {
      isValid = await form.trigger("prenatalCare")
      console.log(`Page 4 validation result: ${isValid}`)

      if(isValid){
        const formData = form.getValues()
        await handleFinalSubmit(formData)
        console.log("Page 4 validation passed, form submitted successfully.")

        navigate(-1)
        
        return;
      }
    }

    if (!isValid) {
      console.error(`Form validation failed for page ${pageNumber}`)
      const firstErrorElement = document.querySelector('[data-error="true"]')
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    if (pageNumber < 4) {
      nextPage()
      return
    }
  }

  return (
    <div>
      <FormProvider {...form}>
        {currentPage === 1 && 
          <PrenatalFormFirstPg 
          form={form} 
          onSubmit={() => handlePatientSubmit(1)} 
          isFromIndividualRecord={isFromIndividualRecord}
          preselectedPatient={preselectedPatient}
          activePregnancyId={activePregnancyId}
        />}
        {currentPage === 2 && (
          <PrenatalFormSecPg 
          form={form} 
          onSubmit={() => handlePatientSubmit(2)} 
          back={() => prevPage()} 
        />)}
        {currentPage === 3 && (
          <PrenatalFormThirdPg 
          form={form} 
          onSubmit={() => handlePatientSubmit(3)} 
          back={() => prevPage()} 
          />)}
        {currentPage === 4 && (
          <PrenatalFormFourthPq
            form={form}
            onSubmit={() => handlePatientSubmit(4)}
            back={() => prevPage()}
          />
        )}
      </FormProvider>
    </div>
  )
}
