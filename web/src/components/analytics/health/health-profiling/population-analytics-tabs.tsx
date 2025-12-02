import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PopulationAgePyramidChart } from "./population-age-pyramid-chart";
import { PopulationBySitioChart } from "./population-by-sitio-chart";
import { HouseholdInfrastructureChart } from "./household-infrastructure-chart";

export function PopulationAnalyticsTabs() {
  return (
    <Tabs defaultValue="age-pyramid" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="age-pyramid">Population by Age Group</TabsTrigger>
        <TabsTrigger value="by-sitio">Population by Sitio</TabsTrigger>
        <TabsTrigger value="infrastructure">Household Infrastructure</TabsTrigger>
      </TabsList>
      
      <TabsContent value="age-pyramid" className="mt-4">
        <PopulationAgePyramidChart />
      </TabsContent>
      
      <TabsContent value="by-sitio" className="mt-4">
        <PopulationBySitioChart />
      </TabsContent>
      
      <TabsContent value="infrastructure" className="mt-4">
        <HouseholdInfrastructureChart />
      </TabsContent>
    </Tabs>
  );
}
