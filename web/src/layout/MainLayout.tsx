import { Header } from "@/pages/menubar/Header";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/pages/menubar/sidebar/sidebar";
import AppSidebar from "@/pages/menubar/sidebar/app-sidebar";
import { Outlet } from "react-router";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import AccountSidebar from "@/pages/menubar/sidebar/account-sidebar";
import { useLocation } from "react-router";

export default function MainLayout() {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  // Check if we are in Account Settings
  const isAccountSettings = location.pathname.startsWith("/manage");

  return (
    <div className="fixed inset-0 flex flex-col bg-none">
      <div className="flex-shrink-0 relative z-10">
        <Header />
      </div> 
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-shrink-0 h-full relative z-0">
          <SidebarProvider>
            {isAccountSettings ? (
              <AccountSidebar/>
            ) : (
              <AppSidebar/>
            )}
            <div className="bg-snow">
              <TooltipLayout
                trigger={<SidebarTrigger onClick={() => setIsOpen(!isOpen)} />}
                content={isOpen ? "Open" : "Close"}
              />
            </div>
          </SidebarProvider>
        </div>
        <main className="py-10 pl-8 pr-14 flex-1 bg-[#F3F4F8] overflow-y-auto ">
          <Outlet />
          <Toaster visibleToasts={5}/>
        </main>
      </div>
    </div>
  );
}