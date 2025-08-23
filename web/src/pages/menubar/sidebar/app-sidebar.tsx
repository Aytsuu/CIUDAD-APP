
import React, { useState } from "react";
import { Link } from "react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar";
import type { MenuItem, SubMenuItemProps, MenuItemProps } from "./sidebarTypes";

// Menu items with dropdown support
const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    title: "Calendar",
    url: "/waste-calendar-scheduling",
  },
  {
    title: "Administration",
    url: "/administration",
  },
  {
    title: "Profiling",
    subItems: true,
    url: "/",
    items: [
      { title: "Resident", url: "/resident" },
      { title: "Family", url: "/family" },
      { title: "Household", url: "/household" },
      { title: "Business", url: "/business/record/active" },
    ],
  },
  {
    title: "Report",
    subItems: true,
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
    url: "/summon-and-case-tracking",
  },
  {
    title: "GAD",
    subItems: true,
    url: "/",
    items: [
      { title: "Budget Tracker", url: "/gad-budget-tracker-main"},
      { title: "Project Proposal", url: "/gad-project-proposal"},
      { title: "Review Project Proposal", url: "/gad-review-project-proposal"},
      { title: "Annual Development Plan", url: "/gad-annual-development-plan"}  
    ],
  },
  {
    title: "Council",
    subItems: true,
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
    subItems: true,
    url: "/",
    items: [
      { title: "Budget Plan", url: "/treasurer-budget-plan" },
      {
        title: "Income & Expense Tracking",
        url: "/treasurer-income-expense-main",
      },
      {
        title: "Income & Disbursement",
        url: "/treasurer-income-and-disbursement",
      },
      {
        title: "Clearance Requests",
        url: "/",
        anotherItems: [
          { title: "Personal & Others", url: "/treasurer-personal-and-others" },
          { title: "Permit", url: "/treasurer-permit" },
          { title: "Service Charge", url: "/treasurer-service-charge" },
          { title: "Barangay Service", url: "/treasurer-barangay-service" },
          { title: "Rates", url: "/treasurer-rates" },
        ],
      },
      { title: "Receipts", url: "/treasurer-receipts" },
    ],
  },
  {
    title: "Donation",
    url: "/donation-record",
  },
  {
    title: "Illegal Dumping Reports",
    url: "/waste-illegaldumping-report",
  },
  {
    title: "Garbage Pickup Request",
    url: "/garbage-pickup-request"
  },
  {
    title: "Waste Personnel & Collection Vehicle",
    url: "/waste-personnel",
  },
  {
    title: "Announcement",
    url: "/announcement",
  },
  {
    title: "Services",
    subItems: true,
    url: "/",
    items: [
      { title: "Administration", url: "/health-administration" },

      { title: "Patients Record", url: "/patients-record-main" },
      {title: "Forwarded Records", url: "/forwarded-records"},
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
      {
        title: "Manage Request",
        url: "/",
        anotherItems: [
          {
            title: "Medicine Request ",
            url: "/medicine-requests",
          },
          { title: "Medical Consultation", url: "/" },
         
        ],
      },
      { title: "Animal Bites", url: "/Animalbite_viewing" },
      { title: "Family Profiling", url: "/family-profiling-main" },
      { title: "Medical Consultation Record", url: "/allMedRecords" },
      { title: "Family Planning Record", url: "/FamPlanning_table" },
      { title: "Maternal Record", url: "/maternalrecords" },
      { title: "Child Health Record", url: "/all-child-health-records" },
      { title: "Vaccination Record", url: "/VaccinationManagement" },
      { title: "Medicine Record", url: "/all-medicine-records" },
      { title: "Firstaid Record ", url: "/all-firstaid-records" },
      { title: "Archive", url: "/archiveMainInventoryStocks" },
      { title: "Schedules", url: "/health-appointments" },
      { title: "Service Scheduler", url: "/health-services/scheduler" },
      { title: "Reports", url: "/healthcare-reports" },

      {
        title: "Inventory",
        url: "/",
        anotherItems: [
          { title: "Inventory List", url: "/mainInventoryList" },
          { title: "Inventory Stocks", url: "/main-inventory" },
        ],
      },
      {
        title: "Queueing",
        url: "/",
        anotherItems: [
          { title: "Patients Queue", url: "/patientsQueue" },
          { title: "Processing Queue", url: "/processingQueue" },
        ],
      },
    ],
  },
  {
    title: "Clerk",
    subItems: true,
    url: "/",
    items: [
      { title: "Certifications", url: "record/clearances/certification" },
      { title: "Business Permits", url: "record/clearances/businesspermit" },
      { title: "Issued Certificates", url: "record/clearances/issuedcertificates" },
    ],
  },
  {
    title: "Activity Log",
    url: "/record/activity-log",

  },
];

