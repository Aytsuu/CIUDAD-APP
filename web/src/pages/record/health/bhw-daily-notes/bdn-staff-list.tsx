import { capitalize } from "@/helpers/capitalize";
import sanroqueLogoimg from "@/assets/images/sanroque_logo.jpg";
import { useMaternalStaff } from "@/pages/healthServices/maternal/queries/maternalFetchQueries"

export default function BHWStaffList() {
   const { data: staffList } = useMaternalStaff();

   const bhwStaff = staffList?.staff?.filter(
      (staff: any) => staff.position === "BARANGAY HEALTH WORKERS"
   ) || [];

   return (
      <div className="bg-gradient-to-l from-white to-blue-300 rounded-sm p-4 relative overflow-hidden">
         {/* Logo overlay on the right */}
         <div 
            className="absolute right-0  opacity-50 pointer-events-none w-48 h-48 bg-cover bg-center"
            style={{
               backgroundImage: `url(${sanroqueLogoimg})`,
            }}
         />
         
         {/* Content stays in front */}
         <div className="relative z-10">
         <p className="font-bold text-blue-800">Barangay Health Workers ({bhwStaff.length})</p>
         <div className="grid grid-cols-5 p-4 gap-5">
            {bhwStaff.length > 0 ? (
               bhwStaff.map((staff: any) => (
                  <div 
                     key={staff.staff_id} 
                     className="flex flex-col items-center bg-transparent border-b-4 rounded-sm border-blue-600 px-2 py-1"
                  >
                     <p className="font-medium text-sm text-blue-800">{capitalize(staff.last_name)}, {capitalize(staff.first_name)} {capitalize(staff.middle_name || "")}</p>
                  </div>
               ))
            ) : (
               <div className="col-span-3 text-center text-gray-500 py-4">
                  No Barangay Health Workers found
               </div>
            )}
         </div>
         </div>
      </div>
   )
}