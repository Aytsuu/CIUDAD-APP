import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/ui/loading";


export default function ComplaintTable({ data, columns }: any) {
  const [pageSizeInput, setPageSizeInput] = useState("10");
  const [pageSize, setPageSize] = useState(10);
  const { user } = useAuth();

  useEffect(() => {
    setPageSizeInput(pageSize.toString());
  }, [pageSize]);

  const applyPageSize = () => {
    const newSize = parseInt(pageSizeInput, 10);
    if (!isNaN(newSize) && newSize > 0) {
      setPageSize(Math.min(newSize, 100)); 
    } else {
      setPageSizeInput(pageSize.toString()); 
    }
  };

  const paginatedData = data.slice(0, pageSize);

  return (
    <div className="w-full flex flex-col">
      <div className="w-full h-auto bg-white flex flex-wrap gap-4 items-center justify-start p-3">
        {/* Show Entries Input */}
        <div className="flex gap-x-2 items-center">
          <p className="text-xs sm:text-sm">Show</p>
          <Input
            type="number"
            min="1"
            max="100"
            className="w-14 h-8"
            value={pageSizeInput}
            onChange={(e) => setPageSizeInput(e.target.value)}
            onBlur={applyPageSize}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyPageSize();
            }}
          />
          <p className="text-xs sm:text-sm">Entries</p>
        </div>

        
      </div>

      <div className="bg-white">
        <DataTable columns={columns} data={paginatedData} />
      </div>
    </div>
  );
}
