import ComplaintRecord from "@/pages/record/complaint/complaint-record/ComplaintRecord";
import { ComplaintForm } from "@/pages/record/complaint/complaint-report/FormComplaint";
import { ComplaintViewRecord } from "@/pages/record/complaint/ComplaintReportRecord";
import ComplaintRequest from "@/pages/record/complaint/ComplaintRequest";
import ComplaintRejected from "@/pages/record/complaint/ComplaintRejected";
import ComplaintList from "@/pages/record/complaint/record/ComplaintRecord";
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
    path: "complaint/report/",
    element: <ComplaintForm />,
  },
  {
    path: "complaint/request/",
    element: <ComplaintRequest />,
  },
  {
    path: "complaint/request/rejected",
    element: <ComplaintRejected />,
  },
  {
    path: "record/",
    element: <ComplaintList />,
  },
];
