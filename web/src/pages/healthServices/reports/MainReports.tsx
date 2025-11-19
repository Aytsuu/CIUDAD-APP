"use client";

import { Button } from "@/components/ui/button/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Activity, Syringe, Eye, Pill, Box, Users, ClipboardList, Search, Heart } from "lucide-react";
import { FaBandAid } from "react-icons/fa";
import { Link } from "react-router";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import CardLayout from "@/components/ui/card/card-layout";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ProtectedComponent } from "@/ProtectedComponent";
import { useAuth } from "@/context/AuthContext";

// Types
interface ReportItem {
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  description: string;
  link: string;
}

type TabType = "all" | "bhw" | "recipients" | "inventory" | "opt" | "fhis" | "profiling" | "doctor";

// Constants - moved outside component to prevent recreation on every render
const PROFILING_REPORTS: ReportItem[] = [
  {
    title: "Health Profiling",
    icon: <Users className="w-6 h-6 text-violet-600" />,
    bgColor: "bg-gradient-to-br from-violet-50 to-purple-50",
    description: "Profiling Population Structure Report and Records",
    link: "/health-family-profiling",
  },
];

const BHW_REPORTS: ReportItem[] = [
  {
    title: "BHW Report",
    icon: <Activity className="w-6 h-6 text-green-600" />,
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
    description: "Monthly report of Barangay Health Workers activities and achievements",
    link: "/bhw-monthly-reports",
  },
  {
    title: "Family Planning Monthly Report",
    icon: <ClipboardList className="w-6 h-6 text-purple-600" />,
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
    description: "Monthly report of family planning service provision and statistics",
    link: "/familyplanning/monthly-records",
  },
];

const RECIPIENT_LISTS: ReportItem[] = [
  {
    title: "Vaccination Recipient List",
    icon: <Syringe className="w-6 h-6 text-red-600" />,
    bgColor: "bg-gradient-to-br from-red-50 to-purple-50",
    description: "Monthly report of vaccination recipients",
    link: "/reports/monthly-vaccination",
  },
  {
    title: "Medicine Recipient List",
    icon: <Pill className="w-6 h-6 text-sky-600" />,
    bgColor: "bg-gradient-to-br from-sky-50 to-blue-50",
    description: "Monthly report of medicine recipients",
    link: "/reports/monthly-medicine",
  },
  {
    title: "First Aid Recipient List",
    icon: <FaBandAid className="w-6 h-6 text-red-600" />,
    bgColor: "bg-gradient-to-br from-red-50 to-rose-50",
    description: "Monthly report of first aid recipients",
    link: "/reports/monthly-firstaid",
  },
  {
    title: "New Children 0-5 Years Old List",
    icon: <Users className="w-6 h-6 text-yellow-600" />,
    bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
    description: "Monthly report of newly registered children aged 0-5 years old",
    link: "/monthly-new-children-records",
  },
  {
    title: "Deworming Recipient List",
    icon: <Pill className="w-6 h-6 text-green-600" />,
    bgColor: "bg-gradient-to-br from-green-50 to-lime-50",
    description: "Yearly report of deworming recipients",
    link: "/reports/deworming-yearly",
  },
  {
    title: "Children 6-59 Supplements Masterlist",
    icon: <ClipboardList className="w-6 h-6 text-indigo-600" />,
    bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
    description: "Comprehensive masterlist of all healthcare records",
    link: "/child-supplements-masterlist",
  },
];

const INVENTORY_REPORTS: ReportItem[] = [
  {
    title: "Medicine Inventory",
    icon: <Box className="w-6 h-6 text-amber-600" />,
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
    description: "Monthly report of medicine inventory status",
    link: "/medicine-inventory-reports",
  },
  {
    title: "First Aid Inventory",
    icon: <FaBandAid className="w-6 h-6 text-blue-600" />,
    bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
    description: "Monthly report of first aid inventory status",
    link: "/firstaid-inventory-reports",
  },
  {
    title: "Commodity Inventory",
    icon: <Box className="w-6 h-6 text-indigo-600" />,
    bgColor: "bg-gradient-to-br from-indigo-50 to-blue-50",
    description: "Monthly report of commodity inventory status",
    link: "/reports/inventory/monthly-commodity",
  },
  {
    title: "EPI Inventory and Utilization",
    icon: <Box className="w-6 h-6 text-teal-600" />,
    bgColor: "bg-gradient-to-br from-teal-50 to-cyan-50",
    description: "Monthly report of antigen inventory status",
    link: "/reports/inventory/monthly-antigen",
  },
];

