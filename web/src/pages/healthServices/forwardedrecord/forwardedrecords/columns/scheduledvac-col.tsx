import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calculateAge } from "@/helpers/ageCalculator";
import ViewButton from "@/components/ui/view-button";

export const useScheduledVaccinationColumns = (): ColumnDef<any>[] => {
  const navigate = useNavigate();

  return [
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Patient <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const patient = row.original.patient?.personal_info;
        const fullName = `${patient?.per_lname || ""}, ${patient?.per_fname || ""} ${patient?.per_mname || ""}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-gray-500">
                {patient?.per_sex || ""}, {patient?.per_dob ? calculateAge(patient.per_dob).toString() : "N/A"}
              </div>
              <div className="text-xs text-gray-400">{row.original.patient?.personal_info?.per_id || ""}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "vaccine",
      header: "Vaccine",
      cell: ({ row }) => (
        <div className="flex flex-col min-w-[150px]">
          <div className="font-medium">{row.original.vaccine_name || "N/A"}</div>
        </div>
      )
    },
    {
      accessorKey: "dose",
      header: "Dose",
      cell: ({ row }) => {
        const doseNo = String(row.original.vachist_doseNo);
        const doseText = doseNo === "1" ? "1st dose" : doseNo === "2" ? "2nd dose" : doseNo === "3" ? "3rd dose" : `${doseNo}th dose`;
        
        return (
          <div className="flex flex-col">
            <div className="text-sm text-gray-500">{doseText}</div>
          </div>
        );
      }
    },
    {
      accessorKey: "vital_signs",
      header: "Vital Signs",
      cell: ({ row }) => {
        const vital = row.original.vital_signs || {};
        return (
          <div className="grid grid-cols-2 gap-1 text-sm min-w-[200px]">
            <div>
              BP: {vital.vital_bp_systolic || "N/A"}/{vital.vital_bp_diastolic || "N/A"}
            </div>
            <div>Temp: {vital.vital_temp || "N/A"}°C</div>
            <div>Pulse: {vital.vital_pulse || "N/A"}</div>
            <div>O2: {vital.vital_o2 || "N/A"}</div>
          </div>
        );
      }
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.original.patient?.address;
        const fullAddress = [address?.add_street, address?.add_barangay, address?.add_city, address?.add_province]
          .filter(Boolean)
          .join(", ") || "No address provided";
        
        return (
          <div className="flex justify-start px-2">
            <div className="w-[200px] break-words">{fullAddress}</div>
          </div>
        );
      }
    },
    {
      accessorKey: "sitio",
      header: "Sitio",
      cell: ({ row }) => (
        <div className="flex justify-center px-2">
          <div>{row.original.patient?.address?.add_sitio || "No address provided"}</div>
        </div>
      )
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const patient = row.original.patient?.personal_info;
        const address = row.original.patient?.address;
        
        const handleViewClick = () => {
          navigate("/scheduled-vaccine", {
            state: {
              Vaccination: row.original,
              patientData: {
                patrec_id: row.original.patrec_id || "",
                pat_id: row.original.patient?.pat_id || "",
                pat_type: row.original.patient?.pat_type || "",
                age: patient?.per_dob ? calculateAge(patient.per_dob).toString() : "N/A",
                addressFull: address?.full_address || [
                  address?.add_street,
                  address?.add_barangay,
                  address?.add_city,
                  address?.add_province
                ].filter(Boolean).join(", ") || "No address provided",
                address: {
                  add_street: address?.add_street || "",
                  add_barangay: address?.add_barangay || "",
                  add_city: address?.add_city || "",
                  add_province: address?.add_province || "",
                  add_sitio: address?.add_sitio || ""
                },
                households: [{ hh_id: row.original.patient?.households?.[0]?.hh_id || "N/A" }],
                personal_info: {
                  per_fname: patient?.per_fname || "",
                  per_mname: patient?.per_mname || "",
                  per_lname: patient?.per_lname || "",
                  per_dob: patient?.per_dob || "",
                  per_sex: patient?.per_sex || ""
                }
              }
            }
          });
        };

        return (
          <div className="flex justify-center gap-2">
            <ViewButton onClick={handleViewClick} />
          </div>
        );
      }
    }
  ];
};