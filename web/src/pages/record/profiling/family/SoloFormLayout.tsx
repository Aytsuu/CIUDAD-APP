import React from "react"
import { useNavigate, useLocation } from "react-router"
import { Button } from "@/components/ui/button/button"
import LivingSoloForm from "./LivingSoloForm"
import { BsChevronLeft } from "react-icons/bs"
import { Separator } from "@/components/ui/separator"
import { formatHouseholds, formatResidents } from "../profilingFormats"

export default function SoloFormLayout(){

    const location = useLocation();
    const navigate = useNavigate();

    const params = React.useMemo(() => {
        return location?.state.params || {}
    }, [location.state])

    const residents = React.useMemo(() => {
        return formatResidents(params, false)
    }, [params.residents])

    const households = React.useMemo(() => {
        return formatHouseholds(params)
    }, [params.households])

    return(
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
                            Family Registration Form
                        </h1>
                        <p className="text-xs sm:text-sm text-darkGray">
                            Family registration form for individuals living independently. Please fill out all required fields
                        </p>
                    </div>
                </div>

                <Separator className="mb-4"/>

                <LivingSoloForm 
                    residents={residents}
                    households={households}
                />
            </div>
        </div>
   ) 
}