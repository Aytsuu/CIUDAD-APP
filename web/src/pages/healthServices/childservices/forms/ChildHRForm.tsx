import { useState, useEffect } from "react";
import { FormData } from "@/form-schema/chr-schema";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Search } from "lucide-react";
import ChildHRPage1 from "./ChildHRPage1";
import ChildHRPage2 from "./ChildHRPage2";
import {api2} from "@/api/api";
// import ChildHRPage3 from "./ChildHRPage3";
// import ChildHRPage4 from "./ChildHRPage4";
import LastPage from "./ChildHRPagelast";
import { useNavigate } from "react-router";
// Define initial form data
const initialFormData: FormData = {
  familyNo: "",
  pat_id: "",
  pat_type: "",
  rp_id: "",
  trans_id: "",
  ufcNo: "",
  childFname: "",
  childLname: "",
  childMname: "",
  childSex: "",
  childDob: "",
  childPob: "",
  childAge: "",
  residenceType: "Resident",
  motherFname: "",
  motherLname: "",
  motherMname: "",
  motherAge: "",
  motherdob: "",
  motherOccupation: "",
  fatherFname: "",
  fatherLname: "",
  fatherMname: "",
  fatherAge: "",
  fatherdob: "",
  fatherOccupation: "",
  address: "",
  landmarks: "",
  dateNewbornScreening: "",
  disabilityTypes: [],
  hasEdema: false,
  edemaSeverity: "",
  BFdates: [],
  // vaccines: [],
  vitalSigns: [],
  // hasExistingVaccination: false,
  // existingVaccines: [],
  medicines: [], // Add medicines with an empty array as the default value
  is_anemic: false, // Add is_anemic with a default value of false
  anemic: {
    seen: "",
    given_iron: "",
  },
  birthwt: {
    seen: "",
    given_iron: "",
  },
  staff_id:"",
  status: "recorded", // Default status
  type_of_feeding: "", // Add type_of_feeding with a default value
  tt_status: "", // Add tt_status with a default value

};

// Helper function to load from localStorage
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

export default function ChildHealthForm() {
  const navigate = useNavigate();
  // Load state from localStorage or use defaults
  const [currentPage, setCurrentPage] = useState(() =>
    loadFromLocalStorage("childHealthFormCurrentPage", 1)
  );

  const [formData, setFormData] = useState<FormData>(() =>
    loadFromLocalStorage("childHealthFormData", initialFormData)
  );

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("childHealthFormCurrentPage", currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem("childHealthFormData", JSON.stringify(formData));
  }, [formData]);

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

  


  const handleSubmit = (submittedData: FormData) => {
    

    // try{

    //   if(submittedData.pat_type == "Transient"){
    //     const response =await api2.put("patientrecords/update-transient/", {

    //     })

    //   }

    // }
    // catch (error) {
    // }
    
    // Here you would typically send the data to your API
    // Example: await submitChildHealthRecord(submittedData);
    
    // Clear the form after submission
    setFormData(initialFormData);
    navigate(-1)
    localStorage.removeItem("selectedPatient");
    localStorage.removeItem("childHrFormData");
    // Optionally navigate to a success page or show a success message
    // navigate('/success');
  };


  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => {
            // Clear the stored data after submission if desired
            localStorage.removeItem("selectedPatient");
            localStorage.removeItem("childHrFormData");
            setFormData(initialFormData);
            setCurrentPage(1);
            navigate(-1);
          }}
        >
          <ChevronLeft />
        </Button>
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
          onNext={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
      {currentPage === 2 && (
        <ChildHRPage2
          onPrevious={handlePrevious}
          onNext={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
      {/* {currentPage === 3 && (
        <ChildHRPage3
          onPrevious={handlePrevious}
          onNext={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )} */}
      {/* {currentPage === 4 && (
        <ChildHRPage4
          onPrevious3={handlePrevious}
          onNext5={handleNext}
          updateFormData={updateFormData}
          formData={formData}
        />
      )} */}
      {currentPage === 3 && (
        <LastPage
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
          updateFormData={updateFormData}
          formData={formData}
        />
      )}
    </>
  );
}
