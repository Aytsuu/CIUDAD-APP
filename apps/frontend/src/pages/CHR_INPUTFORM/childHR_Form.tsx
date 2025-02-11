import { useState } from "react";
import ChildHRPageLast from "./childHR_pagelast";
import ChildHRPage1 from "./childHR_page1";
import ChildHRPage2 from "./childHR_page2";
import ChildHRPage3 from "./childHR_page3";
import ChildHRPage4 from "./childHR_page4";

// export default function ChildHealthForm() {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [formData, setFormData] = useState({
//     familyNo: "",
//     ufcNo: "",
//     childFname: "",
//     childLname: "",
//     childMname: "",
//     childSex: "",
//     childDob: "",
//     childPob: "",
//     motherFname: "",
//     motherLname: "",
//     motherMname: "",
//     motherAge: "",
//     motherOccupation: "",
//     fatherFname: "",
//     fatherLname: "",
//     fatherMname: "",
//     fatherAge: "",
//     fatherOccupation: "",
//     address: "",
//     landmarks: "",
//     dateNewbornScreening: "",
//     screeningStatus: "",
//     birthWeight: "",
//     birthLength: "",
//     headCircumference: "",
//     chestCircumference: "",
//     deliveryType: "",
//     gestationalAge: "",
//     complications: "",
//   });

//   const handleNext = () => {
//     setCurrentPage((prev) => {
//       console.log("Going to next page:", prev + 1);
//       return prev + 1;
//     });
//   };

//   const handlePrevious = () => {
//     setCurrentPage((prev) => prev - 1);
//   };

//   type FormDataType = typeof formData;
//   const updateFormData = (newData: Partial<FormDataType>) => {
//     setFormData((prev) => ({ ...prev, ...newData }));
//   };

//   const handleSubmit = () => {
//     console.log("Submitting Data:", formData);
//     // Send data to API
//   };

//   return (
//     <>
//       {currentPage === 1 && (
//         <ChildHRPage1 onNext2={handleNext} updateFormData={updateFormData} />
//       )}
//       {currentPage === 2 && (
//         <ChildHRPage2
//           onPrevious1={handlePrevious}
//           onNext3={handleNext}
//           updateFormData={updateFormData}
//         />
//       )}
//       {currentPage === 3 && (
//         <ChildHRPage3
//           onPrevious2={handlePrevious}
//           onNext4={handleNext}
//           updateFormData={updateFormData}
//         />
//       )}
//       {currentPage === 4 && (
//         <ChildHRPageLast
//           onPrevious2={handlePrevious}
//           onSubmitForm={handleSubmit}
//           updateFormData={updateFormData}
//         />
//       )}
//     </>
//   );
// }

export default function ChildHealthForm() {
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
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
    address: "",
    landmarks: "",
    dateNewbornScreening: "",
    screeningStatus: "",
    birthWeight: "",
    birthLength: "",
    headCircumference: "",
    chestCircumference: "",
    deliveryType: "",
    gestationalAge: "",
    complications: "",
    hasDisability:""
  });

  const handleNext = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = () => {
    console.log("Submitting Data:", formData);
    // Send data to API
  };

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
        <ChildHRPageLast
          onPrevious4={handlePrevious}
          onSubmitForm={handleSubmit}
          updateFormData={updateFormData}
          // formData={formData}
        />
      )}
    </>
  );
}
