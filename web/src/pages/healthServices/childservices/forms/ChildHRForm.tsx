import { useState } from "react";
import { FormData } from "@/form-schema/chr-schema";

import ChildHRPage1 from "./ChildHRPage1";
import ChildHRPage2 from "./ChildHRPage2";
import ChildHRPage3 from "./ChildHRPage3";
import ChildHRPage4 from "./ChildHRPage4";
import LastPage from "./ChildHRPagelast";

// Define initial form data
const initialFormData: FormData = {
  familyNo: "",
  ufcNo: "",
  childFname: "",
  childLname: "",
  childMname: "",
  childSex: "",
  childDob: "",
  childPob: "",
  motherFname: "",
  motherLname: "",
  motherMname: "",
  motherAge: "",
  motherOccupation: "",
  fatherFname: "",
  fatherLname: "",
  fatherMname: "",
  fatherAge: "",
  fatherOccupation: "",
  houseno:"",
  street: "",
  sitio: "",
  barangay: "",
  province: "",
  city: "",
  landmarks: "",
  isTransient: "Resident",

  dateNewbornScreening:"",
  hasDisability: false,
  disabilityTypes: [],
  hasEdema: false,
  edemaSeverity: "",
  BFdates: [],
  ironDates: [],
  vaccines: [],
  vitaminRecords: [],
  vitalSigns: [],
};

export default function ChildHealthForm() {
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
  // Form submission handler
  const handleSubmit = () => {
    console.log("Submitting Data:", formData);
    // Add your submission logic here (e.g., API call)
  };

  // Render the current page based on the currentPage state
  return (
    <>
      {currentPage === 1 && (
        <ChildHRPage1
          onNext2={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
      {currentPage === 2 && (
        <ChildHRPage2
          onPrevious1={handlePrevious}
          onNext3={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
      {currentPage === 3 && (
        <ChildHRPage3
          onPrevious2={handlePrevious}
          onNext4={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
      {currentPage === 4 && (
        <ChildHRPage4
          onPrevious3={handlePrevious}
          onNext5={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
      {currentPage === 5 && (
        <LastPage
          onPrevious4={handlePrevious}
          onSubmit={handleSubmit}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
    </>
  );
}
