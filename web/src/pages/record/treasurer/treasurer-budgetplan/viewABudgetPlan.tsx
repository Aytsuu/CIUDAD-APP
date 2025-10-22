import { ChevronLeft, Pen, ChevronRightIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { formatNumber } from "@/helpers/currencynumberformatter";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import DisplayBreakdown from "./netBreakdownDisplay";
import { Label } from "@/components/ui/label";
import { BudgetPlanDetail } from "./budgetPlanInterfaces";
import { usegetBudgetPlanDetail } from "./queries/budgetplanFetchQueries";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BudgetPlanHistory from "./budgetPlanHistory";
import BudgetPlanSuppDocs from "./budgetplanSuppDocs";
import { useState } from "react";
import BudgetHeaderEditForm from "./budgetPlanForm/budgetHeaderEditForm";
import BudgetItemEditForm from "./budgetPlanForm/budgetItemEditForm";
import { formatDate } from "@/helpers/dateHelper";
import TableLayout from "@/components/ui/table/table-layout";
import { Spinner } from "@/components/ui/spinner";
import { useLoading } from "@/context/LoadingContext";
import { useEffect } from "react";

const styles = {
  header: "font-bold text-lg text-blue-600",
  budgetItem: "flex flex-col space-y-1 p-3 rounded-lg bg-white shadow-lg",
  budgetLabel: "text-sm font-semibold text-gray-600",
  budgetValue: "font-semibold",
  headerTitle: "text-2xl font-bold text-primary text-center mx-auto",
  budgetHeaderGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
  rowItem: "flex text-sm font-semibold text-left w-full",
  rowValue: "text-sm",
  tabContent: "w-full h-full bg-snow flex flex-col gap-3 p-4",
};

// Table Header
const headerProp = ["", "Per Proposed Budget"].map((text) => (
  <span className={styles.header}>{text}</span>
));

function ViewBudgetPlan() {
  const { showLoading, hideLoading } = useLoading();
  const location = useLocation();
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const [editingRowId, setEditingRowId] = useState<number | null>(null);

  const planId = location.state?.planId;
  const { data: fetchedData, isLoading } = usegetBudgetPlanDetail(planId || "");

  // ----------------- LOADING MGMT --------------------
  useEffect(() => {
    if (isLoading) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [isLoading, showLoading, hideLoading])

  // calculating net available resources
  const availableResources =
    Number(fetchedData?.plan_balance || 0) +
    Number(fetchedData?.plan_tax_share || 0) +
    Number(fetchedData?.plan_tax_allotment || 0) +
    Number(fetchedData?.plan_cert_fees || 0) +
    Number(fetchedData?.plan_other_income || 0);

  // Use the details as they come from the API without ordering
  const rowsProp = (fetchedData?.details || []).map(
    (detail: BudgetPlanDetail) => {
      return [
        <span className={styles.rowItem}>{detail.dtl_budget_item}</span>,
        <span className={styles.rowValue}>
          {formatNumber(detail.dtl_proposed_budget)}
        </span>,
      ];
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading budget plan details...</span>
      </div>
    );
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

        {fetchedData?.plan_year === String(new Date().getFullYear()) &&
          activeTab == "current" && (
            <DialogLayout
              trigger={
                <Button>
                  <Pen size={16} /> <span>Edit</span>
                </Button>
              }
              title={
                isEditingHeader
                  ? "Edit Budget Plan Header"
                  : "Edit Budget Plan"
              }
              description={
                isEditingHeader
                  ? "Update the budget plan header information."
                  : "Select a part of the budget plan that you want to update."
              }
              mainContent={
                isEditingHeader ? (
                  <div className="flex flex-col gap-4">
                    <Button
                      variant="outline"
                      className="w-fit"
                      onClick={() => setIsEditingHeader(false)}
                    >
                      <ChevronLeft size={16} /> Back to menu
                    </Button>
                    <BudgetHeaderEditForm
                      balance={fetchedData?.plan_balance || 0}
                      realtyTaxShare={fetchedData?.plan_tax_share || 0}
                      taxAllotment={fetchedData?.plan_tax_allotment || 0}
                      clearanceAndCertFees={fetchedData?.plan_cert_fees || 0}
                      otherSpecificIncome={fetchedData?.plan_other_income || 0}
                      actualIncome={fetchedData?.plan_actual_income || 0}
                      actualRPT={fetchedData?.plan_rpt_income || 0}
                      budgetaryObligations={
                        fetchedData?.plan_budgetaryObligations
                      }
                      planId={planId}
                      onSuccess={() => {
                        setIsEditingHeader(false);
                        setEditingRowId(null);
                      }}
                    />
                  </div>
                ) : isEditingItem ? (
                  <div className="flex flex-col gap-4">
                    <Button
                      variant="outline"
                      className="w-fit"
                      onClick={() => setIsEditingItem(false)}
                    >
                      <ChevronLeft size={16} /> Back to menu
                    </Button>
                    <BudgetItemEditForm
                      planId={planId}
                      budgetItems={fetchedData?.details || []}
                      balanceUnappropriated={
                        fetchedData?.plan_balUnappropriated
                      }
                      budgetaryObligations={
                        fetchedData?.plan_budgetaryObligations
                      }
                      onSuccess={() => {
                        setIsEditingItem(false);
                        setEditingRowId(null);
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-full"
                      onClick={() => setIsEditingHeader(true)}
                    >
                      Budget Plan Header
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => setIsEditingItem(true)}
                    >
                      Budget Plan Items
                    </Button>
                  </div>
                )
              }
              isOpen={editingRowId === Number(planId)}
              onOpenChange={(open) =>
                setEditingRowId(open ? Number(planId) : null)
              }
              className="min-w-[800px]"
            />
          )}
      </div>

      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="current" onClick={() => setActiveTab("current")}>
          Current Budget Plan
        </TabsTrigger>
        <TabsTrigger value="history" onClick={() => setActiveTab("history")}>
          Update History
        </TabsTrigger>
        <TabsTrigger
          value="documents"
          onClick={() => setActiveTab("documents")}
        >
          Supporting Documents
        </TabsTrigger>
      </TabsList>

      <TabsContent value="current" className={styles.tabContent}>
        {/* Current Budget Plan Content */}
        <div className="w-full">
          <div className={styles.budgetHeaderGrid}>
            <div className="cursor-pointer">
                <DialogLayout
                trigger={
                    <div className="p-4 bg-white flex flex-col gap-4 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                        <Label className={styles.budgetLabel}>
                        NET Available Resources:
                        </Label>
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
                    otherSpecificIncome={fetchedData?.plan_other_income ?? 0}
                    />
                }
                />
            </div>

            {/* HEADER CARDS */}
            <div className={styles.budgetItem}>
              <div className={styles.budgetLabel}>Year:</div>
              <div className={styles.budgetValue}>{fetchedData?.plan_year}</div>
            </div>

            <div className={styles.budgetItem}>
              <div className={styles.budgetLabel}>
                TOTAL BUDGETARY OBLIGATION:
              </div>
              <div className="font-semibold text-red-500">
                {formatNumber(fetchedData?.plan_budgetaryObligations ?? 0)}
              </div>
            </div>

            <div className={styles.budgetItem}>
              <div className={styles.budgetLabel}>Actual Income:</div>
              <div className={styles.budgetValue}>
                {formatNumber(fetchedData?.plan_actual_income ?? 0)}
              </div>
            </div>

            <div className={styles.budgetItem}>
              <div className={styles.budgetLabel}>Actual RPT Income:</div>
              <div className={styles.budgetValue}>
                {formatNumber(fetchedData?.plan_rpt_income ?? 0)}
              </div>
            </div>

            <div className={styles.budgetItem}>
              <div className={styles.budgetLabel}>BALANCE UNAPPROPRIATED:</div>
              <div className="font-semibold text-green-700">
                {formatNumber(fetchedData?.plan_balUnappropriated ?? 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Budget Table */}
        <div className="bg-white p-5 overflow-x-auto">
          <TableLayout header={headerProp} rows={rowsProp} />
        </div>

        <span className="text-sm text-grat-600 italic flex justify-end gap-1">
          <div>Created By: {fetchedData?.staff_name}</div>
          <div className="">
            {fetchedData?.plan_issue_date &&
              `on ${formatDate(fetchedData?.plan_issue_date, "long")}`}
          </div>
        </span>
      </TabsContent>

      <TabsContent value="history" className={styles.tabContent}>
        <BudgetPlanHistory planId={planId} />
      </TabsContent>

      <TabsContent value="documents" className={styles.tabContent}>
        <BudgetPlanSuppDocs plan_id={fetchedData?.plan_id || 0} />
      </TabsContent>
    </Tabs>
  );
}

export default ViewBudgetPlan;