// // famplanning.tsx
// import { useState, useEffect } from 'react';
// import FamilyPlanningView from './view';

// // Define the interface for our data
// interface FamilyPlanningRecord {
//   clientId: string;
//   philhealthNo: string;
//   nhts: {
//     status: boolean;
//     pantawidStatus: boolean;
//   };
//   personalInfo: {
//     lastName: string;
//     givenName: string;
//     middleInitial: string;
//     dateOfBirth: string;
//     age: number;
//     educationalAttainment: string;
//     occupation: string;
//   };
  
// }

// const FamilyPlanningPage = () => {
//   const [records, setRecords] = useState<FamilyPlanningRecord[]>([]);
//   const [selectedRecord, setSelectedRecord] = useState<FamilyPlanningRecord | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Simulating API call - replace with your actual API call
//     const fetchRecords = async () => {
//       try {
//         // Replace this with your actual API endpoint
//         const response = await fetch('/api/family-planning-records');
//         const data = await response.json();
//         setRecords(data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching records:', error);
//         setLoading(false);
//       }
//     };

//     fetchRecords();
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="p-4">
//       <div className="flex gap-4">
//         {/* Left side - List of records */}
//         <div className="w-1/4">
//           <h2 className="text-lg font-semibold mb-4">Patient Records</h2>
//           <div className="space-y-2">
//             {records.map((record) => (
//               <div
//                 key={record.clientId}
//                 className={`p-2 cursor-pointer rounded ${
//                   selectedRecord?.clientId === record.clientId
//                     ? 'bg-blue-100'
//                     : 'hover:bg-gray-100'
//                 }`}
//                 onClick={() => setSelectedRecord(record)}
//               >
//                 <div className="font-medium">
//                   {`${record.personalInfo.lastName}, ${record.personalInfo.givenName}`}
//                 </div>
//                 <div className="text-sm text-gray-600">{record.clientId}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right side - Selected record view */}
//         <div className="w-3/4">
//           {selectedRecord ? (
//             <FamilyPlanningView data={selectedRecord} />
//           ) : (
//             <div className="text-center text-gray-500 mt-10">
//               Select a patient record to view details
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FamilyPlanningPage;



// clientId: string;
    // philhealthNo: string;
    // nhts: {
    //   status: boolean;
    //   pantawidStatus: boolean;
    // };
    // personalInfo: {
    //   lastName: string;
    //   givenName: string;
    //   middleInitial: string;
    //   dateOfBirth: string;
    //   age: number;
    //   educationalAttainment: string;
    //   occupation: string;
    //   address:{
    //     house_no: string;
    //     street: string;
    //     barangay: string;
    //     municipality: string;
    //     province: string;
    //     contactnum: string;
    //     civil_stat: string;
    //     religion: string;
    //   }
    // };


    
// {/* Client Information */}
// <div className="mb-4 mt-6">
//   <div className="mb-4">
//     <span className="block text-sm font-medium mb-1">
//       NAME OF CLIENT:
//       <span className="border-b-2 border-black inline-block min-w-[300px] text-center">
//         {data.personalInfo.lastName} {data.personalInfo.givenName} {data.personalInfo.middleInitial}
//       </span>
//     </span>
//   </div>
//   {/* Additional Information */}
//   <div className="flex flex-wrap mt-2 gap-4">
//     <div className="text-sm font-medium">
//       Date of Birth:
//       <span className="border-b-2 border-black inline-block w-[120px] text-center ml-2">
//         {data.personalInfo.dateOfBirth}
//       </span>
//     </div>
//     <div className="text-sm font-medium">
//       Age:
//       <span className="border-b-2 border-black inline-block w-[50px] text-center ml-2">
//         {data.personalInfo.age}
//       </span>
//     </div>
//     <div className="text-sm font-medium">
//       Educ. Attain.:
//       <span className="border-b-2 border-black inline-block w-[120px] text-center ml-2">
//         {data.personalInfo.educationalAttainment}
//       </span>
//     </div>
//     <div className="text-sm font-medium">
//       Occupation:
//       <span className="border-b-2 border-black inline-block w-[150px] text-center ml-2">
//         {data.personalInfo.occupation}
//       </span>
//     </div>
//   </div>
// </div>


// <div className="grid grid-cols-4 gap-4">
//   <div className="p-1 bg-gray-50">{data.personalInfo.lastName}</div>
//   <div className="p-1 bg-gray-50">{data.personalInfo.givenName}</div>
//   <div className="p-1 bg-gray-50">{data.personalInfo.middleInitial}</div>
//   <div className="grid grid-cols-3 gap-2">
//     <div className="p-1 bg-gray-50">{data.personalInfo.dateOfBirth}</div>
//     <div className="p-1 bg-gray">{data.personalInfo.age}</div>
//     <div className="p-1 bg-gray-50">{data.personalInfo.educationalAttainment}</div>
//   </div>
// </div>


