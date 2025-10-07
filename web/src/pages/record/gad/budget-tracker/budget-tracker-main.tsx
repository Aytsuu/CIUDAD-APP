import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Search, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import CardLayout from "@/components/ui/card/card-layout";
import { useGetGADYearBudgets } from "./queries/BTYearQueries";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/use-debounce";
import { useLoading } from "@/context/LoadingContext"; 

function GADBudgetTrackerMain() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const navigate = useNavigate();
  const {
    data: years = [],
    isLoading,
    isError,
  } = useGetGADYearBudgets(debouncedSearchQuery);
  const { showLoading, hideLoading } = useLoading();

  const sortedYears = [...years].sort(
    (a, b) => Number(b.gbudy_year) - Number(a.gbudy_year)
  );

  const handleCardClick = (gbudy_year: string) => {
    navigate(`/gad/gad-budget-tracker-table/${gbudy_year}/`);
  };

   useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

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
    <div className="w-full h-full">
      <header className="flex flex-col gap-3 mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 mb-1">
          GAD Budget Tracker
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Track and manage your income and expenses with real-time insights.
        </p>
        <hr className="border-gray mt-4" />
      </header>

      <div className="flex flex-col sm:flex-row w-full pb-5">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
            size={17}
          />
          <Input
            placeholder="Search..."
            className="pl-10 w-full bg-white text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 flex items-center justify-center py-16 gap-2 text-gray-500">
            <Spinner size="lg" />
            Loading records...
          </div>
        ) : sortedYears.length > 0 ? (
          sortedYears.map((tracker) => {
            const budget = tracker.gbudy_budget || 0;
            const expenses = tracker.gbudy_expenses || 0;
            const remainingBal = budget - expenses;
            const progress = budget > 0 ? (expenses / budget) * 100 : 0;

            return (
              <div
                key={tracker.gbudy_year}
                onClick={() => handleCardClick(tracker.gbudy_year)}
                className="cursor-pointer hover:opacity-90 transition-opacity"
              >
                <CardLayout
                  title={
                    <div className="flex flex-row">
                      <div className="flex justify-between items-center w-full">
                        <h1 className="font-semibold text-xl sm:text-2xl text-primary flex items-center gap-3">
                          <div className="rounded-full border-2 border-solid border-primary p-3 flex items-center">
                            <Calendar />
                          </div>
                          <div>{tracker.gbudy_year} Budget Overview</div>
                        </h1>
                      </div>
                    </div>
                  }
                  description=""
                  content={
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row">
                        <Label className="w-[12rem]">Total Budget:</Label>
                        <Label className="text-blue">
                          Php {tracker.gbudy_budget}
                        </Label>
                      </div>
                      <div className="flex flex-col sm:flex-row">
                        <Label className="w-[12rem]">Total Expenses:</Label>
                        <Label className="text-red-600">Php {expenses}</Label>
                      </div>
                      <div className="flex flex-col sm:flex-row">
                        <Label className="w-[12rem]">Remaining Balance:</Label>
                        <Label className="text-yellow-600">
                          Php {remainingBal}
                        </Label>
                      </div>
                      <div className="mt-4">
                        <Progress
                          value={progress}
                          className="w-full h-4 bg-gray-300"
                        />
                        <div className="text-sm text-gray-600 text-center mt-2">
                          {progress.toFixed(2)}% of budget spent
                        </div>
                      </div>
                    </div>
                  }
                />
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No budget record found. 
          </div>
        )}
      </section>
    </div>
  );
}

export default GADBudgetTrackerMain;
