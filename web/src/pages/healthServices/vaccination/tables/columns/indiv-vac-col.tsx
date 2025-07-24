import { ColumnDef } from "@tanstack/react-table";
import { VaccinationRecord } from "./types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Syringe, Calendar } from "lucide-react";

export const vaccinationColumns: ColumnDef<VaccinationRecord>[] = [
  {
    accessorKey: "vaccine_name",
    header: "Vaccine",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[150px] px-2">
        <div className="font-medium">
          {row.original.vaccine_name}
          <div className="text-xs text-gray-500">
            Batch: {row.original.batch_number}
          </div>
          <div className="text-xs text-gray-500">
            Type: {row.original.vaccine_details?.vac_type}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "vital_signs",
    header: "Vital Signs",
    cell: ({ row }) => {
      const vital = row.original.vital_signs;
      return (
        <div className="flex justify-center items-center gap-2 min-w-[150px] px-2 py-1 bg-gray-50 rounded-md shadow-sm">
          <div className="flex flex-col justify-start text-sm min-w-[180px]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center">
                <span className="font-medium mr-1">BP:</span>
                <span>
                  {vital?.vital_bp_systolic}/{vital?.vital_bp_diastolic} mmHg
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-1">Temp:</span>
                <span>{vital?.vital_temp}°C</span>
              </div>
              <div className="flex items-center"></div>
              <div className="flex items-center">
                <span className="font-medium mr-1">O2:</span>
                <span>{vital?.vital_o2}%</span>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "vachist_doseNo",
    header: "Dose",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {row.original.vachist_doseNo}
          <div className="text-xs text-gray-500 mt-1">
            Required Doses {row.original.vaccine_details?.no_of_doses} dose/s
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "vachist_status",
    header: "Status",
    cell: ({ row }) => {
      const statusColors = {
        completed: "bg-green-100 text-green-800",
        "partially vaccinated": "text-red-500",
      };
      return (
        <div className="flex flex-col justify-center">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[
                row.original.vachist_status as keyof typeof statusColors
              ] || "bg-gray-100 text-gray-800"
            }`}
          >
            {row.original.vachist_status}
          </span>
          <div>
            <div className="text-xs mt-1">
              {row.original.follow_up_visit?.followv_status?.toLowerCase() ===
              "completed" ? (
                "Next Dose: completed"
              ) : (
                <>
                  Next Dose:{" "}
                  {isNaN(
                    new Date(
                      row.original.follow_up_visit?.followv_date || ""
                    ).getTime()
                  ) ? (
                    "No Schedule"
                  ) : (
                    <span className="text-red-500">
                      {new Date(
                        row.original.follow_up_visit?.followv_date || ""
                      ).toLocaleDateString()}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const updatedAt = new Date(row.original.created_at || "");
      const formattedDate = updatedAt.toLocaleDateString();
      const formattedTime = updatedAt.toLocaleTimeString();
      return (
        <div className="text-sm text-gray-600">
          {formattedDate}
          <div className="text-xs text-gray-400">{formattedTime}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center gap-2">
        <Link
          to="/vaccinationView"
          state={{ params: { Vaccination: row.original } }}
        >
          <Button variant="outline" size="sm" className="h-8 w-[50px] p-0">
            View
          </Button>
        </Link>
        {row.original.follow_up_visit?.followv_status?.toLowerCase() ===
          "pending" && (
          <Link
            to="/updateVaccinationForm"
            state={{ params: { Vaccination: row.original } }}
          >
            <Button variant="destructive" size="sm" className="h-8 p-2">
              update
            </Button>
          </Link>
        )}
      </div>
    ),
  },
];