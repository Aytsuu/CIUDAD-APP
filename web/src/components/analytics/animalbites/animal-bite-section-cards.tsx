// animal-bite-section-cards.tsx (modified to be a full component with month navigation)
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAnimalBiteAnalytics } from "@/pages/animalbites/db-request/get-query";
import { PawPrint, AlertTriangle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, subMonths, addMonths, parseISO, isSameMonth } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface AnimalBiteSectionCardsProps {
  initialMonth: string;
}

export function AnimalBiteSectionCards({ initialMonth }: AnimalBiteSectionCardsProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const { data: analytics, isLoading, error } = useAnimalBiteAnalytics({ months: 12, month: currentMonth }); // Assumes hook modified to accept {months, month}

  const currentDate = parseISO(`${currentMonth}-01`);
  const today = new Date();
  const currentMonthDate = parseISO(`${format(today, "yyyy-MM")}-01`);

  const nextMonthDisabled = isSameMonth(currentDate, currentMonthDate);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate =
      direction === "prev"
        ? subMonths(currentDate, 1)
        : addMonths(currentDate, 1);
    setCurrentMonth(format(newDate, "yyyy-MM"));
  };

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="text-sm">
          Failed to load animal bite section data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Summary for last 12 months ending {format(currentDate, "MMMM yyyy")}
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="group flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Previous</span>
          </Button>
          <div className="px-4 py-1.5 bg-blue-50 text-blue-800 rounded-md text-sm font-medium min-w-[120px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("next")}
            disabled={nextMonthDisabled}
            className="group flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            aria-label="Next month"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Animal Bite Cases
            </CardTitle>
            <PawPrint className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.totalCases ?? 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 12 months</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bite Exposures
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.biteCases ?? 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {analytics?.totalCases
                ? `${((analytics.biteCases / analytics.totalCases) * 100).toFixed(1)}% of total`
                : "0% of total"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Most Common Animal
            </CardTitle>
            <PawPrint className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.mostCommonAnimal || "N/A"}
            </div>
            <p className="text-xs text-gray-500 mt-1">Primary biting animal</p>
          </CardContent>
        </Card>

        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Common Exposure Site
            </CardTitle>
            <MapPin className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.mostCommonSite || "N/A"}
            </div>
            <p className="text-xs text-gray-500 mt-1">Most affected body part</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}