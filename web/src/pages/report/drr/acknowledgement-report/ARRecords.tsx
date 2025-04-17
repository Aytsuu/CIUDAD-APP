// Import necessary components and icons
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { acknowledgeReportColumns } from "../DRRColumns";
import { Link } from "react-router";

// Main component for the DRR Acknowledgement Report
export default function AcknowledgementReport() {
  return (
    <MainLayoutComponent
      title="Acknowledgement Reports"
      description="Manage and view acknowledgement reports"
    >
      <div className="relative w-full lg:flex justify-between items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
            size={17}
          />
          <Input placeholder="Search..." className="pl-10 w-full bg-white" />
        </div>
        <Link to="/drr/acknowledgement-report/form">
          <Button>
            <Plus />Create Report
          </Button>
        </Link>
      </div>

      <div className="w-full flex flex-col">
        <div className="w-full h-auto bg-white flex p-3">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input type="number" className="w-14 h-8" defaultValue="10" />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        <div className="bg-white">
          <DataTable columns={acknowledgeReportColumns} data={[]} />
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            {/* Showing Rows Info */}
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing 1-10 of 150 rows
            </p>

            {/* Pagination */}
            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout 
                
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayoutComponent>
  );
}
