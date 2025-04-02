import { Search, Plus, FileInput } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { DataTable } from "@/components/ui/table/data-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { businessColumns } from "./BusinessColumns";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { useQuery } from "@tanstack/react-query";
import { getBusiness, getSitio } from "../restful-api/profilingGetAPI";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function BusinessRecords() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // Fetching businesses from database
  const { data: businesses, isLoading: isLoadingBusinesses } = useQuery({
    queryKey: ["businesses"],
    queryFn: getBusiness,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Fetching sitio from database
  const { data: sitio, isLoading: isLoadingSitio } = useQuery({
    queryKey: ["sitio"],
    queryFn: getSitio,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Formatting business data (for table)
  const formatBusinessData = React.useCallback(() => {
    if (!businesses) return [];

    return businesses.map((business: any) => {
      // Respondent Name
      const lname = business.bus_respondentLname;
      const fname = business.bus_respondentFname;
      const mname = business.bus_respondentMname;
      const fullName = `${lname}, ${fname} ${
        mname ? mname.slice(0, 1) + "." : ""
      }`;

      return {
        id: business.bus_id || "-",
        name: business.bus_name || "-",
        grossSales: String(business.bus_gross_sales) || "-",
        sitio: business.sitio.sitio_name || "-",
        street: business.bus_street || "-",
        respondent: fullName || "-",
        dateRegistered: business.bus_date_registered || "-",
        registeredBy: business.staff || "-",
      };
    });
  }, [businesses]);


  // Filtering business data (for searching)
  const filteredBusinesses = React.useMemo(() => {
    const formattedData = formatBusinessData();
    if (!formattedData.length) return [];

    return formattedData.filter((record: any) =>
      Object.values(record)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, businesses]);

  // Total pages 
  const totalPages = Math.ceil(filteredBusinesses.length / pageSize);

  // Slicing the data for pagination
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoadingBusinesses || isLoadingSitio) {
    return (
      <div className="w-full h-full"> 
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <Skeleton className="h-10 w-full mb-4 opacity-30" />
        <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
      </div>
    );
  }

  return (
    <MainLayoutComponent
      title="Business Records"
      description="View and manage registered businesses, 
              including their details, location, and registration information."
    >
      <div className="hidden lg:flex justify-between items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
            size={17}
          />
          <Input
            placeholder="Search..."
            className="pl-10 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Link
          to="/business-form"
          state={{
            params: {
              type: "registration",
              sitio: sitio
            },
          }}
        >
          <Button>
            <Plus size={15} /> Register
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-md">
        <div className="flex justify-between p-3">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-6"
              value={pageSize}
              onChange={(e) => {
                if (+e.target.value < 0) {
                  setPageSize(1);
                } else {
                  setPageSize(+e.target.value);
                }
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <DropdownLayout
            trigger={
              <Button variant="outline">
                <FileInput className="mr-2" /> Export
              </Button>
            }
            options={[
              { id: "", name: "Export as CSV" },
              { id: "", name: "Export as Excel" },
              { id: "", name: "Export as PDF" },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <DataTable columns={businessColumns(businesses, sitio)} data={paginatedBusinesses} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredBusinesses.length)} of{" "}
            {filteredBusinesses.length} rows
          </p>
          <PaginationLayout
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </MainLayoutComponent>
  );
}
