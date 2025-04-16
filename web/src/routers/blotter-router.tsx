import BlotterRecord from "@/pages/record/complaint/BlotterRecord";
import { BlotterReport } from "@/pages/record/complaint/BlotterReport";
import { BlotterViewRecord } from "@/pages/record/complaint/BlotterViewRecord";

export const blotter_router = [
  {
    path: "/blotter-record",
    element: <BlotterRecord />,
  },
  {
    path: "/blotter-record/:id",
    element: <BlotterViewRecord />,
  },
  {
    path: "/blotter-report",
    element: <BlotterReport />,
  },
];
