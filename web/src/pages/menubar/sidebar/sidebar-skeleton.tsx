import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./sidebar";

export default function SidebarSkeleton() {
  // Calculate how many items can fit on screen
  const calculateItemCount = () => {
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const headerHeight = 60; // Header area
    const itemHeight = 44; // py-2.5 with h-7 content
    const bottomPadding = 32; // Bottom fade effect
    const availableHeight = windowHeight - headerHeight - bottomPadding;
    const itemCount = Math.floor(availableHeight / itemHeight);
    return Math.max(6, Math.min(itemCount, 20)); // Min 6, max 20 items
  };

  const [itemCount, setItemCount] = React.useState(calculateItemCount);

  React.useEffect(() => {
    const handleResize = () => {
      setItemCount(calculateItemCount());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Generate dynamic menu structure based on item count
  const generateMenuStructure = (count: number) => {
    const widths = ["w-20", "w-16", "w-28", "w-24", "w-32", "w-36", "w-40", "w-44", "w-52", "w-12"];
    const types = ["main", "nested", "sub"];
    
    return Array.from({ length: count }, (_, idx) => ({
      type: types[idx % 3],
      width: widths[idx % widths.length],
      hasChildren: (idx % 4 === 0 && idx > 0), 
      indent: (idx > 0 && (idx - 1) % 4 === 0) 
    }));
  };

  const menuStructure = generateMenuStructure(itemCount);

  return (
    <Sidebar className="bg-white h-screen overflow-hidden">
      <SidebarContent className="h-full flex flex-col">
        <SidebarGroup className="flex-1 flex flex-col">
          <SidebarGroupContent className="flex-1 flex flex-col">
            {/* Header area skeleton */}
            <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="h-5 w-24 bg-gradient-to-r from-gray-200 via-gray-250 to-gray-200 rounded animate-pulse" />
            </div>

            {/* Menu items skeleton - scrollable area */}
            <div className="flex-1 overflow-hidden">
              <SidebarMenu className="space-y-0 h-full">
                {menuStructure.map((item, idx) => (
                  <SidebarMenuItem key={idx}>
                    <SidebarMenuButton
                      className={`w-full flex items-center justify-between rounded-none px-4 py-2.5 hover:bg-gray-50 transition-all duration-200 ${
                        item.indent ? 'pl-8' : 'pl-4'
                      }`}
                      disabled
                    >
                      <div className="flex items-center w-full">
                        {/* Main content skeleton */}
                        <div
                          className={`h-7 ${item.width} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse`}
                          style={{
                            animationDelay: `${idx * 80}ms`,
                            animationDuration: '2s'
                          }}
                        />
                      </div>
                      
                      {/* Arrow skeleton for items with children */}
                      {item.hasChildren && (
                        <div
                          className="w-3 h-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded-sm animate-pulse ml-2"
                          style={{
                            animationDelay: `${(idx * 80) + 400}ms`,
                            animationDuration: '2s'
                          }}
                        />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>

            {/* Bottom fade effect */}
            <div className="h-8 bg-gradient-to-t from-white via-gray-50 to-transparent flex-shrink-0" />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}