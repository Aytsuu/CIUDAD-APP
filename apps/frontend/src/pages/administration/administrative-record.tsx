import { useState } from "react";

import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FilterAccordion } from "@/components/ui/filter-accordion";
import { TableCaption } from "@/components/ui/table";
import TableRecord from "./table-record";
import { NewPositionDialog } from "./new-position-dialog";

const categoryOptions = [
    { id: "1", label: "Profiling", checked: false },
    { id: "2", label: "Certification", checked: false },
    { id: "3", label: "Report", checked: false },
  ];

export function AdministrativeRecord(){

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const handleCategoryChange = (id: string, checked: boolean) => {
        setSelectedCategories((prev) =>
        checked ? [...prev, id] : prev.filter((category) => category !== id)
        );
    };

    const handleReset = () => {
        setSelectedCategories([]);
    };

    return(
        <main className="relative w-full h-[100vh] bg-snow flex flex-col justify-center items-center">
            <div className="w-2/3 h-2/3 flex flex-row gap-3">
                <div className="w-full h-full bg-white border border-gray rounded-[10px] p-[10px] flex flex-col gap-2">
                    <Button 
                        className="bg-blue hover:bg-blue hover:opacity-[80%]"
                    > 
                        <Plus /> Register a Staff
                    </Button>
                    <TableRecord/>
                    <PaginationLayout/>
                </div>
                <div className="w-1/4 bg-white border border-gray rounded-[10px] p-[10px] flex flex-col gap-2">
                    <NewPositionDialog/>
                    <FilterAccordion
                        title="Secretary"
                        options={categoryOptions.map((option) => ({
                            ...option,
                            checked: selectedCategories.includes(option.id),
                        }))}
                        selectedCount={selectedCategories.length}
                        onChange={handleCategoryChange}
                        onReset={handleReset}
                    />
                </div>
            </div>  
            <TableCaption>A list of all staffs and positions.</TableCaption>
        </main>
    )

}