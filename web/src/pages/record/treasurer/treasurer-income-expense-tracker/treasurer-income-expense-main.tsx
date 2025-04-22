import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button/button";
import { ColumnDef } from "@tanstack/react-table";
import { Label } from "@/components/ui/label";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import IncomeandExpenseCreateForm from "./treasurer-expense-tracker-create";
import IncomeandExpenseEditForm from "./treasurer-expense-tracker-edit";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useIncomeExpense, type IncomeExpense } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useDeleteIncomeExpense } from "./queries/treasurerIncomeExpenseDeleteQueries";
import { Link } from 'react-router';
import IncomeandExpenseTracking from "./treasurer-expense-tracker-main";
import CardLayout from "@/components/ui/card/card-layout";
import { Calendar, Search, X, Plus } from 'lucide-react';
import { Progress } from "@/components/ui/progress"; 
import { useIncomeExpenseMainCard } from "./queries/treasurerIncomeExpenseFetchQueries";




export const BudgetTracker = [
    {
        year: "2020",
        budget: 500000.00,
        income: 150000.00,
        expenses: 300000.00,
        remainingBal: 350000.00,
    },
    {
        year: "2021",
        budget: 650000.00,
        income: 150000.00,
        expenses: 300000.00,
        remainingBal: 350000.00,
    }
]



function IncomeExpenseMain() {

    const { data: fetchedData = [], isLoading } = useIncomeExpenseMainCard();

    let styles = {
        budgetLabel: "w-[12rem]",
    };
    
    return (
        <div className="w-full h-full">
            <div className="flex flex-col gap-3 mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>Income Expense Tracking</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Gain clear insights into your finances by tracking income and expenses in real time.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-9" /> 


            <div className="mb-[1rem] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                            size={17}
                        />
                        <Input 
                            placeholder="Search..." 
                            className="pl-10 w-full bg-white text-sm" 
                        />
                    </div>
                        
                </div>
                <Link to="/treasurer-income-and-expense-tracking">
                    <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold px-4 py-2 rounded cursor-pointer">
                        <Plus size={15} strokeWidth={3}></Plus>New Entry 
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                {fetchedData.map((tracker, index) => {
                    const progress = tracker.ie_main_tot_budget > 0 ? (tracker.ie_main_exp / tracker.ie_main_tot_budget) * 100 : 0;
                    const remainingBal = tracker.ie_main_tot_budget - tracker.ie_main_exp;

                    return (
                        <CardLayout
                            key={index}
                            title={
                                <div className="flex flex-row">
                                    <div className="flex justify-between items-center w-full">
                                        <h1 className="font-semibold text-xl sm:text-2xl text-primary flex items-center gap-3 pb-4">
                                            <div className="rounded-full border-2 border-solid border-primary p-3 flex items-center">
                                                <Calendar />
                                            </div>
                                            <div>{tracker.ie_main_year} Budget Overview</div>
                                        </h1>
                                    </div>
                                    <X className="text-gray-500 hover:text-red-600 cursor-pointer" size={20} />
                                </div>
                            }
                            description=""
                            content={
                                <div className="flex flex-col gap-4 pl-3">
                                    <div className="flex flex-col sm:flex-row">
                                        <Label className={styles.budgetLabel}>Total Budget:</Label>
                                        <Label className="text-blue">Php {tracker.ie_main_tot_budget.toFixed(2)}</Label>
                                    </div>
                                    <div className="flex flex-col sm:flex-row">
                                        <Label className={styles.budgetLabel}>Total Income:</Label>
                                        <Label className="text-green-600">Php {tracker.ie_main_inc.toFixed(2)}</Label>
                                    </div>
                                    <div className="flex flex-col sm:flex-row">
                                        <Label className="w-[12rem]">Total Expenses:</Label>
                                        <Label className="text-red-600">Php {tracker.ie_main_exp.toFixed(2)}</Label>
                                    </div>
                                    <div className="flex flex-col sm:flex-row"> 
                                        <Label className="w-[12rem]">Remaining Balance:</Label>
                                        <Label className="text-yellow-600">Php {remainingBal.toFixed(2)}</Label>
                                    </div>

                                    <div className="mt-4">
                                        <Progress value={progress} className="w-full h-4 bg-gray-300" />
                                        <div className="text-sm text-gray-600 text-center mt-2">
                                            {progress.toFixed(2)}% of budget spent
                                        </div>
                                    </div>
                                </div>
                            }
                        />
                    );
                })}
            </div>

        </div>
    );
}

export default IncomeExpenseMain;



