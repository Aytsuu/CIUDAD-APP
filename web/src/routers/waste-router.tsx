import WasteIllegalDumping from "@/pages/report/waste/waste-illegal-dumping";
import WasteMainScheduling from "@/pages/record/waste-scheduling/waste-main-sched-page";
import GarbagePickupRequestMain from "@/pages/record/waste-scheduling/garbage-pickup/garbage-pickup-request-main";

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
      path: '/garbage-pickup-request',
      element: <GarbagePickupRequestMain/>
    }
  ]