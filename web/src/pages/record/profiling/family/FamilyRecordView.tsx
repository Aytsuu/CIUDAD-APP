import React from "react";
import { Label } from "@/components/ui/label";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { DataTable } from "@/components/ui/table/data-table";
import { familyViewColumns } from "./FamilyColumns";
import { useLocation } from "react-router";
import { MemberRecord } from "../profilingTypes";
import CardLayout from "@/components/ui/card/card-layout";
import { Card } from "@/components/ui/card/card";

export default function FamilyRecordView() {
  const location = useLocation();
  const params = React.useMemo(
    () => location.state?.params || {},
    [location.state]
  );
  const family = React.useMemo(() => params.data, [params]);
  const staff = React.useMemo(() => family.staff.rp.per, [family]);

  const formatMemberData = React.useCallback((): MemberRecord[] => {
    const compositions = family.family_compositions;
    if (!compositions) return [];

    return compositions.map((comp: any) => {
      return {
        data: comp,
      };
    });
  }, [family.family_compositions]);

  return (
    <LayoutWithBack
      title="Family Details"
      description="View family details, including family number, date registered and associated members."
    >
      <div className="w-full mb-4">
        <CardLayout
          content={
            <div className="w-full flex justify-between">
              <Label>Family No. : {family.fam_id}</Label>
              <Label>Household No. : {family.hh.hh_id}</Label>
              <Label>Indigenous : {family.fam_indigenous}</Label>
              <Label>Date Registered : {family.fam_date_registered}</Label>
              <Label>
                Registered By :{" "}
                {`${staff.per_lname}, ${staff.per_fname}
                ${staff.per_mname ? staff.per_mname[0] + "." : ""}`}
              </Label>
            </div>
          }
        />
      </div>

      <Card className="p-5">
        <div className="p-3 mb-2">
          <Label className="text-[18px] text-darkBlue1">List of Members</Label>
          <p className="text-sm text-black/70">
            A list overview of all members in the selected family, including key
            details.
          </p>
        </div>
        <div className="w-full flex px-6 py-4">
          <div className="w-full grid grid-cols-8 items-center justify-center">
            <Label className="text-black/50">Resident No.</Label>
            <div className="w-full flex flex-col col-span-2 items-start gap-1">
              <Label className="text-black/50">Name</Label>
            </div>
            <Label className="text-black/50">Sex</Label>
            <Label className="text-black/50">Age</Label>
            <Label className="text-black/50">Date of Birth</Label>
            <Label className="text-black/50">Marital Status</Label>
            <Label className="text-black/50">Role</Label>
          </div>
          <div className="w-1/12 flex justify-end items-center">
          </div>
        </div>
        <DataTable
          columns={familyViewColumns()}
          data={formatMemberData()}
          header={false}
        />
      </Card>
    </LayoutWithBack>
  );
}
