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
  ArrowRight,
} from "lucide-react";
import { FaBandAid } from "react-icons/fa";
import { Link } from "react-router";
import { FAuseMonthCount } from "./firstaid-report/queries/fetchQueries";
import { VacuseMonthCount } from "./vaccination-report/queries/fetchQueries";
import { MeduseMonthCount } from "./medicine-report/queries/fetchQueries";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";

export default function HealthcareReports() {
  const { data: monthCountData } = FAuseMonthCount();
  const { data: vacMonthCountData } = VacuseMonthCount();
  const { data: medMonthCountData } = MeduseMonthCount();

  const bhwReport = [
    {
      title: "BHW Report",
      icon: <Activity className="w-6 h-6 text-green-600" />,
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      description: "Monthly report of Barangay Health Workers activities and achievements",
      link: "#",
    },
  ];

  const recipientLists = [
    {
      title: "Vaccination Recipient List",
      icon: <Syringe className="w-6 h-6 text-violet-600" />,
      bgColor: "bg-gradient-to-br from-violet-50 to-purple-50",
      description: "Monthly report of vaccination recipients",
      link: "/monthly-vaccine-records",
    },
    {
      title: "Medicine Recipient List",
      icon: <Pill className="w-6 h-6 text-sky-600" />,
      bgColor: "bg-gradient-to-br from-sky-50 to-blue-50",
      description: "Monthly report of medicine recipients",
      link: "/monthly-medicine-records",
    },
    {
      title: "First Aid Recipient List",
      icon: <FaBandAid className="w-6 h-6 text-red-600" />,
      bgColor: "bg-gradient-to-br from-red-50 to-rose-50",
      description: "Monthly report of first aid recipients",
      link: "/monthly-firstaid-records",
    },
  ];

  const inventoryReports = [
    {
      title: "Medicine Inventory Report",
      icon: <Box className="w-6 h-6 text-amber-600" />,
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      description: "Monthly report of medicine inventory status",
      link: "/inventory-monthly-medicine-records",
    },
    {
      title: "First Aid Inventory Report",
      icon: <FaBandAid className="w-6 h-6 text-blue-600" />,
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      description: "Monthly report of first aid inventory status",
      link: "/inventory-monthly-firstaid-records",
    },
    {
      title: "Commodity Inventory Report",
      icon: <Box className="w-6 h-6 text-indigo-600" />,
      bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50",
      description: "Monthly report of commodity inventory status",
      link: "/inventory-monthly-commodity-records",
    },
    {
      title: "EPI Inventory and Utilization Report",
      icon: <Box className="w-6 h-6 text-teal-600" />,
      bgColor: "bg-gradient-to-br from-teal-50 to-cyan-50",
      description: "Monthly report of antigen inventory status",
      link: "/inventory-monthly-antigen-records",
    },
  ];

  const optReports = [
    {
      title: "OPT PLUS FORM",
      icon: <Activity className="w-6 h-6 text-green-600" />,
      bgColor: "bg-gradient-to-br from-green-50 to-lime-50",
      description: "List of Preschoolers with weight and height measurements and identified status",
      link: "/monthly-opt-records",
    },
    {
      title: "OPT PLUS SUMMARY REPORT",
      icon: <Activity className="w-6 h-6 text-emerald-600" />,
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      description: "Total no. of Preschoolers base on WFA, HFA, LFA",
      link: "/opt-summaries-all-months",
    },
  ];

  const renderCard = (card:any, index:any) => (
    <CardLayout
      key={index}
      // cardClassName={`${card.bgColor}  rounded-2xl  hover:scale-[1.02] transition-all duration-300 overflow-hidden group cursor-pointer`}
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
      description={<p className="text-gray-600 mb-4">{card.description}</p>}
      content={
        <div className="mt-auto">
          <Link to={card.link}>
            <Button size="sm" className="w-full "  >
              <Eye className="w-4 h-4 mr-2" />
              View Report
            </Button>
          </Link>
        </div>
      }
    />
  );

  return (
    <MainLayoutComponent
      title="Healthcare Reports"
      description="Manage and view healthcare reports for various services"
    >
      <div className="space-y-10 bg-white p-8 rounded-md shadow-sm border border-gray-100">
        {/* BHW Report Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">BHW Reports</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bhwReport.map(renderCard)}
          </div>
        </section>

        {/* Recipient Lists Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Recipient Lists</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipientLists.map(renderCard)}
          </div>
        </section>

        {/* Inventory Reports Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
              <Box className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Inventory Reports</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inventoryReports.map(renderCard)}
          </div>
        </section>

        {/* OPT Reports Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">OPT Reports</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {optReports.map(renderCard)}
          </div>
        </section>
      </div>
    </MainLayoutComponent>
  );
}