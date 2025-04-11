import React from "react";
import { Label } from "@/components/ui/label";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { DataTable } from "@/components/ui/table/data-table";
import { familyViewColumns } from "./FamilyColumns";
import { useLocation } from "react-router";
import { DependentRecord } from "../profilingTypes";
import CardLayout from "@/components/ui/card/card-layout";
// import { MoveRight } from "lucide-react";

export default function FamilyRecordView() {
  const location = useLocation();

  const params = React.useMemo(
    () => location.state?.params || {},
    [location.state]
  );
  
  const formatDependentData = React.useCallback((): DependentRecord[] => {
    const dependents = params.data.dependents;
    if (!dependents) return [];

    return dependents.map((dependent: any) => {
      const profile = dependent.rp;
      const personalInfo = profile.per;

      return {
        id: profile.rp_id || "",
        lname: personalInfo.per_lname || "",
        fname: personalInfo.per_fname || "",
        mname: personalInfo.per_mname || "",
        suffix: personalInfo.per_suffix || "",
        sex: personalInfo.per_sex || "",
        dateOfBirth: personalInfo.per_dob || "",
      };
    });
  }, [params.data.dependents]);

  console.log(params.data);

  return (
    <LayoutWithBack
      title="Family Details"
      description="View family details, including family number, date registered and associated members."
    >
      <div className="w-full mb-4">
        <CardLayout
          content={
            <div className="w-full flex justify-between">
              <Label>Family No. : {params.data.fam_id}</Label>
              <Label>Indigenous : {params.data.fam_indigenous}</Label>
              <Label>Household No. : {params.data.hh.hh_id}</Label>
              <Label>Date Registered : {params.data.fam_date_registered}</Label>
              <Label>Registered By: {params.data.staff.staff_id}</Label>
            </div>
          }
        />
      </div>

      <CardLayout
        title="List of Members"
        content={
          <DataTable
            columns={familyViewColumns()}
            data={formatDependentData()}
          />
        }
      />
    </LayoutWithBack>
  );
}

export const InfoLayout = React.memo((info: any) => (
  <div className="grid gap-2">
    <div className="w-full grid grid-cols-2">
      <Label>Resident (#): {info?.rp_id}</Label>
      <Label>
        Name: {info?.per?.per_fname} {info?.per?.per_mname}{" "}
        {info?.per?.per_lname}
      </Label>
      <Label>Date of Birth: {info?.per?.per_dob}</Label>
      <Label>Contact: {info?.per?.per_contact}</Label>
      <Label>Educational Attainment: {info?.per?.per_edAttainment}</Label>
    </div>
  </div>
));
