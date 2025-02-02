import { SidebarProvider } from "./sidebar";
import { AppSidebar } from "./app-sidebar";
import { Navbar } from "./Navbar";
import { ProfilingForm } from "@/components/profiling/ProfilingForm";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w- h-screen bg-none">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 shadow-[0_0px_7px_rgba(0,0,0,0.25)]">
          <SidebarProvider>
            <AppSidebar />
            <main>
              {/* <SidebarTrigger /> */}
              {children}
            </main>
          </SidebarProvider>
        </div>
        <main className="p-4 overflow-y-auto flex-1">
          <ProfilingForm/>
        </main>
      </div>

      <div></div>
    </div>
  );
}
