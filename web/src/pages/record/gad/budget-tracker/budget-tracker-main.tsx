import { Label } from "@/components/ui/label";
import { Calendar, Search, X } from 'lucide-react'; // Import X icon
import { Progress } from "@/components/ui/progress"; 
import { Input } from "@/components/ui/input";
import CardLayout from "@/components/ui/card/card-layout";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router";

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

function GADBudgetTrackerMain() {
    let styles = {
        budgetLabel: "w-[12rem]",
    };

    return (
        <div className="w-full h-full bg-snow">
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
                        <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" />
                    </div>                               
                </div>
                <Link to="/gad-budget-tracker-table"><Button>+ Create New</Button></Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                {BudgetTracker.map((tracker, index) => {
                    const progress = tracker.budget > 0 ? (tracker.expenses / tracker.budget) * 100 : 0;

                    return (
                        <CardLayout
                            key={index}
                            cardTitle={
                                <div className="flex flex-row">
                                    <div className="flex justify-between items-center w-full">
                                        <h1 className="font-semibold text-xl sm:text-2xl text-primary flex items-center gap-3">
                                            <div className="rounded-full border-2 border-solid border-primary p-3 flex items-center">
                                                <Calendar />
                                            </div>
                                            <div>{tracker.year} Budget Overview</div>
                                        </h1>
                                    </div>
                                    <X className="text-gray-500 hover:text-red-600 cursor-pointer" size={20} />
                                </div>
                            }
                            cardDescription=""
                            cardContent={
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col sm:flex-row">
                                        <Label className={styles.budgetLabel}>Total Budget:</Label>
                                        <Label className="text-blue">Php {tracker.budget.toFixed(2)}</Label>
                                    </div>
                                    <div className="flex flex-col sm:flex-row">
                                        <Label className={styles.budgetLabel}>Total Income:</Label>
                                        <Label className="text-green-600">Php {tracker.income.toFixed(2)}</Label>
                                    </div>
                                    <div className="flex flex-col sm:flex-row">
                                        <Label className="w-[12rem]">Total Expenses:</Label>
                                        <Label className="text-red-600">Php {tracker.expenses.toFixed(2)}</Label>
                                    </div>
                                    <div className="flex flex-col sm:flex-row"> 
                                        <Label className="w-[12rem]">Remaining Balance:</Label>
                                        <Label className="text-yellow-600">Php {tracker.remainingBal.toFixed(2)}</Label>
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

export default GADBudgetTrackerMain;


//create button should be creating a new card with what year
//clicking the card should redirect to the table of year selected