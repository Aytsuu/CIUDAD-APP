"use client"
import { acknowledgement, obstetrical, physical_exam, risks_sti, risks_vaw } from "./PostRequest"
import { useState } from "react"
import FamilyPlanningForm from "./FpPage1"
import FamilyPlanningForm2 from "./FpPage2"
import FamilyPlanningForm3 from "./FpPage3"
import FamilyPlanningForm4 from "./FpPage4"
import FamilyPlanningForm5 from "./FpPage5"
import FamilyPlanningForm6 from "./FpPage6"
import type { FormData } from "@/form-schema/FamilyPlanningSchema"

const initialFormData: FormData = {
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
    menstrualFlow: undefined,
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
  skinNormal: false,
  skinPale: false,
  skinYellowish: false,
  skinHematoma: false,
  conjunctivaNormal: false,
  conjunctivaPale: false,
  conjunctivaYellowish: false,
  neckNormal: false,
  neckMass: false,
  neckEnlargedLymphNodes: false,
  breastNormal: false,
  breastMass: false,
  breastNippleDischarge: false,
  abdomenNormal: false,
  abdomenMass: false,
  abdomenVaricosities: false,
  extremitiesNormal: false,
  extremitiesEdema: false,
  extremitiesVaricosities: false,
  pelvicNormal: false,
  pelvicMass: false,
  pelvicAbnormalDischarge: false,
  pelvicCervicalAbnormalities: false,
  pelvicWarts: false,
  pelvicPolypOrCyst: false,
  pelvicInflammationOrErosion: false,
  pelvicBloodyDischarge: false,
  cervicalConsistencyFirm: false,
  cervicalConsistencySoft: false,
  cervicalTenderness: false,
  cervicalAdnexalMassTenderness: false,
  uterinePositionMid: false,
  uterinePositionAnteflexed: false,
  uterinePositionRetroflexed: false,
  uterineDepth: "",
  acknowledgement: {
    selectedMethod: "coc",
    clientSignature: "",
    clientSignatureDate: "",
    guardianName: "",
    guardianSignature: "",
    guardianSignatureDate: "",
  },
  serviceProvisionRecords: [],
}

export default function FamilyPlanningMain() {
  const [currentPage, setCurrentPage] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)

  const handleNext = () => {
    try {
      console.log("Moving to next page, current data:", formData)
      setCurrentPage((prev) => prev + 1)
    } catch (error) {
      console.error("Validation Error:", error)
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentPage((prev) => prev - 1)
  }

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleSubmit = () => {
    console.log("Submitting data: ", formData)
    obstetrical(formData)
    risks_sti(formData)
    risks_vaw(formData)
    physical_exam(formData)
    acknowledgement(formData)
    alert("Form submitted successfully!")
  }

  return (
    <>
      {currentPage === 1 && (
        <FamilyPlanningForm onNext2={handleNext}
        updateFormData={updateFormData}
        formData={formData} />
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

