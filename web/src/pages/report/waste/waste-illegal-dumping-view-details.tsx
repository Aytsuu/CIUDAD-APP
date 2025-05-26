// import { Button } from "@/components/ui/button/button";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { useUpdateWasteReport } from "./queries/waste-ReportUpdateQueries";

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
//   rep_date_resolved
// }: WasteReportDetailsProps) {


//   const isResolved = !!rep_date_resolved || rep_status === "resolved";
  
//   const { mutate: updateRep } = useUpdateWasteReport(rep_id);


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


//   const handleMarkAsResolved = () => {

//     // Prepare the update data
//     const updateData = {
//       rep_status: "resolved",
//     };
    
//     // Call the mutation
//     updateRep(updateData);
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
//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* Image */}
//         {rep_image && (
//           <div className="lg:w-1/2">
//             <img
//               src={rep_image}
//               alt="Report evidence"
//               className="w-full rounded-md border"
//             />
//           </div>
//         )}

//         {/* Details */}
//         <div className="lg:w-1/2 space-y-4 text-sm text-gray-800">
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
//             <div className="flex mt-6 justify-center">
//                   {/* <Button className="bg-green-100 text-green-800 px-4 py-2 rounded-md border border-green-500 hover:bg-green-200 hover:text-green-900">
//                       ✓ Mark as Resolved
//                   </Button> */}
//                   <ConfirmationModal
//                       trigger={
//                           <Button 
//                             className={`px-4 py-2 rounded-md border ${
//                               isResolved 
//                                 ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
//                                 : "bg-green-100 text-green-800 border border-green-500 hover:bg-green-200 hover:text-green-900"
//                             }`}
//                             disabled={isResolved}
//                           >
//                             ✓ Mark as Resolved
//                           </Button>
//                       }
//                       title="Mark as resolved"
//                       description="Are you sure you want to mark this report as resolved?"
//                       actionLabel="Confirm"
//                       onClick={handleMarkAsResolved}
//                   />                    
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
import { useUpdateWasteReport } from "./queries/waste-ReportUpdateQueries";

interface WasteReportDetailsProps {
  rep_id: number;
  rep_image: string;
  rep_matter: string;
  rep_location: string;
  rep_add_details: string;
  rep_violator: string;
  rep_contact: string;
  rep_status: string;
  rep_date: string;
  rep_date_resolved: string;
}

function WasteIllegalDumpingDetails({
  rep_id,
  rep_image,
  rep_status,
  rep_matter,
  rep_location,
  rep_add_details,
  rep_violator,
  rep_date,
  rep_contact,
  rep_date_resolved
}: WasteReportDetailsProps) {


  const isResolved = !!rep_date_resolved || rep_status === "resolved";
  
  const { mutate: updateRep } = useUpdateWasteReport(rep_id);


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


  const handleMarkAsResolved = () => {

    // Prepare the update data
    const updateData = {
      rep_status: "resolved",
    };
    
    // Call the mutation
    updateRep(updateData);
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
        {/* Image */}
        {rep_image && (
          <div className="lg:w-1/2">
            <img
              src={rep_image}
              alt="Report evidence"
              className="w-full rounded-md border"
            />
          </div>
        )}

        {/* Details */}
        <div className="lg:w-1/2 space-y-4 text-sm text-gray-800 flex flex-col h-full">
          <div className="grid grid-cols-2">
            <div>
              <p className="font-semibold">Sitio</p>
              <p>{rep_location}</p>
            </div>
            <div>
              <p className="font-semibold">Contact Number</p>
              <p>{rep_contact}</p>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div>
              <p className="font-semibold">Violator</p>
              <p>{rep_violator || "Unknown"}</p>
            </div>
            <div>
              <p className="font-semibold">Date and Time</p>
              <p>{formatDate(rep_date)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div>
              <p className="font-semibold">Report Status</p>
              <p>{rep_status || "No additional details provided."}</p>            
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

          {/* Mark as Resolved Button */}
          <div className="mt-auto pt-6">
            <div className="flex justify-center">
                  {/* <Button className="bg-green-100 text-green-800 px-4 py-2 rounded-md border border-green-500 hover:bg-green-200 hover:text-green-900">
                      ✓ Mark as Resolved
                  </Button> */}
                  <ConfirmationModal
                      trigger={
                          <Button 
                            className={`px-4 py-2 rounded-md border ${
                              isResolved 
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                                : "bg-green-100 text-green-800 border border-green-500 hover:bg-green-200 hover:text-green-900"
                            }`}
                            disabled={isResolved}
                          >
                            ✓ Mark as Resolved
                          </Button>
                      }
                      title="Mark as resolved"
                      description="Are you sure you want to mark this report as resolved?"
                      actionLabel="Confirm"
                      onClick={handleMarkAsResolved}
                  />                    
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WasteIllegalDumpingDetails;

