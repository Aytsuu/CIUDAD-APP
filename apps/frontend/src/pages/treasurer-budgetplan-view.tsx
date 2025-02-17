import TableLayout from "@/components/ui/table/table-layout";
import { Label } from "@/components/ui/label";
import { Leaf } from "lucide-react";

function ViewBudgetPlan(){
    const styles = {
        mainheaderStyle: "text-white text-[17px]",
        table1LabelStyle: "font-semibold text-darkGray text-[15px]",
        table1AmountStyle: "text-black font-semibold text-[15px]"
    }

    const budgetData = {
        netAvailable: {amount: 0.00},
        totalBudgetObligation: {amount: 0.00},
        balUnappropriated: {amount:0.00},
        actualIncome: {amount: 0.00},
        actualRPT: {amount: 0.00}
    }
    const headerProp1=[<div className="bg-blue p-4"><Label className={styles.mainheaderStyle}>YEAR 2023</Label></div>];
    const rowsProp1 = [
        [<span><Label className={styles.table1LabelStyle}>NET AVAILABLE RESOURCES: </Label> <Label><div>PHP {budgetData.netAvailable.amount.toFixed(2)}</div></Label></span>],
        [<span><Label className={styles.table1LabelStyle}>TOTAL BUDGET OBLIGATIONS: </Label> <Label><div>PHP {budgetData.totalBudgetObligation.amount.toFixed(2)}</div></Label></span>],
        [<span><Label className={styles.table1LabelStyle}>BALANCE UNAPPROPRIATED: </Label> <Label><div>PHP {budgetData.balUnappropriated.amount.toFixed(2)}</div></Label></span>],
        [<span><Label className={styles.table1LabelStyle}>ACTUAL INCOME: </Label> <Label><div>PHP {budgetData.actualIncome.amount.toFixed(2)}</div></Label></span>],
        [<span><Label className={styles.table1LabelStyle}>ACTUAL RPT INCOME: </Label> <Label><div>PHP {budgetData.actualRPT.amount.toFixed(2)}</div></Label></span>],
    ]

    return(
        <div>
            <div className="mb-4 mt-10">
                {/* Table 1 */}
                <div className="bg-grayishWhite border border-gray rounded-[5px] mx-4">
                    <TableLayout header={headerProp1} rows={rowsProp1}/>
                </div>
                {/* Table 2 */}
                <div>

                </div>
            </div>
        </div>
    )
}
export default ViewBudgetPlan