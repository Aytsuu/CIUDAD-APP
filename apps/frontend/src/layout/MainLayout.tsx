import ProfilingMain from "@/components/profiling/ProfilingMain";
import { Navbar } from "@/components/ui/sidebar/Navbar";
import { AppSidebar } from "@/components/ui/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar/sidebar";
import { Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <div className="flex flex-col w- h-screen bg-none">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 shadow-[0_0px_7px_rgba(0,0,0,0.25)]">
          <SidebarProvider>
            <AppSidebar />
            <main>
              {/* <SidebarTrigger /> */}
            </main>
          </SidebarProvider>
        </div>
        <main className="px-8 py-4 overflow-y-auto flex-1 bg-[#F3F4F8]">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
