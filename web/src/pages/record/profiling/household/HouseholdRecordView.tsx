import React from "react";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useLocation } from "react-router";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/table/data-table";
import { HouseholdFamRecord } from "../profilingTypes";
import { householdFamColumns } from "./HouseholdColumns";
import { Card } from "@/components/ui/card/card";

export default function HouseholdRecordView() {
  // Initialize states
  const location = useLocation();
  const params = React.useMemo(
    () => location.state?.params || {},
    [location.state]
  );
  const residents = React.useMemo(() => params.residents, [params]);
  const households = React.useMemo(() => params.households, [params]);
  const household = React.useMemo(() => params.household || {}, [params]);
  const head = React.useMemo(() => household.rp || {}, [household]);
  const personal = React.useMemo(() => head.per || {}, [head]);
  const staff = React.useMemo(() => household.staff.rp.per || {}, [household]);

  // Format data for table
  const formatFamilyData = React.useCallback((): HouseholdFamRecord[] => {
    const families = household.family;
    if (!families) return [];

    return families?.map((family: any) => {
      return {
        data: family,
      };
    });
  }, [household]);

  return (
    <LayoutWithBack
      title="Household Details"
      description="View and manage household information."
    >
      <Card className="flex">
        <div className="w-1/4 flex flex-col border-r">
          <div className="flex flex-col p-5">
            <Label className="text-[17px] text-darkBlue1 mb-2">General</Label>
            <div className="flex flex-col px-2 py-3 bg-muted">
              <Label className="text-black/40">Household No.</Label>
              <Label className="text-[16px] text-black/70">{household.hh_id}</Label>
            </div>
            <div className="flex flex-col px-2 py-3">
              <Label className="text-black/40">NHTS Household</Label>
              <Label className="text-[16px] text-black/70">{household.hh_nhts}</Label>
            </div>
            <div className="flex flex-col px-2 py-3 bg-muted">
              <Label className="text-black/40">Household Head</Label>
              <Label className="text-[16px] text-black/70">
                {`${personal.per_lname}, 
                  ${personal.per_fname} 
                  ${
                    personal.per_mname
                      ? personal.per_mname.slice(0, 1) + "."
                      : ""
                  }` || ""}
              </Label>
            </div>
            <div className="flex flex-col px-2 py-3">
              <Label className="text-black/40">Sitio</Label>
              <Label className="text-[16px] text-black/70">{household.sitio.sitio_name}</Label>
            </div>
            <div className="flex flex-col px-2 py-3 bg-muted">
              <Label className="text-black/40">Street</Label>
              <Label className="text-[16px] text-black/70">{household.hh_street}</Label>
            </div>
            <div className="flex flex-col px-2 py-3">
              <Label className="text-black/40">Date Registered</Label>
              <Label className="text-[16px] text-black/70">{household.hh_date_registered}</Label>
            </div>
            <div className="flex flex-col px-2 py-3 bg-muted">
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
              <Label className="text-yellow-500">Building</Label>
              <Label className="text-black/50">Indigenous</Label>
              <Label className="text-black/50">Date Registered</Label>
              <Label className="text-black/50">Registered By</Label>
            </div>
            <div className="w-[9%] flex justify-end items-center"></div>
          </div>
          <DataTable
            columns={householdFamColumns(residents, households)}
            data={formatFamilyData()}
            header={false}
          />
        </div>
      </Card>
    </LayoutWithBack>
  );
}