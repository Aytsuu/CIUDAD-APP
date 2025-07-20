// import React, { useState, useMemo } from "react";
// import { Link } from "react-router";
// import { ChevronDown, ChevronRight } from "lucide-react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "./sidebar";
// import type { MenuItem, SubMenuItemProps, MenuItemProps } from "./sidebarTypes";

// const SubMenuItemComponent: React.FC<SubMenuItemProps> = ({
//   item,
//   activeItem,
//   setActiveItem,
// }) => {
//   const [isThirdLevelOpen, setIsThirdLevelOpen] = useState(false);
//   const hasThirdLevel = item.anotherItems && item.anotherItems.length > 0;
//   const isActive = activeItem === item.title;

//   if (hasThirdLevel) {
//     return (
//       <div className="w-full">
//         <div
//           className={`flex items-center justify-between px-4 py-2 text-sm rounded-md cursor-pointer ${
//             isActive
//               ? "bg-[#1273B2]/10 text-[#1273B8]"
//               : "text-[#2D4A72] hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
//           }`}
//           onClick={() => {
//             setIsThirdLevelOpen(!isThirdLevelOpen);
//             setActiveItem(item.title);
//           }}
//         >
//           <span>{item.title}</span>
//           {isThirdLevelOpen ? (
//             <ChevronDown className="h-4 w-4" />
//           ) : (
//             <ChevronRight className="h-4 w-4" />
//           )}
//         </div>
//         {isThirdLevelOpen && (
//           <div className="ml-4 mt-1 space-y-1">
//             {item.anotherItems?.map((thirdItem) => (
//               <SidebarMenuButton
//                 key={thirdItem.title}
//                 asChild
//                 className="w-full"
//               >
//                 <Link
//                   to={thirdItem.url}
//                   className={`flex items-center px-4 py-2 text-sm rounded-md ${
//                     activeItem === thirdItem.title
//                       ? "bg-[#1273B2]/10 text-[#1273B8]"
//                       : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
//                   }`}
//                   onClick={() => setActiveItem(thirdItem.title)}
//                 >
//                   <span>{thirdItem.title}</span>
//                 </Link>
//               </SidebarMenuButton>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <SidebarMenuButton asChild className="w-full">
//       <Link
//         to={item.url}
//         className={`flex items-center px-4 py-2 text-sm rounded-md ${
//           isActive
//             ? "bg-[#1273B2]/10 text-[#1273B8]"
//             : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
//         }`}
//         onClick={() => setActiveItem(item.title)}
//       >
//         <span>{item.title}</span>
//       </Link>
//     </SidebarMenuButton>
//   );
// };

// const MenuItem: React.FC<MenuItemProps> = ({
//   item,
//   activeItem,
//   setActiveItem,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const isActive = activeItem === item.title;

//   if (item.subItems && item.items) {
//     return (
//       <SidebarMenuItem>
//         <div
//           className={`w-full cursor-pointer rounded-md ${
//             isActive
//               ? "bg-[#1273B2]/10 text-[#1273B8]"
//               : "text-[#2D4A72] hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
//           }`}
//           onClick={() => {
//             setIsOpen(!isOpen);
//             setActiveItem(item.title);
//           }}
//         >
//           <div className="flex items-center justify-between px-4 py-2 rounded-md">
//             <span>{item.title}</span>
//             {isOpen ? (
//               <ChevronDown className="h-4 w-4" />
//             ) : (
//               <ChevronRight className="h-4 w-4" />
//             )}
//           </div>
//         </div>
//         {isOpen && (
//           <div className="ml-4 mt-1 space-y-1">
//             {item.items.map((subItem) => (
//               <SubMenuItemComponent
//                 key={subItem.title}
//                 item={subItem}
//                 activeItem={activeItem}
//                 setActiveItem={setActiveItem}
//               />
//             ))}
//           </div>
//         )}
//       </SidebarMenuItem>
//     );
//   }

