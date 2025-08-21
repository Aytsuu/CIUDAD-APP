import React, { useState } from "react";
import { Link } from "react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar";

interface Feature {
  feat_name: string;
  feat_url: string;
  feat_category: string;
}

interface GroupedFeatures {
  [category: string]: Feature[];
}

export function AppSidebar() {
  const [activeItem, setActiveItem] = useState<string>("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const { user } = useAuth();

  // Static items shown to everyone
  const staticItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Announcement", path: "/announcement" },
  ];

  // Features come directly from backend now
  const features: Feature[] = user?.staff?.features || [];

  // Group features by category
  const groupedFeatures: GroupedFeatures = features.reduce((acc, feat) => {
    if (!feat) return acc;
    const { feat_category } = feat;
    if (!acc[feat_category]) {
      acc[feat_category] = [];
    }
    acc[feat_category].push(feat);
    return acc;
  }, {} as GroupedFeatures);

  return (
    <Sidebar className="border-none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="w-full h-14" />
            <SidebarMenu>
              {/* Static Menu */}
              {staticItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild className="w-full">
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2 text-sm rounded-md ${
                        activeItem === item.label
                          ? "bg-[#1273B2]/10 text-[#1273B8]"
                          : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
                      }`}
                      onClick={() => setActiveItem(item.label)}
                    >
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Dynamic Feature Groups */}
              {Object.entries(groupedFeatures).map(([category, feats]) => (
                <SidebarMenuItem key={category}>
                  {/* Category Toggle */}
                  <div
                    className={`w-full cursor-pointer rounded-md ${
                      openCategory === category
                        ? "bg-[#1273B2]/10 text-[#1273B8]"
                        : "text-[#2D4A72] hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
                    }`}
                    onClick={() =>
                      setOpenCategory(openCategory === category ? null : category)
                    }
                  >
                    <div className="flex items-center justify-between px-4 py-2 rounded-md">
                      <span>{category}</span>
                      {openCategory === category ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Features inside category */}
                  {openCategory === category && (
                    <div className="ml-4 mt-1 space-y-1">
                      {feats.map((feat) => (
                        <SidebarMenuButton key={feat.feat_name} asChild className="w-full">
                          <Link
                            to={feat.feat_url}
                            className={`flex items-center px-4 py-2 text-sm rounded-md ${
                              activeItem === feat.feat_name
                                ? "bg-[#1273B2]/10 text-[#1273B8]"
                                : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
                            }`}
                            onClick={() => setActiveItem(feat.feat_name)}
                          >
                            <span>{feat.feat_name}</span>
                          </Link>
                        </SidebarMenuButton>
                      ))}
                    </div>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
