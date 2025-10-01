import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetCardAnalytics } from "./profiling-analytics-queries"
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router";

// Memoized card component that rerenders when props change
const ProfilingCard = React.memo(({ 
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
      <CardDescription>{title}</CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        {!isLoading && value ? value : "..."}
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

ProfilingCard.displayName = "ProfilingCard";

export const useProfilingSectionCards = () => {
  const navigate = useNavigate();
  const { data: profilingCardAnalytics, isLoading } = useGetCardAnalytics();

  
  return {
    residents: (
      <ProfilingCard 
        title="Residents" 
        value={profilingCardAnalytics?.residents} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/profiling/resident")
        }}
      />
    ),
    families: (
      <ProfilingCard 
        title="Families" 
        value={profilingCardAnalytics?.families} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/profiling/family")
        }}
      />
    ),
    households: (
      <ProfilingCard 
        title="Households" 
        value={profilingCardAnalytics?.households} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/profiling/household")
        }}
      />
    ),
    businesses: (
      <ProfilingCard 
        title="Businesses" 
        value={profilingCardAnalytics?.businesses} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/profiling/business/record")
        }}
      />
    ),
  };
};