import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetCardAnalytics } from "./admin-analytics-queries"
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router";

// Memoized card component that rerenders when props change
const AdminCard = React.memo(({ 
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

AdminCard.displayName = "AdminCard";

export const useAdminSectionCards = () => {
  const navigate = useNavigate();
  const { data: adminCardAnalytics, isLoading } = useGetCardAnalytics();
  
  return {
    staffs: (
      <AdminCard 
        title="Staffs" 
        value={adminCardAnalytics?.staffs} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/administration")
        }}
      />
    ),
  };
};