import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnimalBiteAnalytics } from "@/pages/animalbites/db-request/get-query";
import { PawPrint, AlertTriangle, MapPin } from "lucide-react";

export const useAnimalBiteSectionCards = () => {
  // Fetch analytics data for the last 12 months
  const { data: analytics } = useAnimalBiteAnalytics(12);

  // Total cases card
  const totalCases = (
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
  );

  // Bite exposures card
  const biteCases = (
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
  );

  // Most common animal card
  const commonAnimal = (
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
  );

  // Common exposure site card
  const commonSite = (
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
  );

  // Return all cards as an object
  return { totalCases, biteCases, commonAnimal, commonSite };
};
