import TableLayout from "@/components/ui/table/table-layout";
import { ChevronLeft, Pen, ChevronRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { useLocation } from "react-router-dom";
import { formatNumber } from "@/helpers/currencynumberformatter";
import { Skeleton } from "@/components/ui/skeleton";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import DisplayBreakdown from "./netBreakdownDisplay";
import { Label } from "@/components/ui/label";
import { BudgetPlanDetail } from "./budgetPlanInterfaces";
import { usegetBudgetPlanDetail } from "./queries/budgetplanFetchQueries";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BudgetPlanHistory from "./budgetPlanHistory";
import BudgetPlanSuppDocs from "./budgetplanSuppDocs";
import { useState } from "react";
import { budgetItemsPage1, budgetItemsPage2, budgetItemsPage3, budgetItemsPage4 } from "./budgetItemDefinition";
import BudgetHeaderEditForm from "./budgetPlanForm/budgetHeaderEditForm";
import BudgetItemEditForm from "./budgetPlanForm/budgetItemEditForm";

const styles = {
    mainCategory: "font-bold text-[19px] md:text-[22px]",
    subCategory: "font-semibold text-[16px] md:text-[18px] text-sky-500",
    header: "font-bold text-lg text-blue-600",
    budgetItem: "flex flex-col space-y-1 p-3 rounded-lg bg-white shadow-lg",
    budgetLabel: "text-sm font-semibold text-gray-600",
    budgetValue: "font-semibold",
    headerTitle: "text-2xl font-bold text-blue text-center mx-auto",
    budgetHeaderGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", 
    rowItem: "flex text-sm font-semibold text-left w-full",
    rowValue: "text-sm",
    budgetFooter: "text-sm font-bold text-blue",
    indentedRowItem: "ml-6 text-sm flex font-semibold text-left w-full text-gray-700",
    tabContent: "w-full h-full bg-snow flex flex-col gap-3 p-4",
};

// Table Header
const headerProp = ["", "Per Proposed Budget"].map(
    (text) => <span className={styles.header}>{text}</span>
);

function ViewBudgetPlan(){
    const location = useLocation();
    const [isEditingHeader, setIsEditingHeader] = useState(false)
    const [isEditingItem, setIsEditingItem] = useState(false)
    const planId = location.state?.planId;
    const [activeTab, setActiveTab] = useState("current");
    const { data: fetchedData, isLoading } = usegetBudgetPlanDetail(planId || "");
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRowId, setEditingRowId] = useState<number | null>(null)

    // calculating net available resources
    const availableResources = 
    Number(fetchedData?.plan_balance || 0) +
    Number(fetchedData?.plan_tax_share || 0) +
    Number(fetchedData?.plan_tax_allotment || 0) +
    Number(fetchedData?.plan_cert_fees || 0) +
    Number(fetchedData?.plan_other_income || 0);

    // calculating totals per category
    const personalServiceTotal = fetchedData?.details
                                ?.filter((d: BudgetPlanDetail) => d.dtl_budget_category === "Personal Service")
                                ?.reduce((sum: number, d: BudgetPlanDetail) => sum + Number(d.dtl_proposed_budget || 0), 0) || 0;

    const otherExpenseTotal = fetchedData?.details
                            ?.filter((d: BudgetPlanDetail) => d.dtl_budget_category == "Other Expense")
                            ?.reduce((sum: number, d: BudgetPlanDetail) => sum + Number(d.dtl_proposed_budget || 0), 0) || 0;

    const capitalOutlaysTotal = fetchedData?.details
                            ?.filter((d: BudgetPlanDetail) => d.dtl_budget_category == "Capital Outlays")
                            ?.reduce((sum: number, d: BudgetPlanDetail) => sum + Number(d.dtl_proposed_budget || 0), 0) || 0;

    const nonOfficeTotal = fetchedData?.details
                        ?.filter((d: BudgetPlanDetail) => d.dtl_budget_category == "Non-Office")
                        ?.reduce((sum: number, d: BudgetPlanDetail) => sum + Number(d.dtl_proposed_budget || 0), 0) || 0;

    const calamityFundTotal = fetchedData?.details
                        ?.filter((d: BudgetPlanDetail) => d.dtl_budget_category == "LDRRM Fund")
                        ?.reduce((sum: number, d: BudgetPlanDetail) => sum + Number(d.dtl_proposed_budget || 0), 0 ) || 0;

    // 1. Prepare ordered label list from budgetItemDefinition
    const orderedBudgetLabels = [
        ...budgetItemsPage1,
        ...budgetItemsPage2,
        ...budgetItemsPage3,
        ...budgetItemsPage4,
    ].map((item) => item.label);

    // 2. Sort fetched details by this order
    const sortedDetails = [...(fetchedData?.details || [])].sort((a, b) => {
        const idxA = orderedBudgetLabels.indexOf(a.dtl_budget_item ?? "");
        const idxB = orderedBudgetLabels.indexOf(b.dtl_budget_item ?? "");
        return (idxA === -1 ? Infinity : idxA) - (idxB === -1 ? Infinity : idxB);
    });

    // 3. Build rows using the sorted details
    const rowsProp = sortedDetails.reduce((acc: any[], detail: BudgetPlanDetail) => {
        // adding title at the beginning of the table
        if(acc.length == 0){
            acc.push(
                [<span className={styles.mainCategory}>CURRENT OPERATING EXPENDITURES</span>],
                [<span className={styles.subCategory}>Personal Services</span>]
            )
        }

        // Indented rows
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

        const itemLabel = detail.dtl_budget_item;

        const mainRow = [
            <span className={isIndented ? styles.indentedRowItem : styles.rowItem}>{itemLabel}</span>,
            <span className={styles.rowValue}>{formatNumber(detail.dtl_proposed_budget)}</span>
        ];

        acc.push(mainRow);
    
        if (detail.dtl_budget_item === "Commutation of Leave Credits") {
            acc.push(
                [
                    <div ></div>, 
                    <div className={styles.budgetFooter}>Total: {formatNumber(personalServiceTotal)}</div>
                ],
                [<span className={styles.subCategory}>Maint. & Other Operating Expenses</span>]
            );
        } else if(detail.dtl_budget_item == "Disaster Supplies"){
            acc.push(
                [
                    <div ></div>, 
                    <div className={styles.budgetFooter}>Total: {formatNumber(calamityFundTotal)}</div>
                ])
        } else if(detail.dtl_budget_item == "Insurance Expenses"){
            acc.push([
                <span className={styles.rowItem}>Other Maint. & Operating Expenses</span>
            ])
        } else if(detail.dtl_budget_item == "Rehabilitation of Multi-Purpose"){
            acc.push(
                [
                    <div ></div>, 
                    <div className={styles.budgetFooter}>Total: {formatNumber(nonOfficeTotal)}</div>
                ],
                [],
                [<span className={styles.subCategory}>Sangguniang Kabataan Fund</span>],
            )
        } else if(detail.dtl_budget_item == "Total Capital Outlays"){
            acc.push([
                <div ></div>, 
                <div className={styles.budgetFooter}>Total: {formatNumber(capitalOutlaysTotal)}</div>,
            ],
            [<span className={styles.mainCategory}>NON-OFFICE</span>],
            [<span className={styles.subCategory}>Local Development Fund</span>],
            );
        } else if(detail.dtl_budget_item.startsWith("Extraordinary & Miscellaneous Expense")){
            acc.push([
                <div ></div>, 
                <div className={styles.budgetFooter}>Total: {formatNumber(otherExpenseTotal)}</div>,
            ],    
            [<span className={styles.mainCategory}>CAPITAL OUTLAYS</span>],
            );
        } else if(detail.dtl_budget_item == "Subsidy to Sangguniang Kabataan (SK) Fund"){
            acc.push(
                [<span className={styles.subCategory}>LDRRM Fund /Calamity Fund</span>],
            )
        }
    
        return acc;
    }, []) || [];

    if (isLoading){
        return (
            <div className="w-full h-full">
            <Skeleton className="h-10 w-1/6 mb-3" />
            <Skeleton className="h-7 w-1/4 mb-6" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-4/5 w-full mb-4" />
            </div>
        )
    }

    return (
        <Tabs defaultValue="current" className="w-full">
            <div className="flex items-center justify-between mb-4">
                <Link to="/treasurer-budget-plan"> 
                    <Button className="text-black p-2" variant="outline">
                        <ChevronLeft /> 
                    </Button> 
                </Link>
                
                <h1 className={styles.headerTitle}>
                    ANNUAL BUDGET PLAN {fetchedData?.plan_year}
                </h1>

                   {fetchedData?.plan_year === String(new Date().getFullYear()) && (
                    <DialogLayout
                        trigger={
                            <Button>
                                <Pen size={16} /> <span>Edit</span>
                            </Button>
                        }
                        title={isEditingHeader ? "Edit Budget Plan Header" : "Edit Budget Plan"}
                        description={
                            isEditingHeader 
                                ? "Update the budget plan header information." 
                                : "Select a part of the budget plan that you want to update."
                        }
                        mainContent={
                            isEditingHeader ? (
                                <div className="flex flex-col gap-4">
                                    <Button  variant="outline"  className="w-fit"  onClick={() => setIsEditingHeader(false)}>
                                        <ChevronLeft size={16} /> Back to menu
                                    </Button>
                                    <BudgetHeaderEditForm 
                                        balance= {fetchedData?.plan_balance || 0}
                                        realtyTaxShare = {fetchedData?.plan_tax_share || 0}
                                        taxAllotment={fetchedData?.plan_tax_allotment || 0}
                                        clearanceAndCertFees={fetchedData?.plan_cert_fees || 0}
                                        otherSpecificIncome={fetchedData?.plan_other_income || 0}
                                        actualIncome={fetchedData?.plan_actual_income || 0}
                                        actualRPT={fetchedData?.plan_rpt_income || 0}
                                        budgetaryObligations = {fetchedData?.plan_budgetaryObligations}
                                        planId={planId}
                                        onSuccess={() => {
                                            setIsEditingHeader(false);
                                            setEditingRowId(null);
                                        }}
                                    />
                                </div>
                            ) : 
                            isEditingItem ?(
                                <div className="flex flex-col gap-4">
                                     <Button  variant="outline"  className="w-fit"  onClick={() => setIsEditingItem(false)}>
                                        <ChevronLeft size={16} /> Back to menu
                                    </Button>
                                    <BudgetItemEditForm
                                        planId = {planId}
                                        budgetItems={fetchedData?.details || []}
                                    />
                                </div>
                            ):(
                                <div className="flex flex-col gap-2">
                                    <Button className="w-full" onClick={() => setIsEditingHeader(true)}  >
                                        Budget Plan Header
                                    </Button>
                                    <Button className="w-full"  onClick={() => setIsEditingItem(true)} >
                                        Budget Plan Items
                                    </Button>
                                </div>
                            )
                        }
                        isOpen={editingRowId === Number(planId)}
                        onOpenChange={(open) => setEditingRowId(open ? Number(planId) : null)}
                        className="min-w-[800px]"
                    />
                )}

            </div>

            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="current" onClick={() => setActiveTab("current")}>
                    Current Budget Plan
                </TabsTrigger>
                <TabsTrigger value="history" onClick={() => setActiveTab("history")}>
                    Revision History
                </TabsTrigger>
                 <TabsTrigger value="documents" onClick={() => setActiveTab("documents")}>
                    Supporting Documents
                </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className={styles.tabContent}>
                {/* Current Budget Plan Content */}
                <div className="w-full">
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
                            balance={fetchedData?.plan_balance ?? 0}
                            realtyTaxShare={fetchedData?.plan_tax_share ?? 0}
                            taxAllotment={fetchedData?.plan_tax_allotment ?? 0}
                            clearanceAndCertFees={fetchedData?.plan_cert_fees ?? 0}
                            otherSpecificIncome={fetchedData?.plan_other_income ?? 0}/>
                        }/>
                        
                        {/* HEADER CARDS */}
                        <div className={styles.budgetItem}>
                            <div className={styles.budgetLabel}>Year:</div>
                            <div className={styles.budgetValue}>{fetchedData?.plan_year}</div>
                        </div>
                        
                        <div className={styles.budgetItem}>
                            <div className={styles.budgetLabel}>TOTAL BUDGETARY OBLIGATION:</div>
                            <div className="font-semibold text-red-500">{formatNumber(fetchedData?.plan_budgetaryObligations ?? 0)}</div>
                        </div>
                        
                        <div className={styles.budgetItem}>
                            <div className={styles.budgetLabel}>Actual Income:</div>
                            <div className={styles.budgetValue}>{formatNumber(fetchedData?.plan_actual_income ?? 0)}</div>
                        </div>
                        
                        <div className={styles.budgetItem}>
                            <div className={styles.budgetLabel}>Actual RPT Income:</div>
                            <div className={styles.budgetValue}>{formatNumber(fetchedData?.plan_rpt_income ?? 0)}</div>
                        </div>
                        
                        <div className={styles.budgetItem}>
                            <div className={styles.budgetLabel}>BALANCE UNAPPROPRIATED:</div>
                            <div className="font-semibold text-green-700">{formatNumber(fetchedData?.plan_balUnappropriated ?? 0)}</div>
                        </div>
                    </div>
                </div>

                {/* Budget Table */}
                <div className="bg-white p-5 overflow-x-auto">
                    <TableLayout header={headerProp} rows={rowsProp} />
                </div>
            </TabsContent>

            <TabsContent value="history" className={styles.tabContent}>
                {/* History Content */}
                <BudgetPlanHistory planId={planId}/>
            </TabsContent>

            <TabsContent value="documents" className={styles.tabContent}>
                <BudgetPlanSuppDocs plan_id={fetchedData?.plan_id || 0}/>
            </TabsContent>
        </Tabs>
    );
}

export default ViewBudgetPlan;