// import { Calendar, LayoutDashboard, Inbox, Search, Settings } from "lucide-react"
 
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar"
 
// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/clerkDashboard",
  },
  {
    title: "Certification, Permit & Mediation",
    url: "/clerkCertification",
  },
  {
    title: "Record",
    url: "/record",
  },
  {
    title: "Donation",
    url: "/donation",
  },
  {
    title: "Announcement",
    url: "/announcement",
  },
]
 
export function AppSidebar() {
  return (
    <Sidebar className="pt-14 border-none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      {/* <item.icon /> */}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}