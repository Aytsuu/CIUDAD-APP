import { Label } from "@/components/ui/label";
import { formatNumber } from "@/helpers/currencynumberformatter";

interface DisplayBreakDownProps{
    balance: number,
    realtyTaxShare: number,
    taxAllotment: number,
    clearanceAndCertFees: number,
    otherSpecificIncome: number,
}

function DisplayBreakdown({balance, realtyTaxShare, taxAllotment, clearanceAndCertFees, otherSpecificIncome}: DisplayBreakDownProps){
    const style = {
        container: "p-5 border rounded-md border-[2px] border-lightBlue drop-shadow flex flex-col gap-4",
        text: "text-primary font-bold"
    }

    return(
        <div className="flex flex-col gap-3 mt-3">
            <div className={style.container}>
                <Label className={style.text}>Balance From Previous Year</Label>
                <Label>{formatNumber(balance)}</Label>
            </div>
            <div className={style.container}>
                <Label className={style.text}>Realty Tax Share</Label>
                <Label>{formatNumber(realtyTaxShare)}</Label>
            </div>
            <div className={style.container}>
                <Label className={style.text}>National Tax Allotment</Label>
                <Label>{formatNumber(taxAllotment)}</Label>
            </div>
            <div className={style.container}>
                <Label className={style.text}>Clearance & Certification Fees</Label>
                <Label>{formatNumber(clearanceAndCertFees)}</Label>
            </div>
            <div className={style.container}>
                <Label className={style.text}>Other Specific Income</Label>
                <Label>{formatNumber(otherSpecificIncome)}</Label>
            </div>
        </div>
    )
}
export default DisplayBreakdown