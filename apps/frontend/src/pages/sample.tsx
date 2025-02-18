// Reference codes

// import { useState } from "react";
// import ChildHRPageLast from "./childHR_pagelast";
// import ChildHRPage1 from "./childHR_page1";
// import ChildHRPage2 from "./childHR_page2";
// import ChildHRPage3 from "./childHR_page3";
// import ChildHRPage4 from "./childHR_page4";

// // export default function ChildHealthForm() {
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [formData, setFormData] = useState({
// //     familyNo: "",
// //     ufcNo: "",
// //     childFname: "",
// //     childLname: "",
// //     childMname: "",
// //     childSex: "",
// //     childDob: "",
// //     childPob: "",
// //     motherFname: "",
// //     motherLname: "",
// //     motherMname: "",
// //     motherAge: "",
// //     motherOccupation: "",
// //     fatherFname: "",
// //     fatherLname: "",
// //     fatherMname: "",
// //     fatherAge: "",
// //     fatherOccupation: "",
// //     address: "",
// //     landmarks: "",
// //     dateNewbornScreening: "",
// //     screeningStatus: "",
// //     birthWeight: "",
// //     birthLength: "",
// //     headCircumference: "",
// //     chestCircumference: "",
// //     deliveryType: "",
// //     gestationalAge: "",
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

/* *************************************************************************************** */

// export default function ChildHealthForm() {
//   const [currentPage, setCuarrentPage] = useState(1);
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
//     hasDisability:""
//   });

//   const handleNext = () => {
//     setCurrentPage((prev) => prev + 1);
//   };

//   const handlePrevious = () => {
//     setCurrentPage((prev) => prev - 1);
//   };

//   const updateFormData = (newData: Partial<typeof formData>) => {
//     setFormData((prev) => ({ ...prev, ...newData }));
//   };

//   const handleSubmit = () => {
//     console.log("Submitting Data:", formData);
//     // Send data to API
//   };

//   return (
//     <>
//       {currentPage === 1 && (
//         <ChildHRPage1
//           onNext2={handleNext}
//           updateFormData={updateFormData}
//           formData={formData}
//         />
//       )}
//       {currentPage === 2 && (
//         <ChildHRPage2
//           onPrevious1={handlePrevious}
//           onNext3={handleNext}
//           updateFormData={updateFormData}
//           formData={formData}
//         />
//       )}
//       {currentPage === 3 && (
//         <ChildHRPage3
//           onPrevious2={handlePrevious}
//           onNext4={handleNext}
//           updateFormData={updateFormData}
//           formData={formData}
//         />
//       )}
//       {currentPage === 4 && (
//         <ChildHRPage4
//           onPrevious3={handlePrevious}
//           onNext5={handleNext}
//           updateFormData={updateFormData}
//           formData={formData}
//         />
//       )}

//       {currentPage === 5 && (
//         <ChildHRPageLast
//           onPrevious4={handlePrevious}
//           onSubmitForm={handleSubmit}
//           updateFormData={updateFormData}
//           // formData={formData}
//         />
//       )}
//     </>
//   );
// }


/* ***** Family Planning Viewing ***** */

// view.tsx
// interface FamilyPlanningViewProps {
//     data: {
//       clientId: string;
//       philhealthNo: string;
//       nhts: {
//         status: boolean;
//         pantawidStatus: boolean;
//       };
//       personalInfo: {
//         lastName: string;
//         givenName: string;
//         middleInitial: string;
//         dateOfBirth: string;
//         age: number;
//         educationalAttainment: string;
//         occupation: string;
//       };
     
//     };
//   }
  
//   const FamilyPlanningView: React.FC<FamilyPlanningViewProps> = ({ data }) => {
//     return (
//       <div className="max-w-5xl mx-auto p-4 border border-gray-300">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-4">
//           <div className="text-sm">SIDE A</div>
//           <div className="text-center font-bold">FAMILY PLANNING (FP) FORM 1</div>
//           <div className="text-sm">ver 3.0</div>
//         </div>
  
//         {/* Instructions Box */}
//         <div className="border border-black p-3 mb-4 bg-ashGray">
//           <div className="grid grid-cols-3 gap-4">
//             <div className="col-span-2">
//               <p className="text-sm">
//                 <strong>FAMILY PLANNING CLIENT ASSESSMENT RECORD</strong>
//                 <br></br><br></br>
//                 Instructions for Physicians, Nurses, and Midwives: <strong>Make sure that the client is not pregnant by using the question listed in SIDE B.</strong> 
//                 Completely fill out or check the required information. Refer accordingly for any abnormal history/findings for further medical evaluation
//               </p>
//             </div>
//             <div>
//               <div className="mb-2">
//                 <span className="block text-sm font-medium">CLIENT ID:</span>
//                 <span className="block p-1 bg-gray-50">{data.clientId}</span>
//               </div>
//               <div className="mb-2">
//                 <span className="block text-sm font-medium">PHILHEALTH NO.:</span>
//                 <span className="block p-1 bg-gray-50">{data.philhealthNo}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm font-medium">NHTS:</span>
//                 <span className="text-sm">{data.nhts.status ? 'Yes' : 'No'}</span>
//                 <span className="text-sm font-medium ml-4">Pantawid Pamilya Pilipino (4Ps):</span>
//                 <span className="text-sm">{data.nhts.pantawidStatus ? 'Yes' : 'No'}</span>
//               </div>
//             </div>
//           </div>
//         </div>
  
//         {/* Client Information */}
//         <div className="mb-4">
//           <div className="mb-4">
//             <span className="block text-sm font-medium mb-1">NAME OF CLIENT:</span>
//             <div className="grid grid-cols-4 gap-4">
//               <div className="p-1 bg-gray-50">{data.personalInfo.lastName}</div>
//               <div className="p-1 bg-gray-50">{data.personalInfo.givenName}</div>
//               <div className="p-1 bg-gray-50">{data.personalInfo.middleInitial}</div>
//               <div className="grid grid-cols-3 gap-2">
//                 <div className="p-1 bg-gray-50">{data.personalInfo.dateOfBirth}</div>
//                 <div className="p-1 bg-gray-50">{data.personalInfo.age}</div>
//                 <div className="p-1 bg-gray-50">{data.personalInfo.educationalAttainment}</div>
//               </div>
//             </div>
//           </div>
          
//           <div className="mb-4">
//             <span className="block text-sm font-medium mb-1">ADDRESS:</span>
//             <div className="grid grid-cols-5 gap-4">
//               <div className="p-1 bg-gray-50">123</div>
//               <div className="p-1 bg-gray-50">Sampaguita St.</div>
//               <div className="p-1 bg-gray-50">San Antonio</div>
//               <div className="p-1 bg-gray-50">Quezon City</div>
//               <div className="p-1 bg-gray-50">Metro Manila</div>
//             </div>
//             <div className="grid grid-cols-3 gap-4 mt-2">
//               <div className="p-1 bg-gray-50">09123456789</div>
//               <div className="p-1 bg-gray-50">Married</div>
//               <div className="p-1 bg-gray-50">Catholic</div>
//             </div>
//           </div>
  
//           <div className="mb-4">
//             <span className="block text-sm font-medium mb-1">NAME OF SPOUSE:</span>
//             <div className="grid grid-cols-4 gap-4">
//               <div className="p-1 bg-gray-50">Dela Cruz</div>
//               <div className="p-1 bg-gray-50">Juan</div>
//               <div className="p-1 bg-gray-50">R.</div>
//               <div className="grid grid-cols-3 gap-2">
//                 <div className="p-1 bg-gray-50">1988-08-20</div>
//                 <div className="p-1 bg-gray-50">35</div>
//                 <div className="p-1 bg-gray-50">Engineer</div>
//               </div>
//             </div>
//           </div>
  
//           <div className="grid grid-cols-3 gap-4 mb-4">
//             <div>
//               <span className="block text-sm font-medium mb-1">NO. OF LIVING CHILDREN:</span>
//               <div className="p-1 bg-gray-50">2</div>
//             </div>
//             <div>
//               <span className="block text-sm font-medium mb-1">PLAN TO HAVE MORE CHILDREN?</span>
//               <div className="p-1 bg-gray-50">No</div>
//             </div>
//             <div>
//               <span className="block text-sm font-medium mb-1">AVERAGE MONTHLY INCOME:</span>
//               <div className="p-1 bg-gray-50">₱45,000</div>
//             </div>
//           </div>
//         </div>
  
//         {/* Type of Client Section */}
//         <div className="grid grid-cols-2 gap-4 border-t border-gray-300 pt-4">
//           <div>
//             <div className="mb-4">
//               <div className="flex items-center mb-2">
//                 <span className="text-sm font-medium mr-2">☐</span>
//                 <span className="text-sm">New Acceptor</span>
//               </div>
//               <div className="ml-6">
//                 <span className="block text-sm mb-1">Reason for FP:</span>
//                 <div className="flex gap-4">
//                   <span className="text-sm">☒ spacing</span>
//                   <span className="text-sm">☐ limiting</span>
//                   <span className="text-sm">☐ others</span>
//                 </div>
//               </div>
//             </div>
  
//             <div className="mb-4">
//               <div className="flex items-center mb-2">
//                 <span className="text-sm font-medium mr-2">☒</span>
//                 <span className="text-sm">Current User</span>
//               </div>
//               <div className="ml-6">
//                 <div className="flex items-center mb-2">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">Changing Method</span>
//                 </div>
//                 <div className="flex items-center mb-2">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">Changing Clinic</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">Dropout/Restart</span>
//                 </div>
//               </div>
//             </div>
//           </div>
  
//           <div>
//             <span className="block text-sm font-medium mb-2">Method currently used (for Changing Method):</span>
//             <div className="grid grid-cols-3 gap-4">
//               <div>
//                 <div className="flex items-center mb-2">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">COC</span>
//                 </div>
//                 <div className="flex items-center mb-2">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">POP</span>
//                 </div>
//                 <div className="flex items-center mb-2">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">Injectable</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">Implant</span>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex items-center mb-2">
//                   <span className="text-sm font-medium mr-2">☒</span>
//                   <span className="text-sm">IUD</span>
//                 </div>
//                 <div className="flex items-center mb-2">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">Interval</span>
//                 </div>
//                 <div className="flex items-center mb-2">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">Post Partum</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">Condom</span>
//                 </div>
//               </div>
//               <div>
//                 <div className="flex items-center mb-2">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">BOM/CMM</span>
//                 </div>
//                 <div className="flex items-center mb-2">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">BBT</span>
//                 </div>
//                 <div className="flex items-center mb-2">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">STM</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="text-sm font-medium mr-2">☐</span>
//                   <span className="text-sm">SDM</span>
//                 </div>
//         </div>
//       </div>
//       </div>
//       </div>
//       </div>
//     );
//   };
  
//   export default FamilyPlanningView;