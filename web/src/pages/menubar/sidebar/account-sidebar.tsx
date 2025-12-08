import React, { useState } from "react";
import { Link } from "react-router";
import { BsChevronLeft } from "react-icons/bs";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "./sidebar";
import type { MenuItem, MenuItemProps } from "./sidebarTypes";
import ciudadLogo from "@/assets/images/ciudad_logo.svg";

// Menu items
const items: MenuItem[] = [
  { title: "My Profile", url: "manage/profile" },
  { title: "Security & Privacy", url: "manage/security" },
  { title: "Preferences", url: "manage/preferences" },
  { title: "Activity", url: "manage/youractivity" },
  { title: "About", url: "manage/about" },
];

// -----------------------
// MenuItem Component
// -----------------------
const MenuItem: React.FC<MenuItemProps> = ({
  item,
  activeItem,
  setActiveItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = activeItem === item.title;

  if (item.subItems && item.items) {
    return (
      <SidebarMenuItem className="text-white">
        <div
          className={`w-full cursor-pointer rounded-md ${
            isActive
              ? "bg-white/20 text-[#1273B8]"
              : "text-white hover:bg-white/50 hover:text-white"
          }`}
          onClick={() => {
            setIsOpen(!isOpen);
            setActiveItem(item.title);
          }}
        >
          <div className="flex items-center justify-between px-4 py-2 rounded-md">
            {item.title === "About" && (
            <img 
              src={ciudadLogo} 
              alt="Ciudad Logo" 
              className="h-5 w-5 object-contain"
            />
          )}
            <span>{item.title}</span>

            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </div>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
        {item.url && (
          <Link
            to={item.url}
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive
                ? "bg-white/10 text-white"
                : "text-white hover:bg-white/30 hover:text-white"
            }`}
            onClick={() => setActiveItem(item.title)}
          >
            <span>{item.title}</span>
          </Link>
        )}
    </SidebarMenuItem>
  );
};

// -----------------------
// AccountSidebar Component
// -----------------------
export default function AccountSidebar() {
  const [activeItem, setActiveItem] = useState<string>("My Profile");

  return (
    <Sidebar className="border-none bg-darkBlue1 text-white">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="mt-12 flex items-center gap-3 px-2 py-3 border-b border-gray-200/40">
              <Link to="/dashboard">
                <Button
                  className="text-black h-8 w-8 border-white"
                  variant="outline"
                  size="icon"
                >
                  <BsChevronLeft size={14} />
                </Button>
              </Link>
              <h1 className="text-lg text-white font-bold">
                Back to Dashboard
              </h1>
            </div>

            {/* Menu Items */}
            <SidebarMenu className="mt-4">
              {items.map((item) => (
                <MenuItem
                  key={item.title}
                  item={item}
                  activeItem={activeItem}
                  setActiveItem={setActiveItem}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
