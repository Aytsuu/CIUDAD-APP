import React from "react";
import { Label } from "@/components/ui/label";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { DataTable } from "@/components/ui/table/data-table";
import { familyViewColumns } from "./FamilyColumns";
import { useLocation } from "react-router";
import { MemberRecord } from "../profilingTypes";
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
  const [isOpenAddDialog, setIsOpenAddDialog] = React.useState<boolean>(false);
  const [isOpenEditDialog, setIsOpenEditDialog] = React.useState<boolean>(false);
  const residents = React.useMemo(() => params.residents, [params]);
  const [family, setFamily] = React.useState<
    typeof params.family
  >(params.family);
  const [compositions, setComposition] = React.useState<
    typeof family.family_compositions
  >(family.family_compositions)
  const households = React.useMemo(() => params.households, [params]);
  const staff = React.useMemo(() => family.staff.rp.per, [family]);


  const formatMemberData = React.useCallback((): MemberRecord[] => {
    if (!compositions) return [];

    return compositions.map((comp: any) => {
      return {
        data: {
          comp: comp,
          members: compositions
        },
      };
    });
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
              <Label className="text-[16px] text-black/70">{family.hh.hh_id}</Label>
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
              <Label className="text-[16px] text-black/70">
                {`${staff.per_lname}, ${staff.per_fname}
                ${staff.per_mname ? staff.per_mname[0] + "." : ""}`}
              </Label>
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
              <Label className="text-yellow-500">Role</Label>
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
                    residents={
                      residents.filter((r: any) => (
                        !(compositions.find((fc: any) => r.rp_id === fc.rp.rp_id))
                      ))
                    }
                    familyId={family.fam_id}
                    setIsOpenDialog={setIsOpenAddDialog}
                    setComposition={setComposition}
                  />
                }
                isOpen={isOpenAddDialog}
                onOpenChange={setIsOpenAddDialog}
              />
            </div>
          </div>
          <DataTable
            columns={familyViewColumns(residents, family, setComposition)}
            data={formatMemberData()}
            header={false}
          />
        </div>
      </Card>
    </LayoutWithBack>
  );
}
