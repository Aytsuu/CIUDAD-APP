import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import RatesFormPage1 from "./rates-form-page1"

type PermitRangeAndFee = {
    minRange: string;
    maxRange: string;
    amount: string;
}

type Props = {
    onNext2: () => void; // Function to handle the "Next" action
};

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
                    <div className='flex flex-row gap-7 w-full p-3'>
                        <Label className='w-1/2 flex justify-center text-md text-blue font-bold'>Range of Annual Gross Sales</Label>
                        <Label className='w-1/2 flex justify-center text-md text-blue font-bold'>Amount</Label>
                    </div>
                    <div className="space-y-2">
                        {RangesAndFees.map((rangeAndFee, index) => (
                            <div key={index} className="flex flex-row gap-5 w-full p-2">
                                <Label className='w-1/2 flex justify-center'>
                                    {formatNumber(rangeAndFee.minRange)} - {formatNumber(rangeAndFee.maxRange)}
                                </Label>
                                <Label className='w-1/2 flex justify-center'>
                                    {formatNumber(rangeAndFee.amount)}
                                </Label>
                            </div>
                        ))}
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