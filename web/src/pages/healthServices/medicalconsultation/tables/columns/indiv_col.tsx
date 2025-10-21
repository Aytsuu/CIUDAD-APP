// medical-consultation-columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import ViewButton from "@/components/ui/view-button";
import { useNavigate } from "react-router-dom";

const isHighlighted = (rowAppId: any, patientData_app_id?: any) => {
  if (patientData_app_id == null) return false;
  return String(rowAppId) === String(patientData_app_id);
};

export const getMedicalConsultationColumns = (patientData?: any): ColumnDef<any>[] => [
  {
    accessorKey: "created_at",
    header: "Created at",
    cell: ({ row }) => {
      const highlighted = isHighlighted(row.original?.app_id, patientData?.app_id);
      const createdAt = new Date(row.original.created_at || Date.now());
      const formattedDate = createdAt.toLocaleDateString();

      return (
        <div className={`flex flex-col items-center gap-2 text-sm px-2 py-1 ${highlighted ? "text-blue-700 font-medium" : "text-gray-600"}`}>
          {formattedDate}
          {highlighted && (
            <span className="px-2 py-0.5 text-xs font-semibold text-white bg-blue-600 rounded-full">
               Appointment
            </span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "vital_signs",
    header: "Vital Signs",
    cell: ({ row }) => {
      const highlighted = isHighlighted(row.original?.app_id, patientData?.app_id);
      const vital = row.original.vital_signs || {};
      return (
        <div className={`flex justify-center items-center gap-2 min-w-[200px] px-2 py-1 ${highlighted ? "text-blue-700 font-medium" : ""}`}>
          <div className="flex flex-col text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center">
                <span className="font-medium mr-1">BP:</span>
                <span>{vital?.vital_bp_systolic ?? "—"}/{vital?.vital_bp_diastolic ?? "—"} mmHg</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-1">Temp:</span>
                <span>{vital?.vital_temp ?? "—"}°C</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-1">Pulse:</span>
                <span>{vital?.vital_pulse ?? "—"} bpm</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-1">RR:</span>
                <span>{vital?.vital_RR ?? "—"} cpm</span>
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
      const highlighted = isHighlighted(row.original?.app_id, patientData?.app_id);
      const bmi = row.original.bmi_details || {};
      return (
        <div className={`w-full flex justify-center gap-2 min-w-[150px] px-2 py-1 ${highlighted ? "text-blue-700 font-medium" : ""}`}>
          <div className="text-sm flex flex-col items-center gap-1 w-[180px]">
            <span>Height: {bmi?.height ?? "—"} cm</span>
            <span>Weight: {bmi?.weight ?? "—"} kg</span>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "chiefcomplaint",
    header: "Chief Complaint",
    cell: ({ row }) => {
      const highlighted = isHighlighted(row.original?.app_id, patientData?.app_id);
      return (
        <div className={`flex w-full justify-center px-2 py-1 ${highlighted ? "text-blue-700 font-medium" : ""}`}>
          <div className="text-sm font-medium w-[240px] text-center">
            {row.original.medrec_chief_complaint || "N/A"}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "bhw_name",
    header: "BHW Assigned",
    cell: ({ row }) => {
      const highlighted = isHighlighted(row.original?.app_id, patientData?.app_id);
      const fname = row.original?.staff_details?.rp?.per?.per_fname || "N/A";
      const lname = row.original?.staff_details?.rp?.per?.per_lname || "N/A";
      const bhw = `${fname} ${lname}`;
      return (
        <div className={`px-2 py-1 ${highlighted ? "text-blue-700 font-medium" : ""}`}>
          {(bhw || "N/A").toUpperCase()}
        </div>
      );
    }
  },
  {
    accessorKey: "action",
    header: "Actions",
    cell: ({ row }) => {
      const highlighted = isHighlighted(row.original?.app_id, patientData?.app_id);
      const navigate = useNavigate();
      return (
        <div className={`flex justify-center px-2 py-1 ${highlighted ? "text-blue-700" : ""}`}>
          <ViewButton
            onClick={() => {
              navigate("/services/medical-consultation/records/history", {
                state: {
                  params: {
                    MedicalConsultation: row.original,
                    patientData: row.original?.patrec_details?.patient_details
                  }
                }
              });
            }}
          />
        </div>
      );
    }
  }
];