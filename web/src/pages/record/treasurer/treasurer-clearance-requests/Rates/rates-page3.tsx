import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import RatesFormPage3 from "./rates-form-page-3"

type PurposeAndAmount = {
    purpose: string;
    amount: string;
}

type Props = {
    onNext4: () => void; // Function to handle the "Next" action
    onPrevious2: () => void; // Function to handle the "Previous" action
};

export const PurposesAndAmounts: PurposeAndAmount[] = [
    {
        purpose: "Complaint/ Filing Fee/ Summons",
        amount: "150"
    },
    {
        purpose: "Certificate to File Action",
        amount: "150"
    },
]

function RatesPage3({ onNext4, onPrevious2 }: Props) {
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
                        <h2 className='font-bold w-3/4'>C. SERVICE CHARGE:</h2>
                        <div className='flex justify-end w-[32rem]'>
                            <DialogLayout
                                trigger={<Button>+ Add</Button>}
                                title='Add New Purpose and Fee for Service Charge'
                                description="Define a new service charge and its corresponding fee for specific services."
                                mainContent={
                                    <RatesFormPage3 />
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
                <Button type="button" onClick={onPrevious2} className="w-[100px]">
                    Previous
                </Button>
                <Button type="button" onClick={onNext4} className="w-[100px]">
                    Next
                </Button>
            </div>
        </div>
    )
}

export default RatesPage3