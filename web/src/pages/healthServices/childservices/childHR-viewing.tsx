import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableViewing } from "@/components/ui/table/data-table-viewing"

const idInfo = [
    {
        name: "FAMILY NO.:", value: "", className: "w-[15rem]"
    },
    {
        name: "UFC NO.:", value: "", className: "w-[15rem]"
    },
]

const personalInfoOne = [
    {
        name: "Name:", value: "", className: "w-[25rem]"
    },
    {
        name: "Sex:", value: "", className: "w-1/4"
    },
    {
        name: "Date of Birth:", value: "", className: "w-[19.2rem]"
    },
    {
        name: "Birth Order:", value: "", className: "w-1/4"
    },
    
]

// personal info one groupings
const personalInfoOneFieldGroups = [
    [personalInfoOne[0], personalInfoOne[1]],
    [personalInfoOne[2], personalInfoOne[3]]
]

const placeOfDelivery = [
    {
        name: "Hospital Gov't/Private", value: "", className: "w-1/4"
    },
    {
        name: "Home", value: "", className: "w-1/4"
    },
    {
        name: "Private Clinic", value: "", className: "w-1/4"
    },
    {
        name: "Lying In", value: "", className: "w-1/4"
    },
    {
        name: "HC", value: "", className: "w-1/4"
    }
]

// place of delivery groupings
const placeOfDeliveryFieldGroups = [
    [placeOfDelivery[0], placeOfDelivery[1]],
    [placeOfDelivery[2], placeOfDelivery[3], placeOfDelivery[4]]
]

const personalInfoTwo = [
    {
        name: "Mother:", value: "", className: "w-[24rem]"
    },
    {
        name: "Age:", value: "", className: "w-1/4"
    },
    {
        name: "Occupation:", value: "", className: "w-[35.5rem]"
    },
    {
        name: "Father:", value: "", className: "w-[24.5rem]"
    },
    {
        name: "Age:", value: "", className: "w-1/4"
    },
    {
        name: "Occupation:", value: "", className: "w-[35.5rem]"
    },
    {
        name: "Complete Address w/ landmarks:", value: "", className: "w-[27rem]"
    },
    {
        name: "Type of Feeding", value: "", className: "w-[33.7rem]"
    },
    {
        name: "Date referred for newborn screening:", value: "", className: "w-[25.3rem]"
    }
]

const personalInfoTwoFieldGroups = [
    [personalInfoTwo[0], personalInfoTwo[1]],
    [personalInfoTwo[2]],
    [personalInfoTwo[3], personalInfoTwo[4]],
    [personalInfoTwo[5]],
    [personalInfoTwo[6]],
    [personalInfoTwo[7]],
    [personalInfoTwo[8]]
]

const childInfo = [
    {
        name: "Data assessed:", value: "", className: " w-[35rem]"
    }, 
    {
        name: "TT status of mother:", value: "", className: "w-[33rem]"
    },
    {
        name: "Anemic children 2-59 mos. Seen:", value: "", className: "w-[28rem]"
    },
    {
        name: "Anemic children 2-59 mos. Given Iron:", value: "", className: "w-[26rem]"
    },
    {
        name: "Birthwt:", value: "", className: "w-1/4"
    },
    {
        name: "If low birth: 2-6 mos. Seen", value: "", className: ""
    },
    {
        name: "2-6 mos. Given Iron", value: "", className: ""
    },
]

const ironDates = [
    {
        name: "Date Iron Started:", value: "", className: "w-[10rem]"
    },
    {
        name: "Completed:", value: "", className: "w-[12.5rem]"
    }
]

const vitaminDates = [
    {
        name: "Vitamin A Given: 1", value: "", className: "w-1/"
    },
    {
        name: "2", value: "", className: "w-1/4"
    },
    {
        name: "3", value: "", className: "w-1/4"
    }
]

type immunizations = {
    typeOfImmunization: string,
    wtIn24hrs: string,
    first: string,
    second: string,
    third: string
}

const columns: ColumnDef<immunizations>[] = [
    {
        accessorKey: "typeOfImmunization",
        header: "Type of Immunization",     
    },
    {
        accessorKey: "wtIn24hrs",
        header: "wt. in 24 hrs",
        cell: ({ row }) => {
            const noInputs = ["PCV", "OPV", "AMV", "Prevalent"].includes(row.original.typeOfImmunization);
        
            return (
                <div className={noInputs ? "bg-black h-8 w-full" : "h-8 w-full"}
                    style={{
                        margin: 0,
                        padding: 0
                    }}
                    ></div>
            );  
        },
    },
    {
        accessorKey: "first",
        header: "1st",
    },
    {
        accessorKey: "second",
        header: "2nd",
    },
    {
        accessorKey: "third",
        header: "3rd",
    }
]

const data = [
    { typeOfImmunization: "BCG", wtIn24hrs: "", first: "", second: "", third: "" },
    { typeOfImmunization: "Hep.B", wtIn24hrs: "", first: "", second: "", third: "" },
    { typeOfImmunization: "PCV", wtIn24hrs: "", first: "", second: "", third: "" },
    { typeOfImmunization: "OPV", wtIn24hrs: "", first: "", second: "", third: "" },
    { typeOfImmunization: "AMV", wtIn24hrs: "", first: "", second: "", third: "" },
    { typeOfImmunization: "Prevalent", wtIn24hrs: "", first: "", second: "", third: "" },
]


