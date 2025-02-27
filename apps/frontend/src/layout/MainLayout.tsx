import { Navbar } from "@/components/ui/sidebar/Header";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar/sidebar";
import AppSidebar from "@/components/ui/sidebar/app-sidebar";
import { Outlet } from "react-router";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { useState } from "react";

export default function MainLayout() {
 
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col w- h-screen bg-none">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div>
          <SidebarProvider>
            <AppSidebar />
            <div className="bg-snow">
              <TooltipLayout
                trigger={<SidebarTrigger onClick={() => setIsOpen(!isOpen)} />}
                content={isOpen ? "Open" : "Close"}
              />
            </div>
          </SidebarProvider>
        </div>
        <main className="px-2 py-4 overflow-y-auto flex-1 bg-[#F3F4F8]">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}
