import { Link } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { FamilyRecord, MemberRecord } from "../profilingTypes";
import { Label } from "@/components/ui/label";
import { calculateAge } from "@/helpers/ageCalculator";

// Define the columns for family data tables
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const familyColumns = (families: any[]): ColumnDef<FamilyRecord>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Family No.
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: "noOfMembers",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        No. of Members
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: "building",
    header: "Building",
  },
  {
    accessorKey: "indigenous",
    header: "Indigenous",
  },
  {
    accessorKey: "dateRegistered",
    header: "Date Registered",
  },
  {
    accessorKey: "registeredBy",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Registered By
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link
        to="/family/view"
        state={{
          params: {
            data: families.find((family) => family.fam_id == row.original.id),
          },
        }}
      >
        <Button variant={"outline"}>
          View <MoveRight />
        </Button>
      </Link>
    ),
  },
];

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const familyViewColumns = (): ColumnDef<MemberRecord>[] => [
  {
    accessorKey: "data",
    header: "",
    cell: ({ row }) => {
      const composition = row.getValue("data") as any;
      const role = composition.fc_role;
      const profile = composition.rp;
      const personal = profile.per;

      return (
        <div className="w-full border shadow-md flex p-4 rounded-lg">
          <div className="w-full grid grid-cols-8 items-center justify-center">
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-black/70">{profile.rp_id}</Label>
            </div>
            <div className="w-full flex flex-col col-span-2 items-start gap-1">
              <Label className="text-black/70">
              {`${personal.per_lname}, ${personal.per_fname} 
                ${personal.per_mname ? personal.per_mname[0] + "." : ""}`}
              </Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-black/70">{personal.per_sex}</Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-black/70">
                {calculateAge(personal.per_dob)}
              </Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-black/70">{personal.per_dob}</Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-black/70">{personal.per_status}</Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-black/70">{role}</Label>
            </div>
          </div>
          <div className="w-1/12 flex justify-end items-center">
            <Link to="">
              <Button>
                View <MoveRight/>
              </Button>
            </Link>
          </div>
        </div>
      );
    },
  },
];
