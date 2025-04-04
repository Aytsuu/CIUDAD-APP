import { Link } from "react-router-dom";

export default function FamilyProfileOptions({
  residents,
  households,
}: {
  residents: any[];
  households: any[];
}) {
  return (
    <div className="w-full h-[14rem] sm:h-[18rem] md:h-[20rem] grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Registration Form */}
      <Link
        to="/family-solo-form"
        state={{
          params: {
            residents: residents,
            households: households,
          },
        }}
        className="relative inline-block overflow-hidden group border-2 h-full rounded-lg"
      >
        {/* Text content */}
        <div
          className="relative flex items-center justify-center h-full font-medium cursor-pointer text-white 
                    bg-black/40 hover:bg-buttonBlue/100 transition-all duration-300"
        >
          Living Independently
        </div>
      </Link>
      <Link
        to="/family-form"
        state={{
          params: {
            residents: residents,
            households: households,
          },
        }}
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
