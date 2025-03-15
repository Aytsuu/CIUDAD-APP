import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import RatesFormPage5 from "./rates-form-page5"

type PurposeAndAmount = {
    purpose: string;
    amount: string;
}

type Props = {
    onPrevious4: () => void; // Function to handle the "Previous" action
};

export const PurposesAndAmounts: PurposeAndAmount[] = [
    {
        purpose: "Disco",
        amount: "1000"
    },
    {
        purpose: "Bingo",
        amount: "1500"
    },
    {
        purpose: "Peryahan",
        amount: "1000"
    },
    {
        purpose: "Exhibit per stall",
        amount: "1000"
    },
    {
        purpose: "Commercial Billboards for Business",
        amount: "1000"
    },
    {
        purpose: "Professional Billboards, Signs, Advertisements",
        amount: "1500"
    },
]

function RatesPage5({ onPrevious4 }: Props) {
    const formatNumber = (value: string) => {
        return `₱${Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    return (
        <div className='bg-snow w-full h-full'>
            <div className='bg-white p-4 drop-shadow rounded-lg'>
                <div className='p-7 flex flex-col justify-end gap-7'>
                    <div className="flex flex-row items-center">
                        <h2 className='font-bold w-3/4'>E. BARANGAY FEES AND CHARGES:</h2>
                        <div className='flex justify-end w-[32rem]'>
                            <DialogLayout
                                trigger={<Button>+ Add</Button>}
                                title='Add New Purpose and Fee for Barangay Fees and Charges'
                                description="Define a new purpose and its corresponding fee for barangay fees and charges."
                                mainContent={
                                    <RatesFormPage5 />
                                }
                            />
                        </div>
                    </div>
                    <div className='flex flex-row gap-7 w-full'>
                        <Label className='w-1/2 flex justify-center text-md text-blue font-bold'>Purpose/Reason</Label>
                        <Label className='w-1/2 flex justify-center text-md text-blue font-bold'>Amount</Label>
                    </div>
                    <div className="space-y-2">
                        {PurposesAndAmounts.map((purposeAndAmount, index) => (
                            <div key={index} className="flex flex-row gap-5 w-full p-2">
                                <Label className='w-1/2 flex justify-center'>
                                    {purposeAndAmount.purpose}
                                </Label>
                                <Label className='w-1/2 flex justify-center'>
                                    {formatNumber(purposeAndAmount.amount)}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-start mt-5">
                <Button type="button" onClick={onPrevious4} className="w-[100px]">
                    Previous
                </Button>
            </div>
        </div>
    )
}

export default RatesPage5