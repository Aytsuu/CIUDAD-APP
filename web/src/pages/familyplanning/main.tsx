import { useState } from "react";
import FamilyPlanningForm from "./FP-page1";
import FamilyPlanningForm2 from "./FP-page2";
import { FormData } from "@/form-schema/FamilyPlanningSchema";

// Define the initial form data structure
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
  typeOfClient: [],
  subTypeOfClient: [],
  reasonForFP: [],
  otherReasonForFP: "",
  reason: [],
  methodCurrentlyUsed: [],
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
    menstrualFlow: [],
    dysmenorrhea: false,
    hydatidiformMole: false,
    ectopicPregnancyHistory: false,
    typeOfLastDelivery: undefined,
    lastMenstrualPeriod: "",
    previousMenstrualPeriod: "",
  },
};

export default function FamPlanningMain() {
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Navigation handlers
  const handleNext = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <>
      {currentPage === 1 && (
        <FamilyPlanningForm
          onNext2={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
      {currentPage === 2 && (
        <FamilyPlanningForm2
          onPrevious1={handlePrevious} // Fixed prop name
          onNext3={handleNext} // Fixed prop name
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
    </>
  );
}
