import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useState } from "react";
import { Label } from "@/components/ui/label";



export const columns: ColumnDef<TreasurerDonation>[] = [
    { accessorKey: "refNo",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Reference No.
                <ArrowUpDown size={14}/>
            </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("refNo")}</div>
        )
    },
    { accessorKey: "donor", header: "Donor"},
    { accessorKey: "itemName", header: "Item Name"},
    { accessorKey: "description", header: "Item Description"},
    { accessorKey: "category", header: "Category"},
    { accessorKey: "quantity", header: "Quantity"},
    { accessorKey: "date",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Date
                <ArrowUpDown size={14}/>
            </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("date")}</div>
        )
    },
    { accessorKey: "receiver", header: "Receiver"},
]

type TreasurerDonation = {
    refNo: string,
    donor: string,
    itemName: string,
    description: string,
    category: string,
    quantity: number,
    date: string,
    receiver: string
}

export const TreasurerDonationRecords: TreasurerDonation[]=[
    {
        refNo: "123456",
        donor: "Lorem Ipsum",
        itemName: "Food Packs",
        description: "Food Packs for children good for 40pax",
        category:"Essential Goods",
        quantity: 40,
        date: "MM-DD-YYYY",
        receiver: "Dolor Sit"
    }
]


function TreasurerDonationTable(){

    let accumulatedCash = 0.00
    const data = TreasurerDonationRecords;
    const filter = [
        {id: "0", name: "All Donation Category"},
        {id: "1", name: "Monetary Donations"},
        {id: "2", name: "Essential Goods"},
        {id: "3", name: "Medical Supplies"},
        {id: "4", name: "Household Items"},
        {id: "5", name: "Educational Supplies"},
        {id: "6", name: "Baby & Childcare Items"},
        {id: "7", name: "Animal Welfare Items"},
        {id: "8", name: "Shelter & Homeless Aid "},
        {id: "9", name: "Disaster Relief Supplies"},
    ] 

    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

    const filteredData = selectedFilter === "All Donation Category" ? data 
    : data.filter((item) => item.category === selectedFilter);
    

    return(
        <div className="mx-4 mb-4 mt-10">
            <div className="text-lg font-semibold leading-none tracking-tight text-darkBlue1">
                    <p>DONATIONS</p><br></br>
            </div>   
             <div className="bg-white border border-gray-300 rounded-[5px] p-5">
                <div className="mb-[1rem] flex flex-row items-center justify-between gap-2">
                        <div className="flex flex-row gap-7">
                            <Input className="w-[20rem]"placeholder="Search"></Input>
                            <div className="flex flex-row gap-2 justify-center items-center">
                                <Label>Filter: </Label>
                                <SelectLayout className="" options={filter} placeholder="Filter" value={selectedFilter} label="" onChange={setSelectedFilter}></SelectLayout>
                            </div>
                        </div>
                </div>
                <div className="p-2">
                    <Label className="text-darkBlue2 text-md">Accumulated Cash Donations: Php {accumulatedCash.toFixed(2)}</Label>
                </div>
                <DataTable columns={columns} data={filteredData} />
             </div>
        </div>
    )
}

export default TreasurerDonationTable;