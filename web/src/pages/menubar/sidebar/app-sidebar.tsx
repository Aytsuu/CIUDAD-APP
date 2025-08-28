import React, { useState, useMemo } from "react";
import { Link } from "react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SidebarSkeleton from "./sidebar-skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar";

interface Feature {
  feat_name: string;
  feat_url: string;
  feat_category: string;
  feat_group: string;
}

interface GroupedFeatures {
  [category: string]: Feature[];
}

export function AppSidebar() {
  const [activeItem, setActiveItem] = useState<string>("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // Memoize user permission checks for better performance
  const userPermissions = useMemo(() => {
    if (!user?.staff?.pos) {
      return { isAdmin: false, features: [] };
    }

    const positionTitle = user.staff.pos.pos_title;
    const isAdmin = positionTitle === "Admin";
    
    // For admin, return all features or use the features already provided
    if (isAdmin) {
      return { 
        isAdmin: true, 
        features: user.staff.features || [] 
      };
    }

    // For non-admin, use the features from assignments
    return { 
      isAdmin: false, 
      features: user.staff.features || [] 
    };
  }, [user]);

  // Admin static menu items (unchanged)
  const adminItems = [
    { title: "Dashboard", url: "/dashboard" },
    { title: "Calendar", url: "/waste-calendar-scheduling" },
    { title: "Administration", url: "/administration" },
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
            { title: "Household", url: "/profiling/household" },
          ]
        },
        {
          title: "Business", 
          url: "/profiling/business/record",
          items: [
            { title: "Respondent", url: "/profiling/business/record/respondent"}
          ]
        },
      ],
    },
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
    { title: "Complaint", url: "/complaint" },
    { title: "Team", url: "/team" },
    { title: "Summon & Case Tracker", url: "/summon-and-case-tracking" },
    {
      title: "GAD",
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
        { title: "Income & Expense Tracking", url: "/treasurer-income-expense-main" },
        { title: "Income & Disbursement", url: "/treasurer-income-and-disbursement" },
        {
          title: "Clearance Requests",
          url: "/",
          items: [
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
    { title: "Donation", url: "/donation-record" },
    { title: "Illegal Dumping Reports", url: "/waste-illegaldumping-report" },
    { title: "Garbage Pickup Request", url: "/garbage-pickup-request" },
    { title: "Waste Personnel & Collection Vehicle", url: "/waste-personnel" },
    { title: "Announcement", url: "/announcement" },
    {
      title: "Services",
      url: "/",
      items: [
        { title: "Administration", url: "/health-administration" },
        { title: "Patients Record", url: "/patients-record-main" },
        {
          title: "Forwarded Records",
          url: "/",
          items: [
            { title: "Child Immunization", url: "/forwarded-child-health-immunization" },
            { title: "Vaccine Waitlist", url: "/forwarded-vaccine-waitlist" },
            { title: "Step 2: Vitals Queue", url: "/forwarded-vitals-queue" },
            { title: "Medical Consultation", url: "/forwarded-medical-consultation" },
          ],
        },
        {
          title: "Manage Request",
          url: "/",
          items: [
            { title: "Medicine Request", url: "/medicine-requests" },
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
        { title: "Firstaid Record", url: "/all-firstaid-records" },
        { title: "Archive", url: "/archiveMainInventoryStocks" },
        { title: "Schedules", url: "/health-appointments" },
        { title: "Service Scheduler", url: "/health-services/scheduler" },
        { title: "Reports", url: "/healthcare-reports" },
        {
          title: "Inventory",
          url: "/",
          items: [
            { title: "Inventory List", url: "/mainInventoryList" },
            { title: "Inventory Stocks", url: "/mainInventoryStocks" },
            { title: "Transactions List", url: "/transactionMainInventoryList" },
          ],
        },
        {
          title: "Queueing",
          url: "/",
          items: [
            { title: "Patients Queue", url: "/patientsQueue" },
            { title: "Processing Queue", url: "/processingQueue" },
          ],
        },
      ],
    },
    {
      title: "Clerk",
      url: "/",
      items: [
        { title: "Certifications", url: "record/clearances/certification" },
        { title: "Business Permits", url: "record/clearances/businesspermit" },
        { title: "Issued Certificates", url: "record/clearances/issuedcertificates" },
      ],
    },
    { title: "Activity Log", url: "/record/activity-log" },
  ];

  // Static items shown to non-admin users
  const staticItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Announcement", path: "/announcement" },
  ];

  // Memoize grouped features for better performance
  const groupedFeatures = useMemo<GroupedFeatures>(() => {
    const features = userPermissions.features;
    if (!features || features.length === 0) return {};

    return features.reduce((acc: GroupedFeatures, feat: Feature) => {
      if (!feat?.feat_group) return acc;
      
      if (!acc[feat.feat_group]) {
        acc[feat.feat_group] = [];
      }
      acc[feat.feat_group].push(feat);
      return acc;
    }, {} as GroupedFeatures);
  }, [userPermissions.features]);

  // Optimized category toggle handler
  const toggleCategory = (category: string) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Helper function to check if category is open
  const isCategoryOpen = (category: string) => openCategories.has(category);

  // Optimized admin menu item renderer
  const renderAdminMenuItem = (item: any, level: number = 0) => {
    const hasChildren = item.items && item.items.length > 0;
    const paddingLeft = level * 16;
    const isOpen = isCategoryOpen(item.title);

    if (hasChildren) {
      return (
        <SidebarMenuItem key={item.title}>
          <div
            className={`w-full cursor-pointer rounded-md transition-colors ${
              isOpen
                ? "bg-[#1273B2]/10 text-[#1273B8]"
                : "text-[#2D4A72] hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
            }`}
            onClick={() => toggleCategory(item.title)}
            style={{ paddingLeft: `${20 + paddingLeft}px` }}
          >
            <div className="flex items-center justify-between px-4 py-2 rounded-md">
              <Link
                to={item.url}
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveItem(item.title);
                }}
              >
                {item.title}
              </Link>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </div>

          {isOpen && (
            <div className="mt-1 space-y-1" style={{ paddingLeft: `${level === 0 ? 16 : 0}px` }}>
              {item.items.map((subItem: any) => renderAdminMenuItem(subItem, level + 1))}
            </div>
          )}
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild className="w-full">
          <Link
            to={item.url}
            className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
              activeItem === item.title
                ? "bg-[#1273B2]/10 text-[#1273B8]"
                : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
            }`}
            style={{ paddingLeft: `${20 + paddingLeft}px` }}
            onClick={() => setActiveItem(item.title)}
          >
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  // Optimized feature-based menu item renderer
  const renderFeatureMenuItem = (feat: Feature) => {
    // Handle special cases for Resident with sub-items
    if (feat.feat_name.toLowerCase() === "resident") {
      const isResidentOpen = isCategoryOpen("Resident");
      
      return (
        <div key="resident">
          <SidebarMenuButton asChild className="w-full flex items-center justify-between">
            <div
              className={`flex items-center w-full px-4 py-2 text-sm rounded-md cursor-pointer transition-colors ${
                activeItem === "Resident"
                  ? "bg-[#1273B2]/10 text-[#1273B8]"
                  : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
              }`}
              onClick={() => {
                setActiveItem("Resident");
                toggleCategory("Resident");
              }}
            >
              <Link
                to={feat.feat_url}
                className="flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                Resident
              </Link>
              {isResidentOpen ? (
                <ChevronDown className="h-4 w-4 ml-2" />
              ) : (
                <ChevronRight className="h-4 w-4 ml-2" />
              )}
            </div>
          </SidebarMenuButton>

          {isResidentOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <SidebarMenuButton asChild className="w-full">
                <Link
                  to="/profiling/family"
                  className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                    activeItem === "Family"
                      ? "bg-[#1273B2]/10 text-[#1273B8]"
                      : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
                  }`}
                  onClick={() => setActiveItem("Family")}
                >
                  Family
                </Link>
              </SidebarMenuButton>

              <SidebarMenuButton asChild className="w-full">
                <Link
                  to="/profiling/household"
                  className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                    activeItem === "Household"
                      ? "bg-[#1273B2]/10 text-[#1273B8]"
                      : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
                  }`}
                  onClick={() => setActiveItem("Household")}
                >
                  Household
                </Link>
              </SidebarMenuButton>
            </div>
          )}
        </div>
      );
    }

    // Handle special cases for Business with sub-items
    if (feat.feat_name.toLowerCase() === "business") {
      const isBusinessOpen = isCategoryOpen("Business");
      
      return (
        <div key="business">
          <SidebarMenuButton asChild className="w-full flex items-center justify-between">
            <div
              className={`flex items-center w-full px-4 py-2 text-sm rounded-md cursor-pointer transition-colors ${
                activeItem === "Business"
                  ? "bg-[#1273B2]/10 text-[#1273B8]"
                  : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
              }`}
              onClick={() => {
                setActiveItem("Business");
                toggleCategory("Business");
              }}
            >
              <Link
                to={feat.feat_url}
                className="flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                Business
              </Link>
              {isBusinessOpen ? (
                <ChevronDown className="h-4 w-4 ml-2" />
              ) : (
                <ChevronRight className="h-4 w-4 ml-2" />
              )}
            </div>
          </SidebarMenuButton>

          {isBusinessOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <SidebarMenuButton asChild className="w-full">
                <Link
                  to="/profiling/business/record/respondent"
                  className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                    activeItem === "BusinessRespondent"
                      ? "bg-[#1273B2]/10 text-[#1273B8]"
                      : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
                  }`}
                  onClick={() => setActiveItem("BusinessRespondent")}
                >
                  Respondent
                </Link>
              </SidebarMenuButton>
            </div>
          )}
        </div>
      );
    }

    // Default feature item
    return (
      <SidebarMenuButton key={feat.feat_name} asChild className="w-full">
        <Link
          to={feat.feat_url}
          className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
            activeItem === feat.feat_name
              ? "bg-[#1273B2]/10 text-[#1273B8]"
              : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
          }`}
          onClick={() => setActiveItem(feat.feat_name)}
        >
          <span>{feat.feat_name}</span>
        </Link>
      </SidebarMenuButton>
    );
  };

if (!user) {
    return (
      <SidebarSkeleton/>
    );
  }

  return (
    <Sidebar className="border-none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="w-full h-14" />
            <SidebarMenu>
              {userPermissions.isAdmin ? (
                // Render admin menu
                adminItems.map((item) => renderAdminMenuItem(item))
              ) : (
                // Render feature-based menu for non-admin users
                <>
                  {/* Static Menu for non-admin */}
                  {staticItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild className="w-full">
                        <Link
                          to={item.path}
                          className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                            activeItem === item.label
                              ? "bg-[#1273B2]/10 text-[#1273B8]"
                              : "hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
                          }`}
                          onClick={() => setActiveItem(item.label)}
                        >
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                  {/* Dynamic Feature Groups for non-admin */}
                  {Object.entries(groupedFeatures).map(([category, feats]) => {
                    // Filter and modify features as needed
                    let modifiedFeats = feats.filter(
                      (f) =>
                        f.feat_name.toLowerCase() !== "family" &&
                        f.feat_name.toLowerCase() !== "household"
                    );

                    // Add "All" under Profiling if both Resident + Business exist
                    if (
                      category.toLowerCase() === "profiling" &&
                      feats.some((f) => f.feat_name.toLowerCase() === "resident") &&
                      feats.some((f) => f.feat_name.toLowerCase() === "business")
                    ) {
                      modifiedFeats = [
                        {
                          feat_name: "All",
                          feat_url: "/profiling/all",
                          feat_category: "Profiling",
                          feat_group: "Profiling",
                        },
                        ...modifiedFeats,
                      ];
                    }

                    const isCatOpen = isCategoryOpen(category);

                    return (
                      <SidebarMenuItem key={category}>
                        {/* Category Toggle */}
                        <div
                          className={`w-full cursor-pointer rounded-md transition-colors ${
                            isCatOpen
                              ? "bg-[#1273B2]/10 text-[#1273B8]"
                              : "text-[#2D4A72] hover:bg-[#1273B2]/10 hover:text-[#1273B8]"
                          }`}
                          onClick={() => toggleCategory(category)}
                        >
                          <div className="flex items-center justify-between px-4 py-2 rounded-md">
                            <span>{category}</span>
                            {isCatOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </div>

                        {/* Features inside category */}
                        {isCatOpen && (
                          <div className="ml-4 mt-1 space-y-1">
                            {modifiedFeats.map((feat) => renderFeatureMenuItem(feat))}
                          </div>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;