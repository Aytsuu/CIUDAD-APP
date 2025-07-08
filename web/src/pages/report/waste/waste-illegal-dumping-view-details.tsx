// import { Button } from "@/components/ui/button/button";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import DialogLayout from "@/components/ui/dialog/dialog-layout"
// import { useUpdateWasteReport } from "./queries/waste-ReportUpdateQueries";
// import WasteReportResolved from "./waste-illegal-dumping-update";

// interface WasteReportDetailsProps {
//   rep_id: number;
//   rep_image: string;
//   rep_matter: string;
//   rep_location: string;
//   rep_add_details: string;
//   rep_violator: string;
//   rep_contact: string;
//   rep_status: string;
//   rep_date: string;
//   rep_date_resolved: string;
//   rep_resolved_img: string;
// }

// function WasteIllegalDumpingDetails({
//   rep_id,
//   rep_image,
//   rep_status,
//   rep_matter,
//   rep_location,
//   rep_add_details,
//   rep_violator,
//   rep_date,
//   rep_contact,
//   rep_date_resolved,
//   rep_resolved_img
// }: WasteReportDetailsProps) {

//   const isResolved = !!rep_date_resolved || rep_status === "resolved";

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
    
//     // Get date components
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
    
//     // Get time components
//     let hours = date.getHours();
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     const ampm = hours >= 12 ? 'PM' : 'AM';
//     hours = hours % 12;
//     hours = hours ? hours : 12; // the hour '0' should be '12'
    
//     return `${year}-${month}-${day} at ${hours}:${minutes} ${ampm}`;
//   };

//   return (
//     <div className="w-full h-full space-y-6">
//       {/* Header */}
//       <div className="space-y-2">
//         <div className="flex flex-wrap justify-center">
//             <span className="bg-gray text-sm text-black-100 px-3 py-1 rounded">
//                 {rep_matter}
//             </span>
//         </div>
//       </div>

//       {/* Body */}
//       <div className="flex flex-col lg:flex-row gap-6 h-full">
//         {/* Images Container */}
//         <div className="lg:w-1/2 space-y-6"> {/* Increased space-y for better separation */}
//           {/* Original Report Image */}
//           {rep_image && (
//             <div className="w-full relative">
//               <span className="absolute top-2 left-2 bg-white bg-opacity-80 px-2 text-sm font-medium text-gray-700">
//                 Report Evidence
//               </span>
//               <div className="w-full aspect-video bg-gray-100 rounded-md overflow-hidden mt-2">
//                 <img
//                   src={rep_image}
//                   alt="Report evidence"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//             </div>
//           )}
          
//           {/* Resolved Image - only show if exists */}
//           {rep_resolved_img && (
//             <div className="w-full relative">
//               <span className="absolute top-2 left-2 bg-white bg-opacity-80 px-2 text-sm font-medium text-gray-700">
//                 Resolution Evidence
//               </span>
//               <div className="w-full aspect-video bg-gray-100 rounded-md overflow-hidden mt-2">
//                 <img
//                   src={rep_resolved_img}
//                   alt="Resolution evidence"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Details */}
//         <div className="lg:w-1/2 space-y-4 text-sm text-gray-800 flex flex-col h-full">
//           <div className="grid grid-cols-2">
//             <div>
//               <p className="font-semibold">Sitio</p>
//               <p>{rep_location}</p>
//             </div>
//             <div>
//               <p className="font-semibold">Contact Number</p>
//               <p>{rep_contact}</p>
//             </div>
//           </div>

//           <div className="grid grid-cols-2">
//             <div>
//               <p className="font-semibold">Violator</p>
//               <p>{rep_violator || "Unknown"}</p>
//             </div>
//             <div>
//               <p className="font-semibold">Date and Time</p>
//               <p>{formatDate(rep_date)}</p>
//             </div>
//           </div>

//           <div className="grid grid-cols-2">
//             <div>
//               <p className="font-semibold">Report Status</p>
//               <p>{rep_status || "No additional details provided."}</p>            
//             </div>
//             {rep_date_resolved && (
//               <div>
//                 <p className="font-semibold">Date & Time Resolved</p>
//                 <p>{formatDate(rep_date_resolved)}</p>              
//               </div>
//             )}
//           </div>

//           <div>
//             <p className="font-semibold">Report Details</p>
//             <p className="pb-3">{rep_add_details || "No additional details provided."}</p>
//           </div>

