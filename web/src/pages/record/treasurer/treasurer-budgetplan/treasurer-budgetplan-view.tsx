    import TableLayout from "@/components/ui/table/table-layout";
    import PaginationLayout from "@/components/ui/pagination/pagination-layout";
    import { useState } from "react";
    import { ChevronLeft } from "lucide-react";
    import { Link } from "react-router";
    import { Button } from "@/components/ui/button";

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


    export const budgetHeader = {
        availableResources: 0.0,
        actualIncome: 0.0,
        year: 2020,
        actualRpt: 0.0,
        totalBudget: 0.0,
        balanceUnappropriated: 0.0,
    };


    const BudgetData = {
        honorariaOfficials: {proposedBudget: 0.00},
        cashGiftOfficials: {proposedBudget: 0.00 },
        midYearOfficials: {proposedBudget: 0.00},
        yearEndOfficials: {proposedBudget: 0.00 },
        honorariaTanods: {proposedBudget: 0.00},
        honorariaLupon: {proposedBudget: 0.00 },
        honorariaBarangayWorkers: {proposedBudget: 0.00},
        productivityEnhancement: {proposedBudget: 0.00 },
        leaveCredits: {proposedBudget: 0.00},
        personalService: {total: 0.00, budgetLimit: 0.00, balance: 0.00},
        travelExpense: {proposedBudget: 0.00},
        trainingExpense: {proposedBudget: 0.00 },
        officeSupplyExpense: {proposedBudget: 0.00},
        formsExpense: {proposedBudget: 0.00 },
        medicineExpense: {proposedBudget: 0.00},
        waterExpense: {proposedBudget: 0.00 },
        electricityExpense: {proposedBudget: 0.00},
        telephoneExpense: {proposedBudget: 0.00 },
        memeDue: {proposedBudget: 0.00, budgetLimit: 0.00, balance: 0.00},
        equipmentmaintenance: {proposedBudget: 0.00 },
        vehiclemaintenance: {proposedBudget: 0.00 },
        fidelityBond: {proposedBudget: 0.00},
        insuranceExpense: {proposedBudget: 0.00 },
        gadProgram: {proposedBudget: 0.00},
        seniorPwd: {proposedBudget: 0.00 },
        bcpc: {proposedBudget: 0.00},
        badac: {proposedBudget: 0.00 },
        nutrition: {proposedBudget: 0.00},
        aidsProgram: {proposedBudget: 0.00 },
        assemblyExpense: {proposedBudget: 0.00 },
        disasterProgram: {proposedBudget: 0.00},
        miscExpense: {proposedBudget: 0.00, budgetLimit: 0.00, balance: 0.00},
        maintExpenses: {total: 0.00},
        capitalOutlays: {total: 0.00, proposedBudget: 0.00},
        cleanGreen: {proposedBudget: 0.00 },
        streetLighting: {proposedBudget: 0.00},
        rehabofMultPurpose: {proposedBudget: 0.00},
        localDev: {total: 0.00, budgetLimit: 0.00, balance: 0.00},
        skFund: {proposedBudget: 0.00, budgetLimit: 0.00, balance: 0.00},
        quickResponseFund: {proposedBudget: 0.00 },
        disasterTraining: {proposedBudget: 0.00 },
        disasterSupplies: {proposedBudget: 0.00 },
        calamityFund: {total: 0.00, budgetLimit: 0.00, balance: 0.00}
    }


    const headerProp = ["", "Per Proposed Budget", "Budgetary Limitation", "Balance"].map(
        (text) => <span className={styles.header}>{text}</span>
    );


    export const rowsProp = [
        [<span className={styles.mainCategory}>CURRENT OPERATING EXPENDITURES</span>],
        [<span className={styles.subCategory}>Personal Services</span>],
        ['Honoraria for Officials', BudgetData.honorariaOfficials.proposedBudget.toFixed(2)],
        ['Cash Gift for Officials', BudgetData.cashGiftOfficials.proposedBudget.toFixed(2)],
        ['Mid-Year Bonus for Officials', BudgetData.midYearOfficials.proposedBudget.toFixed(2)],
        ['Year-End Bonus for Officials', BudgetData.yearEndOfficials.proposedBudget.toFixed(2)],
        ['Honoraria for Tanods', BudgetData.honorariaTanods.proposedBudget.toFixed(2)],
        ['Honoraria for Lupon Members', BudgetData.honorariaLupon.proposedBudget.toFixed(2)],
        ['Honoraria for Barangay Workers', BudgetData.honorariaBarangayWorkers.proposedBudget.toFixed(2)],
        ['Productivity Enhancement Incentive', BudgetData.productivityEnhancement.proposedBudget.toFixed(2)],
        ['Commutation of Leave Credits', BudgetData.leaveCredits.proposedBudget.toFixed(2)],
        ['', <div className={styles.total}>Total: Php {BudgetData.personalService.total.toFixed(2)}</div>, <div className={styles.budgetValue}>{BudgetData.personalService.budgetLimit.toFixed(2)}</div>, <div className={styles.budgetValue}>{BudgetData.personalService.balance.toFixed(2)}</div>],


        [<span className={styles.subCategory}>Maint. & Other Operating Expenses</span>],
        ['Traveling Expenses', BudgetData.travelExpense.proposedBudget.toFixed(2)],
        ['Training Expense', BudgetData.trainingExpense.proposedBudget.toFixed(2)],
        ['Office Supply Expenses', BudgetData.officeSupplyExpense.proposedBudget.toFixed(2)],
        ['Accountable Forms Expenses', BudgetData.formsExpense.proposedBudget.toFixed(2)],
        ['Drugs and Medicince Expenses', BudgetData.medicineExpense.proposedBudget.toFixed(2)],
        ['Water Expenses', BudgetData.waterExpense.proposedBudget.toFixed(2)],
        ['Electricity Expenses', BudgetData.electricityExpense.proposedBudget.toFixed(2)],
        ['Telephone Expenses', BudgetData.telephoneExpense.proposedBudget.toFixed(2)],
        ['Membership Dues/ Contribution to Organizaation', BudgetData.memeDue.proposedBudget.toFixed(2), BudgetData.memeDue.budgetLimit.toFixed(2), BudgetData.memeDue.balance.toFixed(2)],
        ['Repair and Maintenance of Office Equipment', BudgetData.equipmentmaintenance.proposedBudget.toFixed(2)],
        ['Repair and Maintenance of Office Vehicle', BudgetData.vehiclemaintenance.proposedBudget.toFixed(2)],
        ['Fidelity Bond Premiums', BudgetData.fidelityBond.proposedBudget.toFixed(2)],


        ['Other Maint. and Operating Expenses',],
        ['GAD Program', BudgetData.gadProgram.proposedBudget.toFixed(2)],
        ['Senior Citizen/ PWD Program', BudgetData.seniorPwd.proposedBudget.toFixed(2)],
        ['BCPC (Juvenille Justice System)', BudgetData.bcpc.proposedBudget.toFixed(2)],
        ['BADAC Program', BudgetData.badac.proposedBudget.toFixed(2)],
        ['Nutrition Program', BudgetData.nutrition.proposedBudget.toFixed(2)],
        ['Combating Aids Program', BudgetData.aidsProgram.proposedBudget.toFixed(2)],
        ['Barangay Assembly Expenses', BudgetData.assemblyExpense.proposedBudget.toFixed(2)],
        ['Disaster Response Program', BudgetData.disasterProgram.proposedBudget.toFixed(2)],
        ['Extraordinary & Miscellaneous Expenses', BudgetData.miscExpense.proposedBudget.toFixed(2), BudgetData.miscExpense.budgetLimit.toFixed(2), BudgetData.miscExpense.balance.toFixed(2)],
        ['', <div className={styles.total}>Total: Php {BudgetData.maintExpenses.total.toFixed(2)}</div>],

        [<span className={styles.mainCategory}>CAPITAL OUTLAYS</span>],
        ['Total Capital Outlays', BudgetData.capitalOutlays.proposedBudget.toFixed(2)],
        ['', <div className={styles.total}>Total: Php {BudgetData.capitalOutlays.total.toFixed(2)}</div>],


        [<span className={styles.mainCategory}>NON-OFFICE</span>],
        [<span className={styles.subCategory}>Local Development Fund</span>],
        ['Clean & Green Environmental', BudgetData.cleanGreen.proposedBudget.toFixed(2)],
        ['Street Lighting Project', BudgetData.streetLighting.proposedBudget.toFixed(2)],
        ['Rehabilitation of Multi-Purpose', BudgetData.rehabofMultPurpose.proposedBudget.toFixed(2)],
        ['', <div className={styles.total}>Total: Php {BudgetData.localDev.total.toFixed(2)}</div>, <div className={styles.budgetValue}>{BudgetData.localDev.budgetLimit.toFixed(2)}</div>, <div className={styles.budgetValue}>{BudgetData.localDev.balance.toFixed(2)}</div>],

        [<span className={styles.subCategory}>Sangguniang Kabataan Fund</span>],
        ['Subsidy to Sangguniang Kabataan (SK) FUnd', <div className={styles.total}>Total: Php {BudgetData.skFund.proposedBudget.toFixed(2)}</div>, <div className={styles.budgetValue}>{BudgetData.skFund.budgetLimit.toFixed(2)}</div>, <div className={styles.budgetValue}>{BudgetData.skFund.balance.toFixed(2)}</div>],

        ['', ],

        [<span className={styles.subCategory}>LDRRM Fund (Calamity Fund)</span>],
        ['Quick Response Fund (QRF)', BudgetData.quickResponseFund.proposedBudget.toFixed(2)],
        ['Disaster Training', BudgetData.disasterTraining.proposedBudget.toFixed(2)],
        ['Disaster Supplies', BudgetData.disasterSupplies.proposedBudget.toFixed(2)],
        ['', <div className={styles.total}>Total: Php {BudgetData.calamityFund.total.toFixed(2)}</div>, <div className={styles.budgetValue}>{BudgetData.calamityFund.budgetLimit.toFixed(2)}</div>, <div className={styles.budgetValue}>{BudgetData.calamityFund.balance.toFixed(2)}</div>],


    ]


    function ViewBudgetPlan(){

        // Pagination (12 rows per page)
        const [currentPage, setCurrentPage] = useState(1);
        const totalPages = Math.ceil(rowsProp.length / 12);
        const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        };

        const startIndex = (currentPage - 1) * 12;
        const endIndex = startIndex + 12;
        const currentRows = rowsProp.slice(startIndex, endIndex);


        return (
            <div className="w-full h-full bg-snow flex flex-col gap-3 p-4">
                {/* Budget Header */}
                <div className="w-full">
                    <div className='flex items-center relative mb-4'>
                        <Link to='/treasurer-budget-plan'><Button className="text-black p-2 self-start" variant={"outline"}> <ChevronLeft /></Button></Link>  
                        <h1 className={styles.headerTitle}>ANNUAL BUDGET PLAN {budgetHeader.year}</h1>
                    </div>
                    
                    <div className={styles.budgetHeaderGrid}>
                        <div className={styles.budgetItem}>
                            <div className={styles.budgetLabel}>NET Available Resources:</div>
                            <div className={styles.budgetValue}>Php {budgetHeader.availableResources.toFixed(2)}</div>
                        </div>
                        
                        <div className={styles.budgetItem}>
                            <div className={styles.budgetLabel}>Year:</div>
                            <div className={styles.budgetValue}>{budgetHeader.year}</div>
                        </div>
                        
                        <div className={styles.budgetItem}>
                            <div className={styles.budgetLabel}>TOTAL BUDGETARY OBLIGATION:</div>
                            <div className="font-semibold text-red-500">Php {budgetHeader.totalBudget.toFixed(2)}</div>
                        </div>
                        
                        <div className={styles.budgetItem}>
                            <div className={styles.budgetLabel}>Actual Income:</div>
                            <div className={styles.budgetValue}>Php {budgetHeader.actualIncome.toFixed(2)}</div>
                        </div>
                        
                        <div className={styles.budgetItem}>
                            <div className={styles.budgetLabel}>Actual RPT Income:</div>
                            <div className={styles.budgetValue}>Php {budgetHeader.actualRpt.toFixed(2)}</div>
                        </div>
                        
                        <div className={styles.budgetItem}>
                            <div className={styles.budgetLabel}>BALANCE UNAPPROPRIATED:</div>
                            <div className="font-semibold text-green-700">Php {budgetHeader.balanceUnappropriated.toFixed(2)}</div>
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
