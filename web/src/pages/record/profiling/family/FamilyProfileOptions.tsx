import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function FamilyProfileOptions() {
  const { user } = useAuth();
  
  // Determine routes based on staff type
  const isHealthStaff = user?.staff?.staff_type === "HEALTH STAFF";
    
  const familyRoute = isHealthStaff 
    ? "/family/family-profile-form" 
    : "/profiling/family/form";

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Living Independently */}
      <Link
        to="/profiling/family/form/solo"
        className="relative inline-block overflow-hidden group border-2 h-[14rem] sm:h-[18rem] md:h-[20rem] rounded-lg"
      >
        <div
          className="relative flex items-center justify-center h-full font-medium cursor-pointer text-white 
                    bg-black/40 hover:bg-buttonBlue/100 transition-all duration-300"
        >
          Living Independently
        </div>
      </Link>
      
      {/* Living with Family - Full profiling */}
      <Link
        to={familyRoute}
        className="relative inline-block overflow-hidden group border-2 h-[14rem] sm:h-[18rem] md:h-[20rem] rounded-lg"
      >
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
