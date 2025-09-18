import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
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
import { capitalize } from "@/helpers/capitalize";

// Updated types to be more flexible
interface BaseMenuItem {
  title: string;
  url?: string;
  items?: BaseMenuItem[];   
}

// Menu items with unlimited nesting support
const barangayItems: BaseMenuItem[] = [
  {
    title: "Report",
    url: "/",
    items: [
      { title: "Incident", url: "/report/incident"},
      { title: "Acknowledgement", url: "/report/acknowledgement"},
      { title: "Weekly Accomplishment", url: "/report/weekly-accomplishment"},
      { title: "Securado", url: "/report/securado"}  
    ],
  },
  {
    title: "Complaint",
    url: "/complaint",
  },
  {
    title: "Team",
    url: "/team",
  },
  {
    title: "Summon & Case Tracker",
    url: "/",
    items: [
      { title: "Request List", url: "/request-list"},
      { title: "Summon Calendar", url: "/summon-calendar"},
      { title: "Cases", url: "/summon-cases"},
    ]
  },
  {
    title: "Donation",
    url: "/donation-record",
  },
  {
    title: "GAD",
    url: "/",
    items: [
      { title: "Activity", url: "/gad-activity"},
      { title: "Budget Tracker", url: "/gad-budget-tracker-main"},
      { title: "Project Proposal", url: "/gad-project-proposal"},
      { title: "Annual Development Plan", url: "/gad-annual-development-plan"},
    ],
  },
  {
    title: "Council",
    url: "/",
    items: [
      { title: "Council Events", url: "/calendar-page" },
      { title: "Attendance", url: "/attendance-page" },
      { title: "Ordinance", url: "/ord-page" },
      { title: "Resolution", url: "/res-page" },
      { title: "Minutes of Meeting", url: "/mom-page" },
      { title: "Document Template", url: "/templates-main"}
    ],
  },
  {
    title: "Finance",
    url: "/",
    items: [
      { title: "Budget Plan", url: "/treasurer-budget-plan" },
      {
        title: "Income & Expense Tracking",
        url: "/treasurer-income-expense-main",
      },
      {
        title: "Disbursement",
        url: "/treasurer-disbursement",
      },
      {
        title: "Payment Request",
        url: "/",
        items: [
          { title: "Personal & Others", url: "/treasurer-personal-and-others" },
          { title: "Permit", url: "/treasurer-permit" },
          { title: "Service Charge", url: "/treasurer-service-charge" },
          { title: "Rates", url: "/treasurer-rates" },
        ],
      },
      { title: "Receipts", url: "/treasurer-receipts" },
    ],
  },
  {
    title: "Certificate and Clearances",

    url: "/",
    items: [
      { title: "Certifications", url: "record/clearances/certification" },
      { title: "Business Permits", url: "record/clearances/businesspermit" },
      { title: "Service Charge", url: "record/clearances/servicecharge" },
      { title: "Issued Certificates", url: "record/clearances/issuedcertificates" },
      
      
    ],
  },
    {
    title: "Waste",
    url: "/",
    items: [
      { title: "Waste Personnel & Collection Vehicle", url: "/waste-personnel"},
      { title: "Calendar", url: "/waste-calendar-scheduling"},
      { title: "Illegal Dumping Reports", url: "/waste-illegaldumping-report"},
      { title: "Garbage Pickup Request", url: "/garbage-pickup-request"},
    ],
  },
  {
    title: "Announcement",
    url: "/announcement",
  },
  {
    title: "Activity Log",
    url: "/record/activity-log",

  },
];

// Menu items with unlimited nesting support
const healthItems: BaseMenuItem[] = [
  // {
  //   title: "Dashboard",
  //   url: "/dashboard"
  // },

  // {
  //   title: "Administration",
  //   url: "/administration"
  // },
  // {
  //   title: "Profiling",
  //   url: "/",
  //   items: [
  //     { title: "All", url: "/profiling/all" },
  //     {
  //       title: "Resident",
  //       url: "/profiling/resident",
  //       items: [
  //         { title: "Family", url: "/profiling/family" },
  //         { title: "Household", url: "/profiling/household" }
  //       ]
  //     },
  //     { title: "Voters", url: "/profiling/voters" },
  //     {
  //       title: "Business",
  //       url: "/profiling/business/record",
  //       items: [{ title: "Respondent", url: "/profiling/business/record/respondent" }]
  //     }
  //   ]
  // },
 
  {
    title: "Announcement",
    url: "/announcement"
  },
 
  { title: "Patients Record", url: "/patients-record-main" },

  {
    title: "Services",
    url: "/",
    items: [
      // {
      //   title: "Forwarded Records",
      //   url: "/",
      //   anotherItems: [
      //     {
      //       title: "Child Immunization",
      //       url: "/forwarded-child-health-immunization",
      //     },
      //     { title: "Vaccine Waitlist", url: "/forwarded-vaccine-waitlist" },
      //     { title: "Step 2: Vitals Queue  ", url: "/forwarded-vitals-queue" },
      //     {
      //       title: "Medical Consultaion",
      //       url: "/forwarded-medical-consultation",
      //     },
      //   ],
      // },
      { title: "Forwarded Records", url: "/forwarded-records" },
      { title: "Animal Bites", url: "/Animalbite_viewing" },
      { title: "Medical Consultation ", url: "/allMedRecords" },
      { title: "Family Planning", url: "/FamPlanning_table" },
      { title: "Maternal", url: "/maternalrecords" },
      { title: "Child Health", url: "/all-child-health-records" },
      { title: "Vaccination", url: "/VaccinationManagement" },
      { title: "Medicine", url: "/all-medicine-records" },
      { title: "Firstaid", url: "/all-firstaid-records" },
      { title: "Schedules", url: "/health-appointments" }
    ]
  },

  {
    title: "Inventory",
    url: "/",
    items: [
      { title: "Inventory List", url: "/mainInventoryList" },
      { title: "Inventory Stocks", url: "/main-inventory" }
    ]
  },
  {
    title: "Manage Request",
    url: "/",
    items: [
      {
        title: "Medicine Request",
        url: "/medicine-request"
      },
      { title: "Medical Consultation", url: "/" }
    ]
  },

  { title: "Service Scheduler", url: "/health-services/scheduler" },
  { title: "Reports", url: "/healthcare-reports" },
  {
    title: "Manage",
    url: "/",
    items: [
      {
        title: "Manage age group",
        url: "/age-group"
      },
      { title: "Medical Consultation", url: "/" }
    ]
  },
];

