// Postpartum Form Viewing

// imports
import React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/table/data-table"

const personalInfo = [
    {
        name: "FAMILY NO.", value: "", className: "w-[150px]"
    },
    {
        name: "Name:", value: "", className: "mr-10 w-[400px]"
    },
    {
        name: "Age:", value: "", className: "w-32"
    },
    {
        name: "Husband's Name:", value: "", className: "mr-10 w-[330px]"
    },
    {
        name: "Address:", value: "", className: "w-[300px]"
    }
]

const personalInfoFieldGroups = [
    [personalInfo[0]], // family no.
    [personalInfo[1], personalInfo[2]], // name. age
    [personalInfo[3], personalInfo[4]] // husband's name, address
]


// delivery info
const deliveryInfo = [
    {
        name: "Date & Time of Delivery:", value: "", className: "mr-10 w-[286px]"
    },
    {
        name: "Place of Delivery:", value: "", className: "w-[240px]"
    },
    {
        name: "Attended by:", value: "", className: "mr-10 w-[360px]"
    },
    {
        name: "Outcome", value: "", className: "w-[300px]"
    }
]

const deliveryInfoFieldGroups = [
    [deliveryInfo[0], deliveryInfo[1]], // date & time of delivery, place of delivery
    [deliveryInfo[2], deliveryInfo[3]] // attended by, outcome
]


// postpartum care info
const postpartumCareInfo = [
    {
        name: "TT Status:", value: "", className: "mr-10 w-[384px]"
    },
    {
        name: "Iron Supplementation:", value: "", className: "w-[230px]"
    },
    {
        name: "Lochial Discharges:", value: "", className: "mr-10 w-[325px]"
    },
    {
        name: "Vit A Supplementation:", value: "", className: "w-[225px]"
    },
    {
        name: "No. of pad / day:", value: "", className: "mr-10 w-[338px]"
    },
    {
        name: "Mebenendazole given (if not given during prenatal):", value: "", className: "w-[130px]"
    },
    {
        name: "Date & Time initiated BF:", value: "", className: "w-[288px]"
    }
]

const postpartumCareInfoFieldGroups = [
    [postpartumCareInfo[0], postpartumCareInfo[1]], // tt status, iron supplementation
    [postpartumCareInfo[2], postpartumCareInfo[3]], // lochial discharges, vit a supplementation
    [postpartumCareInfo[4], postpartumCareInfo[5]], // no. of pad/day, mebendazole
    [postpartumCareInfo[6]] // date & time initiated bf
]


// input line component
export const InputLine = ({className}: {className: string}) => (
<Input className={cn("w-1/2 mr-2 border-0 border-b border-black rounded-none", className)} readOnly/>

)

export default function PostpartumViewing() {
    return(
        <div className="max-w-5xl mx-auto m-5 p-5 border border-gray-300">
            <div>
                <h4 className="text-center text-2xl m-4 pb-3"> <b>POSTPARTUM RECORD</b> </h4>
            </div>

            {/* personal info */}
            <div className="flex flex-col">
                {personalInfoFieldGroups.map((group, index) => (
                    <div className="flex" key={index}>
                        {group.map((info, i) => (
                            <div className="flex items-center">
                                <React.Fragment key={i}>
                                <Label className="mt-4">{info.name}</Label>
                                <InputLine className={info.className}></InputLine>
                            </React.Fragment>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* delivery info */}
            <div className="flex flex-col">
                {deliveryInfoFieldGroups.map((group, index) => (
                    <div className="flex" key={index}>
                        {group.map((info, i) => (
                            <React.Fragment key={i}>
                                <Label className="mt-4">{info.name}</Label>
                                <InputLine className={info.className}></InputLine>
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>

            {/* postpartum care info */}
            <div className="flex flex-col">
                {postpartumCareInfoFieldGroups.map((group, index) => (
                    <div className="flex" key={index}>
                        {group.map((info, i) => (
                            <React.Fragment key={i}>
                                <Label className="mt-4">{info.name}</Label>
                                <InputLine className={info.className}></InputLine>
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>

            {/* postpartum table */}
            <div className="flex">
                {/* <DataTable></DataTable> */}
            </div>
        </div>
    )
}