import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import RatesFormPage2 from "./rates-form-page2"

type PurposeAndAmount = {
    purpose: string;
    amount: string;
}

type Props = {
    onNext3: () => void; // Function to handle the "Next" action
    onPrevious1: () => void; // Function to handle the "Previous" action
};

export const PurposesAndAmounts: PurposeAndAmount[] = [
    {
        purpose: "Employment",
        amount: "150"
    },
    {
        purpose: "NSO/SSS/GSIS",
        amount: "150"
    },
    {
        purpose: "Hospitalization/CHAMP",
        amount: "150"
    },
    {
        purpose: "Birth Certificate",
        amount: "150"
    },
]

function RatesPage2({ onNext3, onPrevious1 }: Props) {
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
                        <div className='flex flex-col gap-4 w-3/4'>
                            <h2 className='font-bold'>B. BARANGAY CLEARANCE FOR PERSONAL AND OTHER PURPOSES:</h2>
                            <Label>- For non-residents</Label>
                        </div>
                        <div className='flex justify-end w-[32rem]'>
                            <DialogLayout
                                trigger={<Button>+ Add</Button>}
                                title='Add New Purpose and Fee for Personal Clearance'
                                description="Define a new purpose and its corresponding fee for personal clearance applications."
                                mainContent={
                                    <RatesFormPage2 />
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
                <Button type="button" onClick={onPrevious1} className="w-[100px]">
                    Previous
                </Button>
                <Button type="button" onClick={onNext3} className="w-[100px]">
                    Next
                </Button>
            </div>
        </div>
    )
}

export default RatesPage2