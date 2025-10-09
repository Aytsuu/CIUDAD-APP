import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useReportsCount } from "@/pages/healthServices/count-return/count"
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router";

// Memoized card component that rerenders when props change
const HealthCard = React.memo(({ 
  title, 
  value, 
  isLoading,
  onClick
}: { 
  title: string; 
  value?: number | string; 
  isLoading: boolean;
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
    <CardFooter className="flex-col items-start gap-1.5 text-sm" />
    
    {/* Animated Arrow */}
    <div className="absolute top-4 right-4 opacity-0 -translate-x-2 -translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <ArrowUpRight className="w-4 h-4 text-primary" />
      </div>
    </div>
  </Card>
));

HealthCard.displayName = "HealthCard";

export const useHealthServicesSectionCards = () => {
  const navigate = useNavigate();
  const { data: healthCardAnalytics, isLoading } = useReportsCount();

  return {
    childHealth: (
      <HealthCard 
        title="Child Health" 
        value={healthCardAnalytics?.data?.child_count} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/services/child-health")
        }}
      />
    ),
    firstAid: (
      <HealthCard 
        title="First Aid" 
        value={healthCardAnalytics?.data?.firstaid_records_count} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/services/first-aid")
        }}
      />
    ),
    medicine: (
      <HealthCard 
        title="Medicine" 
        value={healthCardAnalytics?.data?.medicine_records_count} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/services/medicine")
        }}
      />
    ),
    vaccinations: (
      <HealthCard 
        title="Vaccinations" 
        value={healthCardAnalytics?.data?.vaccination_records_count} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/services/vaccination")
        }}
      />
    ),
    consultations: (
      <HealthCard 
        title="Consultations" 
        value={healthCardAnalytics?.data?.medicalconsultation_records_count} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/services/medical-consultation")
        }}
      />
    ),
    animalBites: (
      <HealthCard 
        title="Animal Bites" 
        value={healthCardAnalytics?.data?.animalbite_records_count} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/services/animalbites")
        }}
      />
    ),
    familyPlanning: (
      <HealthCard 
        title="Family Planning" 
        value={healthCardAnalytics?.data?.familyplanning_records_count} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/services/familyplanning")
        }}
      />
    ),
    maternal: (
      <HealthCard 
        title="Maternal Health" 
        value={healthCardAnalytics?.data?.pregnancy_count} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/services/maternal")
        }}
      />
    )
  };
};
