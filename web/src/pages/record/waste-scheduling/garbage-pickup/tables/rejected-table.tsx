import { ColumnDef } from "@tanstack/react-table"
import type { GarbageRequestReject } from "../queries/GarbageRequestFetchQueries"
import { DataTable } from "@/components/ui/table/data-table";
import { useGetGarbageRejectRequest } from "../queries/GarbageRequestFetchQueries";
import { Skeleton } from "@/components/ui/skeleton";

export default function RejectedTable() {

  const { data: rejectedReqData = [], isLoading } = useGetGarbageRejectRequest();
  console.log("Rejected data:", rejectedReqData);

  const columns: ColumnDef<GarbageRequestReject>[] = [
    { accessorKey: "garb_requester", header: "Requester" },
    { accessorKey: "garb_location", header: "Location"},
    { accessorKey: "garb_waste_type", header: "Waste Type" },
    { accessorKey: "garb_created_at", header: "Request Date" },
    { accessorKey: "dec_reason", header: "Rejection Reason" },
    { accessorKey: "dec_date", header: "Decision Date" },
  ]

   if (isLoading) {
      return (
        <div className="w-full h-full">
          <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
          <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
          <Skeleton className="h-10 w-full mb-4 opacity-30" />
          <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
        </div>
      );
  }
  
  return <DataTable columns={columns} data={rejectedReqData} />;
}