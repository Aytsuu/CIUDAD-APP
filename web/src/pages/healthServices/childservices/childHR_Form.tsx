import { useState } from "react";
import { FormData } from "@/form-schema/chr-schema";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Search } from "lucide-react";
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
  houseno: "",
  street: "",
  sitio: "",
  barangay: "",
  province: "",
  city: "",
  landmarks: "",
  isTransient: "Resident",

  dateNewbornScreening: "",
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
  
  const handleSubmit = () => {
    console.log("Submitting Data:", formData);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link to="/invtablechr">
          <Button
            className="text-black p-2 mb-2 self-start"
            variant={"outline"}
          >
            <ChevronLeft />
          </Button>
        </Link>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Child Health Record
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patient's information
          </p>
        </div>
      </div>

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
