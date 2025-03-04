import CardLayout from "@/components/ui/card/card-layout";
import { SelectLayout } from "@/components/ui/select/select-layout"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";

function GADProjectProposal(){

    var projectTitle = 'Lorem Ipsum Dolor Sit';
    var projectDesc = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est.';
    var projectStat = 'Pending', dateofApproval = 'MM-DD-YYYY', dateofRejection = 'MM-DD-YYYY', reason = 'Lorem Ipsum Dolor Sit';

    const style = {
      projStat: ""
    }

    const filter = [
      {id: "All", name: "All"},
      {id: "Approved", name: "Approved"},
      {id: "Pending", name: "Pending"},
      {id: "Rejected", name: "Rejected"},
      {id: "Viewed", name: "Viewed"},
    ];
  
    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);
    // const filteredData = selectedFilter === "All Entry Types" ? data 
    // : data.filter((item) => item.type === selectedFilter);
  
    return(
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
                        <div className="relative flex-1"> {/* Increased max-width */}
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                                size={17}
                            />
                            <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" /> {/* Adjust padding and text size */}
                        </div>
                        <div className="flex flex-row gap-2 justify-center items-center">
                            <Label>Filter: </Label>
                            <SelectLayout className="bg-white" options={filter} placeholder="Filter" value={selectedFilter} label="" onChange={setSelectedFilter}></SelectLayout>
                        </div>                            
                  </div>
                  <div className="bg-primary text-white rounded-md p-3 text-sm font-semibold drop-shadow-sm">+ New Entry</div>
            </div>

            <div className="flex flex-col mt-4">
                <CardLayout
                cardTitle={projectTitle}
                cardDescription={projectDesc}
                cardContent={
                  <div>
                    <div className="flex flex-row items-center gap-4">
                      <Label>Status: </Label><Label>{projectStat}</Label>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                      <Label>Date of Approval: </Label><p>{dateofApproval}</p>
                    </div>
                  </div>
                }
                cardClassName="w-full h-full">
                </CardLayout>
            </div>
        </div>
    )
}

export default GADProjectProposal