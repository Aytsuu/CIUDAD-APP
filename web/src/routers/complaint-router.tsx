import ComplaintRecord from "@/pages/record/complaint/complaint-record/ComplaintRecord";
import { ComplaintReport } from "@/pages/record/complaint/ComplaintReport";
import { ComplaintViewRecord } from "@/pages/record/complaint/ComplaintReportRecord";
import ArchiveComplaints from "@/pages/record/complaint/ComplaintArchive";

export const complaint_router = [
  {
    path: "/blotter-record",
    element: <ComplaintRecord />,
  },
  {
    path: "/complaint-record/:id",
    element: <ComplaintViewRecord />,
  },
  {
    path: "/complaint-report",
    element: <ComplaintReport />,
  },
  {
    path: "/complaint-archive",
    element: <ArchiveComplaints />,
  },
];
