import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useGetAllPersonnel, useGetTrucks } from "@/pages/record/waste-scheduling/waste-personnel/queries/truckFetchQueries";

const WasteCard = React.memo(({ 
  title, 
  value, 
  isLoading,
  description,
  onClick
}: { 
  title: string; 
  value?: number | string; 
  isLoading: boolean;
  description?: string;
  onClick?: () => void;
}) => (
  <Card 
    className="relative cursor-pointer transition-all duration-300 hover:shadow-md group overflow-hidden"
    onClick={onClick}
  >
    <CardHeader>
      <CardDescription className="truncate">{title}</CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        {!isLoading && value !== undefined ? value : "..."}
      </CardTitle>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1.5 text-sm">
      {description && (
        <div className="text-sm text-gray-600">
          {description}
        </div>
      )}
    </CardFooter>
    
    {/* Animated Arrow */}
    <div className="absolute top-4 right-4 opacity-0 -translate-x-2 -translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <ArrowUpRight className="w-4 h-4 text-primary" />
      </div>
    </div>
  </Card>
));

WasteCard.displayName = "WasteCard";

export const useWastePersonnelSectionCards = () => {
  const navigate = useNavigate();
  
  // Queries for waste personnel data
  const { data: driverLoaderData, isLoading: isLoadingDrivers } = useGetAllPersonnel(1, 1, "", "DRIVER LOADER", { enabled: true });
  const { data: loaderData, isLoading: isLoadingLoaders } = useGetAllPersonnel(1, 1, "", "LOADER", { enabled: true });
  const { data: trucksData, isLoading: isLoadingTrucks } = useGetTrucks(1, 1000, "", false, { enabled: true });

  // Calculate counts
  const driverLoaderCount = driverLoaderData?.count || 0;
  const loaderCount = loaderData?.count || 0;
  const operationalTrucksCount = trucksData?.results?.filter(
    (truck: any) => truck.truck_status === "Operational"
  ).length || 0;

  const isLoading = isLoadingDrivers || isLoadingLoaders || isLoadingTrucks;

  return {
    driverLoaders: (
      <WasteCard 
        title="Driver Loaders" 
        value={driverLoaderCount}
        isLoading={isLoading}
        onClick={() => {
          navigate("/waste-personnel")
        }}
      />
    ),
    wasteLoaders: (
      <WasteCard 
        title="Loaders" 
        value={loaderCount}
        isLoading={isLoading}
        onClick={() => {
          navigate("/waste-personnel")
        }}
      />
    ),
    collectionVehicles: (
      <WasteCard 
        title="Collection Vehicles" 
        value={operationalTrucksCount}
        isLoading={isLoading}
        onClick={() => {
          navigate("/waste-personnel")
        }}
      />
    )
  };
};