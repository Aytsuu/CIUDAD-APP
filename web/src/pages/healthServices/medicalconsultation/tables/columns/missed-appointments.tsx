// components/columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDate,formatDateTime } from "@/helpers/dateHelper";



export const medicalAppointmentMissedColumns: ColumnDef<any>[] = [
  {
    id: "index",
    header: () => <div className="text-center">#</div>,
    size: 50,
    cell: ({ row, table }) => {
      return <div className="text-center">{table.getRowModel().rows.indexOf(row) + 1}</div>;
    }
  },
  {
    accessorKey: "personal_info",
    header: () => <div className="text-center">Patient Information</div>,
    size: 220,
    cell: ({ row }) => {
      const personalInfo = row.original.personal_info;
      const fullName = `${personalInfo?.per_lname || ""}, ${personalInfo?.per_fname || ""}${personalInfo?.per_mname ? ` ${personalInfo.per_mname}` : ""}${personalInfo?.per_suffix ? ` ${personalInfo.per_suffix}` : ""}`.trim();
      return (
        <div className="px-2 py-2">
          <div className="text-center space-y-1">
            <div className="font-medium text-gray-900 break-words whitespace-normal" title={fullName}>
              {fullName}
            </div>
            <div className="text-sm text-gray-500">{personalInfo?.per_contact || "No contact"}</div>
            <div className="text-xs text-gray-400">
              {personalInfo?.per_sex || "N/A"} • {formatDate(personalInfo?.per_dob)}
            </div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "address",
    header: () => <div className="text-center">Address</div>,
    size: 250,
    cell: ({ row }) => {
      const address = row.original.address;
      const addressText = address 
        ? [address.add_street, address.add_sitio, address.add_barangay, address.add_city, address.add_province]
            .filter(Boolean)
            .join(", ") 
        : "No address";
      return (
        <div className="px-2 py-2">
          <div className="text-sm text-gray-700 break-words whitespace-normal text-center leading-relaxed" title={addressText}>
            {addressText}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "chief_complaint",
    header: () => <div className="text-center">Chief Complaint</div>,
    size: 200,
    cell: ({ row }) => {
      const complaint = row.original.chief_complaint || "No complaint specified";
      return (
        <div className="px-2 py-2">
          <div className="text-sm text-gray-700 break-words whitespace-normal text-center leading-relaxed" title={complaint}>
            {complaint}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "scheduled_date",
    header: () => <div className="text-center">Scheduled Date</div>,
    size: 130,
    cell: ({ row }) => {
      return (
        <div className="text-center py-2">
          <div className="font-medium text-gray-900">{formatDate(row.original.scheduled_date)}</div>
        </div>
      );
    }
  },
  {
    accessorKey: "meridiem",
    header: () => <div className="text-center">Time</div>,
    size: 80,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center py-2">
          <Badge 
            variant="outline" 
            className={`px-3 py-1 text-xs font-medium ${
              row.original.meridiem === "AM" 
                ? "text-yellow-600 bg-yellow-50 border-yellow-500" 
                : row.original.meridiem === "PM" 
                ? "text-blue-600 bg-blue-50 border-blue-500" 
                : "text-gray-500 bg-gray-50 border-gray-400"
            }`}
          >
            {row.original.meridiem || "N/A"}
          </Badge>
        </div>
      );
    }
  },
  {
    accessorKey: "created_at",
    header: () => <div className="text-center">Requested On</div>,
    size: 140,
    cell: ({ row }) => {
      const { date, time } = formatDateTime(row.original.created_at);
      return (
        <div className="text-center py-2">
          <div className="font-medium text-gray-900 text-sm">{date}</div>
          {time && <div className="text-xs text-gray-500 mt-1">{time}</div>}
        </div>
      );
    }
  },
//   {
//     accessorKey: "status",
//     header: () => <div className="text-center">Status</div>,
//     size: 100,
//     cell: ({ row }) => (
//       <div className="flex justify-center py-2">
//         <Badge className="bg-green-100 text-green-800 hover:bg-green-100 capitalize text-xs px-3 py-1">
//           {row.original.status }
//         </Badge>
//       </div>
//     )
//   },
 
];