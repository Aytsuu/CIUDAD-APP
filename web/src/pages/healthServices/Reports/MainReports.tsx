"use client";

import { Button } from "@/components/ui/button/button";
import CardLayout from "@/components/ui/card/card-layout";
import {
  Activity,
  ClipboardList,
  Package,
  Syringe,
  Eye,
} from "lucide-react";
import { Link } from "react-router";
import { FAuseMonthCount } from "./firstaid-report/queries/fetchQueries";
import { VacuseMonthCount } from "./vaccination-report/queries/fetchQueries";
import { MeduseMonthCount } from "./medicine-report/queries/fetchQueries";

export default function HealthcareReports() {

  const { data: monthCountData, isLoading: isMonthCountLoading } =
  FAuseMonthCount();
  const { data: vacMonthCountData, isLoading: isVacMonthCountLoading } =
    VacuseMonthCount();
  const { data: medMonthCountData, isLoading: isMedMonthCountLoading } =
    MeduseMonthCount();



  const FAmonthCount = monthCountData?.current_month?.total_records;
  const FAlastMonthCount = monthCountData?.last_month?.total_records;
  const VacmonthCount = vacMonthCountData?.current_month?.total_records;
  const VaclastMonthCount = vacMonthCountData?.last_month?.total_records;
  const MedmonthCount = medMonthCountData?.current_month?.total_records;
  const MedlastMonthCount = medMonthCountData?.last_month?.total_records;

  
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Monthly First Aid Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            View all Health Services reports and records for the month
          </p>
        </div>
      </div>
      <hr className="border-gray-300 mb-4" />

      <div className="w-full px-4 py-6 sm:px-6 md:px-8 bg-background">
        {/* Report Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* BHW Report Card */}
          <CardLayout
            cardClassName="flex flex-col h-full border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
            contentClassName="flex flex-col flex-grow p-5"
            title={
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <span className="text-lg font-medium text-gray-800">
                    BHW Report
                  </span>
                </div>
              </div>
            }
            description="Monthly report of Barangay Health Workers activities and achievements"
            content={
              <>
                <div className="space-y-3 flex-grow">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">Current Month:</span>
                      <span className="font-medium">56 records</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Last Month</span>
                      <span className="font-medium text-red-500">
                        20 records
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Report
                  </Button>
                </div>
              </>
            }
          />

          {/* Medicine Utilization Report Card */}
          <CardLayout
            cardClassName="flex flex-col h-full border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
            contentClassName="flex flex-col flex-grow p-5"
            title={
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <span className="text-lg font-medium text-gray-800">
                    Medicine Utilization
                  </span>
                </div>
              </div>
            }
            description="Monthly medicine consumption and inventory tracking
"
            content={
              <>
                <div className="space-y-3 flex-grow">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">Current Month:</span>
                      <span className="font-medium">{MedmonthCount || "0"} records</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Last Month</span>
                      <span className="font-medium text-red-500">
                        {MedlastMonthCount || "0"} records
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Link to="/monthly-medicine-records">
                    <Button size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                  </Link>
                </div>
              </>
            }
          />

          {/* First Aid Report Card */}
          <CardLayout
            cardClassName="flex flex-col h-full border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
            contentClassName="flex flex-col flex-grow p-5"
            title={
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <span className="text-lg font-medium text-gray-800">
                    First Aid Report
                  </span>
                </div>
              </div>
            }
            description="Monthly report of first aid incidents and responses"
            content={
              <>
                <div className="space-y-3 flex-grow">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">Current Month:</span>
                      <span className="font-medium">{FAmonthCount || "0"} records</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Last Month</span>
                      <span className="font-medium text-red-500">
                        {FAlastMonthCount || "0"} records
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Link to="/monthly-firstaid-records">
                    <Button size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                  </Link>
                </div>
              </>
            }
          />

          {/* Vaccination Report Card */}
          <CardLayout
            cardClassName="flex flex-col h-full border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
            contentClassName="flex flex-col flex-grow p-5"
            title={
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                  <Syringe className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <span className="text-lg font-medium text-i-800">
                    Vaccination Report
                  </span>
                </div>
              </div>
            }
            description="Monthly report of first aid incidents and responses"
            content={
              <>
                <div className="space-y-3 flex-grow">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">Current Month:</span>
                      <span className="font-medium">{VacmonthCount || "0"} records</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Last Month</span>
                      <span className="font-medium text-red-500">
                        {VaclastMonthCount || "0"} records
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Link to="/monthly-vaccine-records">
                    <Button size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                  </Link>
                </div>
              </>
            }
          />

          {/* Vaccination Report Card */}
          <CardLayout
            cardClassName="flex flex-col h-full border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
            contentClassName="flex flex-col flex-grow p-5"
            title={
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                  <Syringe className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <span className="text-lg font-medium text-i-800">
                    EPI Inventory Report
                  </span>
                </div>
              </div>
            }
            description="Monthly report of first aid incidents and responses"
            content={
              <>
                <div className="space-y-3 flex-grow">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">Current Month:</span>
                      <span className="font-medium">56 records</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Last Month</span>
                      <span className="font-medium text-red-500">
                        20 records
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Link to="/monthly-firstaid-records">
                    <Button size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                  </Link>
                </div>
              </>
            }
          />
        </div>
      </div>
    </>
  );
}
