import CardLayout from "@/components/ui/card/card-layout";
import { Card } from "@/components/ui/card/card";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Search, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useState } from "react";

const styles={
    cardContent: "font-semibold text-[14px]",
}


function SummonTrackingMain(){  
    const filter = [
        { id: "All", name: "All" },
        { id: "Ongoing", name: "Ongoing" },
        { id: "Resolved", name: "Resolved" },
        { id: "Escalated", name: "Escalated" },
    ];

    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);
    // const filteredData = selectedFilter === "All" ? data 
    // : data.filter((item) => item.paymentStat === selectedFilter);

    return(
        <div className="w-full h-full">

            {/* Header */}
            <div className="flex flex-col gap-3 mb-3">
                <div className='flex flex-row gap-4'>
                    <Button className="text-black p-2 self-start" variant={"outline"}><ChevronLeft /></Button>
                    <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                      Summon & Case Tracker
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-darkGray ml-[3.2rem]">
                 Manage summons, schedule hearings, and generate summon and file action documents.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-8" /> 

            {/* Search and Filter*/}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
                {/* Search */}
                <div className="relative w-full sm:w-auto sm:flex-1 max-w-2xl">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                        size={17}
                    />
                    <Input 
                        placeholder="Search..." 
                        className="pl-10 w-full bg-white text-sm" 
                    />
                </div>     

                {/* Filter */}
                <div className='flex flex-row items-center gap-4 w-full sm:w-auto'>
                    <Label className="whitespace-nowrap">Filter: </Label>
                    <SelectLayout className="bg-white w-full sm:w-[200px]" options={filter} placeholder="Filter" value={selectedFilter} label="Status" onChange={setSelectedFilter}/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">   
                <CardLayout
                    title={
                        <p className="text-primary flex items-center font-semibold text-xl">No. 0015</p>
                    }
                    content={
                        <div className="m-3">
                            <div>
                                <p className={styles.cardContent}>Complainant : </p><p>Anna Reyes</p>
                            </div>
                            <p className={styles.cardContent}>Accused : </p><p>John Michael Cruz</p>
                            <p className={styles.cardContent}>Incident Type : </p><p>Physical Assault</p>
                            <p className={styles.cardContent}>Status: </p><p>Ongoing</p>
                        </div>
                    }
                    description="Accused punched the complainant ..."   
                />
            </div>
 
        

        </div>
    )
}

export default SummonTrackingMain