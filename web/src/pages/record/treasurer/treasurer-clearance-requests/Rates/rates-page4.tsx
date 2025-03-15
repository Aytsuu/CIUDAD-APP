import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import RatesFormPage4 from "./rates-form-page4"

type PurposeAndAmount = {
    purpose: string;
    amount: string;
}

type Props = {
    onNext5: () => void; // Function to handle the "Next" action
    onPrevious3: () => void; // Function to handle the "Previous" action
};

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