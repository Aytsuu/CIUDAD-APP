"use client";

import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import CardLayout from "@/components/ui/card/card-layout";
import { ClipboardList } from "lucide-react";

export default function DoctorReports() {
  const allReports = [
    {
      title: "Consulted Patients Monthly Summary Report",
      description:
        "Monthly report of Barangay Health Workers activities and achievements",
      link: "/reports/monthly-consulted-summaries",
    },
    {
      title: "Family Planning Monthly Report",
      description:
        "Monthly report of family planning service provision and statistics",
      link: "/familyplanning/report",
    },
  
  ];

  return (
    <MainLayoutComponent
      title="Healthcare Reports"
      description="Manage and view healthcare reports for various services"
    >
      <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
        {allReports.map((report, index) => (
          <CardLayout
            key={index}
            contentClassName="flex flex-col flex-grow p-5"
            title={
              <span className="text-lg font-medium text-gray-800">
                {report.title}
              </span>
            }
            description={<p className="text-gray-600 mb-4">{report.description}</p>}
            content={
              <div className="mt-auto">
                <a href={report.link}>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                    <ClipboardList className="w-4 h-4 inline-block mr-2" />
                    View Report
                  </button>
                </a>
              </div>
            }
          />
        ))}
      </div>
    </MainLayoutComponent>
  );
}