    import TableLayout from "@/components/ui/table/table-layout";
    import PaginationLayout from "@/components/ui/pagination/pagination-layout";
    import { useState } from "react";
    import { ChevronLeft, Pen, ChevronRightIcon } from "lucide-react";
    import { Link } from "react-router-dom";
    import { Button } from "@/components/ui/button/button";
    import { useParams } from "react-router-dom";
    import { useQuery } from "@tanstack/react-query";
    import { formatNumber } from "@/helpers/currencynumberformatter";
    import { getBudgetDetails } from "./restful-API/budgetplanGetAPI";
    import { Skeleton } from "@/components/ui/skeleton";
    import DialogLayout from "@/components/ui/dialog/dialog-layout";
    import DisplayBreakdown from "./display_breakdown";
    import { Label } from "@/components/ui/label";
    import { Outlet } from "react-router-dom";

    const styles = {
        mainCategory: "font-bold text-[19px] md:text-[22px]",
        subCategory: "font-semibold text-[16px] md:text-[18px] text-sky-500",
        header: "font-bold text-lg text-blue-600",
        budgetItem: "flex flex-col space-y-1 p-3 rounded-lg bg-white shadow-lg",
        budgetLabel: "text-sm font-semibold text-gray-600",
        budgetValue: "font-semibold",
        headerTitle: "text-center text-2xl font-bold text-blue mb-4 absolute left-1/2 transform -translate-x-1/2",
        budgetHeaderGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", 
        rowItem: "flex text-sm font-semibold text-left w-full",
        rowValue: "text-sm",
        budgetFooter: "text-sm font-bold text-blue",
        indentedRowItem: "ml-6 text-sm flex font-semibold text-left w-full text-gray-700",
    };

    interface BudgetPlan {
        plan_id: number;
        plan_year: string;
        plan_actual_income: number;
        plan_rpt_income: number;
        plan_balance: number;
        plan_tax_share: number;
        plan_tax_allotment: number;
        plan_cert_fees: number;
        plan_other_income: number;
        plan_budgetaryObligations: number;
        plan_balUnappropriated: number;
        plan_issue_date: string;
        plan_personalService_limit: number,
        plan_miscExpense_limit: number,
        plan_localDev_limit: number,
        plan_skFund_limit: number,
        plan_calamityFund_limit: number,
        budget_detail: BudgetPlanDetail[];
    }

    interface BudgetPlanDetail {
        dtl_id: number;
        dtl_budget_item: string;
        dtl_proposed_budget: number;
        dtl_budget_category: string;
        plan: number; 
    }

    // Table Header
    const headerProp = ["", "Per Proposed Budget", "Budgetary Limitation", "Balance"].map(
        (text) => <span className={styles.header}>{text}</span>
    );

    function ViewBudgetPlan(){
        //get the passed Id
        const { plan_id } = useParams<{ plan_id: string }>();
        const [currentPage, setCurrentPage] = useState(1);
        const{ data: budgetDetails, isLoading: isLoadingBudgetDetails} = useQuery({
            queryKey: ['budgetDetails', plan_id],
            queryFn: () => getBudgetDetails(plan_id!),
            refetchOnMount: true,
            staleTime: 0
        });


        // calculating net available resources
        const availableResources =
        (parseFloat(budgetDetails?.plan_balance) || 0) +
        (parseFloat(budgetDetails?.plan_tax_share) || 0) +
        (parseFloat(budgetDetails?.plan_tax_allotment) || 0) +
        (parseFloat(budgetDetails?.plan_cert_fees) || 0) +
        (parseFloat(budgetDetails?.plan_other_income) || 0);


        // calculating totals per category
        const personalServiceTotal = budgetDetails?.details
                                    ?.filter((d: BudgetPlanDetail) => d.dtl_budget_category === "Personal Service")
                                    ?.reduce((sum: number, d: BudgetPlanDetail) => sum + Number(d.dtl_proposed_budget || 0), 0) || 0;

        const otherExpenseTotal = budgetDetails?.details
                                ?.filter((d: BudgetPlanDetail) => d.dtl_budget_category == "Other Expense")
                                ?.reduce((sum: number, d: BudgetPlanDetail) => sum + Number(d.dtl_proposed_budget || 0), 0) || 0;

        const capitalOutlaysTotal = budgetDetails?.details
                                ?.filter((d: BudgetPlanDetail) => d.dtl_budget_category == "Capital Outlays")
                                ?.reduce((sum: number, d: BudgetPlanDetail) => sum + Number(d.dtl_proposed_budget || 0), 0) || 0;

        const nonOfficeTotal = budgetDetails?.details
                            ?.filter((d: BudgetPlanDetail) => d.dtl_budget_category == "Non-Office")
                            ?.reduce((sum: number, d: BudgetPlanDetail) => sum + Number(d.dtl_proposed_budget || 0), 0) || 0;

        const calamityFundTotal = budgetDetails?.details
                            ?.filter((d: BudgetPlanDetail) => d.dtl_budget_category == "LDRRM Fund")
                            ?.reduce((sum: number, d: BudgetPlanDetail) => sum + Number(d.dtl_proposed_budget || 0), 0 ) || 0;

        // Limit Calculations
        const personalServiceLimit = budgetDetails?.plan_actual_income * (budgetDetails?.plan_personalService_limit / 100);
        const miscExpenseLimit = budgetDetails?.plan_rpt_income * (budgetDetails?.plan_miscExpense_limit/ 100);
        const nonOfficeLimit = budgetDetails?.plan_tax_allotment * (budgetDetails?.plan_localDev_limit/100);
        const skfundLimit = availableResources * (budgetDetails?.plan_skFund_limit/ 100);
        const calamityfundLimit = availableResources * (budgetDetails?.plan_calamityFund_limit/ 100);

        // populating the rows
        const rowsProp = budgetDetails?.details?.reduce((acc: any[], detail: BudgetPlanDetail) => {

            // adding title at the beginning of the table
            if(acc.length == 0){
                acc.push(
                    [<span className={styles.mainCategory}>CURRENT OPERATING EXPENDITURES</span>],
                    [<span className={styles.subCategory}>Personal Services</span>]
                )
            }

            const isIndented = [
                "GAD Program",
                "Senior Citizen/ PWD Program",
                "BCPC (Juvenile Justice System)",
                "BADAC Program",
                "Nutrition Program",
                "Combating AIDS Program",
                "Barangay Assembly Expenses",
                "Disaster Response Program"
            ].includes(detail.dtl_budget_item);

            const mainRow = [
                <span className={isIndented ? styles.indentedRowItem : styles.rowItem}>{detail.dtl_budget_item} </span>,
                <span className={styles.rowValue}>{formatNumber(detail.dtl_proposed_budget)}</span>
            ];

            // addding necessary footers(totals, budget limits, and balances)
            if (detail.dtl_budget_item === "Membership Dues/ Contribution to Organization") {
                mainRow.push(
                    <span className={styles.rowValue}>{formatNumber(detail.dtl_proposed_budget)}</span>,
                );
            }else if(detail.dtl_budget_item == "Extraordinary & Miscellaneous Expense"){
                mainRow.push(
                    <span className={styles.rowValue}>{formatNumber(miscExpenseLimit)}</span>,
                    <span className={styles.rowValue}>{formatNumber(miscExpenseLimit - detail.dtl_proposed_budget)}</span>
                );
            }else if(detail.dtl_budget_item == "Subsidy to Sangguniang Kabataan (SK) Fund"){
                mainRow.push(
                    <span className={styles.rowValue}>{formatNumber(skfundLimit)}</span>,
                    <span className={styles.rowValue}>{formatNumber(skfundLimit - detail.dtl_proposed_budget)}</span>
                );
            }
            acc.push(mainRow);
        

            if (detail.dtl_budget_item === "Commutation of Leave Credits") {
                acc.push(
                    [
                        <div ></div>, 
                        <div className={styles.budgetFooter}>Total: {formatNumber(personalServiceTotal)}</div>,
                        <div className={styles.budgetFooter}>{formatNumber(personalServiceLimit)}</div>,
                        <div className={styles.budgetFooter}>{formatNumber(personalServiceLimit - personalServiceTotal)}</div>
                    ],
            
                    [<span className={styles.subCategory}>Maint. & Other Operating Expenses</span>]
                );
            } else if(detail.dtl_budget_item == "Disaster Supplies"){
                acc.push(
                    [
                        <div ></div>, 
                        <div className={styles.budgetFooter}>Total: {formatNumber(calamityFundTotal)}</div>,
                        <div className={styles.budgetFooter}>{formatNumber(calamityfundLimit)}</div>,
                        <div className={styles.budgetFooter}>{formatNumber(calamityfundLimit - calamityFundTotal)}</div>
                    ])
            } else if(detail.dtl_budget_item == "Repair and Maintenance of Motor Vehicle"){

                acc.push( 
                    [<span className={styles.subCategory}>Maint. & Other Operating Expenses</span>],
                    
                )

            }else if(detail.dtl_budget_item == "Insurance Expenses"){

                acc.push([
                    <span className={styles.rowItem}>Other Maint. & Operating Expenses</span>
                ])

            }else if(detail.dtl_budget_item == "Rehabilitation of Multi-Purpose"){
                acc.push(
                    [
                        <div ></div>, 
                        <div className={styles.budgetFooter}>Total: {formatNumber(nonOfficeTotal)}</div>,
                        <div className={styles.budgetFooter}>{formatNumber(nonOfficeLimit)}</div>,
                        <div className={styles.budgetFooter}>{formatNumber(nonOfficeLimit - nonOfficeTotal)}</div>
                    ],
                    [],
                    [<span className={styles.subCategory}>Sangguniang Kabataan Fund</span>],
            )
            }else if(detail.dtl_budget_item == "Total Capital Outlays"){
                acc.push([
                    <div ></div>, 
                    <div className={styles.budgetFooter}>Total: {formatNumber(capitalOutlaysTotal)}</div>,
                
                ],
                [<span className={styles.mainCategory}>NON-OFFICE</span>],
                [<span className={styles.subCategory}>Local Development Fund</span>],
            );

            }else if(detail.dtl_budget_item == "Extraordinary & Miscellaneous Expense"){
                acc.push([
                    <div ></div>, 
                    <div className={styles.budgetFooter}>Total: {formatNumber(otherExpenseTotal)}</div>,
                ],    
                [<span className={styles.mainCategory}>CAPITAL OUTLAYS</span>],
                );
            } else if(detail.dtl_budget_item == "Subsidy to Sangguniang Kabataan (SK) Fund"){
                acc.push(
                    [<span className={styles.subCategory}>LDRRM Fund (Calamity Fund)</span>],
                )
            }
        
            return acc;
        }, []) || [];

        //  Loading screen
        if (isLoadingBudgetDetails){
            return (
                <div className="w-full h-full">
                <Skeleton className="h-10 w-1/6 mb-3" />
                <Skeleton className="h-7 w-1/4 mb-6" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-4/5 w-full mb-4" />
                </div>
            )
        }

        // Pagination
        const totalPages = Math.ceil(rowsProp.length / 12);
        const handlePageChange = (newPage: number) => { setCurrentPage(newPage); };
        const startIndex = (currentPage - 1) * 12;
        const endIndex = startIndex + 12;
        const currentRows = rowsProp.slice(startIndex, endIndex);

        return(
            <div className="w-full h-full bg-snow flex flex-col gap-3 p-4">
            {/* Budget Header */}
            <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <Link to="/treasurer-budget-plan"> <Button className="text-black p-2" variant="outline"><ChevronLeft /> </Button> </Link>
                    <h1 className={`${styles.headerTitle} text-center flex-grow`}>
                        ANNUAL BUDGET PLAN {budgetDetails?.plan_year}
                    </h1>
                    <Link to={'edit-header-and-allocation'} state={{ id: plan_id }}>
                        <Button>
                            <Pen size={16} /> <span>Edit</span>
                        </Button>
                    </Link>
                </div>
                
                <div className={styles.budgetHeaderGrid}>

                    <DialogLayout
                    trigger={
                         <div className="p-4 bg-white flex flex-col gap-4 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-[1.02]">
                            <div className="flex items-center justify-between">
                                <Label className={styles.budgetLabel}>NET Available Resources:</Label>
                                <ChevronRightIcon className="w-5 h-5 text-blue-500" />
                            </div>
                            <Label>{formatNumber(availableResources)}</Label>
                        </div>
                    }
                    title="Breakdown of NET Available Resources"
                    description=""
                    mainContent={
                        <DisplayBreakdown
                        balance={budgetDetails?.plan_balance}
                        realtyTaxShare={budgetDetails?.plan_tax_share}
                        taxAllotment={budgetDetails?.plan_tax_allotment}
                        clearanceAndCertFees={budgetDetails?.plan_cert_fees}
                        otherSpecificIncome={budgetDetails.plan_other_income}/>
                    }/>
                    
                    <div className={styles.budgetItem}>
                        <div className={styles.budgetLabel}>Year:</div>
                        <div className={styles.budgetValue}>{budgetDetails?.plan_year}</div>
                    </div>
                    
                    <div className={styles.budgetItem}>
                        <div className={styles.budgetLabel}>TOTAL BUDGETARY OBLIGATION:</div>
                        <div className="font-semibold text-red-500">{formatNumber(budgetDetails?.plan_budgetaryObligations)}</div>
                    </div>
                    
                    <div className={styles.budgetItem}>
                        <div className={styles.budgetLabel}>Actual Income:</div>
                        <div className={styles.budgetValue}>{formatNumber(budgetDetails?.plan_actual_income)}</div>
                    </div>
                    
                    <div className={styles.budgetItem}>
                        <div className={styles.budgetLabel}>Actual RPT Income:</div>
                        <div className={styles.budgetValue}>{formatNumber(budgetDetails?.plan_rpt_income)}</div>
                    </div>
                    
                    <div className={styles.budgetItem}>
                        <div className={styles.budgetLabel}>BALANCE UNAPPROPRIATED:</div>
                        <div className="font-semibold text-green-700">{formatNumber(budgetDetails?.plan_balUnappropriated)}</div>
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
            <Outlet/>
        </div>
        )

    }
    export default ViewBudgetPlan