//   return (
//     <SidebarMenuItem>
//       <SidebarMenuButton asChild>
//         {item.url && (
//           <Link
//             to={item.url}
//             className={`flex items-center px-4 py-2 rounded-md ${
//               isActive
//                 ? "bg-[#1273B2]/10 text-[#1273B8]"
//                 : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
//             }`}
//             onClick={() => setActiveItem(item.title)}
//           >
//             <span>{item.title}</span>
//           </Link>
//         )}
//       </SidebarMenuButton>
//     </SidebarMenuItem>
//   );
// };

// export function AppSidebar({ assignedFeatures }: { assignedFeatures: any[] }) {
//   const [activeItem, setActiveItem] = useState<string>("");

//   // Group features by category and transform to MenuItem structure
//   const items: MenuItem[] = useMemo(() => {
//     if (!assignedFeatures || assignedFeatures.length === 0) {
//       return [];
//     }

//     // Group features by feat_category
//     const groupedFeatures = assignedFeatures.reduce((acc, item) => {
//       const feature = item.feat;
//       const category = feature.feat_category;
      
//       if (!acc[category]) {
//         acc[category] = [];
//       }
      
//       // Check if this feature already exists in the category to avoid duplicates
//       const existingFeature = acc[category].find((f: { title: string; url: string }) => f.title === feature.feat_name && f.url === feature.feat_url);
//       if (!existingFeature) {
//         acc[category].push({
//           title: feature.feat_name,
//           url: feature.feat_url,
//         });
//       }
      
//       return acc;
//     }, {} as Record<string, Array<{ title: string; url: string }>>);

//     // Transform grouped features to MenuItem structure
//     return (Object.entries(groupedFeatures) as [string, { title: string; url: string }[]][]).map(([category, features]) => {
//       // If only one feature in category, make it a direct link
//       if (features.length === 1) {
//         return {
//           title: category,
//           url: features[0].url,
//         };
//       }
      
//       // If multiple features, make it a dropdown
//       return {
//         title: category,
//         subItems: true,
//         url: "/",
//         items: features as import("./sidebarTypes").SubMenuItem[],
//       };
//     });
//   }, [assignedFeatures]);

//   return (
//     <Sidebar className="border-none">
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupContent>
//             <div className="w-full h-14"></div>
//             <SidebarMenu>
//               {items.map((item) => (
//                 <MenuItem
//                   key={item.title}
//                   item={item}
//                   activeItem={activeItem}
//                   setActiveItem={setActiveItem}
//                 />
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   );
// }

// export default AppSidebar;


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
      { title: "Resident", url: "/resident"},
      { title: "Family", url: "/family" },
      { title: "Household", url: "/household" },
      { title: "Business", url: "/business" },
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
    title: "Blotter",
    url: "/blotter-record",
  },
  {
    title: "Team",
    url: "/team",
  },
  {
    title: "Summon & Case Tracker",
    url: "/summon-and-case-tracking"
  },
  {
    title: "GAD",
    subItems: true,
    url: "/",
    items: [
      { title: "Budget Tracker", url: "/gad-budget-tracker-main"},
      { title: "Project Proposals", url: "/gad-project-proposal"},
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
    title: "Waste Personnel & Collection Vehicle",
    url: "/waste-personnel"
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
      { title: "Administrations", url: "/health-administration" },
      { title: "Doctor", url: "/mainMedicalForm" },
      { title: "Animal Bites", url: "/Animalbite_viewing" },
      { title: "Child Services", url: "/allChildHRTable" },
      { title: "Maternal Services", url: "/maternalrecords" },
      { title: "Family Planning", url: "/FamPlanning_table" },
      { title: "Medical Consultation", url: "/allMedRecords" },
      { title: "Vaccination", url: "/allRecordsForVaccine" },
      { title: "Patients Record", url: "/patients-record-main" },
      { title: "Family Profiling", url: "/family-profiling-main" },
      
      
      {
        title: "Inventory",
        url: "/",
        anotherItems: [
          { title: "Inventory List", url: "/mainInventoryList" },
          { title: "Inventory Stocks", url: "/mainInventoryStocks" },
          {title: "Transactions List", url: "/transactionMainInventoryList" },
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