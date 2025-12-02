import { Card } from "@/components/ui/card";
import {
  ChevronRight,
  FileText,
  Calendar,
  Users,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";
import { useGetProjectProposals } from "@/pages/record/gad/project-proposal/queries/projprop-fetchqueries";
import { ProjectProposal } from "@/pages/record/gad/project-proposal/projprop-types";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export const ProjectProposalSidebar = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear().toString();
  const { data: proposalsData, isLoading } = useGetProjectProposals(
    1,
    10,
    "",
    false,
    currentYear
  );
  const [_selectedProposal, setSelectedProposal] =
    useState<ProjectProposal | null>(null);

    // Sort proposals by ID
    const proposals = proposalsData?.results 
    ? [...proposalsData.results].sort((a, b) => 
        (b.gprId || 0) - (a.gprId || 0)
        )
    : [];

  const truncateText = (text: string, maxLength: number = 40) => {
    if (!text) return "No title";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Calculate total participants
  const getTotalParticipants = (
    participants: { category: string; count: string | number }[] = []
  ) => {
    return participants.reduce((total, participant) => {
      const count =
        typeof participant.count === "string"
          ? parseInt(participant.count) || 0
          : participant.count || 0;
      return total + count;
    }, 0);
  };

  // Calculate total budget
  const getTotalBudget = (budgetItems: any[] = []) => {
    return budgetItems.reduce((total, item) => {
      const amount =
        typeof item.amount === "string"
          ? parseFloat(item.amount) || 0
          : item.amount || 0;
      return total + amount;
    }, 0);
  };

  const handleProposalClick = (proposal: ProjectProposal) => {
    setSelectedProposal(proposal);
  };

  const handleViewAll = () => {
    navigate("/gad-project-proposal");
  };

  return (
    <Card className="w-full bg-white h-full flex flex-col border-none">
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-4 bg-black/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-black/20 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-black/20 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : proposals && proposals.length > 0 ? (
          <div className="p-4 space-y-3">
            {proposals.slice(0, 1).map((proposal) => {
              const totalParticipants = getTotalParticipants(
                proposal.participants
              );
              const totalBudget = getTotalBudget(proposal.budgetItems);

              return (
                <DialogLayout
                  key={proposal.gprId}
                  trigger={
                    <Card
                      className="p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200"
                      onClick={() => handleProposalClick(proposal)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-700 line-clamp-2">
                                {truncateText(proposal.projectTitle, 50)}
                              </h3>
                            </div>

                            <div className="space-y-1 text-xs text-gray-500">
                              {/* Date */}
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {proposal.date
                                    ? new Date(
                                        proposal.date
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "Not specified"}
                                </span>
                              </div>

                              {/* Participants */}
                              {totalParticipants > 0 && (
                                <div className="flex items-center gap-2">
                                  <Users className="w-3 h-3" />
                                  <span>{totalParticipants} participants</span>
                                </div>
                              )}

                              {/* Venue */}
                              {proposal.venue && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">
                                    {proposal.venue}
                                  </span>
                                </div>
                              )}

                              {/* Budget */}
                              {totalBudget > 0 && (
                                <div className="flex items-center gap-2 text-blue-600 font-medium">
                                  <span>₱{totalBudget.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    </Card>
                  }
                  title="Project Proposal Details"
                  description={""}
                  mainContent={
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Project Title
                          </Label>
                          <p className="text-sm text-gray-900 mt-1">
                            {proposal.projectTitle}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Date
                          </Label>
                          <p className="text-sm text-gray-900 mt-1">
                            {proposal.date
                              ? new Date(proposal.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )
                              : "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Venue */}
                        {proposal.venue && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Venue
                            </Label>
                            <p className="text-sm text-gray-900 mt-1">
                              {proposal.venue}
                            </p>
                          </div>
                        )}

                        {/* Budget Information */}
                        {totalBudget > 0 && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Total Budget
                            </Label>
                            <p className="text-2xl font-bold text-blue-600 mt-1">
                              ₱{totalBudget.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Participants */}
                      {proposal.participants &&
                        proposal.participants.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Participants
                            </Label>
                            <div className="mt-2 space-y-2">
                              {proposal.participants.map(
                                (participant, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="text-gray-600">
                                      {participant.category}
                                    </span>
                                    <span className="font-medium">
                                      {participant.count}
                                    </span>
                                  </div>
                                )
                              )}
                              <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between font-semibold">
                                  <span>Total Participants</span>
                                  <span>{totalParticipants}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  }
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">
              No project proposals
            </h3>
            <p className="text-sm text-gray-500">
              Project proposals will appear here once created
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {proposals && proposals.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Button
            variant={"link"}
            onClick={handleViewAll}
            className="text-blue-600 hover:text-blue-700"
          >
            View All Proposals
          </Button>
        </div>
      )}
    </Card>
  );
};
