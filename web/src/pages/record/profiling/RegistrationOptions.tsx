import { Link } from "react-router"

export default function RegistrationOptions(){
    return(
        // Registration form content
        <div className="mb-4">
            <div className="w-full h-[14rem] sm:h-[18rem] md:h-[20rem] grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Registration Form */}
                <Link
                    to="/resident-registration"
                    className="relative inline-block overflow-hidden group border-2 h-full rounded-lg"
                >
                    {/* Background image */}
                    <div
                    className="absolute inset-0 bg-[url('../assets/images/sanRoqueLogo.svg')] bg-cover bg-center 
                        blur-sm group-hover:blur-none transition-all duration-300"
                    ></div>

                    {/* Overlay for better text visibility */}
                    <div
                    className="absolute inset-0 bg-black/40 group-hover:bg-black/30 
                        transition-all duration-300"
                    ></div>

                    {/* Text content */}
                    <div className="relative flex items-center justify-center h-full">
                        <span className="text-white font-medium">
                            Registration Form
                        </span>
                    </div>
                </Link>
                <Link
                    to="/residentRegistration"
                    className="relative inline-block overflow-hidden group border-2 h-full rounded-lg"
                >
                    {/* Background image */}
                    <div
                    className="absolute inset-0 bg-[url('../assets/images/sanRoqueLogo.svg')] bg-cover bg-center 
                        blur-sm group-hover:blur-none transition-all duration-300"
                    ></div>

                    {/* Overlay for better text visibility */}
                    <div
                    className="absolute inset-0 bg-black/40 group-hover:bg-black/30 
                        transition-all duration-300"
                    ></div>

                    {/* Text content */}
                    <div className="relative flex items-center justify-center h-full">
                        <span className="text-white font-medium">
                            Household Form
                        </span>
                    </div>
                </Link>
            </div>
        </div>
    )
}