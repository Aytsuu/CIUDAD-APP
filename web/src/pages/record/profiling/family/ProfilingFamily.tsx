import React from "react";
import { Search, Plus, FileInput } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { DataTable } from "@/components/ui/table/data-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { familyColumns } from "../profilingColumns";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import FamilyProfileOptions from "./FamilyProfileOptions";
import LivingSoloForm from "./LivingSoloForm";
import api from "@/api/api";
import { FamilyRecord } from "../profilingTypes";

export default function ProfilingFamily() {

    // Initialize states 
    
    const [residents, setResidents] = React.useState<Record<string, string>[]>([]);
    const [isOptionOpen, setIsOptionOpen] = React.useState(false);
    const [isFamilyFormOpen, setIsFamilyFormOpen] = React.useState(false);
    const [families, setFamilies] = React.useState<FamilyRecord[]>([])
    const hasFetchData = React.useRef(false);

    React.useEffect(()=>{
    if(!hasFetchData.current){
        getResidents() 
        getFamilies()
        hasFetchData.current = true
    }
    }, [])
      
    const getResidents  = React.useCallback(async ()=> {
        try{

            const res = await api.get('profiling/personal/')
            setResidents(res.data)

        } catch (err) {
            console.log(err)
        } 
    }, [])

    const formatFamilyData = (data: any[]): FamilyRecord[] => {
    
        return data.map(item => {

            const building = item.building
            
            return {
                id: item.fam_id || '',
                head: '',
                noOfDependents: item.dependents.length,
                building: building.build_type || '',
                indigenous: item.fam_indigenous || '',
                dateRegistered: item.fam_date_registered || '',
                registeredBy: ''
            }
        });
    };

    const getFamilies = React.useCallback(async () => {

        try {

            const res = await api.get('profiling/family/')
            const formattedData = formatFamilyData(res.data)
            setFamilies(formattedData)

        } catch (err) {
            console.log(err)
        }

    }, [])

    const handleDialogChange = () => {
        setIsOptionOpen(false)
        setIsFamilyFormOpen(true)
    }

    return (
        <div className="w-full">
            <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-semibold text-darkBlue2">Family Records</h1>
                <p className="text-xs sm:text-sm text-darkGray">Manage and view family information</p>
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

                {/* DialogLayout with state management */}
                <DialogLayout
                    trigger={
                        <Button>
                            <Plus /> Register
                        </Button>
                    }
                    mainContent={
                        <FamilyProfileOptions onClose={handleDialogChange} />
                    }
                    isOpen={isOptionOpen}
                    onOpenChange={setIsOptionOpen}
                />

                <DialogLayout 
                    mainContent={<LivingSoloForm residents={residents}/>}
                    title="Register Family"
                    description="Family registration form for individuals living independently. Please fill out all required fields"
                    isOpen={isFamilyFormOpen}
                    onOpenChange={setIsFamilyFormOpen}
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
                            { id: '', name: "Export as CSV" },
                            { id: '', name: "Export as Excel" },
                            { id: '', name: "Export as PDF" },
                        ]}
                    />
                </div>
                <div className="overflow-x-auto">
                    <DataTable columns={familyColumns} data={families} />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
                    <p className="text-xs sm:text-sm text-darkGray">
                        Showing 0 rows
                    </p>
                    <PaginationLayout />
                </div>
            </div>
        </div>
    );
}