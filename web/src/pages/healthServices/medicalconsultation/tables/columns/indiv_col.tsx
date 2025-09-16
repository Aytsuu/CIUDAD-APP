// medical-consultation-columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { MedicalConsultationHistory } from "../../types";
import { Patient } from "../../../restful-api-patient/type";

export const getMedicalConsultationColumns = (patientData: Patient | null): ColumnDef<MedicalConsultationHistory>[] => [
  {
    accessorKey: "created_at",
    header: "Created at",
    cell: ({ row }) => {
      const createdAt = new Date(row.original.created_at || Date.now());
      const formattedDate = createdAt.toLocaleDateString();

      return <div className="text-sm text-gray-600">{formattedDate}</div>;
    }
  },
  {
    accessorKey: "vital_signs",
    header: "Vital Signs",
    cell: ({ row }) => {
      const vital = row.original.vital_signs;
      return (
        <div className="flex justify-center items-center gap-2 min-w-[150px] px-2 py-1 ">
          <div className="flex flex-col justify-start text-sm min-w-[180px]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center">
                <span className="font-medium mr-1">BP:</span>
                <span>
                  {vital.vital_bp_systolic}/{vital.vital_bp_diastolic} mmHg
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-1">Temp:</span>
                <span>{vital.vital_temp}°C</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-1">Pulse:</span>
                <span>{vital.vital_pulse} bpm</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-1">RR:</span>
                <span>{vital.vital_RR} cpm</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "bmi_details",
    header: "Height and Weight",
    cell: ({ row }) => {
      const bmi = row.original.bmi_details;
      return (
        <div className="w-full items-center flex justify-center gap-2 min-w-[150px] px-2 py-1">
          <div className="text-sm flex flex-col  items-center gap-2 w-[150px] px-2 py-1">
            <span> Height: {bmi.height} cm </span>
            <span> Weight: {bmi.weight} kg</span>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "chiefcomplaint",
    header: "ChiefComplaint",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col w-full items-center">
          <div className="text-sm font-medium  w-[200px]">{row.original.medrec_chief_complaint || "N/A"}</div>
        </div>
      );
    }
  },
  {
    accessorKey: "bhw_name",
    header: "BHW Assigned",
    cell: ({ row }) => {
      const bhw = `${row.original.staff_details?.rp?.per?.per_fname || "N/A"} ${row.original.staff_details?.rp?.per?.per_lname || "N/A"}`;
      return (
        <div className="flex flex-col">
          <div className="text-sm">{bhw}</div>
        </div>
      );
    }
  },
  {
    accessorKey: "action",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center gap-2">
        <Link
          to="/DisplayMedicalConsultation"
          state={{
            params: { MedicalConsultation: row.original, patientData }
          }}
        >
          <Button variant="outline" size="sm" className="h-8 w-[50px] p-0">
            View
          </Button>
        </Link>
      </div>
    )
  }
];
