import TableLayout from "@/components/ui/table/table-layout";
import { Label } from "@/components/ui/label";
import { Leaf } from "lucide-react";

function ViewBudgetPlan(){
    const styles = {
        header: "font-bold text-lg text-blue-600",
        mainheaderStyle: "text-white text-[17px]",
        table1LabelStyle: "font-semibold text-darkGray text-[15px]",
        table1AmountStyle: "text-black font-semibold text-[15px]",
        budgetDetails: "flex text-left text-[15px]",
        mainCategory: "font-bold text-[19px]",
        subCategory: "font-semibold text-[16px] text-sky-500",
    }

    const budgetData = {
        personalServices: { total: 0.0, budgetLimit: 0.0, balance: 0.0 },
        memDue: { budgetLimit: 0.0, balance: 0.0 },
        miscExpense: { budgetLimit: 0.0, balance: 0.0 },
        maintExpense: { total: 0.0 },
        capitalOutlays: { total: 0.0 },
        localDev: { total: 0.0, budgetLimit: 0.0, balance: 0.0 },
        skFund: { budgetLimit: 0.0, balance: 0.0 },
        calamityFund: { total: 0.0, budgetLimit: 0.0, balance: 0.0 },
        netAvailable: {amount: 0.00},
        totalBudgetObligation: {amount: 0.00},
        balUnappropriated: {amount:0.00},
        actualIncome: {amount: 0.00},
        actualRPT: {amount: 0.00}
    }
    const headerProp1 = [<div className="bg-blue p-4"><Label className={styles.mainheaderStyle}>YEAR 2023</Label></div>];
    const rowsProp1 = [
        [<span><Label className={styles.table1LabelStyle}>NET AVAILABLE RESOURCES: </Label> <Label><div>PHP {budgetData.netAvailable.amount.toFixed(2)}</div></Label></span>],
        [<span><Label className={styles.table1LabelStyle}>TOTAL BUDGET OBLIGATIONS: </Label> <Label><div>PHP {budgetData.totalBudgetObligation.amount.toFixed(2)}</div></Label></span>],
        [<span><Label className={styles.table1LabelStyle}>BALANCE UNAPPROPRIATED: </Label> <Label><div>PHP {budgetData.balUnappropriated.amount.toFixed(2)}</div></Label></span>],
        [<span><Label className={styles.table1LabelStyle}>ACTUAL INCOME: </Label> <Label><div>PHP {budgetData.actualIncome.amount.toFixed(2)}</div></Label></span>],
        [<span><Label className={styles.table1LabelStyle}>ACTUAL RPT INCOME: </Label> <Label><div>PHP {budgetData.actualRPT.amount.toFixed(2)}</div></Label></span>],
    ]

    const headerProp2 = [["", "Per Proposed Budget", "Budgetary Limitation", "Balance"].map(
        (text) => <span className={styles.header}>{text}</span>)]

    // const createRow = (label: string, key? : string, budgetLimit: string | JSX.Element = "" , balance: string | JSX.Element = ""): JSX.Element[] => [
    //     <div className={styles.budgetDetails}>{label}</div>,
    //     <
    // ]


    const rowsProp2 = [
        [<div className={styles.mainCategory}>"CURRENT OPERATING EXPENDITURES"</div>], 
        [<div className={styles.subCategory}>Personal Services</div>],
        ["Honoraria for Officials", <div>budgetData.</div>]
    ]

    return(
        <div>
            <div className="mb-4 mt-10">
                {/* Table 1 */}
                <div className="bg-gray ishWhite border border-gray rounded-[5px] mx-4">
                    <TableLayout header={headerProp1} rows={rowsProp1}/>
                </div>
                {/* Table 2 */}
                <div>
                    {/* <TableLayout header={headerProp2} rows={}/> */}
                </div>
            </div>
        </div>
    )
}
export default ViewBudgetPlan