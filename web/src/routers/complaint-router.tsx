import ComplaintRecord from "@/pages/record/complaint/complaint-record/ComplaintRecord";
import { ComplaintForm } from "@/pages/record/complaint/complaint-report/FormComplaint";
import { ComplaintViewRecord } from "@/pages/record/complaint/ComplaintReportRecord";
import ArchiveComplaints from "@/pages/record/complaint/complaint-archive/ArchiveComplaint";
import ComplaintRequest from "@/pages/record/complaint/complaint-request/ComplaintRequest";
// import ComplaintRejected from "@/pages/record/complaint/complain-rejected/ComplaintRejected";

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
    path: "complaint/archive/",
    element: <ArchiveComplaints />,
  },
  {
    path: "complaint/request/",
    element: <ComplaintRequest />,
  },
  // {
  //   path: "complaint/request/rejected",
  //   element: <ComplaintRejected />,
  // },
];
