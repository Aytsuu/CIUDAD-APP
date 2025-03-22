/* 

  Note...

  This form is being utilized for creating, viewing, and updating resident records
  Additionally, it is being used for adminstrative position assignment or staff registration 

*/

import React from "react";
import { Card } from "@/components/ui/card/card";
import PersonalInfoForm from "./PersonalInfoForm";
import { BsChevronLeft } from "react-icons/bs";
import { Button } from "@/components/ui/button/button";
import { useLocation, useNavigate } from "react-router";

export default function ResidentFormLayout() {
  const location = useLocation()
  const navigate = useNavigate();
  const params = React.useMemo(() => {
    return location.state?.params || {};
  }, [location.state]); 

  return (
    <>
      <div className="flex gap-2 justify-between pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Header - Stacks vertically on mobile */}
          <Button 
            className="text-black p-2 self-start"
            variant={"outline"}
            onClick={() => navigate(-1)}
          >
            <BsChevronLeft />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              {params.title}
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              {params.description}
            </p>
          </div>  
        </div>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />

      <div>
        <Card className="w-full border-none shadow-none rounded-b-lg rounded-t-none">
            <PersonalInfoForm params={params}/>
        </Card>
      </div>
    </>
  );
}