interface MenuItemComponentProps {
  item: BaseMenuItem;
  activeItem: string;
  setActiveItem: (title: string) => void;
  level?: number;
}

// Single recursive component that handles all nesting levels
const MenuItemComponent: React.FC<MenuItemComponentProps> = ({
  item,
  activeItem,
  setActiveItem,
  level = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const hasSubItems = item.items && item.items.length > 0;
  const isActive = activeItem === item.title;
  const currentPath = location.pathname.split('/').pop() as string;
  
  // Auto-set active item based on current path
  useEffect(() => {
    if (item.url && item.url.split('/').pop() === currentPath) {
      setActiveItem(capitalize(item.title) as string);
    }
  }, [currentPath, item.url, item.title, setActiveItem]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (hasSubItems && (!item.url || item.url === '/')) {
      // Toggle submenu for items without navigable URLs
      setIsOpen(!isOpen);
      setActiveItem(item.title);
    } else if (item.url && item.url !== '/') {
      // Navigate to URL
      setActiveItem(item.title);
      navigate(item.url);
    }
  };

  const toggleSubmenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    setActiveItem(item.title);
  };

  // Calculate indentation based on nesting level
  const indentClass = level > 0 ? `pl-${level * 4}` : '';
  
  // Base styles
  const baseStyles = `flex items-center px-4 py-2.5 text-sm rounded-md cursor-pointer transition-colors ${
    isActive
      ? "bg-[#1273B2]/10 text-[#1273B8]"
      : "text-[#2D4A72] hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
  }`;

  if (hasSubItems) {
    return (
      <SidebarMenuItem>
        <div className={`w-full ${indentClass}`}>
          <SidebarMenuButton asChild className="w-full">
            <React.Fragment>
              <div className={baseStyles} onClick={handleClick}>
                <span className="flex-1">{item.title}</span>
                <div onClick={toggleSubmenu}>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>
              {isOpen && (
                <div className="mt-1 space-y-1">
                  {item.items!.map((subItem, index) => (
                    <MenuItemComponent
                      key={`${subItem.title}-${index}`}
                      item={subItem}
                      activeItem={activeItem}
                      setActiveItem={setActiveItem}
                      level={level + 1}
                    />
                  ))}
                </div>
              )}
            </React.Fragment>
          </SidebarMenuButton>
        </div>
      </SidebarMenuItem>
    );
  }

  // Leaf item without subitems
  return (
    <SidebarMenuItem>
      <div className={indentClass}>
        <SidebarMenuButton asChild className="w-full">
          {item.url && item.url !== '/' ? (
            <Link
              to={item.url}
              className={baseStyles}
              onClick={() => setActiveItem(item.title)}
            >
              <span>{item.title}</span>
            </Link>
          ) : (
            <div
              className={baseStyles}
              onClick={() => setActiveItem(item.title)}
            >
              <span>{item.title}</span>
            </div>
          )}
        </SidebarMenuButton>
      </div>
    </SidebarMenuItem>
  );
};

export function AppSidebar() {
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState<string>("");

  const items: BaseMenuItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard"
    },

    {
      title: "Administration",
      url: "/administration"
    },
    {
      title: "Profiling",
      url: "/",
      items: [
        { title: "All", url: "/profiling/all" },
        {
          title: "Resident",
          url: "/profiling/resident",
          items: [
            { title: "Family", url: "/profiling/family" },
            { title: "Household", url: "/profiling/household" }
          ]
        },
        { title: "Voters", url: "/profiling/voters" },
        {
          title: "Business",
          url: "/profiling/business/record",
          items: [{ title: "Respondent", url: "/profiling/business/record/respondent" }]
        }
      ]
    },
    ...(user?.staff?.staff_type?.toLowerCase() === "barangay staff" ? barangayItems : healthItems)
  ]

  // Uncomment and modify this if you want to use assignedFeatures instead of hardcoded items
  // const dynamicItems: BaseMenuItem[] = assignedFeatures?.map((item: any) => ({
  //   title: item.feat.feat_name,
  //   url: item.feat.feat_url,
  // })) || items;

  return (
    <Sidebar className="border-none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="w-full h-14"></div>
            <SidebarMenu>
              {items.map((item, index) => (
                <MenuItemComponent
                  key={`${item.title}-${index}`}
                  item={item}
                  activeItem={activeItem}
                  setActiveItem={setActiveItem}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;