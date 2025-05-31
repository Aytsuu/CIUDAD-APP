import React from "react";
import { Label } from "@/components/ui/label";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { DataTable } from "@/components/ui/table/data-table";
import { familyViewColumns } from "./FamilyColumns";
import { useLocation } from "react-router";
import { Card } from "@/components/ui/card/card";
import { Pen, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import AddMemberForm from "./AddMemberForm";
import EditGeneralDetails from "./EditGeneralDetails";

export default function FamilyRecordView() {
  const location = useLocation();
  const params = React.useMemo(
    () => location.state?.params || {},
    [location.state]
  );
  const households = React.useMemo(() => params.households || [], [params]);
  const [isOpenAddDialog, setIsOpenAddDialog] = React.useState<boolean>(false);
  const [isOpenEditDialog, setIsOpenEditDialog] = React.useState<boolean>(false);
  const [family, setFamily] = React.useState(params?.family);
  const [compositions, setCompositions] = React.useState(family.members.results);

  const formattedData = React.useCallback(() => {
    if(!compositions) return [];

    return compositions.map((member: any) => {
      return {
        data: member
      }
    })
  }, [compositions]);
  
  return (
    <LayoutWithBack
      title="Family Details"
      description="View family details, including family number, date registered and associated members."
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
                description="Edit form for family general details. "
                mainContent={
                  <EditGeneralDetails 
                    familyData={family} 
                    households={households}
                    setIsOpenDialog={setIsOpenEditDialog}
                    setFamily={setFamily}
                  />
                }
                isOpen={isOpenEditDialog}
                onOpenChange={setIsOpenEditDialog}
              />
            </div>
            <div className="flex flex-col px-2 py-3 bg-muted">
              <Label className="text-black/40">Family No.</Label>
              <Label className="text-[16px] text-black/70">{family.fam_id}</Label>
            </div>
            <div className="flex flex-col px-2 py-3">
              <Label className="text-black/40">Household No.</Label>
              <Label className="text-[16px] text-black/70">{family.household_no}</Label>
            </div>
            <div className="flex flex-col px-2 py-3 bg-muted">
              <Label className="text-black/40">Building</Label>
              <Label className="text-[16px] text-black/70">{family.fam_building}</Label>
            </div>
            <div className="flex flex-col px-2 py-3">
              <Label className="text-black/40">Indigenous</Label>
              <Label className="text-[16px] text-black/70">{family.fam_indigenous}</Label>
            </div>
            <div className="flex flex-col px-2 py-3 bg-muted">
              <Label className="text-black/40">Date Registered</Label>
              <Label className="text-[16px] text-black/70">{family.fam_date_registered}</Label>
            </div>
            <div className="flex flex-col px-2 py-3">
              <Label className="text-black/40">Registered By</Label>
              <Label className="text-[16px] text-black/70">{family.registered_by}</Label>
            </div>
          </div>
        </div>
        <div className="w-full p-5">
          <div className="flex flex-col p-3 mb-2">
            <Label className="text-[18px] text-darkBlue1">
              List of Members
            </Label>
            <p className="text-sm text-black/70">
              A list overview of all members in the selected family, including
              key details.
            </p>
          </div>
          <div className="w-full flex px-6 py-4">
            <div className="w-full grid grid-cols-9 items-center justify-center">
              <Label className="text-black/50">Resident No.</Label>
              <div className="w-full flex flex-col col-span-2 items-start gap-1">
                <Label className="text-black/50">Name</Label>
              </div>
              <Label className="text-black/50">Sex</Label>
              <Label className="text-black/50">Age</Label>
              <Label className="text-black/50">Date of Birth</Label>
              <Label className="text-black/50">Status</Label>
              <Label className="text-black/50">Role</Label>
            </div>
            <div className="w-[14.5%] flex justify-end items-center">
              <DialogLayout 
                trigger={
                  <Button>
                    <UserRoundPlus/> Add Member
                  </Button>
                }
                title="New Member" 
                description="Select a registered resident from the database and assign their role within the family."
                mainContent={
                  <AddMemberForm 
                    familyId={family.fam_id}
                    setIsOpenDialog={setIsOpenAddDialog}
                    setCompositions={setCompositions}
                  />
                }
                isOpen={isOpenAddDialog}
                onOpenChange={setIsOpenAddDialog}
              />
            </div>
          </div>
          <DataTable
            columns={familyViewColumns(family, setCompositions)}
            data={formattedData()}
            header={false}
          />
        </div>
      </Card>
    </LayoutWithBack>
  );
}
