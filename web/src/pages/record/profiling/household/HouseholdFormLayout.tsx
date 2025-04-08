import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button/button";
import HouseholdProfileForm from "./HouseholdProfileForm";
import { BsChevronLeft } from "react-icons/bs";
import { Separator } from "@/components/ui/separator";
import { formatResidents, formatSitio} from "../profilingFormats";

export default function HouseholdFormLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = React.useMemo(() => {
        return location.state?.params || {};
    }, [location.state]);

    const [residents, setResidents] = React.useState(() => formatResidents(params, true));
    const sitio = React.useRef(formatSitio(params))

    // Function to update residents after a new household is registered
    const updateResidents = React.useCallback((newHousehold: any) => {
        setResidents((prevResidents: any) => {
            return prevResidents.filter((resident: any) => resident.id.split(" ")[0] !== newHousehold.per.per_id);
        });
    }, []);

    console.log(params)

    return (
        <div className="w-full flex justify-center">
            <div className="w-1/2 grid gap-4 bg-white p-10 rounded-md">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    {/* Header - Stacks vertically on mobile */}
                    <Button
                        className="text-black p-2 self-start"
                        variant={"outline"}
                        onClick={() => navigate(-1)}
                    >
                        <BsChevronLeft />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                            Household Registration Form
                        </h1>
                        <p className="text-xs sm:text-sm text-darkGray">
                            All fields are required
                        </p>
                    </div>
                </div>

                <Separator className="mb-4"/>

                <HouseholdProfileForm 
                    sitio={sitio.current} 
                    residents={residents} 
                    onHouseholdRegistered={updateResidents}
                />
            </div>
        </div>
    );
}