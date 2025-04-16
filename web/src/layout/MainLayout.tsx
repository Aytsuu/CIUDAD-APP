import React from "react";
import { Header } from "@/components/ui/menubar/Header";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/menubar/sidebar";
import AppSidebar from "@/components/ui/menubar/app-sidebar";
import { Outlet } from "react-router";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";

export default function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = React.useRef(useAuth()).current;
   
  return (
    <div className="fixed inset-0 flex flex-col bg-none">
      <div className="flex-shrink-0 relative z-10">
        <Header />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-shrink-0 h-full relative z-0">
          <SidebarProvider>
            <AppSidebar assignedFeatures={user?.staff.assignments}/>
            <div className="bg-snow">
              <TooltipLayout
                trigger={<SidebarTrigger onClick={() => setIsOpen(!isOpen)} />}
                content={isOpen ? "Open" : "Close"}
              />
            </div>
          </SidebarProvider>
        </div>
        <main className="py-10 pl-8 pr-14 overflow-y-auto flex-1 bg-[#F3F4F8]">
          <Outlet />
          <Toaster />
        </main>
      </div>
    </div>
  );
}