// columns and data for postpartum table
const ppcColumns= [
    {
        accessorKey: "ppcDate",
        header: "Date",    
    },
    {
        accessorKey: "ppcAge",
        header: "Age",
    },
    {
        accessorKey: "ppcWt",
        header: "Wt.",
    },
    {
        accessorKey: "ppcTemp",
        header: "Temp",
    },
    {
        accessorKey: "ppcHt",
        header: "Ht.",
    },
    {
        accessorKey: "ppcFindings",
        header: "Findings",
    },
    {
        accessorKey: "ppcNotes",
        header: "Notes",
    }
]

const ppcData = [
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
    { ppcDate: "", ppcAge: "", ppcWt: "", ppcTemp: "", ppcHt: "", ppcFindings: "", ppcNotes: "" },
]

// input line readOnly component
export const InputLine = ({className}: {className: string}) => (
    <Input className={cn("w-1/2 mr-2 border-0 border-b border-black rounded-none", className)} readOnly/>
)


export default function ChildHealthViewing(){
    return(
        <div className="w-full">
            <div className="flex">
                <Link to="/invtablechr">
                    <Button 
                        className="text-black p-2 self-start"
                        variant={"outline"}
                    >
                        <ChevronLeft />
                    </Button>                        
                </Link>
                <div className="flex flex-col sm:flex-row ml-3 justify-between items-start sm:items-center gap-4">
                    <div className="flex-col items-center mb-4">
                        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                            Child Health Record Viewing
                        </h1>
                        <p className="text-xs sm:text-sm text-darkGray">
                            View child's information
                        </p>
                    </div>
                </div>
            </div>
            

            <div className=" w-full mx-auto m-3 p-10 border border-gray-300 bg-white">
                <div className="flex flex-col m-5">
                    <div>
                        <p className="text-center mt-10 text-2xl underline"><b>CHILD HEALTH RECORD</b></p>
                    </div>
                    
                    {/* family no., ufc no. */}
                    <div className="flex flex-col w-full mb-4">
                        {idInfo.map((info) => (
                            <div className="flex justify-end ">
                                <React.Fragment>
                                    <Label className="mt-4 mb-3">{info.name}</Label>
                                    <InputLine className={info.className}/>
                                </React.Fragment>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-row">
                        {/* personal info one */}
                        <div className="flex flex-col w-full">
                            {personalInfoOneFieldGroups.map((group, index) => (
                                <div className="flex mb-3" key={index}>
                                    {group.map((info, i) => (
                                        <React.Fragment key={i}>
                                            <Label className="mt-4">{info.name}</Label>
                                            <InputLine className={info.className} />
                                        </React.Fragment>
                                    ))}
                                </div>
                            ))}
                            
                            <div className="flex mt-5">
                                <Label className="mr-2">Place of Delivery:</Label>
                                <div className="flex flex-col">
                                    {placeOfDeliveryFieldGroups.map((group, index) => (
                                        <div className="flex" key={index}>
                                            {group.map((info, i) => (
                                                <React.Fragment key={i}>
                                                    <RadioGroup>
                                                        <RadioGroupItem value={info.value}/>
                                                    </RadioGroup>
                                                    <Label className="ml-1 mr-7 mb-3">{info.name}</Label>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* personal info two */}
                            {personalInfoTwoFieldGroups.map((group, index) => (
                                <div className="flex mb-3" key={index}>
                                    {group.map((info, i) => (
                                        <React.Fragment key={i}>
                                            <Label className="mt-4">{info.name}</Label>
                                            <InputLine className={info.className}/>
                                        </React.Fragment>
                                    ))}
                                </div>
                            ))}

                            {/* exclusive breastfeeding */}
                            <div className="flex flex-col mt-4">
                                <Label>Exclusive BF check:</Label>
                                <table className="border border-black mr-6">
                                    <thead>
                                        <tr>
                                            <th rowSpan={2} className="w-16 p-4">Dates</th>
                                            <td className="p-2 border border-black w-16"></td>
                                            <td className="p-2 border border-black w-16"></td>
                                            <td className="p-2 border border-black w-16"></td>
                                            <td className="p-2 border border-black w-16"></td>
                                            <td className="p-2 border border-black w-16"></td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border border-black w-16"></td>
                                            <td className="p-2 border border-black w-16"></td>
                                            <td className="p-2 border border-black w-16"></td>
                                            <td className="p-2 border border-black w-16"></td>
                                            <td className="p-2 border border-black w-16"></td>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>

                        {/* immunization table */}
                        <div className="w-full">
                            <div className="flex flex-col">
                                <DataTableViewing columns={columns} data={data}/>
                            
                                <div className="flex flex-col mt-3">
                                    <Label>Child protected at birth:</Label>
                                    {childInfo.map((info) => (
                                        <div className="flex mb-3">
                                            <React.Fragment>
                                                <Label className="mt-4">{info.name}</Label>
                                                <InputLine className={info.className}></InputLine>
                                            </React.Fragment>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            

                            
                        </div>
                    </div>
                    
                    {/* date of iron */}
                    <div className="flex justify-end">
                        <div className="flex flex-col">
                            {ironDates.map((info) => (
                                <div className="flex mb-3">
                                    <React.Fragment>
                                        <Label className="mt-4">{info.name}</Label>
                                        <InputLine className={info.className}/>
                                    </React.Fragment>
                                </div>
                                
                            ))}
                        </div>
                        <div className="flex">
                            {vitaminDates.map((info) => (
                                <React.Fragment>
                                    <Label className="mt-4">{info.name}</Label>
                                    <InputLine className={info.className}/>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* postpartum check table */}
                    <div className="w-full">
                        <DataTableViewing columns={ppcColumns} data={ppcData}/>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}