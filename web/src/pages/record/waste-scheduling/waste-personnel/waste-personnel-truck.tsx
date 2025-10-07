import { useState, useEffect } from "react";
import { Truck, User, Trash2, Search } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useGetAllPersonnel, useGetTrucks } from "./queries/truckFetchQueries";
import { PersonnelCategory, Trucks } from "./waste-personnel-types";
import TruckManagement from "./waste-truck-form";
import { useLoading } from "@/context/LoadingContext";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useDebounce } from "@/hooks/use-debounce";

const WastePersonnelDashboard = () => {
  const [activeTab, setActiveTab] =
    useState<PersonnelCategory>("DRIVER LOADER");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { showLoading, hideLoading } = useLoading();

  const categoryDisplayNames: Record<PersonnelCategory, string> = {
    "DRIVER LOADER": "Driver Loader",
    LOADER: "Waste Loader",
    Trucks: "Collection Vehicles",
  };
  // Separate queries for counts (no search, no pagination)
  const { data: driverLoaderCount } = useGetAllPersonnel(
    1,
    1,
    "",
    "DRIVER LOADER",
    { enabled: true }
  );
  const { data: loaderCount } = useGetAllPersonnel(1, 1, "", "LOADER", {
    enabled: true,
  });

  const { data: trucksCountData } = useGetTrucks(1, 1, "", false, {
    enabled: true,
  });

  const { data: operationalTrucksData } = useGetTrucks(
  1, 
  1000,
  "", 
  false,
  { 
    enabled: true,
    select: (data: { results: Trucks[]; count: number }) => ({
      count: data.results.filter(truck => truck.truck_status === "Operational").length,
      total: data.count
    })
  }
);
const operationalTrucksCount = operationalTrucksData?.count || 0;

  // Main personnel query - only fetch when NOT on Trucks tab
  const {
    data: personnelData = { results: [], count: 0 },
    isLoading: isPersonnelLoading,
    isError: isPersonnelError,
  } = useGetAllPersonnel(
    currentPage,
    pageSize,
    debouncedSearchTerm,
    activeTab !== "Trucks" ? activeTab : undefined,
    {
      enabled: activeTab !== "Trucks",
    }
  );

  // Main trucks query - only fetch on Trucks tab
  const {
    data: trucksData = { results: [], count: 0 },
    isLoading: isTrucksLoading,
    isError: isTrucksError,
  } = useGetTrucks(
    activeTab === "Trucks" ? currentPage : 1,
    activeTab === "Trucks" ? pageSize : 100,
    activeTab === "Trucks" ? debouncedSearchTerm : "",
    false,
    { enabled: activeTab === "Trucks" }
  );

  const personnel = personnelData.results || [];
  const personnelCount = personnelData.count || 0;
  const trucksCount = trucksData.count || 0;

  const personnelColumns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      size: 200,
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("position")}</div>
      ),
      size: 150,
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => <div>{row.getValue("contact")}</div>,
      size: 150,
    },
  ];

  const preparedPersonnelData = personnel.map((p) => {
    const profile = p.staff?.profile;
    const personal = profile?.personal;

    // Check if position is in a different structure
    const position = p.staff?.pos || p.staff?.profile?.position;

    return {
      id: p.wstp_id.toString(),
      name: personal
        ? `${personal.fname || ""} ${personal.mname || ""} ${
            personal.lname || ""
          } ${personal.suffix || ""}`.trim()
        : "Unknown Name",
      position: position?.pos_title || "LOADER",
      contact: personal?.contact || "N/A",
      status: "Active",
    };
  });

  const totalPages =
    activeTab === "Trucks"
      ? Math.ceil(trucksCount / pageSize)
      : Math.ceil(personnelCount / pageSize);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value) || 10;
    setPageSize(newSize);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (isPersonnelLoading || isTrucksLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isPersonnelLoading, isTrucksLoading, showLoading, hideLoading]);

  const getCategoryIcon = (category: PersonnelCategory) => {
    switch (category) {
      case "DRIVER LOADER":
        return (
          <div className="relative">
            <User className="h-5 w-5" />
            <Truck className="h-3 w-3 absolute -bottom-1 -right-1" />
          </div>
        );
      case "LOADER":
        return <Trash2 className="h-5 w-5" />;
      case "Trucks":
        return <Truck className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: PersonnelCategory) => {
    switch (category) {
      case "DRIVER LOADER":
        return "bg-yellow-100 text-yellow-600";
      case "LOADER":
        return "bg-sky-100 text-sky-600";
      case "Trucks":
        return "bg-purple-100 text-purple-600";
    }
  };

  // Use static counts from separate queries
  const getCategoryCount = (category: PersonnelCategory) => {
    switch (category) {
      case "Trucks":
        return trucksCountData?.count || 0;
      case "DRIVER LOADER":
        return driverLoaderCount?.count || 0;
      case "LOADER":
        return loaderCount?.count || 0;
      default:
        return 0;
    }
  };

  if (isTrucksError || isPersonnelError) {
    return <div className="text-red-500 p-4">Error loading data</div>;
  }

  const currentCount = activeTab === "Trucks" ? trucksCount : personnelCount;

  return (
    <div className="w-full h-full p-4">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Waste Personnel & Collection Vehicles
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage waste management personnel and garbage collection vehicles.
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {(["DRIVER LOADER", "LOADER", "Trucks"] as PersonnelCategory[]).map(
          (category) => (
            <div
              key={category}
              className="border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 bg-white"
            >
              <div className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${getCategoryColor(category)}`}
                  >
                    {getCategoryIcon(category)}
                  </div>
                  <span className="text-2xl font-semibold">
                    {getCategoryCount(category)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium">
                    {categoryDisplayNames[category]}
                  </h3>
                  {category === "Trucks" && (
                    <div className="flex items-center gap-1 text-sm text-purple-600">
                      <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                       <span>
                      Operational: {operationalTrucksCount}
                    </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <div className="w-full bg-white border border-gray rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4 border-b">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={17}
              />
              <Input
                placeholder={`Search ${
                  activeTab === "Trucks" ? "trucks" : "personnel"
                }...`}
                className="pl-10 bg-white w-full"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as PersonnelCategory);
              setCurrentPage(1);
              setSearchTerm("");
            }}
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="DRIVER LOADER">Driver Loaders</TabsTrigger>
              <TabsTrigger value="LOADER">Loaders</TabsTrigger>
              <TabsTrigger value="Trucks">Vehicles</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4">
          {isPersonnelLoading || (activeTab === "Trucks" && isTrucksLoading) ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <Tabs value={activeTab} className="w-full">
                <TabsContent value="DRIVER LOADER" className="m-0">
                  <DataTable
                    columns={personnelColumns}
                    data={preparedPersonnelData}
                  />
                </TabsContent>
                <TabsContent value="LOADER" className="m-0">
                  <DataTable
                    columns={personnelColumns}
                    data={preparedPersonnelData}
                  />
                </TabsContent>
                <TabsContent value="Trucks" className="m-0">
                  <TruckManagement
                    searchTerm={debouncedSearchTerm}
                    currentPage={currentPage}
                    pageSize={pageSize}
                  />
                </TabsContent>
              </Tabs>

              {currentCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 border-t">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm">Show</p>
                    <Input
                      type="number"
                      className="w-14 h-8"
                      value={pageSize}
                      onChange={handlePageSizeChange}
                    />
                    <p className="text-xs sm:text-sm">Entries</p>
                  </div>

                  <p className="text-xs sm:text-sm font-normal text-darkGray">
                    Showing {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, currentCount)} of{" "}
                    {currentCount} rows
                  </p>

                  {currentCount > 0 && totalPages > 1 && (
                    <div className="w-full sm:w-auto flex justify-center">
                      <PaginationLayout
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WastePersonnelDashboard;

