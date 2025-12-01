// // InventoryReportsTabs.tsx
// import { useState } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
// import { Package, AlertTriangle } from "lucide-react";
// import CommodityExpiredOutOfStockSummary from "./expoutstock/monthly";
// import InventoryMonthlyCommodityRecords from "./monthly";

// export default function CommodityInventoryReportsTabs() {
//   const [activeTab, setActiveTab] = useState("inventory");

//   return (
//     <div className="w-full  pb-10">
//       <LayoutWithBack title="Medicine Inventory Reports" description="View and manage medicine inventory reports including stock levels and restock needs.">
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full ">
//           <div className="flex items-center justify-center mb-6">
//             <TabsList className="grid grid-cols-2 p-1 h-auto rounded-full w-full max-w-md bg-white">
//               <TabsTrigger value="inventory" className="flex items-center justify-center gap-2 py-2 data-[state=active]:text-blue-500  data-[state=active]:bg-blue-100  data-[state=active]:rounded-full transition-all">
//                 <Package className="h-4 w-4" />
//                 <span>Inventory Stocks Report</span>
//               </TabsTrigger>
//               <TabsTrigger value="restock" className="flex items-center justify-center gap-2 py-2 data-[state=active]:text-blue-500 data-[state=active]:bg-blue-100 data-[state=active]:rounded-full transition-all">
//                 <AlertTriangle className="h-4 w-4" />
//                 <span>Need Restock Report</span>
//               </TabsTrigger>
//             </TabsList>
//           </div>

//           <div className="relative">
//             <TabsContent value="inventory" className="mt-0">
//               <InventoryMonthlyCommodityRecords />
//             </TabsContent>

//             <TabsContent value="restock" className="mt-0">
//               <CommodityExpiredOutOfStockSummary />
//             </TabsContent>
//           </div>
//         </Tabs>
//       </LayoutWithBack>
//     </div>
//   );
// }
