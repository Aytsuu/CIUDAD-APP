import React from "react";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useLocation } from "react-router";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/table/data-table";
import { HouseholdFamRecord } from "../profilingTypes";
import { householdFamColumns } from "./HouseholdColumns";
import { Card } from "@/components/ui/card/card";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button/button";
import { Pen } from "lucide-react";
import EditGeneralDetails from "./EditGeneralDetails";

export default function HouseholdRecordView() {
  // Initialize states
  const location = useLocation();
  const params = React.useMemo(
    () => location.state?.params || {},
    [location.state]
  );
  const [isOpenEditDialog, setIsOpenEditDialog] = React.useState<boolean>(false);
  const families = React.useMemo(() => params.families || {}, [params]);
  const household = React.useMemo(() => params.household || {}, [params]);

  // Format data for table
  const formatFamilyData = React.useCallback((): HouseholdFamRecord[] => {
    if (!families) return [];

    return families.map((family: any) => {
      return {
        data: family,
      };
    });
  }, [families]);


  return (
    <LayoutWithBack
      title="Household Details"
      description="View and manage household information."
    >
      <Card className="flex">
        <div className="w-1/4 flex flex-col border-r">
          <div className="flex flex-col p-5">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-[17px] text-darkBlue1">General</Label>
              <DialogLayout 
                trigger= {
                  <Button 
                    variant={"outline"} 
                    className="border-none shadow-none text-black/50"
                  >
                    <Pen/> Edit
                  </Button>
                }
                title="General Details"
                description="Edit form for household general details. "
                mainContent={
                  <EditGeneralDetails 
                    householdData={household} 
                    setIsOpenDialog={setIsOpenEditDialog}
                  />
                }
                isOpen={isOpenEditDialog}
                onOpenChange={setIsOpenEditDialog}
              />
            </div>
            <div className="flex flex-col px-2 py-3 bg-muted">
              <Label className="text-black/40">Household No.</Label>
              <Label className="text-[16px] text-black/70">{household.hh_id}</Label>
            </div>
            <div className="flex flex-col px-2 py-3">
              <Label className="text-black/40">NHTS Household</Label>
              <Label className="text-[16px] text-black/70">{household.nhts}</Label>
            </div>
            <div className="flex flex-col px-2 py-3 bg-muted">
              <Label className="text-black/40">Household Head</Label>
              <Label className="text-[16px] text-black/70">
                {household.head}
              </Label>
            </div>
            <div className="flex flex-col px-2 py-3">
              <Label className="text-black/40">Sitio</Label>
              <Label className="text-[16px] text-black/70">{household.sitio}</Label>
            </div>
            <div className="flex flex-col px-2 py-3 bg-muted">
              <Label className="text-black/40">Street</Label>
              <Label className="text-[16px] text-black/70">{household.street}</Label>
            </div>
            <div className="flex flex-col px-2 py-3">
              <Label className="text-black/40">Date Registered</Label>
              <Label className="text-[16px] text-black/70">{household.date_registered}</Label>
            </div>
            <div className="flex flex-col px-2 py-3 bg-muted">
              <Label className="text-black/40">Registered By</Label>
              <Label className="text-[16px] text-black/70">
                {household.registered_by}
              </Label>
            </div>
          </div>
        </div>

        <div className="w-full p-5">
          <div className="flex flex-col p-3 mb-2">
            <Label className="text-[18px] text-darkBlue1">
              List of Families
            </Label>
            <p className="text-sm text-black/70">
              A list overview of all families in the selected household,
              including key details.
            </p>
          </div>
          <div className="w-full flex px-6 py-4">
            <div className="w-full grid grid-cols-7 items-center justify-center">
              <Label className="text-black/50">Family No.</Label>
              <Label className="text-black/50">No. of Members</Label>
              <Label className="text-black/50">Building</Label>
              <Label className="text-black/50">Indigenous</Label>
              <Label className="text-black/50">Date Registered</Label>
              <Label className="text-black/50">Registered By</Label>
            </div>
            <div className="w-[9%] flex justify-end items-center"></div>
          </div>
          <DataTable
            columns={householdFamColumns}
            data={formatFamilyData()}
            header={false}
          />
        </div>
      </Card>
    </LayoutWithBack>
  );
}