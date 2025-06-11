import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card/card";
import { Link, Outlet } from "react-router";

const NavItemList = [
  { path: 'incident', title: 'Incident' },
  { path: 'activity', title: 'Activity' },
  { path: 'acknowledgement', title: 'Acknowledgement' },
  { path: 'weekly/acknowledgement', title: 'Weekly AR' },
];

export default function ReportLayout() {
  return (
    <div className="w-full px-3 py-4 sm:px-6 md:px-8 bg-background">
      {/* Tabs Navigation */}
      <Card className="border-none">
        <CardHeader className="p-0">
          <div className="px-4 pt-4">
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-1">
              {NavItemList.map(({path, title}) => (
                <Link key={path} to={`${path}`}
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <span>{title}</span>
                </Link>
              ))}
            </div>
          </div>

          <CardContent className="p-4 pt-6">
            <Outlet />
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}