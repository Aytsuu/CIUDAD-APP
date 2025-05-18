import React from "react";
import { Button } from "@/components/ui/button/button";
import { Card } from "@/components/ui/card/card";
import { Label } from "@/components/ui/label";
import { Check, ChevronRight, MoveRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { selectAccount, selectHousehold, selectFamily, reset } from "@/redux/addRegSlice";
import { useSelector, useDispatch } from "react-redux";

const OPTIONS_STYLE = "flex justify-between items-center p-4 rounded-xl text-black/60 hover:bg-lightBlue cursor-pointer"

export default function AddRegOptions() {
  // ============== STATE INITIALIZATION ================
  const location = useLocation();
  const navigate = useNavigate();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const isAccountCreated = useSelector(selectAccount);
  const household = useSelector(selectHousehold);
  const isFamilyRegistered = useSelector(selectFamily);
  const dispatch = useDispatch();

  const isComplete = (
    isAccountCreated 
    && household?.reg 
    && isFamilyRegistered
  );

  // ================ RENDER ==================
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
              !isAccountCreated && navigate(
                "/account/create", 
                {state: {params: {residentId: params.residentId}}}
              )
            }}
          >
            <Label className="text-[15px]">Account</Label>
            {isAccountCreated ? <Check color="green"/> : <ChevronRight/>}
          </div>
          <div className={OPTIONS_STYLE}
            onClick={() => {
              !household?.reg && navigate(
                "/household/form", 
                {state: {params: {
                  residentId: params.residentId,
                  addresses: params.addresses
                }}}
              )
            }}
          >
            <Label className="text-[15px]">Household</Label>
            {household?.reg ? <Check color="green"/> : <ChevronRight/>}
          </div>
          <div className={OPTIONS_STYLE}
            onClick={() => {
              !isFamilyRegistered && navigate(
                "/family/form/solo", 
                {state: {params: {
                  residentId: params.residentId,
                  hh_id: household?.hh_id
                }}}
              )
            }}
          >
            <Label className="text-[15px]">Family</Label>
            {isFamilyRegistered ? <Check color="green"/> : <ChevronRight/>}
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <Button
            variant={"outline"}
            className="border-none shadow-none font-normal text-black/70"
            onClick={() => {
              dispatch(reset())
              navigate('/resident')
            }}
          >
            {isComplete ? <>Finish <MoveRight/></> : "Skip for now"}
          </Button>
        </div>
      </Card>
    </div>
  )
}