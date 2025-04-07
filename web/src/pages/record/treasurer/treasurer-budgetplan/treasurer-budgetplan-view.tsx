import TableLayout from "@/components/ui/table/table-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatNumber } from "@/helpers/currencynumberformatter";
import { getBudgetDetails } from "./restful-API/budgetplanGetAPI";
import { Skeleton } from "@/components/ui/skeleton";

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
    budget_detail: BudgetPlanDetail[];
}

interface BudgetPlanDetail {
    dtl_id: number;
    dtl_budget_item: string;
    dtl_proposed_budget: number;
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

    // populating the rows
    const rowsProp = budgetDetails?.details?.map((detail: BudgetPlanDetail) => [
        detail.dtl_budget_item,
        formatNumber(detail.dtl_proposed_budget)
    ]) || [];

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

    // calculating net available resources
    const availableResources =
    (parseFloat(budgetDetails?.plan_balance) || 0) +
    (parseFloat(budgetDetails?.plan_tax_share) || 0) +
    (parseFloat(budgetDetails?.plan_tax_allotment) || 0) +
    (parseFloat(budgetDetails?.plan_cert_fees) || 0) +
    (parseFloat(budgetDetails?.plan_other_income) || 0);

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
            <div className='flex items-center relative mb-4'>
                <Link to='/treasurer-budget-plan'><Button className="text-black p-2 self-start" variant={"outline"}> <ChevronLeft /></Button></Link>  
                <h1 className={styles.headerTitle}>ANNUAL BUDGET PLAN {budgetDetails?.plan_year}</h1>
            </div>
            
            <div className={styles.budgetHeaderGrid}>
                <div className={styles.budgetItem}>
                    <div className={styles.budgetLabel}>NET Available Resources:</div>
                    <div className={styles.budgetValue}>{formatNumber(availableResources)}</div>
                </div>
                
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
    </div>
    )

}
export default ViewBudgetPlan
