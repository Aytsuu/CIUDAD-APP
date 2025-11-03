import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calculateAge } from "@/helpers/ageCalculator";
import ViewButton from "@/components/ui/view-button";



export const useCombinedConsultationColumns = (): ColumnDef<any>[] => {
  const navigate = useNavigate();

  return [
    {
      accessorKey: "record_type",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Record Type <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => <div className="text-sm min-w-[120px] capitalize text-center">{row.original.record_type.replace("-", " ")}</div>
    },
    {
      accessorKey: "patient_info",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Patient Info <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const data = row.original.data;
        let patientDetails = null;

        if (row.original.record_type === "child-health") {
          patientDetails = data.chrec_details?.patrec_details?.pat_details;
        } else {
          patientDetails = data.patrec_details?.patient_details;
        }

        const personalInfo = patientDetails?.personal_info || {};
        const fullName = `${personalInfo.per_lname || ""}, ${personalInfo.per_fname || ""} ${personalInfo.per_mname || ""}`.trim();

        return (
          <div className="flex flex-col min-w-[200px]">
            <div className="font-medium">{fullName}</div>
            <div className="text-sm text-gray-500">
              {personalInfo.per_sex}, {personalInfo.per_dob ? calculateAge(personalInfo.per_dob) : "N/A"}
            </div>
            <div className="text-xs text-gray-500">ID: {patientDetails?.pat_id || "N/A"}</div>
          </div>
        );
      }
    },
    {
      accessorKey: "details",
      header: "Record Details",
      cell: ({ row }) => {
        const data = row.original.data;

        if (row.original.record_type === "child-health") {
          return (
            <div className="grid grid-cols-1 gap-1 text-sm min-w-[180px]">
              <div>UFC No: {data.chrec_details?.ufc_no || "N/A"}</div>
              <div>TT Status of Mother: {data.tt_status || "N/A"}</div>
            </div>
          );
        } else {
          return (
            <div className="grid grid-cols-1 gap-1 text-sm min-w-[200px]">
              <div>Chief Complaint: {data.medrec_chief_complaint || "N/A"}</div>
              <div>Status: {data.medrec_status || "N/A"}</div>
            </div>
          );
        }
      }
    },
    {
      accessorKey: "vital_signs",
      header: "Vital Signs",
      cell: ({ row }) => {
        const data = row.original.data;

        if (row.original.record_type === "child-health") {
          const vitalSigns = data.child_health_vital_signs?.[0];
          const bmDetails = vitalSigns?.bm_details;
          const temp = vitalSigns?.temp;

          return (
            <div className="text-sm min-w-[180px]">
              {temp && <div>Temp: {temp}°C</div>}
              {bmDetails && (
                <>
                  <div>Height: {bmDetails.height || "N/A"} cm</div>
                  <div>Weight: {bmDetails.weight || "N/A"} kg</div>
                  <div>WFA: {bmDetails.wfa || "N/A"}</div>
                  <div>LHFA: {bmDetails.lhfa || "N/A"}</div>
                </>
              )}
            </div>
          );
        } else {
          const vitalSigns = data.vital_signs || {};
          const bmiDetails = data.bmi_details || {};

          return (
            <div className="text-sm min-w-[180px]">
              <div>
                BP: {vitalSigns.vital_bp_systolic || "N/A"}/{vitalSigns.vital_bp_diastolic || "N/A"}
              </div>
              <div>Temp: {vitalSigns.vital_temp || "N/A"}°C</div>
              <div>Pulse: {vitalSigns.vital_pulse || "N/A"}</div>
              <div>RR: {vitalSigns.vital_RR || "N/A"}</div>
              <div>Height: {bmiDetails.height || "N/A"} cm</div>
              <div>Weight: {bmiDetails.weight || "N/A"} kg</div>
            </div>
          );
        }
      }
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Address <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const data = row.original.data;
        let address = null;

        if (row.original.record_type === "child-health") {
          address = data.chrec_details?.patrec_details?.pat_details?.address;
        } else {
          address = data.patrec_details?.patient_details?.address;
        }

        return <div className="w-[200px] break-words text-sm">{address?.full_address || "No address provided"}</div>;
      }
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Created At <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => <div className="text-sm">{row.original.data.created_at ? new Date(row.original.data.created_at).toLocaleDateString() : "N/A"}</div>
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const data = row.original.data;
        let patientData = null;

        if (row.original.record_type === "child-health") {
          const patDetails = data.chrec_details?.patrec_details?.pat_details;
          const personalInfo = patDetails?.personal_info || {};
          const address = patDetails?.address || {};

          patientData = {
            pat_id: patDetails?.pat_id,
            pat_type: patDetails?.pat_type,
            age: personalInfo.per_dob ? calculateAge(personalInfo.per_dob).toString() : "",
            addressFull: address.full_address,
            address: {
              add_street: address.add_street,
              add_barangay: address.add_barangay,
              add_city: address.add_city,
              add_province: address.add_province,
              add_sitio: address.add_sitio
            },
            households: patDetails?.households || [],
            personal_info: personalInfo
          };
        } else {
          const patDetails = data.patrec_details?.patient_details;
          const personalInfo = patDetails?.personal_info || {};
          const address = patDetails?.address || {};

          patientData = {
            pat_id: data.patrec_details?.pat_id,
            pat_type: patDetails?.pat_type,
            age: personalInfo.per_dob ? calculateAge(personalInfo.per_dob).toString() : "",
            addressFull: address.full_address,
            address: {
              add_street: address.add_street,
              add_barangay: address.add_barangay,
              add_city: address.add_city,
              add_province: address.add_province,
              add_sitio: address.add_sitio
            },
            households: patDetails?.households || [],
            personal_info: personalInfo
          };
        }

        return (
          <div className="flex justify-center gap-2">
            <ViewButton
              onClick={() => {
                navigate(row.original.record_type === "child-health" ? "/referred-patients/child" : "/referred-patients/adult", {
                  state: {
                    patientData,
                    recordData: row.original.data,
                    recordType: row.original.record_type,
                    ...(row.original.record_type === "child-health" ? { checkupData: row.original.data } : { MedicalConsultation: row.original.data })
                  }
                });
              }}
            />
          </div>
        );
      }
    }
  ];
};