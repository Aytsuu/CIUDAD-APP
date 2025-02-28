import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar";

type SubMenuItem = {
  title: string;
  url: string;
}

type MenuItem = {
  title: string;
  url?: string;
  subItems?: boolean;
  items?: SubMenuItem[];
}

//Menu items with dropdown support
const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    title: "Resident",
    url: "/resident-records",
  },
  {
    title: "Administration",
    url: "/administrative",
  },
  {
    title: "Blotter",
    url: "/blotter-record",
  },
  {
    title: "Disaster Risk Reduction",
    subItems: true,
    url: "/",
    items: [
      { title: "Resident Report", url: "/drr-resident-report" },
      { title: "Acknowledgement Report", url: "/drr-acknowledgement-report" },
      { title: "Monthly Report", url: "/drr-monthly-report" },
      { title: "Staff", url: "/drr-staff" }
    ]
  },
  {
    title: "Announcement",
    url: "/announcement",
  },
];

interface MenuItemProps {
  item: MenuItem;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (item.subItems && item.items) {
    return (
      <SidebarMenuItem>
        <div 
          className="w-full cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 rounded-md text-[#2D4A72] hover:bg-[#1273B2]/10 hover:text-[#1273B8]">
            <span>{item.title}</span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </div>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {item.items.map((subItem) => (
              <SidebarMenuButton 
                key={subItem.title} 
                asChild
                className="w-full"
              >
                <a 
                  href={subItem.url}
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                  
                >
                  <span>{subItem.title}</span>
                </a>
              </SidebarMenuButton>
            ))}
          </div>
        )}
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <a 
          href={item.url}
          className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-md"
        >
          <span>{item.title}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function AppSidebar() {
  return (
    <Sidebar className="border-none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className='w-full h-14'></div>
            <SidebarMenu>
              {items.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;