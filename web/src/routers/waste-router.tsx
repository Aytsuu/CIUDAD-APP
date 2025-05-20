import WasteIllegalDumping from "@/pages/report/waste/waste-illegal-dumping";
import WasteMainScheduling from "@/pages/record/waste-scheduling/waste-main-sched-page";
import WastePersonnel from "@/pages/record/waste-scheduling/waste-personnel-truck";

// Creating routes
export const waste_router = [
    {
      path: '/waste-calendar-scheduling',
      element: <WasteMainScheduling/>
    },
    {
      path: '/waste-illegaldumping-report',
      element: <WasteIllegalDumping/>
    },
        {
      path: '/waste-personnel',
      element: <WastePersonnel/>
    },
  ]