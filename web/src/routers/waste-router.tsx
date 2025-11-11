import WasteIllegalDumping from "@/pages/record/report/waste/waste-illegal-dumping";
import WastePersonnel from "@/pages/record/waste-scheduling/waste-personnel/waste-personnel-truck";
import GarbagePickupRequestMain from "@/pages/record/waste-scheduling/garbage-pickup/garbage-pickup-request-main";
import WasteCollectionMain from "@/pages/record/waste-scheduling/waste-collection/waste-col-main";

// Creating routes
export const waste_router = [
    {
      path: '/waste-illegaldumping-report',
      element: <WasteIllegalDumping/>
    },
    {
      path: '/waste-personnel',
      element: <WastePersonnel/>
    },
    {
      path: '/garbage-pickup-request',
      element: <GarbagePickupRequestMain/>
    },
    {
      path: '/waste-collection',
      element: <WasteCollectionMain/>
    }
  ]
