import { Calendar, Eye, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card/card";
import { Button } from "@/components/ui/button/button";
import { useGetBudgetPlanHistory } from "./queries/budgetplanFetchQueries";
import { formatNumber } from "@/helpers/currencynumberformatter";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

function BudgetPlanHistory({ planId }: { planId: string }) {
  const { data: fetchedData = [], isLoading } = useGetBudgetPlanHistory(planId);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredData = useMemo(() => {
    return fetchedData.filter(entry => {
      return (
        formatTimestamp(entry.bph_change_date).toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatNumber(entry.bph_budgetaryObligations ?? 0).includes(searchTerm) ||
        formatNumber(entry.bph_balUnappropriated ?? 0).includes(searchTerm)
      );
    });
  }, [fetchedData, searchTerm]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (fetchedData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg font-semibold">No update history available for this budget plan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative flex-1 max-w-[20rem]">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
          size={17}
        />
        <Input 
          placeholder="Search..." 
          className="pl-10 w-full bg-white text-sm" 
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
      </div>
      
      {filteredData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-semibold">No matching history records found.</p>
        </div>
      ) : (
        filteredData.map((entry) => (
          <Card
            key={entry.bph_change_date} 
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-md font-medium">
                    Plan Year: {entry.bph_year}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {formatTimestamp(entry.bph_change_date)}
                  </CardDescription>
                </div>
                <Button
                  variant="secondary"
                  className="bg-green-100 text-green-800 hover:bg-green-200 border border-green-200"
                  onClick={() => {
                    navigate("/budget-plan-history", { 
                      state: { 
                        type: "viewing", 
                        bph_id: entry.bph_id, 
                        planId: planId 
                      } 
                    });
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" /> View
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>
                <strong>Budgetary Obligations:</strong>{" "}
                <span className="text-primary font-semibold">
                  {formatNumber(entry.bph_budgetaryObligations ?? 0)}
                </span>
              </p>
              <p>
                <strong>Balance Unappropriated:</strong>{" "}
                <span className="text-green-700 font-semibold">
                  {formatNumber(entry.bph_balUnappropriated ?? 0)}
                </span>
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default BudgetPlanHistory;