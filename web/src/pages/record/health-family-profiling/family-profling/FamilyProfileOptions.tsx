import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function FamilyProfileOptions() {
  const { user } = useAuth();
  
  // Determine routes based on staff type
  const isHealthStaff = user?.staff?.staff_type === "Health Staff";
    
  const familyRoute = isHealthStaff 
    ? "/family/family-profile-form" 
    : "/profiling/family/form";

  return (
    <div className="w-full h-[14rem] sm:h-[18rem] md:h-[20rem] grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Registration Form */}
      <Link
        to="/profiling/family/form/solo"
        className="relative inline-block overflow-hidden group border-2 h-full rounded-lg"
      >
        <div
          className="relative flex items-center justify-center h-full font-medium cursor-pointer text-white 
                    bg-black/40 hover:bg-buttonBlue/100 transition-all duration-300"
        >
          Living Independently
        </div>
      </Link>
      
      <Link
        to={familyRoute}
        className="relative inline-block overflow-hidden group border-2 h-full rounded-lg"
      >
        {/* Text content */}
        <div
          className="relative flex items-center justify-center h-full font-medium cursor-pointer text-white 
                    bg-black/40 hover:bg-buttonBlue/100 transition-all duration-300"
        >
          Living with Family
        </div>
      </Link>
    </div>
  );
}
// import { Link } from "react-router-dom";

// export default function FamilyProfileOptions() {
//   return (
//     <div className="w-full h-[14rem] sm:h-[18rem] md:h-[20rem] grid grid-cols-1 sm:grid-cols-2 gap-3">
//       {/* Registration Form */}
//       <Link
//         to="/family/family-profile-form"
//         className="relative inline-block overflow-hidden group border-2 h-full rounded-lg"
//       >
//         <div
//           className="relative flex items-center justify-center h-full font-medium cursor-pointer text-white 
//                     bg-black/40 hover:bg-buttonBlue/100 transition-all duration-300"
//         >
//           Family Profile Form
//         </div>
    
        
//       </Link>
//       <Link
//         to="/profiling/family/form"
//         className="relative inline-block overflow-hidden group border-2 h-full rounded-lg"
//       >
//         {/* Text content */}
//         <div
//           className="relative flex items-center justify-center h-full font-medium cursor-pointer text-white 
//                     bg-black/40 hover:bg-buttonBlue/100 transition-all duration-300"
//         >
//           Living with Family
//         </div>
//       </Link>
//     </div>
//   );
// }