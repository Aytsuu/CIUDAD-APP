"use client";

import { Button } from "@/components/ui/button/button";
import CardLayout from "@/components/ui/card/card-layout";
import {
  Activity,
  Syringe,
  Eye,
  Pill,
  Box,
  Users,
  ClipboardList,
  Package,
} from "lucide-react";
import { FaBandAid } from "react-icons/fa";
import { Link } from "react-router";
import { FAuseMonthCount } from "./firstaid-report/queries/fetchQueries";
import { VacuseMonthCount } from "./vaccination-report/queries/fetchQueries";
import { MeduseMonthCount } from "./medicine-report/queries/fetchQueries";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";

export default function HealthcareReports() {
  const { data: monthCountData, isLoading: isMonthCountLoading } =
    FAuseMonthCount();
  const { data: vacMonthCountData, isLoading: isVacMonthCountLoading } =
    VacuseMonthCount();
  const { data: medMonthCountData, isLoading: isMedMonthCountLoading } =
    MeduseMonthCount();

  const isLoading =
    isMonthCountLoading || isVacMonthCountLoading || isMedMonthCountLoading;

  const FAmonthCount = monthCountData?.current_month?.total_records || "0";
  const FAlastMonthCount = monthCountData?.last_month?.total_records || "0";
  const VacmonthCount = vacMonthCountData?.current_month?.total_records || "0";
  const VaclastMonthCount = vacMonthCountData?.last_month?.total_records || "0";
  const MedmonthCount = medMonthCountData?.current_month?.total_records || "0";
  const MedlastMonthCount = medMonthCountData?.last_month?.total_records || "0";

  const bhwReport = [
    {
      title: "BHW Report",
      icon: <Activity className="w-5 h-5 text-green-600" />,
      bgColor: "bg-green-50",
      description:
        "Monthly report of Barangay Health Workers activities and achievements",
      currentCount: "56",
      lastCount: "20",
      link: "#",
      isStatic: true,
    },
  ];

  const recipientLists = [
    {
      title: "Vaccination Recipient List",
      icon: <Syringe className="w-5 h-5 text-violet-600" />,
      bgColor: "bg-violet-50",
      description: "Monthly report of vaccination recipients",
      currentCount: VacmonthCount,
      lastCount: VaclastMonthCount,
      link: "/monthly-vaccine-records",

    },
    {
      title: "Medicine Recipient List",
      icon: <Pill className="w-5 h-5 text-sky-600" />,
      bgColor: "bg-sky-50",
      description: "Monthly report of medicine recipients",
      currentCount: MedmonthCount,
      lastCount: MedlastMonthCount,
      link: "/monthly-medicine-records",

    },
    {
      title: "First Aid Recipient List",
      icon: <FaBandAid className="w-5 h-5 text-red-600" />,
      bgColor: "bg-red-50",
      description: "Monthly report of first aid recipients",
      currentCount: FAmonthCount,
      lastCount: FAlastMonthCount,
      link: "/monthly-firstaid-records",

    },
  ];

  const inventoryReports = [
    {
      title: "Medicine Inventory Report",
      icon: <Package className="w-5 h-5 text-amber-600" />,
      bgColor: "bg-amber-50",
      description: "Monthly report of medicine inventory status",
      currentCount: "56",
      lastCount: "20",
      link: "/inventory-monthly-medicine-records",
    },
    {
      title: "First Aid Inventory Report",
      icon: <FaBandAid className="w-5 h-5 text-blue-600" />,
      bgColor: "bg-blue-50",
      description: "Monthly report of first aid inventory status",
      currentCount: "56",
      lastCount: "20",
      link: "/inventory-monthly-firstaid-records",
    },
    {
      title: "Commodity Inventory Report",
      icon: <Box className="w-5 h-5 text-indigo-600" />,
      bgColor: "bg-indigo-50",
      description: "Monthly report of commodity inventory status",
      currentCount: "56",
      lastCount: "20",
      link: "/inventory-monthly-commodity-records",
      
    },
  ];

  const renderCard = (card: any, index: any) => (
    <CardLayout
      key={index}
      cardClassName="flex flex-col h-full border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
      contentClassName="flex flex-col flex-grow p-5"
      title={
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}
          >
            {card.icon}
          </div>
          <div>
            <span className="text-lg font-medium text-gray-800">
              {card.title}
            </span>
          </div>
        </div>
      }
      description={card.description}
      content={
        <>
          <div className="space-y-3 flex-grow">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Current Month:</span>
                <span className="font-medium">{card.currentCount} records</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Last Month</span>
                <span
                  className="text-red-500"
                >
                  {card.lastCount} records
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link to={card.link}>
              <Button size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Report
              </Button>
            </Link>
          </div>
        </>
      }
    />
  );

  return (
    <MainLayoutComponent
      title="Healthcare Reports"
      description="Manage and view healthcare reports for various services"
    >
      <CardLayout
        content={
          <>
            {/* BHW Report Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                BHW Reports
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bhwReport.map(renderCard)}
              </div>
            </div>

            {/* Recipient Lists Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                Recipient Lists
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recipientLists.map(renderCard)}
              </div>
            </div>

            {/* Inventory Reports Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                Inventory Reports
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {inventoryReports.map(renderCard)}
              </div>
            </div>
          </>
        }
      />
    </MainLayoutComponent>
  );
}
