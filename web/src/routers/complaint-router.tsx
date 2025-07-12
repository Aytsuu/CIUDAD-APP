import ComplaintRecord from "@/pages/record/complaint/complaint-record/ComplaintRecord";
import { ComplaintReport } from "@/pages/record/complaint/ComplaintReport";
import { ComplaintViewRecord } from "@/pages/record/complaint/ComplaintReportRecord";
import ArchiveComplaints from "@/pages/record/complaint/ComplaintArchive";

export const complaint_router = [
  {
    path: "/complaint",
    children:[
      {
        index: true,
        element: <ComplaintRecord/>
      },
      {
        path: ":id",
        element: <ComplaintViewRecord/>
      },
      {
        path: "report",
        element: <ComplaintReport/>
      },
      {
        path: "archive",
        element: <ArchiveComplaints/>
      }
    ]
  },
];
