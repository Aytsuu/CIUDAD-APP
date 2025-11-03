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
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar";
import type { MenuItem, SubMenuItemProps, MenuItemProps } from "./sidebarTypes";

// Existing menu items
const items: MenuItem[] = [
  { title: "My Profile", url: "manage/profile" },
  { title: "Security & Privacy", url: "manage/security" },
  { title: "Preferences", url: "manage/preferences" },
  { title: "Activity", url: "manage/youractivity" },
  { title: "About", url: "account/about" },
];

// ---------------------
// SubMenuItemComponent
// ---------------------
const SubMenuItemComponent: React.FC<SubMenuItemProps> = ({
  item,
  activeItem,
  setActiveItem,
}) => {
  const [isThirdLevelOpen, setIsThirdLevelOpen] = useState(false);
  const hasThirdLevel = item.anotherItems && item.anotherItems.length > 0;
  const isActive = activeItem === item.title;

  if (hasThirdLevel) {
    return (
      <div className="w-full">
        <div
          className={`flex items-center justify-between px-4 py-2 text-sm rounded-md cursor-pointer ${
            isActive
              ? "bg-[#1273B2]/10 text-[#1273B8]"
              : "text-[#2D4A72] hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
          }`}
          onClick={() => {
            setIsThirdLevelOpen(!isThirdLevelOpen);
            setActiveItem(item.title);
          }}
        >
          <span>{item.title}</span>
          {isThirdLevelOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
        {isThirdLevelOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {item.anotherItems?.map((thirdItem) => (
              <SidebarMenuButton
                key={thirdItem.title}
                asChild
                className="w-full"
              >
                <Link
                  to={thirdItem.url}
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    activeItem === thirdItem.title
                      ? "bg-[#1273B2]/10 text-[#1273B8]"
                      : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
                  }`}
                  onClick={() => setActiveItem(thirdItem.title)}
                >
                  <span>{thirdItem.title}</span>
                </Link>
              </SidebarMenuButton>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <SidebarMenuButton asChild className="w-full">
      <Link
        to={item.url}
        className={`flex items-center px-4 py-2 text-sm rounded-md ${
          isActive
            ? "bg-[#1273B2]/10 text-[#1273B8]"
            : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
        }`}
        onClick={() => setActiveItem(item.title)}
      >
        <span>{item.title}</span>
      </Link>
    </SidebarMenuButton>
  );
};

// ---------------------
// MenuItem Component
// ---------------------
const MenuItem: React.FC<MenuItemProps> = ({
  item,
  activeItem,
  setActiveItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = activeItem === item.title;

  if (item.subItems && item.items) {
    return (
      <SidebarMenuItem>
        <div
          className={`w-full cursor-pointer rounded-md ${
            isActive
              ? "bg-[#1273B2]/10 text-[#1273B8]"
              : "text-[#2D4A72] hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
          }`}
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
              <SubMenuItemComponent
                key={subItem.title}
                item={subItem}
                activeItem={activeItem}
                setActiveItem={setActiveItem}
              />
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
              isActive
                ? "bg-[#1273B2]/10 text-[#1273B8]"
                : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
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

// ---------------------
// AccountSidebar Component
// ---------------------
export default function AccountSidebar() {
  const [activeItem, setActiveItem] = useState<string>("");

  return (
    <Sidebar className="border-none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="mt-12 flex items-center gap-3 px-2 py-3 border-b border-gray-200">
              <Link to="/dashboard">
                <Button className="text-black h-8 w-8" variant="outline" size="icon">
                  <BsChevronLeft size={14} /> 
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-darkBlue2">
                Settings & Privacy
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
