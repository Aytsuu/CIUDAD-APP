import { Calendar } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { getAnnualDevPlansByYear } from "@/pages/record/gad/annual_development_plan/restful-api/annualGetAPI";
import { useGetProjectProposals } from "@/pages/record/gad/project-proposal/queries/projprop-fetchqueries";
import { useResolution } from "@/pages/record/council/resolution/queries/resolution-fetch-queries";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Helper function to safely extract array from API response
const safeExtractArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

// Helper to create set of dev IDs with proposals and resolutions
const createDevIdsWithProposals = (projectProposals: any[], resolutions: any[]) => {
  const resolutionsList = Array.isArray(resolutions) ? resolutions : [];
  const projectProposalsList = Array.isArray(projectProposals) ? projectProposals : [];
  
  const resolutionGprIds = new Set(resolutionsList.map((r: any) => r.gpr_id).filter(Boolean));
  return new Set(
    projectProposalsList
      .filter((p: any) => p?.devId && p?.gprId && resolutionGprIds.has(p.gprId))
      .map((p: any) => p.devId)
      .filter((id: any) => id !== null && id !== undefined)
  );
};

export const GADActivityDashboard = () => {
  const navigate = useNavigate();
  // Get current year and next year for fetching
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  // Fetch project proposals and resolutions to determine which plans to show
  const { data: projectProposals } = useGetProjectProposals();
  const { data: resolutions } = useResolution();
  
  // Fetch annual dev plans for current and next year
  const yearQueries = useQueries({
    queries: [currentYear, nextYear].map((year) => ({
      queryKey: ["annualDevPlans", year, "dashboard"],
      queryFn: async () => getAnnualDevPlansByYear(year, undefined, undefined, undefined, false),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });
  
  const isLoading = yearQueries.some(query => query.isLoading);
  
  // Combine all year plans
  const allPlans = useMemo(() => {
    return yearQueries.map(query => safeExtractArray(query.data)).flat();
  }, [yearQueries]);
  
  // Create set of dev IDs with proposals
  const devIdsWithProposals = useMemo(() => {
    const proposalsList = safeExtractArray(projectProposals);
    const resolutionsList = safeExtractArray(resolutions);
    return createDevIdsWithProposals(proposalsList, resolutionsList);
  }, [projectProposals, resolutions]);
  
  // Filter events for the next 5 days (upcoming, non-archived, mandated or with proposals)
  const upcomingActivities = useMemo(() => {
    const now = new Date();
    const fiveDaysFromNow = new Date(now);
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    
    return allPlans.filter((plan: any) => {
      // Check archived status
      const archivedValue = plan?.dev_archived;
      if (archivedValue === true || archivedValue === "true" || archivedValue === "True" || archivedValue === "TRUE" || archivedValue === 1) {
        return false;
      }
      
      // Check if date is within next 5 days
      if (plan?.dev_date) {
        const planDate = new Date(plan.dev_date);
        planDate.setHours(0, 0, 0, 0);
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        if (planDate < today || planDate > fiveDaysFromNow) {
          return false;
        }
      } else {
        return false; // No date means we can't show it
      }
      
      // Only show mandated activities or those with project proposals
      const isMandated = Boolean(plan?.dev_mandated);
      const hasProposal = devIdsWithProposals.has(plan.dev_id);
      
      return isMandated || hasProposal;
    }).sort((a: any, b: any) => {
      // Sort by date
      const dateA = new Date(a.dev_date).getTime();
      const dateB = new Date(b.dev_date).getTime();
      return dateA - dateB;
    });
  }, [allPlans, devIdsWithProposals]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-3 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (upcomingActivities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {upcomingActivities.slice(0, 3).map((activity: any) => (
        <div
          key={activity.dev_id}
          onClick={() => navigate('/calendar-page')}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer border border-white/10"
        >
          <h3 className="text-white font-semibold text-base mb-2 line-clamp-1">
            {activity.dev_client || activity.dev_project || "GAD Activity"}
          </h3>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{new Date(activity.dev_date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>
            
            {activity.dev_project && (
              <div className="text-white/80 text-xs line-clamp-1">
                Project: {activity.dev_project}
              </div>
            )}
          </div>
          
          {activity.dev_issue && (
            <p className="text-white/70 text-xs mt-2 line-clamp-2">
              {activity.dev_issue}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

// Hook for dashboard configuration
export const useGADUpcomingActivities = () => {
  return {
    upcomingEvents: <GADActivityDashboard />,
  };
};