// <div className="mb-4">
//   <span className="block text-sm font-medium mb-1">ADDRESS:</span>
//   <div className="grid grid-cols-5 gap-4">
//     <div className="p-1 bg-gray-50">123</div>
//     <div className="p-1 bg-gray-50">Sampaguita St.</div>
//     <div className="p-1 bg-gray-50">San Antonio</div>
//     <div className="p-1 bg-gray-50">Quezon City</div>
//     <div className="p-1 bg-gray-50">Metro Manila</div>
//   </div>
//   <div className="grid grid-cols-3 gap-4 mt-2">
//     <div className="p-1 bg-gray-50">09123456789</div>
//     <div className="p-1 bg-gray-50">Married</div>
//     <div className="p-1 bg-gray-50">Catholic</div>
//   </div>
// </div>

// <div className="mb-4">
//   <span className="block text-sm font-medium mb-1">NAME OF SPOUSE:</span>
//   <div className="grid grid-cols-4 gap-4">
//     <div className="p-1 bg-gray-50">Dela Cruz</div>
//     <div className="p-1 bg-gray-50">Juan</div>
//     <div className="p-1 bg-gray-50">R.</div>
//     <div className="grid grid-cols-3 gap-2">
//       <div className="p-1 bg-gray-50">1988-08-20</div>
//       <div className="p-1 bg-gray-50">35</div>
//       <div className="p-1 bg-gray-50">Engineer</div>
//     </div>
//   </div>
// </div>

// <div className="grid grid-cols-3 gap-4 mb-4">
//   <div>
//     <span className="block text-sm font-medium mb-1">NO. OF LIVING CHILDREN:</span>
//     <div className="p-1 bg-gray-50">2</div>
//   </div>
//   <div>
//     <span className="block text-sm font-medium mb-1">PLAN TO HAVE MORE CHILDREN?</span>
//     <div className="p-1 bg-gray-50">No</div>
//   </div>
//   <div>
//     <span className="block text-sm font-medium mb-1">AVERAGE MONTHLY INCOME:</span>
//     <div className="p-1 bg-gray-50">₱45,000</div>
//   </div>
// </div>


// {/* Type of Client Section */}
// <div className="grid grid-cols-2 gap-4 border-t border-gray-300 pt-4">
//   <div>
//     <div className="mb-4">
//       <div className="flex items-center mb-2">
//         <span className="text-sm font-medium mr-2">☐</span>
//         <span className="text-sm">New Acceptor</span>
//       </div>
//       <div className="ml-6">
//         <span className="block text-sm mb-1">Reason for FP:</span>
//         <div className="flex gap-4">
//           <span className="text-sm">☒ spacing</span>
//           <span className="text-sm">☐ limiting</span>
//           <span className="text-sm">☐ others</span>
//         </div>
//       </div>
//     </div>

//     <div className="mb-4">
//       <div className="flex items-center mb-2">
//         <span className="text-sm font-medium mr-2">☒</span>
//         <span className="text-sm">Current User</span>
//       </div>
//       <div className="ml-6">
//         <div className="flex items-center mb-2">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">Changing Method</span>
//         </div>
//         <div className="flex items-center mb-2">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">Changing Clinic</span>
//         </div>
//         <div className="flex items-center">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">Dropout/Restart</span>
//         </div>
//       </div>
//     </div>
//   </div>

//   <div>
//     <span className="block text-sm font-medium mb-2">Method currently used (for Changing Method):</span>
//     <div className="grid grid-cols-3 gap-4">
//       <div>
//         <div className="flex items-center mb-2">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">COC</span>
//         </div>
//         <div className="flex items-center mb-2">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">POP</span>
//         </div>
//         <div className="flex items-center mb-2">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">Injectable</span>
//         </div>
//         <div className="flex items-center">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">Implant</span>
//         </div>
//       </div>
//       <div>
//         <div className="flex items-center mb-2">
//           <span className="text-sm font-medium mr-2">☒</span>
//           <span className="text-sm">IUD</span>
//         </div>
//         <div className="flex items-center mb-2">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">Interval</span>
//         </div>
//         <div className="flex items-center mb-2">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">Post Partum</span>
//         </div>
//         <div className="flex items-center">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">Condom</span>
//         </div>
//       </div>
//       <div>
//         <div className="flex items-center mb-2">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">BOM/CMM</span>
//         </div>
//         <div className="flex items-center mb-2">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">BBT</span>
//         </div>
//         <div className="flex items-center mb-2">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">STM</span>
//         </div>
//         <div className="flex items-center">
//           <span className="text-sm font-medium mr-2">☐</span>
//           <span className="text-sm">SDM</span>
//         </div>
//       </div>
//     </div>

