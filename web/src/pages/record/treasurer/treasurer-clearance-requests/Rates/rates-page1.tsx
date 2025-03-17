import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import RatesFormPage1 from "./rates-form-page1"
import { DataTable } from "@/components/ui/table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Pen, Trash} from 'lucide-react';


type PermitRangeAndFee = {
    minRange: string;
    maxRange: string;
    amount: string;
}

type Props = {
    onNext2: () => void; 
};

const formatNumber = (value: string) => {
    return `₱${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

export const columns: ColumnDef<PermitRangeAndFee>[] = [
    { accessorKey: "rangeOfGrossSales", header: "Range of Annual Gross Sales", 
        cell: ({ row }) => {
            const minRange = row.original.minRange;
            const maxRange = row.original.maxRange;
            return `${formatNumber(minRange)} - ${formatNumber(maxRange)}`;
        }
    },
    { accessorKey: "amount", header: "Amount",},
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

export const RangesAndFees: PermitRangeAndFee[] = [
    {
        minRange: "50000",
        maxRange: "100000",
        amount: "500"
    },
    {
        minRange: "100001",
        maxRange: "200000",
        amount: "1000"
    },
    {
        minRange: "200001",
        maxRange: "500000",
        amount: "1500"
    },
    {
        minRange: "500001",
        maxRange: "1000000",
        amount: "2000"
    },
]

function RatesPage1({ onNext2 }: Props) {
    const data = RangesAndFees;

    return (
        <div className='bg-snow w-full h-full'>
            <div className='bg-white p-4 drop-shadow rounded-lg'>
                <div className='p-7 flex flex-col justify-end gap-7'>
                    <div className="flex flex-row items-center">
                        <h2 className='font-bold'>A. BARANGAY CLEARANCE FOR BUSINESS PERMIT BASED ON ANNUAL GROSS SALES FOR RECEIPTS:</h2>
                        <div className='flex justify-end w-[32rem]'>
                            <DialogLayout
                                trigger={<Button>+ Add</Button>}
                                title='Add New Range and Fee for Business Permit'
                                description="Set a new annual gross sales range and its associated fee for business permits."
                                mainContent={
                                    <RatesFormPage1 />
                                }
                            />
                        </div>
                    </div>
                    <div className='border overflow-auto max-h-[400px]'>
                        <DataTable columns={columns} data={data}></DataTable>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-5">
                <Button type="button" onClick={onNext2} className="w-[100px]">
                    Next
                </Button>
            </div>
        </div>
    )
}

export default RatesPage1