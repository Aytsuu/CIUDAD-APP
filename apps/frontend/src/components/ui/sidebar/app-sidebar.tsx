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
import { Link } from 'react-router';

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

// Menu items with dropdown support
const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    title: "Calendar",
    url: "/waste-calendar-scheduling",
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
    title: "Donation",
    url: "/donation",
  },
  {
    title: "Illegal Dumping Reports",
    url: "/waste-illegaldumping-report",
  },
  {
    title: "Announcement",
    url: "/announcement",
  },
];

interface MenuItemProps {
  item: MenuItem;
  activeItem: string;
  setActiveItem: (title: string) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, activeItem, setActiveItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = activeItem === item.title; // Check if this item is active

  if (item.subItems && item.items) {
    return (
      <SidebarMenuItem>
        <div 
          className={`w-full cursor-pointer rounded-md ${isActive ? "bg-[#1273B2]/10 text-[#1273B8]" : "text-[#2D4A72] hover:bg-[#1273B2]/10 hover:text-[#1273B8]"}`}
          onClick={() => {
            setIsOpen(!isOpen);
            setActiveItem(item.title);
          }}
        >
          <div className="flex items-center justify-between px-4 py-2 rounded-md">
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
                <Link 
                  to={subItem.url}
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    activeItem === subItem.title ? "bg-[#1273B2]/10 text-[#1273B8]" : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
                  }`}
                  onClick={() => setActiveItem(subItem.title)}
                >
                  <span>{subItem.title}</span>
                </Link>
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
        {item.url && (
          <Link
            to={item.url}
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive ? "bg-[#1273B2]/10 text-[#1273B8]" : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
            }`}
            onClick={() => setActiveItem(item.title)}
          >
            <span>{item.title}</span>
          </Link>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function AppSidebar() {
  const [activeItem, setActiveItem] = useState<string>("");

  return (
    <Sidebar className="border-none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className='w-full h-14'></div>
            <SidebarMenu>
              {items.map((item) => (
                <MenuItem key={item.title} item={item} activeItem={activeItem} setActiveItem={setActiveItem} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
