import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Search, ArrowLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import { getIssuedCertificates } from "./restful-api/issuedCertGetAPI";

type IssuedCertificate = {
  requester: string;
  dateIssued: string;
  purpose: string;
  fileUrl: string;
};

function IssuedCertificates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("All");
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);

  const handleViewFile = (fileUrl: string) => {
    setSelectedFileUrl(fileUrl);
  };

  const handleBack = () => {
    setSelectedFileUrl(null);
  };

  const columns: ColumnDef<IssuedCertificate>[] = [
    {
      accessorKey: "requester",
      header: "Requester",
      cell: ({ row }) => <div className="capitalize">{row.getValue("requester")}</div>,
    },
    {
      accessorKey: "dateIssued",
      header: "Date Issued",
      cell: ({ row }) => {
        const dateStr = row.getValue("dateIssued") as string;
        try {
          const date = parseISO(dateStr);
          return <div>{format(date, "MM/dd/yyyy")}</div>;
        } catch (e) {
          console.error("Error formatting date:", e);
          return <div>{dateStr || ""}</div>;
        }
      },
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => <div>{row.getValue("purpose")}</div>,
    },
    {
      accessorKey: "fileUrl",
      header: "File",
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          onClick={() => row.original && handleViewFile(row.original.fileUrl)}
          className="text-darkBlue2 hover:text-white hover:bg-darkBlue2"
        >
          View File
        </Button>
      ),
    },
  ];

  const { data: certificates, isLoading, error } = useQuery({
    queryKey: ["issuedCertificates"],
    queryFn: getIssuedCertificates,
  });

  // Filter certificates based on search query and filter value
  const filteredCertificates = certificates?.filter((cert: IssuedCertificate) => {
    const matchesSearch = cert.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterValue === "All" || cert.purpose === filterValue;
    return matchesSearch && matchesFilter;
  });

  // If a file is selected, show the PDF viewer
  if (selectedFileUrl) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleBack}
            className="bg-[#1273B8] text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow hover:bg-[#0e5a8f] transition-colors"
          >
            <ArrowLeft size={20} /> Back
          </button>
        </div>
        <div className="flex-1 w-full bg-white">
          <iframe
            src={selectedFileUrl}
            className="w-full h-[calc(100vh-120px)]"
            title="PDF Viewer"
          />
        </div>
      </div>
    );
  }

  // Otherwise show the table view
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Issued Certifications</h1>
        <p className="text-xs sm:text-sm text-darkGray">Collection of issued certifications.</p>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <div className="relative w-full flex justify-between items-center mb-4">
        <div className="flex gap-x-2">
          <div className="relative flex-1 bg-white">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input 
              placeholder="Search..." 
              className="pl-10 w-72" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <SelectLayout
            placeholder="Filter by"
            label=""
            className="bg-white"
            options={[
              { id: "all", name: "All" },
              { id: "nso", name: "NSO/SSS/GSIS" },
              { id: "residential", name: "Residential Permit" },
              { id: "residency", name: "Residency" },
            ]}
            value={filterValue}
            onChange={(value) => setFilterValue(value)}
          />
        </div>
      </div>

      <div className="w-full flex flex-col">
        <div className="w-full h-auto bg-white p-3">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input type="number" className="w-14 h-8" defaultValue="10" />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        <div className="bg-white w-full overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-5">Loading certificates...</div>
          ) : error ? (
            <div className="text-center py-5 text-red-500">Error loading data</div>
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredCertificates || []} 
              header={true} 
            />
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing 1-10 of {filteredCertificates?.length || 0} rows
        </p>
      </div>
    </div>
  );
}

export default IssuedCertificates; 