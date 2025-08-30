import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VaccineList from "./VaccineList";
import SupplyList from "./SupplyList";
import { Syringe, Package } from "lucide-react";

export default function AntigenList() {
  return (
    <div className="relative">
      <Tabs defaultValue="vaccines">
        <div className="flex items-center justify-center mb-2 ">
          <TabsList className="grid  grid-cols-2 mb-6 p-1 h-auto rounded-full w-1/2 bg-slate-100">
            <TabsTrigger value="vaccines" className="flex items-center justify-center gap-2 py-2 data-[state=active]:text-blue-500  data-[state=active]:rounded-full transition-all">
              <Syringe className="h-4 w-4" />
              <span>Vaccines</span>
              <span className="ml-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">24</span>
            </TabsTrigger>
            <TabsTrigger value="supplies" className="flex items-center justify-center gap-2 py-2 data-[state=active]:text-blue-500 data-[state=active]:rounded-full transition-all">
              <Package className="h-4 w-4" />
              <span>Immunization Supplies</span>
              <span className="ml-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">16</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="relative ">
          <TabsContent value="vaccines" className="mt-0">
            <VaccineList />
          </TabsContent>

          <TabsContent value="supplies" className="mt-0">
            <SupplyList />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}