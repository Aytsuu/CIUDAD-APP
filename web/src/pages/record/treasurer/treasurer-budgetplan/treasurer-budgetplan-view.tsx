import TableLayout from "@/components/ui/table/table-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "@/api/api";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { formatNumber } from "@/helpers/currencynumberformatter";

const styles = {
    header: "font-bold text-lg text-blue-600",
    total: "font-bold text-blue",
    mainCategory: "font-bold text-[19px] md:text-[22px]",
    subCategory: "font-semibold text-[16px] md:text-[18px] text-sky-500",
    budgetDetails: "flex text-left text-[15px] md:text-[16px]",
    colDesign: "flex flex-col gap-4",
    budgetValue: "font-semibold",
    headerTitle: "text-center text-2xl font-bold text-blue mb-4 absolute left-1/2 transform -translate-x-1/2",
    budgetHeaderGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2", 
    budgetItem: "flex flex-col space-y-1 p-3 rounded bg-white border-l-4 border-sky-500 shadow-sm",
    budgetLabel: "text-sm font-semibold text-gray-600",
};


const headerProp = ["", "Per Proposed Budget", "Budgetary Limitation", "Balance"].map(
    (text) => <span className={styles.header}>{text}</span>
);

function ViewBudgetPlan(){

    //get the passed Id
    const { plan_id } = useParams<{ plan_id: string }>();
    // initialize values
    const [budgetPlan, setBudgetPlan] = useState({
        plan_actual_income: "0.00",
        plan_balance: "0.00",
        plan_cert_fees: "0.00",
        plan_issue_date: "",
        plan_other_income: "0.00",
        plan_rpt_income: "0.00",
        plan_tax_allotment: "0.00",
        plan_tax_share: "0.00",
        plan_year: "",
        plan_budgetaryObligations: "0.00",
        plan_balUnappropriated: "0.00",
        personal: [
            {cep_brgy_workers_honoraria: "0.00",
            cep_cash_gift: "0.00",
            cep_enhancement_incentive: "0.00",
            cep_leave_credits: "0.00",
            cep_lupon_honoraria: "0.00",
            cep_mid_year_bonus: "0.00",
            cep_official_honoraria: "0.00",
            cep_tanod_honoraria: "0.00",
            cep_year_end_bonus: "0.00",}
        ],
        maintenance: [
          {  cem_accountable_expense: "0.00",
            cem_electricity_expense: "0.00",
            cem_medicine_expense: "0.00",
            cem_membership_dues: "0.00",
            cem_office_expense: "0.00",
            cem_office_maintenance: "0.00",
            cem_telephone_expense: "0.00",
            cem_training_expense: "0.00",
            cem_travel_expense: "0.00",
            cem_vehicle_maintenance: "0.00",
            cem_water_expense: "0.00",}
        ],
        other_expenses: [
            {ome_aids_program: "0.00",
            ome_assembly_expense: "0.00",
            ome_badac_program: "0.00",
            ome_bcpc: "0.00",
            ome_disaster_program: "0.00",
            ome_fidelity_bond: "0.00",
            ome_gad_program: "0.00",
            ome_insurance_expense: "0.00",
            ome_misc_expense: "0.00",
            ome_nutrition_program: "0.00",
            ome_senior_pwd_program: "0.00",}
        ],
        capital_nonoffice: [
           { con_capital_outlay: "0.00",
            con_clean_and_green: "0.00",
            con_disaster_supplies: "0.00",
            con_disaster_training: "0.00",
            con_quick_response: "0.00",
            con_rehab_multi_purpose: "0.00",
            con_sk_fund: "0.00",
            con_street_lighting: "0.00",}
        ]
    });


    // get request using the plan id
    useEffect(() => {
        const fetchBudgetPlanDetails = async () =>  {
            try{
                const response = await api.get(`/treasurer/budget-plan/${plan_id}/`)
                setBudgetPlan(response.data)
                console.log(response.data)
            } catch (error){
                console.error("Failed fetching budgetplan details: ", error)
            }
        }
        fetchBudgetPlanDetails();
    }, [plan_id])

    // total for personal table
    let personalTotal = 0.00
    for (let i = 0; i < budgetPlan.personal.length; i++) {
        const personalItem = budgetPlan.personal[i];
        personalTotal += parseFloat(personalItem.cep_official_honoraria || "0.00") +
                         parseFloat(personalItem.cep_cash_gift || "0.00") +
                         parseFloat(personalItem.cep_mid_year_bonus || "0.00") +
                         parseFloat(personalItem.cep_year_end_bonus || "0.00") +
                         parseFloat(personalItem.cep_tanod_honoraria || "0.00") +
                         parseFloat(personalItem.cep_lupon_honoraria || "0.00") +
                         parseFloat(personalItem.cep_brgy_workers_honoraria || "0.00") +
                         parseFloat(personalItem.cep_enhancement_incentive || "0.00") +
                         parseFloat(personalItem.cep_leave_credits || "0.00");
    }

    // TEMPORARY DATAS
    const temp = {
        personal: {limit:0.00, bal: 0.00},
        memDue: {limit: 0.00, bal: 0.00},
        miscExpense: {limit: 0.00, bal: 0.00},
        capitalOutlays: {total: 0.00},
        localDev: {total:0.00, limit: 0.00, bal: 0.00},
        maintEx: {total: 0.00},
        skfund: {limit: 0.00, bal: 0.00},
        calamity: {total:0.00, limit: 0.00, bal: 0.00}
    }


    // rows with values
 const rowsProp = [
    [<span className={styles.mainCategory}>CURRENT OPERATING EXPENDITURES</span>],
    [<span className={styles.subCategory}>Personal Services</span>],
    ['Honoraria for Officials', formatNumber(budgetPlan.personal[0].cep_official_honoraria)],
    ['Cash Gift for Officials', formatNumber(budgetPlan.personal[0].cep_cash_gift)],
    ['Mid-Year Bonus for Officials', formatNumber(budgetPlan.personal[0].cep_mid_year_bonus)],
    ['Year-End Bonus for Officials', formatNumber(budgetPlan.personal[0].cep_year_end_bonus)],
    ['Honoraria for Tanods', formatNumber(budgetPlan.personal[0].cep_tanod_honoraria)],
    ['Honoraria for Lupon Members', formatNumber(budgetPlan.personal[0].cep_lupon_honoraria)],
    ['Honoraria for Barangay Workers', formatNumber(budgetPlan.personal[0].cep_brgy_workers_honoraria)],
    ['Productivity Enhancement Incentive', formatNumber(budgetPlan.personal[0].cep_enhancement_incentive)],
    ['Commutation of Leave Credits', formatNumber(budgetPlan.personal[0].cep_leave_credits)],
    ['', <div className={styles.total}>Total: {formatNumber(personalTotal)}</div>, <div className={styles.budgetValue}>{formatNumber(temp.personal.limit)}</div>, <div className={styles.budgetValue}>{formatNumber(temp.personal.bal)}</div>],


    [<span className={styles.subCategory}>Maint. & Other Operating Expenses</span>],
    ['Traveling Expenses', formatNumber(budgetPlan.maintenance[0].cem_travel_expense)],
    ['Training Expense', formatNumber(budgetPlan.maintenance[0].cem_training_expense)],
    ['Office Supply Expenses', formatNumber(budgetPlan.maintenance[0].cem_office_expense)],
    ['Accountable Forms Expenses', formatNumber(budgetPlan.maintenance[0].cem_accountable_expense)],
    ['Drugs and Medicince Expenses', formatNumber(budgetPlan.maintenance[0].cem_medicine_expense)],
    ['Water Expenses', formatNumber(budgetPlan.maintenance[0].cem_water_expense)],
    ['Electricity Expenses', formatNumber(budgetPlan.maintenance[0].cem_electricity_expense)],
    ['Telephone Expenses', formatNumber(budgetPlan.maintenance[0].cem_telephone_expense)],
    ['Membership Dues/ Contribution to Organizaation', formatNumber(budgetPlan.maintenance[0].cem_membership_dues), formatNumber(temp.memDue.limit), formatNumber(temp.memDue.bal)],
    ['Repair and Maintenance of Office Equipment', formatNumber(budgetPlan.maintenance[0].cem_office_maintenance)],
    ['Repair and Maintenance of Office Vehicle', formatNumber(budgetPlan.maintenance[0].cem_vehicle_maintenance)],

    ['Fidelity Bond Premiums', formatNumber(budgetPlan.other_expenses[0].ome_fidelity_bond)],
    ['Other Maint. and Operating Expenses',],
    ['GAD Program', formatNumber(budgetPlan.other_expenses[0].ome_gad_program)],
    ['Senior Citizen/ PWD Program', formatNumber(budgetPlan.other_expenses[0].ome_senior_pwd_program)],
    ['BCPC (Juvenille Justice System)', formatNumber(budgetPlan.other_expenses[0].ome_bcpc)],
    ['BADAC Program', formatNumber(budgetPlan.other_expenses[0].ome_badac_program)],
    ['Nutrition Program', formatNumber(budgetPlan.other_expenses[0].ome_nutrition_program)],
    ['Combating Aids Program', formatNumber(budgetPlan.other_expenses[0].ome_aids_program)],
    ['Barangay Assembly Expenses', formatNumber(budgetPlan.other_expenses[0].ome_assembly_expense)],
    ['Disaster Response Program', formatNumber(budgetPlan.other_expenses[0].ome_disaster_program)],
    ['Extraordinary & Miscellaneous Expenses', formatNumber(budgetPlan.other_expenses[0].ome_misc_expense), formatNumber(temp.miscExpense.limit), formatNumber(temp.miscExpense.bal)],
    ['', <div className={styles.total}>Total: {formatNumber(temp.maintEx.total)}</div>],

    [<span className={styles.mainCategory}>CAPITAL OUTLAYS</span>],
    ['Total Capital Outlays', formatNumber(budgetPlan.capital_nonoffice[0].con_capital_outlay)],
    ['', <div className={styles.total}>Total: {formatNumber(temp.capitalOutlays.total)}</div>],


    [<span className={styles.mainCategory}>NON-OFFICE</span>],
    [<span className={styles.subCategory}>Local Development Fund</span>],
    ['Clean & Green Environmental', formatNumber(budgetPlan.capital_nonoffice[0].con_clean_and_green)],
    ['Street Lighting Project', formatNumber(budgetPlan.capital_nonoffice[0].con_street_lighting)],
    ['Rehabilitation of Multi-Purpose', formatNumber(budgetPlan.capital_nonoffice[0].con_rehab_multi_purpose)],
    ['', <div className={styles.total}>Total: {formatNumber(temp.localDev.total)}</div>, <div className={styles.budgetValue}>{formatNumber(temp.localDev.limit)}</div>, <div className={styles.budgetValue}>{formatNumber(temp.localDev.bal)}</div>],

    [<span className={styles.subCategory}>Sangguniang Kabataan Fund</span>],
    ['Subsidy to Sangguniang Kabataan (SK) FUnd', <div className={styles.total}>Total: {formatNumber(budgetPlan.capital_nonoffice[0].con_sk_fund)}</div>, <div className={styles.budgetValue}>{formatNumber(temp.skfund.limit)}</div>, <div className={styles.budgetValue}>{formatNumber(temp.skfund.bal)}</div>],

    ['', ],

    [<span className={styles.subCategory}>LDRRM Fund (Calamity Fund)</span>],
    ['Quick Response Fund (QRF)', formatNumber(budgetPlan.capital_nonoffice[0].con_quick_response)],
    ['Disaster Training', formatNumber(budgetPlan.capital_nonoffice[0].con_disaster_training)],
    ['Disaster Supplies', formatNumber(budgetPlan.capital_nonoffice[0].con_disaster_supplies)],
    ['', <div className={styles.total}>Total: {formatNumber(temp.calamity.total)}</div>, <div className={styles.budgetValue}>{formatNumber(temp.calamity.limit)}</div>, <div className={styles.budgetValue}>{formatNumber(temp.calamity.bal)}</div>],
]



    // Pagination (12 rows per page)
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(rowsProp.length / 12);
    const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    };

    const startIndex = (currentPage - 1) * 12;
    const endIndex = startIndex + 12;
    const currentRows = rowsProp.slice(startIndex, endIndex);

    // calculating the net available resources
    const availableResources =
        (parseFloat(budgetPlan.plan_balance) || 0) +
        (parseFloat(budgetPlan.plan_tax_share) || 0) +
        (parseFloat(budgetPlan.plan_tax_allotment) || 0) +
        (parseFloat(budgetPlan.plan_cert_fees) || 0) +
        (parseFloat(budgetPlan.plan_other_income) || 0);
    

    return (
        <div className="w-full h-full bg-snow flex flex-col gap-3 p-4">
            {/* Budget Header */}
            <div className="w-full">
                <div className='flex items-center relative mb-4'>
                    <Link to='/treasurer-budget-plan'><Button className="text-black p-2 self-start" variant={"outline"}> <ChevronLeft /></Button></Link>  
                    <h1 className={styles.headerTitle}>ANNUAL BUDGET PLAN {budgetPlan.plan_year}</h1>
                </div>
                
                <div className={styles.budgetHeaderGrid}>
                    <div className={styles.budgetItem}>
                        <div className={styles.budgetLabel}>NET Available Resources:</div>
                        <div className={styles.budgetValue}>{formatNumber(availableResources)}</div>
                    </div>
                    
                    <div className={styles.budgetItem}>
                        <div className={styles.budgetLabel}>Year:</div>
                        <div className={styles.budgetValue}>{budgetPlan.plan_year}</div>
                    </div>
                    
                    <div className={styles.budgetItem}>
                        <div className={styles.budgetLabel}>TOTAL BUDGETARY OBLIGATION:</div>
                        <div className="font-semibold text-red-500">{formatNumber(budgetPlan.plan_budgetaryObligations)}</div>
                    </div>
                    
                    <div className={styles.budgetItem}>
                        <div className={styles.budgetLabel}>Actual Income:</div>
                        <div className={styles.budgetValue}>{formatNumber(budgetPlan.plan_actual_income)}</div>
                    </div>
                    
                    <div className={styles.budgetItem}>
                        <div className={styles.budgetLabel}>Actual RPT Income:</div>
                        <div className={styles.budgetValue}>{formatNumber(budgetPlan.plan_rpt_income)}</div>
                    </div>
                    
                    <div className={styles.budgetItem}>
                        <div className={styles.budgetLabel}>BALANCE UNAPPROPRIATED:</div>
                        <div className="font-semibold text-green-700">{formatNumber(budgetPlan.plan_balUnappropriated)}</div>
                    </div>
                </div>
            </div>

            {/* Budget Table */}
            <div className="bg-white p-5 overflow-x-auto">
                <TableLayout header={headerProp} rows={currentRows} />
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-center">
                <PaginationLayout
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}

export default ViewBudgetPlan