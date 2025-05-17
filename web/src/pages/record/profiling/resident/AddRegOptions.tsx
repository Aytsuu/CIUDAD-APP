import { Button } from "@/components/ui/button/button";
import { Card } from "@/components/ui/card/card";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import React from "react";
import { useLocation, useNavigate } from "react-router";

const OPTIONS_STYLE = "flex justify-between items-center p-4 rounded-xl text-black/60 hover:bg-lightBlue cursor-pointer"

export default function AddRegOptions() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = React.useMemo(() => location.state?.params, [location.state]);

  return (
    <div className="w-full flex justify-center m-16">
      <Card className="w-[40%] border-gray p-7 flex flex-col gap-3">
        <div>
          <Label className="text-[18px] text-darkBlue1">Additional Registration</Label>
          <p className="text-[14px]">Complete extra registrations here or skip to continue</p>
        </div>
        <div className="grid">
          <div className={OPTIONS_STYLE}
            onClick={() => {
              navigate(
                "/account/create", 
                {state: {params: {residentId: params.residentId}}}
              )
            }}
          >
            <Label className="text-[15px]">Account</Label>
            <ChevronRight />
          </div>
          <div className={OPTIONS_STYLE}
            onClick={() => {
              navigate(
                "/household/form", 
                {state: {params: {residentId: params.residentId}}}
              )
            }}
          >
            <Label className="text-[15px]">Household</Label>
            <ChevronRight />
          </div>
          <div className={OPTIONS_STYLE}
            onClick={() => {
              navigate(
                "/family/form/solo", 
                {state: {params: {residentId: params.residentId}}}
              )
            }}
          >
            <Label className="text-[15px]">Family</Label>
            <ChevronRight />
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <Button
            variant={"outline"}
            className="border-none shadow-none font-normal text-black/70"
          >
            Skip all
          </Button>
        </div>
      </Card>
    </div>
  )
}