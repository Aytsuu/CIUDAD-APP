import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card/card";
import { Link, Outlet, useLocation } from "react-router-dom"; // Fixed import (react-router -> react-router-dom)

const NavItemList = [
  { path: 'incident', title: 'Incident' },
  { path: 'activity', title: 'Activity' },
  { path: 'acknowledgement', title: 'Acknowledgement' },
  { path: 'weekly', title: 'Weekly AR' },
  { path: 'securado', title: 'Securado' },
];

export default function ReportLayout() {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || '';

  return (
    <div className="border-none">
      <div className="p-0 bg-transparent">
        <div className="pt-4">
          <div className="flex flex-wrap h-auto">
            {NavItemList.map(({path, title}) => {
              // Determine if the current tab is active
              const isActive = path === currentPath
              
              return (
                <Link 
                  key={path} 
                  to={path}
                  className={`flex items-center gap-2 py-3 px-5 rounded-t-md transition-colors
                    ${isActive 
                      ? 'bg-white text-primary font-medium' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                >
                  <span className="text-[15px]">{title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <Card className="p-4 pt-6 border-none rounded-tl-none">
          <Outlet />
        </Card>
      </div>
    </div>
  );
}