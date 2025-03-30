import { Search, Plus, FileInput } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { DataTable } from "@/components/ui/table/data-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { businessColumns } from "./BusinessColumns";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";

export default function BusinessRecords() {



  return (
    <MainLayoutComponent
      title="Business Records"
      description="View and manage registered businesses, including their details, location, and registration information."
    >
      <div className="hidden lg:flex justify-between items-center gap-2 mb-4">
				<div className="relative flex-1 bg-white">
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
						size={17}
					/>
					<Input
						placeholder="Search..."
						className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
						value={""}
						onChange={() => {}}
					/>
				</div>
				<Link to="/business-form">
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
              value={""}
              onChange={() => {}}
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
          <DataTable columns={businessColumns()} data={[]} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">Showing 0 rows</p>
          <PaginationLayout />
        </div>
      </div>
    </MainLayoutComponent>
  );
}
