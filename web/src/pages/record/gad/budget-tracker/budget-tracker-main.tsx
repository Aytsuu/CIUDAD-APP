import { Label } from "@/components/ui/label";
import { Calendar, Search } from 'lucide-react';
import { Progress } from "@/components/ui/progress"; 
import { Input } from "@/components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import CreateGADBudgetTracker from "./budget-tracker-create-tracker-form";
import CardLayout from "@/components/ui/card/card-layout";

function GADBudgetTrackerMain() {
    let year = "2020", remainingBal = 850000.00, budget = 1000000.00, income = 150000.00, expenses = 300000.00;
    const progress = budget > 0 ? (expenses / budget) * 100 : 0;
    let styles = {
        budgetLabel: "w-[12rem]",
    };


    return (
        <div className="w-full h-full">
            <div className="flex flex-col gap-3 mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>GAD Budget Tracker</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Track and manage your income and expenses with real-time insights.
                </p>
            </div>
            <hr className="border-gray mb-5 sm:mb-4" />   

            <div className="mb-[1rem] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 max-w-[20rem]"> {/* Increased max-width */}
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                            size={17}
                        />
                        <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" /> {/* Adjust padding and text size */}
                    </div>                               
                </div>
                <DialogLayout
                    trigger={<div className="bg-primary text-white rounded-md p-3 text-sm font-semibold drop-shadow-sm w-full sm:w-auto text-center">+ Create New</div>}
                    className="max-w-md"
                    title="Create New Budget Tracker"
                    description="Fill out the form below to create a new budget tracker for a specific year."
                    mainContent={
                        <div>
                            <CreateGADBudgetTracker/>
                        </div>
                    }
                />
            </div>

            <div>
                <CardLayout
                cardTitle={
                    <h1 className="font-semibold text-xl sm:text-2xl text-primary flex items-center gap-3">
                        <div className="rounded-full border-2 border-solid border-primary p-3 flex items-center">
                            <Calendar />
                        </div>
                        <div>{year} Budget Overview</div>
                    </h1>
                }
                cardDescription=""
                cardContent={
                    <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row">
                        <Label className={styles.budgetLabel}>Total Budget:</Label>
                        <Label className="text-blue">Php {budget.toFixed(2)}</Label>
                    </div>
                    <div className="flex flex-col sm:flex-row">
                        <Label className={styles.budgetLabel}>Total Income:</Label>
                        <Label className="text-green-600">Php {income.toFixed(2)}</Label>
                    </div>
                    <div className="flex flex-col sm:flex-row">
                        <Label className="w-[12rem]">Total Expenses:</Label>
                        <Label className="text-red-600">Php {expenses.toFixed(2)}</Label>
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
                }>
                </CardLayout>
            </div>
        </div>
    );
}

export default GADBudgetTrackerMain;