import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button/button";
import HouseholdProfileForm from "./HouseholdProfileForm";
import { BsChevronLeft } from "react-icons/bs";

export default function HouseholdFormLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = React.useMemo(() => {
        return location.state?.params || {};
    }, [location.state]);


    const formatResidents = React.useCallback(() => {
        if (!params.residents || !params.households) return [];
    
        // Format the data and filter unassigned residents in one step
        return params.residents
            .map((resident: any) => ({
                id: `${resident.per_id} ${resident.per_fname} ${resident.per_mname} ${resident.per_lname}`,
                name: (
                    <div className="flex gap-4 items-center">
                        <span className="bg-green-500 text-white py-1 px-2 text-[14px] rounded-md shadow-md">
                            #{resident.per_id}
                        </span>
                        {`${resident.per_lname}, ${resident.per_fname}, ${resident.per_mname.slice(0, 1)}.`}
                    </div>
                ),
            }))
            .filter((resident: any) => !params.households.some((household: any) => 
                household.per.per_id === resident.id.split(" ")[0]
            ));

    }, [params.residents, params.households]);

    const [residents, setResidents] = React.useState(() => formatResidents());

    // Format sitio
    const getSitio = React.useCallback(() => {
        if (!params.sitio) return [];

        const sitioList = params.sitio.map((item: { sitio_id: string; sitio_name: string }) => ({
            id: String(item.sitio_id),
            name: item.sitio_name,
        }));

        return sitioList;
    }, [params.sitio]);

    // Function to update residents after a new household is registered
    const updateResidents = React.useCallback((newHousehold: any) => {
        setResidents((prevResidents: any) => {
            return prevResidents.filter((resident: any) => resident.id.split(" ")[0] !== newHousehold.per.per_id);
        });
    }, []);

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
                <HouseholdProfileForm 
                    sitio={getSitio()} 
                    residents={residents} 
                    onHouseholdRegistered={updateResidents}
                />
            </div>
        </div>
    );
}