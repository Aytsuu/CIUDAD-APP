import TableLayout from "@/components/ui/table/table-layout";
import { formatNumber } from "@/helpers/currencynumberformatter";
import { Skeleton } from "@/components/ui/skeleton";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import DisplayBreakdown from "./netBreakdownDisplay";
import { Label } from "@/components/ui/label";
import { useGetBudgetPlanAndDetailHistory } from "./queries/budgetplanFetchQueries";
import { useLocation } from "react-router";
import { budgetItemsPage1, budgetItemsPage2, budgetItemsPage3, budgetItemsPage4 } from "./budgetItemDefinition";
import { ChevronLeft, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";

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
  changedText: "text-red-600 font-semibold",
};

const headerProp = ["", "Per Proposed Budget", "Budgetary Limitation", "Balance"].map(
  (text) => <span className={styles.header}>{text}</span>
);

function ViewBudgetPlanHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bph_id } = location.state;
  const { data: fetchedData, isLoading } = useGetBudgetPlanAndDetailHistory(bph_id);

  const availableResources =
    Number(fetchedData?.bph_balance ?? 0) +
    Number(fetchedData?.bph_tax_share ?? 0) +
    Number(fetchedData?.bph_tax_allotment ?? 0) +
    Number(fetchedData?.bph_cert_fees ?? 0) +
    Number(fetchedData?.bph_other_income ?? 0);

  // Compute totals
  const personalServiceTotal = fetchedData?.detail_history
    ?.filter((d) => d.bpdh_budget_category === "Personal Service")
    .reduce((sum, d) => sum + Number(d.bpdh_proposed_budget), 0) ?? 0;

  const otherExpenseTotal = fetchedData?.detail_history
    ?.filter((d) => d.bpdh_budget_category === "Other Expense")
    .reduce((sum, d) => sum + Number(d.bpdh_proposed_budget), 0) ?? 0;

  const capitalOutlaysTotal = fetchedData?.detail_history
    ?.filter((d) => d.bpdh_budget_category === "Capital Outlays")
    .reduce((sum, d) => sum + Number(d.bpdh_proposed_budget), 0) ?? 0;

  const nonOfficeTotal = fetchedData?.detail_history
    ?.filter((d) => d.bpdh_budget_category === "Non-Office")
    .reduce((sum, d) => sum + Number(d.bpdh_proposed_budget), 0) ?? 0;

  const calamityFundTotal = fetchedData?.detail_history
    ?.filter((d) => d.bpdh_budget_category === "LDRRM Fund")
    .reduce((sum, d) => sum + Number(d.bpdh_proposed_budget), 0) ?? 0;

  // Compute limits
  const personalServiceLimit = (fetchedData?.bph_actual_income ?? 0) * ((fetchedData?.bph_personalService_limit ?? 0) / 100);
  const miscExpenseLimit = (fetchedData?.bph_rpt_income ?? 0) * ((fetchedData?.bph_miscExpense_limit ?? 0) / 100);
  const nonOfficeLimit = (fetchedData?.bph_tax_allotment ?? 0) * ((fetchedData?.bph_localDev_limit ?? 0) / 100);
  const skfundLimit = availableResources * ((fetchedData?.bph_skFund_limit ?? 0) / 100);
  const calamityfundLimit = availableResources * ((fetchedData?.bph_calamityFund_limit ?? 0) / 100);

  // 1. Prepare ordered label list
  const orderedBudgetLabels = [
    ...budgetItemsPage1,
    ...budgetItemsPage2,
    ...budgetItemsPage3,
    ...budgetItemsPage4,
  ].map((item) => item.label);

  // 2. Sort fetched details by this order
  const sortedDetails = [...(fetchedData?.detail_history ?? [])].sort((a, b) => {
    const idxA = orderedBudgetLabels.indexOf(a.bpdh_budget_item ?? "");
    const idxB = orderedBudgetLabels.indexOf(b.bpdh_budget_item ?? "");
    return (idxA === -1 ? Infinity : idxA) - (idxB === -1 ? Infinity : idxB);
  });

  // 3. Build rows
  const rowsProp = sortedDetails.reduce<any[]>((acc, detail) => {
    if (acc.length === 0) {
      acc.push(
        [<span className={styles.mainCategory}>CURRENT OPERATING EXPENDITURES</span>],
        [<span className={styles.subCategory}>Personal Services ({fetchedData?.bph_personalService_limit}%)</span>]
      );
    }

    const isIndented = [
      "GAD Program",
      "Senior Citizen/ PWD Program",
      "BCPC (Juvenile Justice System)",
      "BADAC Program",
      "Nutrition Program",
      "Combating AIDS Program",
      "Barangay Assembly Expenses",
      "Disaster Response Program",
    ].includes(detail.bpdh_budget_item);

    const labelClass = `${isIndented ? styles.indentedRowItem : styles.rowItem} ${
      detail.bpdh_is_changed ? styles.changedText : ""
    }`;
    const valueClass = `${styles.rowValue} ${detail.bpdh_is_changed ? styles.changedText : ""}`;

    const itemLabel =
      detail.bpdh_budget_item === "Extraordinary & Miscellaneous Expense"
        ? `${detail.bpdh_budget_item} (${fetchedData?.bph_miscExpense_limit ?? 0}%)`
        : detail.bpdh_budget_item;

    const mainRow = [
      <span className={labelClass}>{itemLabel}</span>,
      <span className={valueClass}>{formatNumber(detail.bpdh_proposed_budget)}</span>,
    ];

    // Additional columns based on special items
    switch (detail.bpdh_budget_item) {
      case "Membership Dues/ Contribution to Organization":
        mainRow.push(<span className={styles.rowValue}>{formatNumber(detail.bpdh_proposed_budget)}</span>);
        break;
      case "Extraordinary & Miscellaneous Expense":
        mainRow.push(
          <span className={styles.rowValue}>{formatNumber(miscExpenseLimit)}</span>,
          <span className={styles.rowValue}>{formatNumber(miscExpenseLimit - detail.bpdh_proposed_budget)}</span>
        );
        break;
      case "Subsidy to Sangguniang Kabataan (SK) Fund":
        mainRow.push(
          <span className={styles.rowValue}>{formatNumber(skfundLimit)}</span>,
          <span className={styles.rowValue}>{formatNumber(skfundLimit - detail.bpdh_proposed_budget)}</span>
        );
        break;
      default:
        break;
    }

    acc.push(mainRow);

    // Footer rows at specific breakpoints
    if (detail.bpdh_budget_item === "Commutation of Leave Credits") {
      acc.push(
        ["", <div className={styles.budgetFooter}>Total: {formatNumber(personalServiceTotal)}</div>, <div className={styles.budgetFooter}>{formatNumber(personalServiceLimit)}</div>, <div className={styles.budgetFooter}>{formatNumber(personalServiceLimit - personalServiceTotal)}</div>],
        [<span className={styles.subCategory}>Maint. & Other Operating Expenses</span>]
      );
    } else if (detail.bpdh_budget_item === "Disaster Supplies") {
      acc.push(
        ["", <div className={styles.budgetFooter}>Total: {formatNumber(calamityFundTotal)}</div>, <div className={styles.budgetFooter}>{formatNumber(calamityfundLimit)}</div>, <div className={styles.budgetFooter}>{formatNumber(calamityfundLimit - calamityFundTotal)}</div>]
      );
    } else if (detail.bpdh_budget_item === "Rehabilitation of Multi-Purpose") {
      acc.push(
        ["", <div className={styles.budgetFooter}>Total: {formatNumber(nonOfficeTotal)}</div>, <div className={styles.budgetFooter}>{formatNumber(nonOfficeLimit)}</div>, <div className={styles.budgetFooter}>{formatNumber(nonOfficeLimit - nonOfficeTotal)}</div>],
        [],
        [<span className={styles.subCategory}>Sangguniang Kabataan Fund ({fetchedData?.bph_skFund_limit}%)</span>]
      );
    } else if (detail.bpdh_budget_item === "Total Capital Outlays") {
      acc.push(
        ["", <div className={styles.budgetFooter}>Total: {formatNumber(capitalOutlaysTotal)}</div>],
        [<span className={styles.mainCategory}>NON-OFFICE</span>],
        [<span className={styles.subCategory}>Local Development Fund ({fetchedData?.bph_localDev_limit}%)</span>]
      );
    } else if (detail.bpdh_budget_item === "Extraordinary & Miscellaneous Expense") {
      acc.push(
        ["", <div className={styles.budgetFooter}>Total: {formatNumber(otherExpenseTotal)}</div>],
        [<span className={styles.mainCategory}>CAPITAL OUTLAYS</span>]
      );
    } else if (detail.bpdh_budget_item === "Subsidy to Sangguniang Kabataan (SK) Fund") {
      acc.push(
        [<span className={styles.subCategory}>LDRRM Fund /Calamity Fund ({fetchedData?.bph_calamityFund_limit}%)</span>]
      );
    }

    return acc;
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  return (
    <div className="w-full">
       <div className="flex items-center justify-between mb-4">
          <Button  className="text-black p-2"   variant="outline"  onClick={() => navigate(-1)} >
            <ChevronLeft />
          </Button>
     
      
        <h1 className={styles.headerTitle}>BUDGET PLAN HISTORY {fetchedData?.bph_year}</h1>
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
              balance={fetchedData?.bph_balance ?? 0}
              realtyTaxShare={fetchedData?.bph_tax_share ?? 0}
              taxAllotment={fetchedData?.bph_tax_allotment ?? 0}
              clearanceAndCertFees={fetchedData?.bph_cert_fees ?? 0}
              otherSpecificIncome={fetchedData?.bph_other_income ?? 0}
            />
          }
        />

        {/* Budget Info Cards */}
        {[["Year", fetchedData?.bph_year], ["Total Budgetary Obligation", fetchedData?.bph_budgetaryObligations], ["Actual Income", fetchedData?.bph_actual_income], ["Actual RPT Income", fetchedData?.bph_rpt_income], ["Balance Unappropriated", fetchedData?.bph_balUnappropriated]].map(([label, value], i) => (
          <div key={i} className={styles.budgetItem}>
          <div className={styles.budgetLabel}>
            {typeof label === "string" ? label.toUpperCase() : label}
          </div>
            <div className={`${i === 1 ? "font-semibold text-red-500" : i === 4 ? "font-semibold text-green-700" : styles.budgetValue}`}>
              {formatNumber(Number(value ?? 0))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-5 overflow-x-auto mt-4">
        <TableLayout header={headerProp} rows={rowsProp} />
      </div>
    </div>
  );
}

export default ViewBudgetPlanHistory;
