import React from "react";
import { Search, Plus, FileInput} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { DataTable } from "@/components/ui/table/data-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { householdColumns } from "../profilingColumns";
import HouseholdProfileForm from "./HouseholdProfileForm";
import { HouseholdRecord } from "../profilingTypes";
import api from "@/api/api";




export default function ProfilingHousehold(){

    const [households, setHouseholds] = React.useState<HouseholdRecord[]>([])
    const hasFetchData = React.useRef(false)

    React.useEffect(()=> {
        if(!hasFetchData.current){ 
            getHouseholds()
            hasFetchData.current = true
        }
    })

    const formatHouseholdData = (data: any[]): HouseholdRecord[] => {

        return data.map((item)=> {

            const sitio = item.sitio
            const personal = item.per

            return {
                id: item.hh_id || '',
                streetAddress: item.hh_street || '',
                sitio: sitio?.sitio_name || '',
                nhts: item.hh_nhts || '',
                head: personal?.per_fname + ' ' + personal?.per_lname || '',
                dateRegistered: item.hh_date_registered || '',
                registeredBy: ''
            }
        })

    }

    const getHouseholds = React.useCallback(async () => {
        try {

            const res = await api.get('profiling/household/')
            const formattedData = formatHouseholdData(res.data)
            setHouseholds(formattedData)

        } catch (err) {
            console.log(err)
        }
    },[])

    return (
        <div className="w-full">
            <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-semibold text-darkBlue2">Household Records</h1>
                <p className="text-xs sm:text-sm text-darkGray">Manage and view household information</p>
            </div>

            <hr className="border-gray mb-6 sm:mb-8" />

            <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="flex gap-2">
            <div className="relative flex-1 bg-white">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
                <Input
                    placeholder="Search..." 
                    className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={''}
                    onChange={() => {}}
                    />
                </div>

                </div>
                <DialogLayout
                    trigger={
                        <Button>
                            <Plus size={15} /> Register
                        </Button>
                    }
                    title="Household Registration"
                    description="All fields are required"
                    mainContent={<HouseholdProfileForm/>}
                />
            </div>

            <div className="bg-white rounded-md">
                <div className="flex justify-between p-3">
                <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm">Show</p>
                    <Input
                        type="number"
                        className="w-14 h-6"
                        value={''}
                        onChange={() => {}}
                        min="1"
                    />
                    <p className="text-xs sm:text-sm">Entries</p>
                </div>
                <DropdownLayout
                    trigger={
                        <Button variant="outline">
                            <FileInput className="mr-2" /> Export
                        </Button>
                    }
                    options={[
                    { id: '', name: "Export as CSV"},
                    { id: '', name: "Export as Excel"},
                    { id: '', name: "Export as PDF"},
                    ]}
                />
                </div>
                <div className="overflow-x-auto">
                    <DataTable columns={householdColumns} data={households} />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
                    <p className="text-xs sm:text-sm text-darkGray">
                        Showing 0 rows
                    </p>
                    <PaginationLayout/>
                </div>
            </div>
        </div>
    )
}