//           {/* Mark as Resolved Button */}
//           <div className="mt-auto pt-6">
//             <div className="flex justify-center">
//               <DialogLayout   
//                   trigger=
//                   {
//                     <div 
//                       className={`px-4 py-2 rounded-md border ${
//                         isResolved 
//                           ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
//                           : "bg-green-100 text-green-800 border border-green-500 hover:bg-green-200 hover:text-green-900"
//                       }`}
//                     >
//                       ✓ Mark as Resolved
//                     </div>
//                   }
//                   className="max-w-[30%] h-[340px] flex flex-col overflow-auto"
//                   title="Proof of Resolution"
//                   description="Please provide an image of resolution"
//                   mainContent={<WasteReportResolved rep_id={rep_id} is_resolve={isResolved}/>}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default WasteIllegalDumpingDetails;




import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { useUpdateWasteReport } from "./queries/waste-ReportUpdateQueries";
import WasteReportResolved from "./waste-illegal-dumping-update";

interface WasteReportDetailsProps {
  rep_id: number;
  // rep_image: string;
  rep_matter: string;
  rep_location: string;
  rep_add_details: string;
  rep_violator: string;
  rep_contact: string;
  rep_status: string;
  rep_date: string;
  rep_date_resolved: string;
  rep_resolved_img: string;
  sitio_id: number;
  sitio_name: string;
  waste_report_file: {
      wrf_id: number;
      wrf_url: string;
  }[];
}

function WasteIllegalDumpingDetails({
  rep_id,
  // rep_image,
  rep_status,
  rep_matter,
  rep_location,
  rep_add_details,
  rep_violator,
  rep_date,
  rep_contact,
  rep_date_resolved,
  rep_resolved_img,
  sitio_id,
  sitio_name,
  waste_report_file
}: WasteReportDetailsProps) {

  const isResolved = !!rep_date_resolved || rep_status === "resolved";

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Get date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get time components
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${year}-${month}-${day} at ${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap justify-center">
            <span className="bg-gray text-sm text-black-100 px-3 py-1 rounded">
                {rep_matter}
            </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Images Container */}
        <div className="lg:w-1/2 space-y-6">
          {/* Original Report Image */}
          {waste_report_file[0].wrf_url && (
            <div className="w-full relative">
              <span className="absolute top-2 left-2 bg-white bg-opacity-80 px-2 text-sm font-medium text-gray-700">
                Report Evidence
              </span>
              <div className="w-full aspect-video bg-gray-100 rounded-md overflow-hidden mt-2">
                <img
                  src={waste_report_file[0].wrf_url}
                  alt="Report evidence"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          
          {/* Resolved Image - only show if exists */}
          {rep_resolved_img && (
            <div className="w-full relative">
              <span className="absolute top-2 left-2 bg-white bg-opacity-80 px-2 text-sm font-medium text-gray-700">
                Resolution Evidence
              </span>
              <div className="w-full aspect-video bg-gray-100 rounded-md overflow-hidden mt-2">
                <img
                  src={rep_resolved_img}
                  alt="Resolution evidence"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Details Container */}
        <div className="lg:w-1/2 flex flex-col h-full">
          <div className="flex-grow space-y-4 text-sm text-gray-800 overflow-auto">
            <div className="grid grid-cols-2">
              <div>
                <p className="font-semibold">Sitio</p>
                <p>{sitio_name}</p>
              </div>
              <div>
                <p className="font-semibold">Location</p>
                <p>{rep_location}</p>
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div>
                <p className="font-semibold">Contact Number</p>
                <p>{rep_contact}</p>
              </div>
              <div>
                <p className="font-semibold">Violator</p>
                <p>{rep_violator || "Unknown"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div>
                <p className="font-semibold">Date and Time</p>
                <p>{formatDate(rep_date)}</p>
              </div>
              <div>
                <p className="font-semibold pb-2">Report Status</p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(rep_status)}`}>
                  {rep_status || "No status provided"}
                </div>      
              </div>
              {rep_date_resolved && (
                <div>
                  <p className="font-semibold">Date & Time Resolved</p>
                  <p>{formatDate(rep_date_resolved)}</p>              
                </div>
              )}
            </div>

            <div>
              <p className="font-semibold">Report Details</p>
              <p className="pb-3">{rep_add_details || "No additional details provided."}</p>
            </div>
          </div>

          {/* Mark as Resolved Button - Now properly anchored to bottom */}
          <div className="pt-6 sticky bottom-0 bg-white">
            <div className="flex justify-center">
              <DialogLayout   
                trigger={
                  <div 
                    className={`px-4 py-2 rounded-md text-sm border ${
                      isResolved 
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                        : "bg-green-100 text-green-800 text-12px border border-green-500 hover:bg-green-200 hover:text-green-900"
                    }`}
                  >
                    ✓ Mark as Resolved
                  </div>
                }
                className="max-w-[30%] h-[340px] flex flex-col overflow-auto"
                title="Proof of Resolution"
                description="Please provide an image"
                mainContent={<WasteReportResolved rep_id={rep_id} is_resolve={isResolved}/>}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WasteIllegalDumpingDetails;