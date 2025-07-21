import { useQuery } from "@tanstack/react-query";
import { IncomeExpense } from "./treasurerIncomeExpenseFetchQueries";
import { getIncomeExpense } from "../request/income-ExpenseTrackingGetRequest";
import { Income } from "./treasurerIncomeExpenseFetchQueries";


//Expense Quarterly
export interface QuarterlyData {
  quarter: number;
  total: number;
  items: IncomeExpense[];
}

export const calculateQuarterlyExpenses = (data: IncomeExpense[]): QuarterlyData[] => {
  // Initialize quarterly data
  const quarters: QuarterlyData[] = [
    { quarter: 1, total: 0, items: [] },
    { quarter: 2, total: 0, items: [] },
    { quarter: 3, total: 0, items: [] },
    { quarter: 4, total: 0, items: [] },
  ];

  data.forEach(item => {
    // Skip if not an expense item
    if (item.iet_entryType !== 'Expense') return;

    // Parse the date and determine quarter
    const date = new Date(item.iet_datetime);
    // Validate the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date for item:', item);
      return;
    }
    
    const quarter = Math.floor((date.getMonth() + 3) / 3);
    const quarterIndex = quarter - 1;

    // Determine which amount to use with explicit checks
    let amount = 0;
    if (item.iet_actual_amount !== null && item.iet_actual_amount !== undefined) {
      amount = Number(item.iet_actual_amount);
    } else if (item.iet_amount !== null && item.iet_amount !== undefined) {
      amount = Number(item.iet_amount);
    }

    // Validate the amount is a valid number
    if (isNaN(amount)) {
      console.warn('Invalid amount for item:', item);
      return;
    }

    // Update the quarter data
    quarters[quarterIndex].total += amount;
    quarters[quarterIndex].items.push(item);
  });

  return quarters;
};

export const useIncomeExpense = (year?: number) => {
  return useQuery<IncomeExpense[], Error, { allData: IncomeExpense[]; quarterlyExpenses: QuarterlyData[] }>({
    queryKey: ["incomeExpense", year],
    queryFn: () => getIncomeExpense(year),
    staleTime: 1000 * 60 * 30,
    select: (data) => {
      return {
        allData: data,
        quarterlyExpenses: calculateQuarterlyExpenses(data)
      };
    }
  });
};




//Income Quarterly
interface IncomeQuarterData {
  name: string; // incp_item
  Q1?: number;
  Q2?: number;
  Q3?: number;
  Q4?: number;
}

export const getQuarterlyIncomeByItem = (income: Income[]): IncomeQuarterData[] => {
  const grouped: Record<string, IncomeQuarterData> = {};

  income.forEach(item => {
    if (item.inc_entryType !== 'Income') return;

    const date = new Date(item.inc_datetime);
    if (isNaN(date.getTime())) return;

    const quarter = `Q${Math.floor((date.getMonth() + 3) / 3)}` as 'Q1' | 'Q2' | 'Q3' | 'Q4';
    const amount = Number(item.inc_amount || 0);
    const key = item.incp_item;

    if (!grouped[key]) {
      grouped[key] = { name: key };
    }

    grouped[key][quarter] = (grouped[key][quarter] || 0) + amount;
  });

  return Object.values(grouped);
};