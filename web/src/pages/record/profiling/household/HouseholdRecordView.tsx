import React from "react";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useLocation } from "react-router";
import CardLayout from "@/components/ui/card/card-layout";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/table/data-table";
import { HouseholdFamRecord } from "../profilingTypes";
import { householdFamColumns } from "./HouseholdColumns";
import { Card } from "@/components/ui/card/card";
import { Separator } from "@/components/ui/separator";

export default function HouseholdRecordView() {
  const location = useLocation();
  const params = React.useMemo(
    () => location.state?.params || {},
    [location.state]
  );
  const household = React.useMemo(() => params?.data || {}, [params]);
  const head = React.useMemo(() => household.rp || {}, [household]);
  const personal = React.useMemo(() => head.per || {}, [head]);

  const formatFamilyData = React.useCallback((): HouseholdFamRecord[] => {
    const families = household.family;
    if (!families) return [];

    return families?.map((family: any) => {
      return {
        data: family
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
        
      <Card className="p-5">
        <div className="p-3 mb-2">
          <Label className="text-[18px] text-darkBlue1">List of Families</Label>
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
            <Label className="text-black/50">Indgenous</Label>
            <Label className="text-black/50">Date Registered</Label>
            <Label className="text-black/50">Registered By</Label>
          </div>
          <div className="w-1/12 flex justify-end items-center">
          </div>
        </div>
        <DataTable
            columns={householdFamColumns()}
            data={formatFamilyData()}
            header={false}
          />
      </Card>
    </LayoutWithBack>
  );
}