const OPT_REPORTS: ReportItem[] = [
  {
    title: "Opt Plus Form",
    icon: <Activity className="w-6 h-6 text-green-600" />,
    bgColor: "bg-gradient-to-br from-green-50 to-lime-50",
    description: "List of Preschoolers with weight and height measurements and identified status",
    link: "/monthly-opt-records",
  },
  {
    title: "Opt Plus Summary",
    icon: <Activity className="w-6 h-6 text-emerald-600" />,
    bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
    description: "Total no. of Preschoolers base on WFA, HFA, LFA",
    link: "/opt-summaries-all-months",
  },
  {
    title: "Semi Annual OPT Summary",
    icon: <Activity className="w-6 h-6 text-emerald-600" />,
    bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
    description: "Total no. of Preschoolers base on WFA, HFA, LFA",
    link: "/semiannual-opt-yearly",
  },
  {
    title: "0-23 mos Monthly Monitoring",
    icon: <Activity className="w-6 h-6 text-emerald-600" />,
    bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
    description: "Total no. of Preschoolers base on WFA, HFA, LFA",
    link: "/yearly-opt-records-jantodec",
  },
];

const FHIS_REPORTS: ReportItem[] = [
  {
    title: "FHIS Monthly Report",
    icon: <Heart className="w-6 h-6 text-pink-600" />,
    bgColor: "bg-gradient-to-br from-pink-50 to-rose-50",
    description: "Monthly Field Health Services Information System report",
    link: "/reports/fhis-monthly-records",
  },
];

const DOCTOR_REPORTS: ReportItem[] = [
  {
    title: "Consulted Patients Monthly Summary Report",
    icon: <Users className="w-6 h-6 text-blue-600" />,
    bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
    description: "Monthly report of consulted patients and physician activities",
    link: "/reports/monthly-consulted-summaries",
  },
  {
    title: "Morbidity Monthly Report",
    icon: <Heart className="w-6 h-6 text-red-600" />,
    bgColor: "bg-gradient-to-br from-red-50 to-pink-50",
    description: "Monthly report of Morbidity",
    link: "/reports/monthly-morbidity",
  },
];

const ALL_REPORTS = [
  ...PROFILING_REPORTS,
  ...BHW_REPORTS,
  ...RECIPIENT_LISTS,
  ...INVENTORY_REPORTS,
  ...OPT_REPORTS,
  ...FHIS_REPORTS,
  ...DOCTOR_REPORTS,
];

// Tab configuration
const TAB_CONFIG = {
  all: { name: "All", icon: ClipboardList, count: ALL_REPORTS.length },
  profiling: { name: "Profiling", icon: Users, count: PROFILING_REPORTS.length },
  bhw: { name: "BHW", icon: Users, count: BHW_REPORTS.length },
  recipients: { name: "Recipients", icon: Syringe, count: RECIPIENT_LISTS.length },
  inventory: { name: "Inventory", icon: Box, count: INVENTORY_REPORTS.length },
  opt: { name: "OPT", icon: Activity, count: OPT_REPORTS.length },
  fhis: { name: "FHIS", icon: Heart, count: FHIS_REPORTS.length },
  doctor: { name: "All", icon: Users, count: DOCTOR_REPORTS.length },
} as const;

// Color configuration for tabs
const COLOR_CONFIG = {
  all: {
    borderColor: "border-blue-600",
    textColor: "text-blue-700",
    bgColor: "bg-blue-100",
    textColorDark: "text-blue-800",
    iconColor: "text-blue-600",
  },
  bhw: {
    borderColor: "border-green-600",
    textColor: "text-green-700",
    bgColor: "bg-green-100",
    textColorDark: "text-green-800",
    iconColor: "text-green-600",
  },
  recipients: {
    borderColor: "border-red-600",
    textColor: "text-red-700",
    bgColor: "bg-red-100",
    textColorDark: "text-red-800",
    iconColor: "text-red-600",
  },
  inventory: {
    borderColor: "border-amber-600",
    textColor: "text-amber-700",
    bgColor: "bg-amber-100",
    textColorDark: "text-amber-800",
    iconColor: "text-amber-600",
  },
  opt: {
    borderColor: "border-emerald-600",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-100",
    textColorDark: "text-emerald-800",
    iconColor: "text-emerald-600",
  },
  fhis: {
    borderColor: "border-pink-600",
    textColor: "text-pink-700",
    bgColor: "bg-pink-100",
    textColorDark: "text-pink-800",
    iconColor: "text-pink-600",
  },
  profiling: {
    borderColor: "border-violet-600",
    textColor: "text-violet-700",
    bgColor: "bg-violet-100",
    textColorDark: "text-violet-800",
    iconColor: "text-violet-600",
  },
  doctor: {
    borderColor: "border-indigo-600",
    textColor: "text-indigo-700",
    bgColor: "bg-indigo-100",
    textColorDark: "text-indigo-800",
    iconColor: "text-indigo-600",
  },
} as const;

// Components
interface TabButtonProps {
  active: boolean;
  type: TabType;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  onClick: () => void;
}

