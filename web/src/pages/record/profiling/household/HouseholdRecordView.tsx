import React from "react";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useLocation } from "react-router";
import CardLayout from "@/components/ui/card/card-layout";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/table/data-table";
import { familyColumns } from "../family/FamilyColumns";

export default function HouseholdRecordView() {
  const location = useLocation();
  const params = React.useMemo(
    () => location.state?.params || {},
    [location.state]
  );
  const household = React.useMemo(() => params?.data || {}, [params]);
  const head = React.useMemo(() => household.rp || {}, [household]);
  const personal = React.useMemo(() => head.per || {}, [head]);

  const formatFamilyData = React.useCallback(() => {
    const families = household.family;
    if (!families) return [];

    return families?.map((family: any) => {
      const mother = family.mother;
      const father = family.father;
      const dependents = family.dependents;
      const totalMembers = (mother ? 1 : 0) + (father ? 1 : 0) + dependents.length;

      return {
        id: family.fam_id || "",
        noOfMembers: totalMembers || 1,
        building: family.fam_building || "",
        indigenous: family.fam_indigenous || "",
        dateRegistered: family.fam_date_registered || "",
        registeredBy: family.staff,
      };
    });
  }, [household]);

  return (
    <LayoutWithBack
      title="Household Details"
      description="View and manage household information."
    >
      <div className="w-full mb-4">
        <CardLayout
          content={
            <div className="w-full flex justify-between">
              <Label>Household No. : {household.hh_id}</Label>
              <Label>NHTS Household : {household.hh_nhts}</Label>
              <Label>
                Household Head : 
                {`${personal.per_lname}, 
                  ${personal.per_fname} 
                  ${
                    personal.per_mname
                      ? personal.per_mname.slice(0, 1) + "."
                      : ""
                  }` || ""}
              </Label>
              <Label>Sitio : {household.sitio.sitio_name}</Label>
              <Label>Street : {household.hh_street}</Label>
              <Label>Date Registered : {household.hh_date_registered}</Label>
              <Label>Registered By : {household.staff.staff_id}</Label>
            </div>
          }
        />
      </div>

      <CardLayout
        title="List of Families"
        content={
          <DataTable
            columns={familyColumns(params.data.family)}
            data={formatFamilyData()}
          />
        }
      />
    </LayoutWithBack>
  );
}
