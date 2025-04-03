import { Button } from "@/components/ui/button/button"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import RatesFormPage4 from "./rates-form-page4"
import { DataTable } from "@/components/ui/table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Pen, Trash} from 'lucide-react';
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"

type PurposeAndAmount = {
    purpose: string;
    amount: string;
}

type Props = {
    onNext5: () => void; 
    onPrevious3: () => void; 
};

const formatNumber = (value: string) => {
    return `₱${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

export const columns: ColumnDef<PurposeAndAmount>[] = [
    { accessorKey: 'purpose', header: "Purpose"},
    { accessorKey: 'amount', header: 'Amount',
        cell: ({ row }) => {
            const amount = row.original.amount
            return `${formatNumber(amount)}`
        }
    },
    { accessorKey: "action", header: "Action",
        cell: ({}) =>(
            <div className="flex justify-center gap-2">
                <TooltipLayout
                trigger={
                    <DialogLayout
                        trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><Pen size={16}/></div>}
                        className="flex flex-col"
                        title="Create Receipt"
                        description="Enter the serial number to generate a receipt."
                        mainContent={
                            <div></div>
                        } 
                    />
                } content="Edit"/>
                <TooltipLayout 
                    trigger={
                    <DialogLayout
                    trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"> <Trash size={16} /></div>}
                    className="max-w-[50%] h-2/3 flex flex-col"
                    title="Image Details"
                    description="Here is the image related to the report."
                    mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} 
                    />
                    }  content="Delete"/>
            </div>
        )
    }
]

export const PurposesAndAmounts: PurposeAndAmount[] = [
    {
        purpose: "Commercial Building Permit",
        amount: "1000"
    },
    {
        purpose: "Residential Permit",
        amount: "1500"
    },
    {
        purpose: "Water Connection Permit (Commercial)",
        amount: "1000"
    },
    {
        purpose: "Water Connection Permit (Residential)",
        amount: "1000"
    },
    {
        purpose: "Electrical Permit Connection (Commercial)",
        amount: "1000"
    },
    {
        purpose: "Electrical Permit Connection (Residential)",
        amount: "1500"
    },
    {
        purpose: "Fencing Renovation and Repair (Concrete/Steel)",
        amount: "1000"
    },
    {
        purpose: "Fencing Renovation and Repair (Light Materials)",
        amount: "1000"
    },
]

function RatesPage4({ onNext5, onPrevious3 }: Props) {
    const data = PurposesAndAmounts;

    return (
        <div className='bg-snow w-full h-full'>
            <div className='bg-white p-4 drop-shadow rounded-lg'>
                <div className='p-7 flex flex-col justify-end gap-7'>
                    <div className="flex flex-row items-center">
                        <h2 className='font-bold w-3/4'>D. BARANGAY CLEARANCE FOR PERMITS:</h2>
                        <div className='flex justify-end w-[32rem]'>
                            <DialogLayout
                                trigger={<Button>+ Add</Button>}
                                title='Add New Purpose and Fee for Permit Clearance'
                                description="Define a new purpose and its corresponding fee for permit clearance applications."
                                mainContent={
                                    <RatesFormPage4 />
                                }
                            />
                        </div>
                    </div>
                   <div className='border overflow-auto max-h-[400px]'>
                        <DataTable columns={columns} data={data}></DataTable>
                    </div>
                </div>
            </div>
            <div className="flex justify-between mt-5">
                <Button type="button" onClick={onPrevious3} className="w-[100px]">
                    Previous
                </Button>
                <Button type="button" onClick={onNext5} className="w-[100px]">
                    Next
                </Button>
            </div>
        </div>
    )
}

export default RatesPage4