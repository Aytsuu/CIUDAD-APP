import TableLayout from "@/components/ui/table/table-layout";
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

function AddBudgetPlan() {
    // ====================== STYLES==========================
    const styles = {
        header: "font-bold text-lg text-blue-600",
        total: "font-bold text-blue",
        mainCategory: "font-bold text-[19px]",
        subCategory: "font-semibold text-[16px] text-sky-500",
        budgetDetails: "flex text-left text-[15px]",
        indent: "ml-4",
    };

    const budgetValueStyle = (value: number) => <span className="text-black font-semibold">{value.toFixed(2)}</span>;

    const BudgetInput = ({ placeholder }: { placeholder: string }) => (
        <div className="flex justify-center">
            <Input className="border-blue w-[200px]" type="number" placeholder={placeholder} />
        </div>
    );

    
    // =====================TABLE PROPS==========================
    const headerProp = ["", "Per Proposed Budget", "Budgetary Limitation", "Balance"].map(
        (text) => <span className={styles.header}>{text}</span>
    );

    const budgetData = {
        personalServices: { total: 0.0, budgetLimit: 0.0, balance: 0.0 },
        memDue: { budgetLimit: 0.0, balance: 0.0 },
        miscExpense: { budgetLimit: 0.0, balance: 0.0 },
        maintExpense: { total: 0.0 },
        capitalOutlays: { total: 0.0 },
        localDev: { total: 0.0, budgetLimit: 0.0, balance: 0.0 },
        skFund: { budgetLimit: 0.0, balance: 0.0 },
        calamityFund: { total: 0.0, budgetLimit: 0.0, balance: 0.0 },
    };

    const createRow = ( label: string,key?: string,budgetLimit: string | JSX.Element = "",balance: string | JSX.Element = ""): JSX.Element[] => [
        <span className={styles.budgetDetails}>{label}</span>,
        key ? <BudgetInput placeholder="0.00" key={key} /> : <span></span>,
        typeof budgetLimit === "string" ? <span>{budgetLimit}</span> : budgetLimit,
        typeof balance === "string" ? <span>{balance}</span> : balance,
    ];
    
    

    const rowsProp = [
        [<span className={styles.mainCategory}>CURRENT OPERATING EXPENDITURES</span>],
        [<span className={styles.subCategory}>Personal Services</span>],
        createRow("Honoraria for Officials", "honorariaOfficials"),
        createRow("Cash Gift for Officials", "cashOfficials"),
        createRow("Mid-Year Bonus for Officials", "midBonusOfficials"),
        createRow("Year-End Bonus for Officials", "endBonusOfficials"),
        createRow("Honoraria for Tanods", "honorariaTanods"),
        createRow("Honoraria for Lupon Members", "honorariaLupon"),
        createRow("Honoraria for Barangay Workers", "honorariaBarangay"),
        createRow("Productivity Enhancement Incentive", "prodEnhancement"),
        createRow("Commutation of Leave Credits", "leaveCredits"),
        ["",<span className={styles.total}>Total: Php {budgetValueStyle(budgetData.personalServices.total)}</span>, budgetValueStyle(budgetData.personalServices.budgetLimit),budgetValueStyle(budgetData.personalServices.balance)],
        [<span className={styles.subCategory}>Maint. & Other Operating Expenses</span>],
        createRow("Traveling Expenses", "travelingExpenses"),
        createRow("Training Expenses", "trainingExpenses"),
        createRow("Office Supplies Expenses", "officeExpenses"),
        createRow("Accountable Forms Expenses", "accountableExpenses"),
        createRow("Drugs and Medicine Expenses", "medExpenses"),
        createRow("Water Expenses", "waterExpenses"),
        createRow("Electricity Expenses", "electricityExpenses"),
        createRow("Telephone Expenses", "telephoneExpenses"),
        createRow("Membership Dues/ Contribution to Organization", "memDues", budgetValueStyle(budgetData.memDue.budgetLimit), budgetValueStyle(budgetData.memDue.balance)),
        createRow("Repair and Maintenance of Office Equipment", "officeMaintenance"),
        createRow("Repair and Maintenance of Office Vehicle", "vehicleMaintenance"),
        createRow("Fidelity Bond Premiums", "fidelityBond"),
        createRow("Insurance Expenses", "insuranceExpense"),
        createRow("Other Maint. and Operating Expenses", ""),
        createRow("\u2003\u2003GAD Program","gadProg"),
        createRow("\u2003\u2003Senior Citizen/ PWD Program", "seniorProg"),
        createRow("\u2003\u2003BCPC (Juvenille Justice System)", "juvJustice"),
        createRow("\u2003\u2003BADAC Program","badacProg"),
        createRow("\u2003\u2003Nutrition Program", "nutritionProg"),
        createRow("\u2003\u2003Combating AIDS Program", "aidsProg"),
        createRow("\u2003\u2003Barangay Assembly Expenses","assemblyExpenses"),
        createRow("\u2003\u2003Disaster Response Program","disasterProg"),
        createRow("Extraordinary & Miscellaneous Expenses","miscExpense", budgetValueStyle(budgetData.miscExpense.budgetLimit), budgetValueStyle(budgetData.miscExpense.balance)),
        ["", <span className={styles.total}>Total: Php {budgetValueStyle(budgetData.maintExpense.total)}</span>],
        [<span className={styles.mainCategory}>CAPITAL OUTLAYS</span>],
        createRow("Total Capital Outlays", "capitalOutlays"),
        ["",<span className={styles.total}>Total: Php {budgetValueStyle(budgetData.capitalOutlays.total)}</span>],
        [<span className={styles.mainCategory}>NON-OFFICE</span>],
        [<span className={styles.subCategory}>Local Development Fund</span>],
        createRow("TClean & Green- Environmental","cleanAndGreen"),
        createRow("Street Lighting Project","streetLighting"),
        createRow("Rehabilitation of Multi-Purpose", "rehabMultPurpose"),
        ["", <span className={styles.total}>Total: Php {budgetValueStyle(budgetData.localDev.total)}</span>, budgetValueStyle(budgetData.localDev.budgetLimit), budgetValueStyle(budgetData.localDev.balance)],
        [<span className={styles.subCategory}>Sangguniang Kabataan Fund</span>],
        createRow("Subsidy to Sangguniang Kabataan (SK) Fund","skFund", budgetValueStyle(budgetData.skFund.budgetLimit), budgetValueStyle(budgetData.skFund.balance)),
        [<span className={styles.subCategory}>LDRRM Fund (Calamity Fund)</span>],
        createRow("Quick Response Fund (QRF)","qrfFund"),
        createRow("Disaster Training","disasterTraining"),
        createRow("Disaster Supplies","disasterSupplies"),
        ["",<span className={styles.total}>Total: Php {budgetValueStyle(budgetData.calamityFund.total)}</span>, budgetValueStyle(budgetData.calamityFund.budgetLimit) , budgetValueStyle(budgetData.calamityFund.balance)],
    ];

    return (
        <div className="mx-4 mb-4 mt-10">
            <div className="bg-white border border-gray rounded-[5px] p-5">
                <TableLayout header={headerProp} rows={rowsProp} />
            </div>
            <PaginationLayout />
        </div>
    );
}

export default AddBudgetPlan;
