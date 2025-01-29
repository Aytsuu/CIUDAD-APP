import { SidebarProvider, SidebarTrigger } from "./sidebar"
import { AppSidebar } from "./app-sidebar"
 
export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
} 