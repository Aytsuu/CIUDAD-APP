"use client";

import { Button } from "@/components/ui/button/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Activity, Syringe, Eye, Pill, Box, Users, ClipboardList, Search, Heart } from "lucide-react";
import { FaBandAid } from "react-icons/fa";
import { Link } from "react-router";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import CardLayout from "@/components/ui/card/card-layout";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function HealthcareReports() {
  const [activeTab, setActiveTab] = useState<"all" | "bhw" | "recipients" | "inventory" | "opt" | "masterlist" | "fhis" | "profiling">("all");
  const [searchTerm, setSearchTerm] = useState("");


  const profilingReports = [
    {
      title: "Health Profiling",
      icon: <Users className="w-6 h-6 text-violet-600" />,
      bgColor: "bg-gradient-to-br from-violet-50 to-purple-50",
      description: "Profiling Population Structure Report and Records",
      link: "/health-family-profiling"
    }
  ];
  const bhwReport = [
    {
      title: "BHW Report",
      icon: <Activity className="w-6 h-6 text-green-600" />,
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50", 
      description:
        "Monthly accomplishment report of Barangay Health Workers",
      link: "/reports/bhw-accomplishment-reports/monthly",
    },
    {
      title: "Family Planning Monthly Report",
      icon: <ClipboardList className="w-6 h-6 text-purple-600" />,
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      description: "Monthly report of family planning service provision and statistics",
      link: "/familyplanning/monthly-records"
    },
  ];

  const recipientLists = [
    {
      title: "Vaccination Recipient List",
      icon: <Syringe className="w-6 h-6 text-red-600" />,
      bgColor: "bg-gradient-to-br from-red-50 to-purple-50",
      description: "Monthly report of vaccination recipients",
      link: "/reports/monthly-vaccination"
    },
    {
      title: "Medicine Recipient List",
      icon: <Pill className="w-6 h-6 text-sky-600" />,
      bgColor: "bg-gradient-to-br from-sky-50 to-blue-50",
      description: "Monthly report of medicine recipients",
      link: "/reports/monthly-medicine"
    },
    {
      title: "First Aid Recipient List",
      icon: <FaBandAid className="w-6 h-6 text-red-600" />,
      bgColor: "bg-gradient-to-br from-red-50 to-rose-50",
      description: "Monthly report of first aid recipients",
      link: "/reports/monthly-firstaid"
    },
    {
      title: "New Children 0-5 Years Old List",
      icon: <Users className="w-6 h-6 text-yellow-600" />,
      bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
      description: "Monthly report of newly registered children aged 0-5 years old",
      link: "/monthly-new-children-records"
    }
  ];

  const inventoryReports = [
    {
      title: "Medicine Inventory",
      icon: <Box className="w-6 h-6 text-amber-600" />,
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      description: "Monthly report of medicine inventory status",
      link: "/medicine-inventory-reports"
    },
    {
      title: "First Aid Inventory",
      icon: <FaBandAid className="w-6 h-6 text-blue-600" />,
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      description: "Monthly report of first aid inventory status",
      link: "/firstaid-inventory-reports"
    },
    {
      title: "Commodity Inventory",
      icon: <Box className="w-6 h-6 text-indigo-600" />,
      bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50",
      description: "Monthly report of commodity inventory status",
      link: "/reports/inventory/monthly-commodity"
    },
    {
      title: "EPI Inventory and Utilization",
      icon: <Box className="w-6 h-6 text-teal-600" />,
      bgColor: "bg-gradient-to-br from-teal-50 to-cyan-50",
      description: "Monthly report of antigen inventory status",
      link: "/antigen-inventory-reports"
    }
  ];

  const optReports = [
    {
      title: "Opt Plus Form",
      icon: <Activity className="w-6 h-6 text-green-600" />,
      bgColor: "bg-gradient-to-br from-green-50 to-lime-50",
      description: "List of Preschoolers with weight and height measurements and identified status",
      link: "/monthly-opt-records"
    },
    {
      title: "Opt Plus Summary",
      icon: <Activity className="w-6 h-6 text-emerald-600" />,
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      description: "Total no. of Preschoolers base on WFA, HFA, LFA",
      link: "/opt-summaries-all-months"
    },
    {
      title: "Semi Annual OPT Summary",
      icon: <Activity className="w-6 h-6 text-emerald-600" />,
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      description: "Total no. of Preschoolers base on WFA, HFA, LFA",
      link: "/semiannual-opt-yearly"
    },
    {
      title: "0-23 mos Monthly Monitoring",
      icon: <Activity className="w-6 h-6 text-emerald-600" />,
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      description: "Total no. of Preschoolers base on WFA, HFA, LFA",
      link: "/yearly-opt-records-jantodec"
    }
  ];

  const masterlistReports = [
    {
      title: "Children 6-59 Supplements Masterlist",
      icon: <ClipboardList className="w-6 h-6 text-indigo-600" />,
      bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
      description: "Comprehensive masterlist of all healthcare records",
      link: "/child-supplements-masterlist"
    }
  ];

  const fhisReports = [
    {
      title: "FHIS Monthly Report",
      icon: <Heart className="w-6 h-6 text-pink-600" />,
      bgColor: "bg-gradient-to-br from-pink-50 to-rose-50",
      description: "Monthly Field Health Services Information System report",
      link: "/reports/fhis-monthly-records"
    },

  ];



  const allReports = [...profilingReports, ...bhwReport, ...recipientLists, ...inventoryReports, ...optReports, ...masterlistReports, ...fhisReports];

  const filterReports = (reports: any[]) => {
    if (!searchTerm) return reports;
    return reports.filter((report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderCard = (card: any, index: any) => (
    <CardLayout
      key={index}
      contentClassName="flex flex-col flex-grow p-5"
      title={
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
            {card.icon}
          </div>
          <div>
            <span className="text-lg font-medium text-gray-800">{card.title}</span>
          </div>
        </div>
      }
      description={<p className="text-gray-600 mb-4">{card.description}</p>}
      content={
        <div className="mt-auto">
          <Link to={card.link}>
            <Button size="sm" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Report
            </Button>
          </Link>
        </div>
      }
    />
  );

  const TabButton = ({
    active,
    type,
    icon: Icon,
    count,
    onClick
  }: {
    active: boolean;
    type: "all" | "bhw" | "recipients" | "inventory" | "opt" | "masterlist" | "fhis" | "profiling";
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    onClick: () => void;
  }) => {
    const config = {
      all: {
        color: "blue",
        borderColor: "border-blue-600",
        textColor: "text-blue-700",
        bgColor: "bg-blue-100",
        textColorDark: "text-blue-800",
        iconColor: "text-blue-600"
      },
      bhw: {
        color: "green",
        borderColor: "border-green-600",
        textColor: "text-green-700",
        bgColor: "bg-green-100",
        textColorDark: "text-green-800",
        iconColor: "text-green-600"
      },
      recipients: {
        color: "red",
        borderColor: "border-red-600",
        textColor: "text-red-700",
        bgColor: "bg-red-100",
        textColorDark: "text-red-800",
        iconColor: "text-red-600"
      },
      inventory: {
        color: "yellow",
        borderColor: "border-amber-600",
        textColor: "text-amber-700",
        bgColor: "bg-amber-100",
        textColorDark: "text-amber-800",
        iconColor: "text-amber-600"
      },
      opt: {
        color: "emerald",
        borderColor: "border-emerald-600",
        textColor: "text-emerald-700",
        bgColor: "bg-emerald-100",
        textColorDark: "text-emerald-800",
        iconColor: "text-emerald-600"
      },
      masterlist: {
        color: "indigo",
        borderColor: "border-indigo-600",
        textColor: "text-indigo-700",
        bgColor: "bg-indigo-100",
        textColorDark: "text-indigo-800",
        iconColor: "text-indigo-600"
      },
      fhis: {
        color: "pink",
        borderColor: "border-pink-600",
        textColor: "text-pink-700",
        bgColor: "bg-pink-100",
        textColorDark: "text-pink-800",
        iconColor: "text-pink-600"
      },
      profiling: {
        color: "violet",
        borderColor: "border-violet-600",
        textColor: "text-violet-700",
        bgColor: "bg-violet-100",
        textColorDark: "text-violet-800",
        iconColor: "text-violet-600"
      }
    }[type];

    const getDisplayName = () => {
      switch (type) {
        case "all": return "All";
        case "bhw": return "BHW";
        case "recipients": return "Recipients";
        case "inventory": return "Inventory";
        case "opt": return "OPT";
        case "masterlist": return "Masterlist";
        case "fhis": return "FHIS";
        case "profiling": return "Profiling";
        default: return type;
      }
    };

    return (
      <button
        type="button"
        onClick={onClick}
        className={`
          flex-1 min-w-0 py-3 px-1 text-xs sm:text-sm 
          flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 
          transition-colors border-b-4 
          ${active ? `${config.borderColor} ${config.textColor} font-medium` : "border-transparent text-gray-600 hover:border-gray-300"}
        `}
      >
        <Icon className={`h-4 w-4 ${active ? config.iconColor : "text-gray-500"}`} />
        <span className="capitalize text-center">{getDisplayName()}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${active ? `${config.bgColor} ${config.textColorDark}` : "bg-gray-200 text-gray-600"}`}>
          {count}
        </span>
      </button>
    );
  };

  return (
    <MainLayoutComponent title="Healthcare Reports" description="Manage and view healthcare reports for various services">
      <Tabs value={activeTab} className="w-full">
        {/* Mobile Responsive Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-2 bg-white rounded-md border border-gray-200 h-auto overflow-hidden">
          <TabButton
            active={activeTab === "all"}
            type="all"
            icon={ClipboardList}
            count={allReports.length}
            onClick={() => setActiveTab("all")}
          />
          <TabButton 
            active={activeTab === "profiling"} 
            type="profiling" 
            icon={Users} 
            count={profilingReports.length} 
            onClick={() => setActiveTab("profiling")} 
          />
          <TabButton
            active={activeTab === "bhw"}
            type="bhw"
            icon={Users}
            count={bhwReport.length}
            onClick={() => setActiveTab("bhw")}
          />
          <TabButton
            active={activeTab === "recipients"}
            type="recipients"
            icon={Syringe}
            count={recipientLists.length}
            onClick={() => setActiveTab("recipients")}
          />
          <TabButton
            active={activeTab === "inventory"}
            type="inventory"
            icon={Box}
            count={inventoryReports.length}
            onClick={() => setActiveTab("inventory")}
          />
          <TabButton
            active={activeTab === "opt"}
            type="opt"
            icon={Activity}
            count={optReports.length}
            onClick={() => setActiveTab("opt")}
          />
          <TabButton
            active={activeTab === "masterlist"}
            type="masterlist"
            icon={ClipboardList}
            count={masterlistReports.length}
            onClick={() => setActiveTab("masterlist")}
          />
          <TabButton
            active={activeTab === "fhis"}
            type="fhis"
            icon={Heart}
            count={fhisReports.length}
            onClick={() => setActiveTab("fhis")}
          />
        </div>

        <div className="bg-white rounded-sm border border-gray-200 p-4 mb-8">
          {/* Search Bar - Mobile Responsive */}
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-[50%] max-w-full sm:max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search reports..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* All Reports Tab */}
          <TabsContent value="all" className="space-y-8">
            <div className="bg-white p-4 sm:p-6">
              <div className="flex items-center gap-4 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">All Healthcare Reports</h2>
              </div>
              {filterReports(allReports).length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filterReports(allReports).map(renderCard)}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500">No reports found matching your search</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Profiling Reports Tab */}
          <TabsContent value="profiling" className="space-y-8">
            <div className="bg-white p-4 sm:p-6">
              <div className="flex items-center gap-4 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-6 sm:h-6 text-violet-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Profiling Reports</h2>
              </div>
              {filterReports(profilingReports).length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filterReports(profilingReports).map(renderCard)}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500">No profiling reports found matching your search</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* BHW Reports Tab */}
          <TabsContent value="bhw" className="space-y-8">
            <div className="bg-white p-4 sm:p-6">
              <div className="flex items-center gap-4 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">BHW Reports</h2>
              </div>
              {filterReports(bhwReport).length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filterReports(bhwReport).map(renderCard)}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500">No BHW reports found matching your search</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Recipient Lists Tab */}
          <TabsContent value="recipients" className="space-y-8">
            <div className="bg-white p-4 sm:p-6">
              <div className="flex items-center gap-4 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Syringe className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Recipient Lists</h2>
              </div>
              {filterReports(recipientLists).length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filterReports(recipientLists).map(renderCard)}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500">No recipient lists found matching your search</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Inventory Reports Tab */}
          <TabsContent value="inventory" className="space-y-8">
            <div className="bg-white p-4 sm:p-6">
              <div className="flex items-center gap-4 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Box className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Inventory Reports</h2>
              </div>
              {filterReports(inventoryReports).length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filterReports(inventoryReports).map(renderCard)}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500">No inventory reports found matching your search</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* OPT Reports Tab */}
          <TabsContent value="opt" className="space-y-8">
            <div className="bg-white p-4 sm:p-6">
              <div className="flex items-center gap-4 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">OPT Reports</h2>
              </div>
              {filterReports(optReports).length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filterReports(optReports).map(renderCard)}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500">No OPT reports found matching your search</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Masterlist Reports Tab */}
          <TabsContent value="masterlist" className="space-y-8">
            <div className="bg-white p-4 sm:p-6">
              <div className="flex items-center gap-4 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Masterlist Reports</h2>
              </div>
              {filterReports(masterlistReports).length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filterReports(masterlistReports).map(renderCard)}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500">No masterlist reports found matching your search</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* FHIS Reports Tab */}
          <TabsContent value="fhis" className="space-y-8">
            <div className="bg-white p-4 sm:p-6">
              <div className="flex items-center gap-4 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-pink-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">FHIS Reports</h2>
              </div>
              {filterReports(fhisReports).length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filterReports(fhisReports).map(renderCard)}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500">No FHIS reports found matching your search</p>
                </div>
              )}
            </div>
          </TabsContent>

        
        </div>
      </Tabs>
    </MainLayoutComponent>
  );
}