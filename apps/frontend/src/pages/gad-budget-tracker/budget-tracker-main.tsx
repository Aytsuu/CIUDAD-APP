import { Label } from "@/components/ui/label";
import { Calendar } from 'lucide-react';
import { Progress } from "@/components/ui/progress"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function GADBudgetTrackerMain(){

    let year = "2020", remainingBal = 850000.00, budget = 1000000.00, income = 150000.00, expenses = 300000.00;
    const progress = budget > 0 ? (expenses / budget) * 100 : 0;

    return(
        <div className="bg-snow p-4 items-center">
                <div className="mx-4 mb-4 mt-10 gap-4 flex flex-col p-5">
                    <div className="flex flex-col gap-3 mb-4">
                        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                            <div>GAD Budget Tracker</div>
                        </h1>
                        <p className="text-xs sm:text-sm text-darkGray">
                        Track and manage your income and expenses   with real-time insights.
                        </p>
                    </div>
                    <hr className="border-gray mb-5 sm:mb-4" />   
                </div>

                <div className="flex justify-end gap-5 m-5">
                    <Button> + Create New</Button>
                    <Input className="w-[20rem] bg-white" placeholder="Search"></Input>
                </div>


                <div className="flex justify-center">
                    <div className="border-2 border-solid border-gray-300 bg-white rounded-2xl m-5 p-8 w-full min-h-[250px]">
                        <div className="flex flex-col gap-6">
                            <h1 className="font-semibold text-xl sm:text-2xl text-primary flex items-center gap-3">
                                <div className="rounded-full border-2 border-solid border-primary p-3 flex items-center">
                                    <Calendar />
                                </div>
                                <div>{year} Budget Overview</div>
                            </h1>

                            <div className="flex flex-col gap-4">
                                <div className = "flex flex-row">
                                    <Label className="w-[12rem]">Total Budget:</Label>
                                    <Label className = "text-blue">Php {budget.toFixed(2)}</Label>
                                </div>
                                <div className = "flex flex-row">
                                    <Label className="w-[12rem]">Total Income:</Label>
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