
import { fp_obstetrical, fp_record, physical_exam, fp_type, risk_sti, risk_vaw, acknowledgement, pelvic_exam, pregnancy_check } from "./request-db/PostRequest"
import { useState } from "react"
import FamilyPlanningForm from "./FpPage1"
import FamilyPlanningForm2 from "./FpPage2"
import FamilyPlanningForm3 from "./FpPage3"
import FamilyPlanningForm4 from "./FpPage4"
import FamilyPlanningForm5 from "./FpPage5"
import FamilyPlanningForm6 from "./FpPage6"
import type { FormData } from "@/form-schema/FamilyPlanningSchema"
import { data } from "react-router"



// Initial form data structure
const initialFormData: FormData = {
  pat_id: "",
  fpt_id: "",
  clientID: "",
  philhealthNo: "",
  nhts_status: false,
  pantawid_4ps: false,
  lastName: "",
  givenName: "",
  middleInitial: "",
  dateOfBirth: "",
  age: 0,
  educationalAttainment: "",
  occupation: "",
  address: {
    houseNumber: "",
    street: "",
    barangay: "",
    municipality: "",
    province: "",
  },
  spouse: {
    s_lastName: "",
    s_givenName: "",
    s_middleInitial: "",
    s_dateOfBirth: "",
    s_age: 0,
    s_occupation: "",
  },
  numOfLivingChildren: 0,
  planToHaveMoreChildren: false,
  averageMonthlyIncome: "",
  typeOfClient: "",
  subTypeOfClient: "",
  reasonForFP: "",
  otherReasonForFP: "",
  reason: "",
  otherReason: "",
  methodCurrentlyUsed: undefined,
  otherMethod: "",
  medicalHistory: {
    severeHeadaches: false,
    strokeHeartAttackHypertension: false,
    hematomaBruisingBleeding: false,
    breastCancerHistory: false,
    severeChestPain: false,
    coughMoreThan14Days: false,
    jaundice: false,
    unexplainedVaginalBleeding: false,
    abnormalVaginalDischarge: false,
    phenobarbitalOrRifampicin: false,
    smoker: false,
    disability: false,
    disabilityDetails: "",
  },
  obstetricalHistory: {
    g_pregnancies: 0,
    p_pregnancies: 0,
    fullTerm: 0,
    premature: 0,
    abortion: 0,
    livingChildren: 0,
    lastDeliveryDate: "",
    typeOfLastDelivery: undefined,
    lastMenstrualPeriod: "",
    previousMenstrualPeriod: "",
    menstrualFlow: "Scanty",
    dysmenorrhea: false,
    hydatidiformMole: false,
    ectopicPregnancyHistory: false,
  },
  sexuallyTransmittedInfections: {
    abnormalDischarge: false,
    dischargeFrom: undefined,
    sores: false,
    pain: false,
    history: false,
    hiv: false,
  },
  violenceAgainstWomen: {
    unpleasantRelationship: false,
    partnerDisapproval: false,
    domesticViolence: false,
    referredTo: undefined,
    otherReferral: "",
  },
  weight: "",
  height: "",
  bloodPressure: "",
  pulseRate: "",
  skinExamination: "normal",
  conjunctivaExamination: "normal",
  neckExamination: "normal",
  breastExamination: "normal",
  abdomenExamination: "normal",
  extremitiesExamination: "normal",
  pelvicExamination: "normal",
  cervicalConsistency: "firm",
  cervicalTenderness: false,
  cervicalAdnexalMassTenderness: false,
  uterinePosition: "mid",
  uterineDepth: "",
  acknowledgement: {
    selectedMethod: "coc",
    clientSignature: "",
    clientSignatureDate: new Date().toISOString().split("T")[0],
    guardianName: "",
    guardianSignature: "",
    guardianSignatureDate: new Date().toISOString().split("T")[0],
  },
  serviceProvisionRecords: [],
  pregnancyCheck: {
    breastfeeding: false,
    abstained: false,
    recent_baby: false,
    recent_period: false,
    recent_abortion: false,
    using_contraceptive: false,
  },
  isTransient: "Resident",
  patientId: undefined,
}

export default function FamilyPlanningMain() {
  const [currentPage, setCurrentPage] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => {
    console.log("Moving to next page, current data:", formData)
    setCurrentPage((prev) => prev + 1)
  }

  const handlePrevious = () => {
    setCurrentPage((prev) => prev - 1)
  }

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleSubmit = async () => {
    console.log("All datas submitted: ", formData)
    try{
      const fprecord_id = await fp_record(formData)
      const fpt_id = await fp_type(formData,fprecord_id)
      formData.fpt_id = fpt_id

      await fp_type(formData,fprecord_id)
      await fp_obstetrical(formData,fprecord_id)
      await risk_sti(formData,fprecord_id)
      await risk_vaw(formData,fprecord_id)
      await fp_obstetrical(formData,fprecord_id)
      await physical_exam(formData,fprecord_id)
      await pregnancy_check(formData,fprecord_id)
      await pelvic_exam(formData,fprecord_id)
      await acknowledgement(formData,fprecord_id)

      console.log("All datas submitted: ", formData)

    // risk_sti(formData)
    // risk_vaw(formData)
    // physical_exam(formData)
    // fp_type(formData)
    // fp_record(formData)
    // fp_obstetrical(formData)
    // fp_findings(formData)
    console.log("📌 Submitting with pat_id:", formData.pat_id)
   
    alert("Form submitted successfully!")
  } catch (err) {
    console.error("Error submitting form:", err)
    alert("Something went wrong while submitting the form.")
  }
}


  return (
    <>
     

      {currentPage === 1 && (
        <FamilyPlanningForm onNext2={handleNext} updateFormData={updateFormData} formData={formData} />
      )}
      {currentPage === 2 && (
        <FamilyPlanningForm2
          onPrevious1={handlePrevious}
          onNext3={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
      {currentPage === 3 && (
        <FamilyPlanningForm3
          onPrevious2={handlePrevious}
          onNext4={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
      {currentPage === 4 && (
        <FamilyPlanningForm4
          onPrevious3={handlePrevious}
          onNext5={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
      {currentPage === 5 && (
        <FamilyPlanningForm5
          onPrevious4={handlePrevious}
          onNext6={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
      {currentPage === 6 && (
        <FamilyPlanningForm6
          onPrevious5={handlePrevious}
          onSubmitFinal={handleSubmit}
          updateFormData={updateFormData}
          formData={formData}
         
        />
      )}
    </>
  )
}