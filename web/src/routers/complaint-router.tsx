import ComplaintRecord from "@/pages/record/complaint/complaint-record/ComplaintRecord";
import { ComplaintForm } from "@/pages/record/complaint/complaint-report/FormComplaint";
import { ComplaintViewRecord } from "@/pages/record/complaint/ComplaintReportRecord";
import ComplaintRequest from "@/pages/record/complaint/ComplaintRequest";
import ComplaintArchive from "@/pages/record/complaint/ComplaintArchive";

export const complaint_router = [
  {
    path: "complaint/",
    element: <ComplaintRecord />,
  },
  {
    path: "complaint/view/",
    element: <ComplaintViewRecord />,
  },
  {
    path: "complaint/archive/",
    element: <ComplaintArchive />,
  },
  {
    path: "complaint/report/",
    element: <ComplaintForm />,
  },
  {
    path: "complaint/request/",
    element: <ComplaintRequest />,
  },
];
