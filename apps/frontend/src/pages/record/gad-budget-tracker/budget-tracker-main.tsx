import { Label } from "@/components/ui/label";
import { Calendar } from 'lucide-react';
import { Progress } from "@/components/ui/progress"; 
import { Input } from "@/components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import CreateGADBudgetTracker from "./budget-tracker-create-tracker-form";

function GADBudgetTrackerMain(){

    let year = "2020", remainingBal = 850000.00, budget = 1000000.00, income = 150000.00, expenses = 300000.00;
    const progress = budget > 0 ? (expenses / budget) * 100 : 0;
    let styles = {
        budgetLabel: "w-[12rem]",
    }

    return(
        <div className="bg-snow w-full h-full">
                    <div>
                        <div className="mx-4 mb-4 mt-10 gap-4 flex flex-col p-5">
                            <div className="flex flex-col gap-3 mb-4">
                                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                                    <div>GAD Budget Tracker</div>
                                </h1>
                                <p className="text-xs sm:text-sm text-darkGray">
                                Track and manage your income and expenses with real-time insights.
                                </p>
                            </div>
                            <hr className="border-gray mb-5 sm:mb-4" />   
                        </div>

                            <div className="flex justify-end gap-5 m-5">
                                <DialogLayout
                                trigger={ <div className="bg-primary text-white rounded-md p-3 text-sm font-semibold drop-shadow-sm">+ Create New</div>}
                                className="max-w-md"
                                title="Create New Budget Tracker"
                                description="Fill out the form below to create a new budget tracker for a specific year."
                                mainContent={
                                    <div>
                                    <CreateGADBudgetTracker/>
                                    </div>
                                }></DialogLayout>
                                <Input className="w-[20rem] bg-white" placeholder="Search"></Input>
                            </div>
                    </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 m-5">
                    <div className="border-2 border-solid border-gray-300 bg-white rounded-2xl p-8 w-full mb-4 min-h-[300px]">
                        <div className="flex flex-col gap-6">
                            <h1 className="font-semibold text-xl sm:text-2xl text-primary flex items-center gap-3">
                                <div className="rounded-full border-2 border-solid border-primary p-3 flex items-center">
                                    <Calendar />
                                </div>
                                <div>{year} Budget Overview</div>
                            </h1>

                            <div className="flex flex-col gap-4">
                                <div className = "flex flex-row">
                                    <Label className={styles.budgetLabel}>Total Budget:</Label>
                                    <Label className = "text-blue">Php {budget.toFixed(2)}</Label>
                                </div>
                                <div className = "flex flex-row">
                                    <Label className={styles.budgetLabel}>Total Income:</Label>
                                    <Label className = "text-green-600">Php {income.toFixed(2)}</Label>
                                </div>
                                <div className = "flex flex-row">
                                    <Label className="w-[12rem]">Total Expenses:</Label>
                                    <Label className = "text-red-600">Php {expenses.toFixed(2)}</Label>
                                </div>
                                <div className = "flex flex-row">
                                    <Label className="w-[12rem]">Remaining Balance:</Label>
                                    <Label className = "text-yellow-600">Php {remainingBal.toFixed(2)}</Label>
                                </div>

                                <div className="mt-4">
                                    <Progress value={progress} className="w-full h-4 bg-gray-300" />
                                    <div className="text-sm text-gray-600 text-center mt-2">
                                    {progress.toFixed(2)}% of budget spent
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
        </div>
    )
}

export default GADBudgetTrackerMain;