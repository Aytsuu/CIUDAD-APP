// columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { VaccinationRecord } from "./types";
import { Patient } from "@/pages/healthServices/restful-api-patient/type";
import { getOrdinalSuffix } from "@/helpers/getOrdinalSuffix";

export const IndivVaccineColumns = (
  patientData: Patient,
  allVaccinationRecords: VaccinationRecord[]
): ColumnDef<VaccinationRecord>[] => [
  {
    accessorKey: "index",
    header: "#",
    cell: ({ row }) => (
      <div className="text-center bg-blue-50 p-1 rounded-md">
        {row.index + 1}
      </div>
        ),
      },

      {
        accessorKey: "date_administered",
        header: "Date Administered",
        cell: ({ row }) => {
        
      return <div className="text-sm text-gray-600">{row.original.date_administered}</div>;
        },
      },
      {
        accessorKey: "vaccine_name",
        header: "Vaccine",
        cell: ({ row }) => (
      <div className="flex justify-center min-w-[150px] px-2">
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
    accessorKey: "vital_signs",
    header: "Vital Signs",
    cell: ({ row }) => {
      const vital = row.original.vital_signs;
      return (
        <div className="flex justify-center items-center gap-2 min-w-[150px] px-2 py-1 ">
          <div className="flex flex-col justify-start text-sm min-w-[180px]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {vital?.vital_bp_systolic && vital?.vital_bp_diastolic && (
                <div className="flex items-center">
                  <span className="font-medium mr-1">BP:</span>
                  <span>
                    {vital.vital_bp_systolic}/{vital.vital_bp_diastolic} mmHg
                  </span>
                </div>
              )}
              {vital?.vital_temp && (
                <div className="flex items-center">
                  <span className="font-medium mr-1">Temp:</span>
                  <span>{vital.vital_temp}°C</span>
                </div>
              )}
              {vital?.vital_pulse && (
                <div className="flex items-center">
                  <span className="font-medium mr-1">PR:</span>
                  <span>{vital.vital_pulse}</span>
                </div>
              )}
              {vital?.vital_o2 && (
                <div className="flex items-center">
                  <span className="font-medium mr-1">O2:</span>
                  <span>{vital.vital_o2}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "vachist_doseNo",
    header: "Dose",
    cell: ({ row }) => {
      const formattedDose = getOrdinalSuffix(
        row.original.vachist_doseNo
          ? parseInt(row.original.vachist_doseNo, 10)
          : undefined
      );
      return (
        <div className="flex justify-center">
          <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {formattedDose} Dose
            <div className="text-xs text-gray-500 mt-1">
              Required Doses {row.original.vacrec_totaldose ?? "N/A"} dose/s
            </div>
          </div>
        </div>
      );
    },
  },

  //   // In the "vachist_status" column definition, modify it as follows:
  // {
  //   accessorKey: "vachist_status",
  //   header: "Status",
  //   cell: ({ row }) => {
  //     // Determine status based on doseNo and totaldose
  //     const doseNo = row.original.vachist_doseNo;
  //     const totalDose = row.original.vacrec_totaldose ;

  //     let displayStatus = row.original.vachist_status;

  //     // Manual status override logic
  //     if (doseNo !== totalDose) {
  //       displayStatus = "partially vaccinated";
  //     } else if (doseNo === totalDose) {
  //       displayStatus = "completed";
  //     }

  //     const statusColors = {
  //       completed: "bg-green-100 text-green-800",
  //       "partially vaccinated": "bg-red-100 text-red-800",
  //       "in queue": "bg-yellow-100 text-yellow-800",
  //     };

  //     return (
  //       <div className="flex flex-col justify-center">
  //         <span
  //           className={`px-3 py-1 rounded-full text-sm font-medium ${
  //             statusColors[displayStatus as keyof typeof statusColors] ||
  //             "bg-gray-100 text-gray-800"
  //           }`}
  //         >
  //           {displayStatus}
  //         </span>
  //         <div className="text-xs mt-1">
  //           {(row.original.follow_up_visit?.followv_status?.toLowerCase() ??
  //             "") === "completed" ? (
  //             "Next Dose: completed"
  //           ) : (
  //             <>
  //               Next Dose:{" "}
  //               {isNaN(
  //                 new Date(
  //                   row.original.follow_up_visit?.followv_date ??
  //                     "Invalid Date"
  //                 ).getTime()
  //               ) ? (
  //                 "No Schedule"
  //               ) : (
  //                 <span className="text-red-500">
  //                   {new Date(
  //                     row.original.follow_up_visit?.followv_date ??
  //                       "Invalid Date"
  //                   ).toLocaleDateString()}
  //                 </span>
  //               )}
  //             </>
  //           )}
  //         </div>
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "nextDose",
    header: "Next Dose",
    cell: ({ row }) => {
      const displayStatus = row.original.vachist_status;

      const statusColors = {
        completed: "bg-green-100 text-green-800",
        "partially vaccinated": "bg-red-100 text-red-800",
        "in queue": "bg-yellow-100 text-yellow-800",
      };

      return (
        <div className="flex flex-col justify-center">
          {/* <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[displayStatus as keyof typeof statusColors] ||
              "bg-gray-100 text-gray-800"
            }`}
          >
            {displayStatus}
          </span> */}
          <div>
            <div className="text-xs mt-1">
              {(row.original.follow_up_visit?.followv_status?.toLowerCase() ??
                "") === "completed" ? (
                "Next Dose: completed"
              ) : (
                <>
                  Next Dose:{" "}
                  {isNaN(
                    new Date(
                      row.original.follow_up_visit?.followv_date ??
                        "Invalid Date"
                    ).getTime()
                  ) ? (
                    "No Schedule"
                  ) : (
                    <span className="text-red-500">
                      {new Date(
                        row.original.follow_up_visit?.followv_date ??
                          "Invalid Date"
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
    accessorKey: "action",
    header: "Actions",
    cell: ({ row }) => {
      const currentRecord = row.original;
      const followUpStatus =
        currentRecord.follow_up_visit?.followv_status?.toLowerCase();

      const sameVacRecRecords = allVaccinationRecords.filter(
        (record) => record.vacrec === currentRecord.vacrec
      );

      const hasScheduledInSameVacRec = sameVacRecRecords.some(
        (record) => record.vachist_status?.toLowerCase() === "scheduled"
      );

      const shouldShowButton =
        followUpStatus === "pending" && !hasScheduledInSameVacRec;

      return (
        <div className="flex justify-center gap-2">
          <Link
            to="/vaccinationView"
            state={{ params: { Vaccination: currentRecord, patientData } }}
          >
            <Button variant="outline" size="sm" className="h-8 w-[50px] p-0">
              View
            </Button>
          </Link>
          {/* {shouldShowButton && (
            <Link
              to="/updateVaccinationForm"
              state={{ params: { Vaccination: currentRecord, patientData } }}
            >
              <Button
                variant="destructive"
                size="sm"
                className="h-8 p-2"
              >
                Process Next Dose
              </Button>
            </Link>
          )} */}
        </div>
      );
    },
  },
];
