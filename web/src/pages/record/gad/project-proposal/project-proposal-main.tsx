import CardLayout from "@/components/ui/card/card-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// Define the type for project proposals
type ProjectProposal = {
  projectId: string;
  projectTitle: string;
  projectDesc: string;
  projectStat: "Pending" | "Approved" | "Rejected" | "Viewed";
  dateofApproval: string;
  dateofRejection: string;
  dateViewed: string;
  reason: string;
};

export const ProjectProposals: ProjectProposal[] = [
  {
    projectId: "0915",
    projectTitle: "Lorem Ipsum Dolor Sit",
    projectDesc: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est.",
    projectStat: "Pending",
    dateofApproval: "None",
    dateofRejection: "None",
    dateViewed: "None",
    reason: "None"
  },
  {
    projectId: "0915",
    projectTitle: "Lorem Ipsum Dolor Sit",
    projectDesc: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est.",
    projectStat: "Approved",
    dateofApproval: "MM-DD-YYYY",
    dateofRejection: "None",
    dateViewed: "None",
    reason: "None"
  }
];

function GADProjectProposal() {
      const style = {
        projStat: {
          pending: "text-blue",
          approved: "text-green-500",
          rejected: "text-red",
          viewed: "text-darkGray"
        } 
      };

      const filter = [
        { id: "All", name: "All" },
        { id: "Approved", name: "Approved" },
        { id: "Pending", name: "Pending" },
        { id: "Rejected", name: "Rejected" },
        { id: "Viewed", name: "Viewed" },
      ];

      const [selectedFilter, setSelectedFilter] = useState("All");
      const filteredProjects = selectedFilter === "All"
        ? ProjectProposals
        : ProjectProposals.filter(project => project.projectStat === selectedFilter);

      return (
        <div className="bg-snow w-full h-full">
              <div className="flex flex-col gap-3 mb-4">
                  <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>GAD Project Proposal</div>
                  </h1>
                  <p className="text-xs sm:text-sm text-darkGray">
                    Track and manage your income and expenses with real-time insights.
                  </p>
              </div>
              <hr className="border-gray mb-5 sm:mb-4" />

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1">
                          <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                            size={17}
                          />
                          <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" />
                        </div>
                        <div className="flex flex-row gap-2 justify-center items-center">
                          <Label>Filter: </Label>
                          <SelectLayout
                            className="bg-white"
                            options={filter}
                            placeholder="Filter"
                            value={selectedFilter}
                            label=""
                            onChange={setSelectedFilter}
                          />
                        </div>
                  </div>
                  <div className="bg-primary text-white rounded-md p-3 text-sm font-semibold drop-shadow-sm">+ New Entry</div>
              </div>

              <div className="flex flex-col mt-4 gap-4">
                    {filteredProjects.map(project => {
                      const status = project.projectStat.toLowerCase() as keyof typeof style.projStat;
                      return (
                        <CardLayout
                          key={project.projectId}
                          cardTitle={project.projectTitle}
                          cardDescription={project.projectDesc}
                          cardContent={
                            <div>
                                <div className="flex flex-row items-center gap-4">
                                    <Label>Status: </Label>
                                    <Label className={style.projStat[status]}>
                                      {project.projectStat}
                                    </Label>
                                </div>
                                {project.projectStat == "Approved" && (
                                    <div className="flex flex-row items-center gap-4">
                                      <Label>Date of Approval: </Label>
                                      <p>{project.dateofApproval}</p>
                                    </div>
                                )}
                                {project.projectStat == "Rejected" && (
                                    <div className="flex flex-row items-center gap-4">
                                      <Label>Date of Rejection: </Label>
                                      <p>{project.dateofRejection}</p>
                                    </div>
                                )}
                                {project.projectStat == "Viewed" && (
                                  <div className="flex flex-row items-center gap-4">
                                    <Label>Date Viewed: </Label>
                                    <p>{project.dateViewed}</p>
                                  </div>
                                )}
                                {project.reason !== "None" && (
                                    <div className="flex flex-row items-center gap-4">
                                      <Label>Reason: </Label>
                                      <p>{project.reason}</p>
                                    </div>
                                )}
                            </div>
                          }
                          cardClassName="w-full h-full"
                        />
                      );
                    })}
              </div>
        </div>
      );
}

export default GADProjectProposal;