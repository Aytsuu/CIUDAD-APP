import ComplaintRecord from "@/pages/record/complaint/ComplaintRecord";
import { ComplaintReport } from "@/pages/record/complaint/ComplaintReport";
import { ComplaintViewRecord } from "@/pages/record/complaint/ComplaintViewRecord";

export const complaint_router = [
  {
    path: "/blotter-record",
    element: <ComplaintRecord />,
  },
  {
    path: "/blotter-record/:id",
    element: <ComplaintViewRecord />,
  },
  {
    path: "/blotter-report",
    element: <ComplaintReport />,
  },
];
