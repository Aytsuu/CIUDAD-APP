import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react"; 
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import CardLayout from "@/components/ui/card/card-layout";
import { Button } from "@/components/ui/button/button";
import { useBudgetYears, useCreateCurrentYearBudgetWithFeedback } from "./queries/BTYearQueries";
import { Skeleton } from "@/components/ui/skeleton";

function GADBudgetTrackerMain() {
  const navigate = useNavigate();
  const { 
    data: years = [], 
    isLoading, 
    isError, 
    refetch 
  } = useBudgetYears();
  
  const { mutate: createYear } = useCreateCurrentYearBudgetWithFeedback();

  const handleCreateNew = () => {
    createYear();
  };

  const handleCardClick = (year: string) => {
    navigate(`/gad/gad-budget-tracker-table/${year}`);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-snow">
        <div className="flex flex-col gap-3 mb-4">
          <Skeleton className="h-10 w-1/4 mb-3 opacity-30" />
          <Skeleton className="h-6 w-1/3 opacity-30" />
        </div>
        <Skeleton className="h-6 w-full mb-6 opacity-30" />
        <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 w-full opacity-30" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full bg-snow p-4">
        <div className="text-red-500 text-center mt-10">
          Failed to load budget data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-snow p-4 md:p-6">
      <header className="mb-6">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 mb-1">
          GAD Budget Tracker
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Track and manage your income and expenses with real-time insights.
        </p>
        <hr className="border-gray mt-4" />
      </header>

      <section className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input 
              placeholder="Search budgets..." 
              className="pl-10 w-full bg-white text-sm"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleCreateNew}
          className="w-full md:w-auto"
        >
          + Create Budget Entry
        </Button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {years.map((tracker) => {
          const progress = tracker.budget > 0 
            ? (tracker.expenses / tracker.budget) * 100 
            : 0;

          return (
            <div 
              key={tracker.year} 
              onClick={() => handleCardClick(tracker.year)}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            >
              <CardLayout
                title={`${tracker.year} Budget Overview`}
                content={
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row">
                      <Label className="w-[12rem]">Total Budget:</Label>
                      <Label className="text-blue">Php {tracker.budget.toFixed(2)}</Label>
                    </div>
                    <div className="flex flex-col sm:flex-row">
                      <Label className="w-[12rem]">Total Income:</Label>
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
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default GADBudgetTrackerMain;