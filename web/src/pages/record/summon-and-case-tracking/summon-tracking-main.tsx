import CardLayout from "@/components/ui/card/card-layout";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Search, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useState } from "react";

const styles = {
    cardContent: "font-semibold text-[14px]",
    cardInfoRow: "flex flex-grid items-center gap-5",
    cardInfo: "font-sm text-[14px]",
    statusOngoing: "text-[#5B72CF]",
    statusResolved: "text-[#17AD00]",
    statusEscalated: "text-[#FF0000]"
};

function getStatusColor(status: string) {
    switch(status) {
        case "Ongoing":
            return styles.statusOngoing;
        case "Resolved":
            return styles.statusResolved;
        case "Escalated":
            return styles.statusEscalated;
        default:
            return "";
    }
}

function SummonTrackingMain(){  
    const filter = [
        { id: "All", name: "All" },
        { id: "Ongoing", name: "Ongoing" },
        { id: "Resolved", name: "Resolved" },
        { id: "Escalated", name: "Escalated" },
    ];

    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

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
                <Link to='/summon-and-case-view' className="hover:shadow-lg transition-shadow" >
                    <CardLayout
                        title={
                            <div className="flex flex-row">
                                <div className="flex justify-between items-center w-full">
                                    <p className="text-primary flex items-center font-semibold text-xl mb-2">No. 0015</p>
                                </div>
                                <X className="text-gray-500 hover:text-red-600 cursor-pointer" size={20} />
                            </div>
                        }
                        content={
                            <div className="flex flex-col gap-2">
                                <div className={styles.cardInfoRow}>
                                    <p className={styles.cardContent}>Complainant : </p><p className={styles.cardInfo}>Anna Reyes</p>
                                </div>
                                
                                <div className={styles.cardInfoRow}>
                                    <p className={styles.cardContent}>Accused : </p><p className={styles.cardInfo}>John Michael Cruz</p>
                                </div>

                                <div className={styles.cardInfoRow}>
                                    <p className={styles.cardContent}>Incident Type : </p><p className={styles.cardInfo}>Physical Assault</p>
                                </div>

                                <div className={styles.cardInfoRow}>
                                    <p className={styles.cardContent}>Status: </p>
                                    <p className={`${styles.cardInfo} ${getStatusColor("Ongoing")}`}>Ongoing</p>
                                </div>
                            </div>
                        }
                        description={
                            <div className="mb-5">
                                <p>Accused punched the complainant ...</p>
                            </div>
                        }  
                    />
                </Link>  
            </div>
        </div>
    )
}

export default SummonTrackingMain