const SubMenuItemComponent: React.FC<SubMenuItemProps> = ({
  item,
  activeItem,
  setActiveItem,
}) => {
  const [isThirdLevelOpen, setIsThirdLevelOpen] = useState(false);
  const hasThirdLevel = item.anotherItems && item.anotherItems.length > 0;
  const isActive = activeItem === item.title;

  if (hasThirdLevel) {
    return (
      <div className="w-full">
        <div
          className={`flex items-center justify-between px-4 py-2 text-sm rounded-md cursor-pointer ${
            isActive
              ? "bg-[#1273B2]/10 text-[#1273B8]"
              : "text-[#2D4A72] hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
          }`}
          onClick={() => {
            setIsThirdLevelOpen(!isThirdLevelOpen);
            setActiveItem(item.title);
          }}
        >
          <span>{item.title}</span>
          {isThirdLevelOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
        {isThirdLevelOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {item.anotherItems?.map((thirdItem) => (
              <SidebarMenuButton
                key={thirdItem.title}
                asChild
                className="w-full"
              >
                <Link
                  to={thirdItem.url}
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    activeItem === thirdItem.title
                      ? "bg-[#1273B2]/10 text-[#1273B8]"
                      : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
                  }`}
                  onClick={() => setActiveItem(thirdItem.title)}
                >
                  <span>{thirdItem.title}</span>
                </Link>
              </SidebarMenuButton>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <SidebarMenuButton asChild className="w-full">
      <Link
        to={item.url}
        className={`flex items-center px-4 py-2 text-sm rounded-md ${
          isActive
            ? "bg-[#1273B2]/10 text-[#1273B8]"
            : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
        }`}
        onClick={() => setActiveItem(item.title)}
      >
        <span>{item.title}</span>
      </Link>
    </SidebarMenuButton>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  activeItem,
  setActiveItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = activeItem === item.title;

  if (item.subItems && item.items) {
    return (
      <SidebarMenuItem>
        <div
          className={`w-full cursor-pointer rounded-md ${
            isActive
              ? "bg-[#1273B2]/10 text-[#1273B8]"
              : "text-[#2D4A72] hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
          }`}
          onClick={() => {
            setIsOpen(!isOpen);
            setActiveItem(item.title);
          }}
        >
          <div className="flex items-center justify-between px-4 py-2 rounded-md">
            <span>{item.title}</span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </div>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {item.items.map((subItem) => (
              <SubMenuItemComponent
                key={subItem.title}
                item={subItem}
                activeItem={activeItem}
                setActiveItem={setActiveItem}
              />
            ))}
          </div>
        )}
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        {item.url && (
          <Link
            to={item.url}
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive
                ? "bg-[#1273B2]/10 text-[#1273B8]"
                : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
            }`}
            onClick={() => setActiveItem(item.title)}
          >
            <span>{item.title}</span>
          </Link>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function AppSidebar({ assignedFeatures }: { assignedFeatures: any }) {
  const [activeItem, setActiveItem] = useState<string>("");

  // const items: MenuItem[] = assignedFeatures.map((item) => {
  //   const feature = item.feat;
  //   return {
  //     title: feature.feat_name,
  //     url: feature.feat_url,
  //   }
  // });
  return (
    <Sidebar className="border-none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="w-full h-14"></div>
            <SidebarMenu>
              {items.map((item) => (
                <MenuItem
                  key={item.title}
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

// import React, { useState } from "react";
// import { Link } from "react-router";
// import { ChevronDown, ChevronRight } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "./sidebar";

// interface Feature {
//   feat_name: string;
//   feat_url: string;
//   feat_category: string;
// }

// interface Assignment {
//   feat: Feature;
// }

// interface GroupedFeatures {
//   [category: string]: Feature[];
// }

// export function AppSidebar() {
//   const [activeItem, setActiveItem] = useState<string>("");
//   const [openCategory, setOpenCategory] = useState<string | null>(null);
//   const { user } = useAuth();

//   const staticItems = [
//     { label: "Dashboard", path: "/dashboard" },
//     { label: "Announcement", path: "/announcement" },
//   ];

//   const assignments: Assignment[] = user?.staff?.assignments || [];

//   const groupedFeatures: GroupedFeatures = assignments.reduce((acc, assignment) => {
//     const feat = assignment.feat;
//     if (!feat) return acc;

//     const { feat_category } = feat;
//     if (!acc[feat_category]) {
//       acc[feat_category] = [];
//     }

//     acc[feat_category].push(feat);
//     return acc;
//   }, {} as GroupedFeatures);

//   return (
//     <Sidebar className="border-none">
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupContent>
//             <div className="w-full h-14" />
//             <SidebarMenu>
//               {staticItems.map((item) => (
//                 <SidebarMenuItem key={item.label}>
//                   <SidebarMenuButton asChild className="w-full">
//                     <Link
//                       to={item.path}
//                       className={`flex items-center px-4 py-2 text-sm rounded-md ${
//                         activeItem === item.label
//                           ? "bg-[#1273B2]/10 text-[#1273B8]"
//                           : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
//                       }`}
//                       onClick={() => setActiveItem(item.label)}
//                     >
//                       <span>{item.label}</span>
//                     </Link>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}

//               {/* Dynamic Feature Groups */}
//               {Object.entries(groupedFeatures).map(([category, features]) => (
//                 <SidebarMenuItem key={category}>
//                   <div
//                     className={`w-full cursor-pointer rounded-md ${
//                       openCategory === category
//                         ? "bg-[#1273B2]/10 text-[#1273B8]"
//                         : "text-[#2D4A72] hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
//                     }`}
//                     onClick={() =>
//                       setOpenCategory(openCategory === category ? null : category)
//                     }
//                   >
//                     <div className="flex items-center justify-between px-4 py-2 rounded-md">
//                       <span>{category}</span>
//                       {openCategory === category ? (
//                         <ChevronDown className="h-4 w-4" />
//                       ) : (
//                         <ChevronRight className="h-4 w-4" />
//                       )}
//                     </div>
//                   </div>

//                   {openCategory === category && (
//                     <div className="ml-4 mt-1 space-y-1">
//                       {features.map((feat) => (
//                         <SidebarMenuButton key={feat.feat_name} asChild className="w-full">
//                           <Link
//                             to={feat.feat_url}
//                             className={`flex items-center px-4 py-2 text-sm rounded-md ${
//                               activeItem === feat.feat_name
//                                 ? "bg-[#1273B2]/10 text-[#1273B8]"
//                                 : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
//                             }`}
//                             onClick={() => setActiveItem(feat.feat_name)}
//                           >
//                             <span>{feat.feat_name}</span>
//                           </Link>
//                         </SidebarMenuButton>
//                       ))}
//                     </div>
//                   )}
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   );
// }

// export default AppSidebar;
