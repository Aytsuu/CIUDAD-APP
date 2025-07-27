import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { ChevronDown, FileInput, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { DataTable } from "@/components/ui/table/data-table";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";

export default function ComplaintTable({ data, columns, isLoading }: any) {
  const [pageSizeInput, setPageSizeInput] = useState("10");
  const [pageSize, setPageSize] = useState(10);
  const [rowSelection, setRowSelection] = useState({});
  const showEntriesOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ];

  useEffect(() => {
    setPageSizeInput(pageSize.toString());
  }, [pageSize]);

  const paginatedData = data?.slice(0, pageSize) || [];

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="w-full flex flex-col">
      <div className="w-full h-auto bg-white flex flex-wrap gap-4 items-center p-3">
        {/* Show Entries Input */}
        <div className="flex gap-x-2 items-center border-r-2 border-gray pr-4 min-w-[200px]">
          <p className="text-xs sm:text-sm">Show</p>
          <DropdownLayout
            className="text-darkGray"
            trigger={
              <Button variant="outline" className="h-8 w-20 justify-between">
                {pageSizeInput}
                <ChevronDown size={16} />
              </Button>
            }
            options={showEntriesOptions.map((option) => ({
              id: option.value,
              name: option.label,
            }))}
            onSelect={(value) => {
              setPageSizeInput(value);
              const newSize = parseInt(value, 10);
              if (!isNaN(newSize) && newSize > 0) {
                setPageSize(Math.min(newSize, 100));
              }
            }}
          />
          <p className="text-xs sm:text-sm">Entries</p>
        </div>
        
        <div className={`flex gap-2 transition-opacity duration-200 ${selectedCount > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Button
            variant="destructive"
            className="border-2 border-red-100 text-darkGray bg-red-100 hover:bg-red-400 hover:text-white"
            onClick={() => {
              console.log("Selected rows: ", rowSelection)
            }}
          >
            <Trash2 size={16} />
            {selectedCount == 1
              ? `Delete ${selectedCount} row`
              : `Delete ${selectedCount} rows`}
          </Button>

          <Link to="/complaint/archive">
            <Button variant="outline" className="gap-2 text-darkGray">
              <FileInput size={16} className="text-gray-400" />
              <span>Export</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white">
        <DataTable
          columns={columns}
          data={paginatedData}
          isLoading={isLoading}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  );
}