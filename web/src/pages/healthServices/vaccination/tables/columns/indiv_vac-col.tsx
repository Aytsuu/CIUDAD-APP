// columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { VaccinationRecord } from "./types";
import { Patient } from "@/pages/healthServices/restful-api-patient/type";
import { getOrdinalSuffix } from "@/helpers/getOrdinalSuffix";
import ViewButton from "@/components/ui/view-button";
import { useNavigate } from "react-router-dom";

export const IndivVaccineColumns = (patientData: Patient): ColumnDef<VaccinationRecord>[] => [
  {
    accessorKey: "index",
    header: "#",
            size: 50,

    cell: ({ row, table }) => {
      // Reverse index: totalRows - row.index
      const totalRows = table.getRowModel().rows.length;
      return <div className="text-center p-1 rounded-md">{totalRows - row.index}</div>;
    },
  },

  {
    accessorKey: "vaccine_name",
    header: "Vaccine",
    cell: ({ row }) => (
      <div className="flex justify-center px-2">
        <div className="font-medium">
          {row.original.vaccine_name}
          {/* <div className="text-xs text-gray-500">
            Batch: {row.original.batch_number}
          </div>
          <div className="text-xs text-gray-500">
            Type: {row.original.vaccine_details?.vac_type ?? "Unknown"}
          </div> */}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "BP",
    header: "BP",
    size: 80,
    cell: ({ row }) => {
      const vital = row.original.vital_signs;
      return (
        <div className="flex justify-center items-center gap-2 px-2 py-1 ">
          {vital?.vital_bp_systolic && vital?.vital_bp_diastolic && (
            <div className="flex items-center">
              <span>
                {vital.vital_bp_systolic}/{vital.vital_bp_diastolic} mmHg
              </span>
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "temperature",
    header: "Temp",
    size: 50,

    cell: ({ row }) => {
      const vital = row.original.vital_signs;
      return (
        <div className="flex justify-center items-center gap-2 px-2 py-1 ">
          {vital?.vital_temp && (
            <div className="flex items-center">
              <span>{vital.vital_temp}°C</span>
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "pulse_rate",
    header: "PR",
    size: 80,

    cell: ({ row }) => {
      const vital = row.original.vital_signs;
      return (
        <div className="flex justify-center items-center gap-2 px-2 py-1 ">
          {vital?.vital_pulse && (
            <div className="flex items-center">
              <span>{vital.vital_pulse}</span>
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "O2",
    header: "O2",
    size: 50,

    cell: ({ row }) => {
      const vital = row.original.vital_signs;
      return (
        <div className="flex justify-center items-center gap-2 px-2 py-1 ">
          {vital?.vital_o2 && (
            <div className="flex items-center">
              <span>{vital.vital_o2}%</span>
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "vachist_doseNo",
    header: "Dose",
    cell: ({ row }) => {
      const formattedDose = getOrdinalSuffix(row.original.vachist_doseNo ? parseInt(row.original.vachist_doseNo, 10) : undefined);
      return (
        <div className="flex justify-center">
          <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{formattedDose} Dose</div>
        </div>
      );
    },
  },

  
    {
    accessorKey: "date_administered",
    header: "Date Administered",
    cell: ({ row }) => {
      return <div className="text-sm text-gray-600">{row.original.date_administered}</div>;
    },
  },

  {

    accessorKey: "status",
    header: "Status",
    cell: ({}) => (
      <div className="w-full flex justify-center">
        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">Completed</span>
      </div>
    ),
  },


  
  // {
  //   accessorKey: "nextDose",
  //   header: "Next follow up",
  //   size: 110,

  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex flex-col justify-center">
  //         {/* <span
  //           className={`px-3 py-1 rounded-full text-sm font-medium ${
  //             statusColors[displayStatus as keyof typeof statusColors] ||
  //             "bg-gray-100 text-gray-800"
  //           }`}
  //         >
  //           {displayStatus}
  //         </span> */}
  //         <div>
  //           <div className="text-xs mt-1">
  //             {(row.original.follow_up_visit?.followv_status?.toLowerCase() ?? "") === "completed" ? (
  //               "Next Dose: completed"
  //             ) : (
  //               <>
  //                 {" "}
  //                 {isNaN(new Date(row.original.follow_up_visit?.followv_date ?? "Invalid Date").getTime()) ? (
  //                   "No Schedule"
  //                 ) : (
  //                   <span className="text-red-500">{new Date(row.original.follow_up_visit?.followv_date ?? "Invalid Date").toLocaleDateString()}</span>
  //                 )}
  //               </>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   },
  // },

  // {
  //   accessorKey: "signature",
  //   header: "Signature",
  //   cell: ({ row }) => (
  //     <div className="flex justify-center px-2 w-full">
  //       {row.original.signature && (
  //         <div className="w-[200px]">
  //           <img src={`data:image/png;base64,${row.original.signature}`} alt="Authorized Signature" className="h-10 w-auto object-contain" />
  //         </div>
  //       )}
  //     </div>
  //   ),
  // },

  {
    accessorKey: "action",
    header: "Actions",
    cell: ({ row }) => {
      const currentRecord = row.original;
      const navigate = useNavigate();

      return (
        <div className="flex justify-center gap-2">
          {/* <Link to="/services/vaccination/records/history" state={{ params: { Vaccination: currentRecord, patientData } }}> */}
          {/* <Button variant="outline" size="sm" className="h-8 w-[50px] p-0">
              View
            </Button> */}
          {/* </Link> */}

          <ViewButton
            onClick={() => {
              navigate("/services/vaccination/records/history", {
                state: {
                  params: {
                    Vaccination: currentRecord,
                    patientData,
                  },
                },
              });
            }}
          />
        </div>
      );
    },
  },
];