const TabButton = ({ active, type, icon: Icon, count, onClick }: TabButtonProps) => {
  const config = COLOR_CONFIG[type];
  const tabInfo = TAB_CONFIG[type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex-shrink-0 py-2 px-4 text-sm font-medium
        flex items-center justify-center gap-2 
        transition-all duration-200 rounded-lg whitespace-nowrap
        ${active ? `${config.bgColor} ${config.textColor} shadow-sm` : "bg-gray-50 text-gray-600 hover:bg-gray-100"}
      `}
    >
      <Icon className={`h-4 w-4 flex-shrink-0 ${active ? config.iconColor : "text-gray-500"}`} />
      <span>{tabInfo.name}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${active ? `bg-white ${config.textColor}` : "bg-gray-200 text-gray-600"}`}>
        {count}
      </span>
    </button>
  );
};

interface ReportsSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  reports: ReportItem[];
  searchTerm: string;
  iconColor: string;
  bgColor: string;
}

const ReportsSection = ({ title, reports, searchTerm }: ReportsSectionProps) => {
  const filteredReports = searchTerm
    ? reports.filter((report) => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : reports;

  if (filteredReports.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-gray-500">No {title.toLowerCase()} found matching your search</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
      {filteredReports.map((report, index) => (
        <CardLayout
          key={`${report.title}-${index}`}
          contentClassName="flex flex-col flex-grow p-5"
          title={
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${report.bgColor} rounded-lg flex items-center justify-center`}>
                {report.icon}
              </div>
              <span className="text-lg font-medium text-gray-800">{report.title}</span>
            </div>
          }
          description={<p className="text-gray-600 mb-4">{report.description}</p>}
          content={
            <div className="mt-auto">
              <Link to={report.link}>
                <Button size="sm" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Report
                </Button>
              </Link>
            </div>
          }
        />
      ))}
    </div>
  );
};

// Main Component
export default function HealthcareReports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDoctor, setIsDoctor] = useState(false);

  // Auto-select doctor tab if user is a doctor
  useEffect(() => {
    const userPosition = user?.staff?.pos;
    const userPositionTitle = typeof userPosition === 'string' 
      ? userPosition 
      : userPosition?.pos_title || '';
    
    const doctorCheck = userPositionTitle.toLowerCase().includes("doctor");
    setIsDoctor(doctorCheck);
    
    if (doctorCheck) {
      setActiveTab("doctor");
    }
  }, [user?.staff?.pos]);

  const getReportsByTab = (tab: TabType): ReportItem[] => {
    switch (tab) {
      case "all": return ALL_REPORTS;
      case "profiling": return PROFILING_REPORTS;
      case "bhw": return BHW_REPORTS;
      case "recipients": return RECIPIENT_LISTS;
      case "inventory": return INVENTORY_REPORTS;
      case "opt": return OPT_REPORTS;
      case "fhis": return FHIS_REPORTS;
      case "doctor": return DOCTOR_REPORTS;
      default: return [];
    }
  };


  // Get tabs to display based on user role
  const getVisibleTabs = () => {
    if (isDoctor) {
      return [["doctor", TAB_CONFIG.doctor] as const];
    }
    return Object.entries(TAB_CONFIG).filter(([tabType]) => tabType !== "doctor") as [TabType, typeof TAB_CONFIG.all][];
  };

  return (
    <MainLayoutComponent title="Healthcare Reports" description="Manage and view healthcare reports for various services">
      <Tabs value={activeTab} className="w-full">
        {/* Navigation */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mb-4">
          <div className="inline-flex gap-4 bg-white rounded-md border border-gray-200 p-2 min-w-full">
            {getVisibleTabs().map(([tabType, tabInfo]) => (
              <TabButton
                key={tabType}
                active={activeTab === tabType}
                type={tabType}
                icon={tabInfo.icon}
                count={tabInfo.count}
                onClick={() => setActiveTab(tabType)}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-sm border border-gray-200 p-4 mb-8">
          {/* Search Bar */}
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

          {/* Tab Contents */}
          {getVisibleTabs().map(([tabType, tabInfo]) => {
            const reports = getReportsByTab(tabType);
            const colorConfig = COLOR_CONFIG[tabType];

            return (
              <TabsContent key={tabType} value={tabType} className="space-y-8">
                <div className="bg-white p-4 sm:p-6">
                  <div className="flex items-center gap-4 mb-6 sm:mb-8">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${colorConfig.bgColor} rounded-xl flex items-center justify-center`}>
                      <tabInfo.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${colorConfig.iconColor}`} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{tabInfo.name} Reports</h2>
                  </div>
                  
                  <ProtectedComponent exclude={tabType === "doctor" ? ["BARANGAY HEALTH WORKERS", "NURSE", "ADMIN"] : ["DOCTOR"]}>
                    <ReportsSection
                      title={tabInfo.name}
                      icon={tabInfo.icon}
                      reports={reports}
                      searchTerm={searchTerm}
                      iconColor={colorConfig.iconColor}
                      bgColor={colorConfig.bgColor}
                    />
                  </ProtectedComponent>
                </div>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </MainLayoutComponent>
  );
}