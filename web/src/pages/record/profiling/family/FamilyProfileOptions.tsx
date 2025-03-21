import { Link } from "react-router-dom";

interface FamilyProfileOptionsProps {
    onClose: () => void;
}

export default function FamilyProfileOptions({ onClose }: FamilyProfileOptionsProps) {
    return (
        <div className="w-full h-[14rem] sm:h-[18rem] md:h-[20rem] grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Registration Form */}
            <div 
                className="relative inline-block overflow-hidden group border-2 h-full rounded-lg"
                onClick={onClose} // Close the dialog when this option is clicked
            >
                {/* Text content */}
                <div className="relative flex items-center justify-center h-full font-medium cursor-pointer text-white 
                    bg-black/40 hover:bg-buttonBlue/100 transition-all duration-300"
                >
                    Living Independently
                </div>
            </div>
            <Link
                to="/family-form"
                className="relative inline-block overflow-hidden group border-2 h-full rounded-lg"
            >
                {/* Text content */}
                <div className="relative flex items-center justify-center h-full font-medium cursor-pointer text-white 
                    bg-black/40 hover:bg-buttonBlue/100 transition-all duration-300"
                >
                    Living with Family
                </div>
            </Link>
        </div>
    );
}