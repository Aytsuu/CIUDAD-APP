import { Link } from "react-router-dom";
import { useGetBlotter } from "./blotter-hooks";
import { Button } from "@/components/ui/button/button";
import { BsChevronLeft } from "react-icons/bs";

export default function BlotterRecord (): JSX.Element {
  const {data: blotter, isLoading, error } =useGetBlotter();

  if (isLoading) { 
    return (
      <div className="w-full p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
        <p className="mt-4 text-gray-500">Loading blotter record...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-red-500 mb-2">Error: {error instanceof Error ? error.message : "Failed to load record"}</p>
        <p className="text-gray-500 mb-4">The requested blotter record could not be found or there was an error loading it.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-row mb-4 sm:mb-0">
            <div className="flex items-center mr-4">
              <Button className="text-black p-2 self-start" variant="outline">
                <Link to="/blotter-record">
                  <BsChevronLeft />
                </Link>
              </Button>
            </div>
            <div>
              <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                Barangay Blotter Report
              </h1>
              <p className="text-xs sm:text-sm text-darkGray">ID: {blotter?.data?.id || "ID unavailable"}</p>
              {/* <p className="text-xs sm:text-sm text-darkGray">Filed: {formattedCreatedDate}</p> */}
            </div>
          </div>
          <div className="flex items-center">
            <span 
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                blotter?.data?.bc_status === 'Resolved' 
                  ? 'bg-green-100 text-green-800' 
                  : blotter?.data?.bc_status === 'Pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {blotter?.data?.bc_status || "Status unavailable"}
            </span>
          </div> 
        </div>

        <div className="space-y-6">
          {/* People Involved Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Complainant Card */}
            <div className="border rounded-lg p-5 bg-white shadow-sm">
              <h3 className="font-medium text-lg mb-4 text-darkBlue2 border-b pb-2">
                Complainant Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-darkGray block mb-1">Full Name</label>
                  <div className="p-3 bg-gray-50 rounded border">{blotter?.data?.bc_complainant || "Not specified"}</div>
                </div>
                <div>
                  <label className="text-sm text-darkGray block mb-1">Address</label>
                  <div className="p-3 bg-gray-50 rounded border">{blotter?.data?.bc_cmplnt_address || "Not specified"}</div>
                </div>
              </div>
            </div>

            {/* Accused Card */}
            <div className="border rounded-lg p-5 bg-white shadow-sm">
              <h3 className="font-medium text-lg mb-4 text-darkBlue2 border-b pb-2">
                Accused Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-darkGray block mb-1">Full Name</label>
                  <div className="p-3 bg-gray-50 rounded border">{blotter?.data?.bc_accused || "Not specified"}</div>
                </div>
                <div>
                  <label className="text-sm text-darkGray block mb-1">Address</label>
                  <div className="p-3 bg-gray-50 rounded border">{blotter?.data?.bc_accused_address || "Not specified"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Details */}
          <div className="border rounded-lg p-5 bg-white shadow-sm">
            <h3 className="font-medium text-lg text-darkBlue2 mb-4 border-b pb-2">
              Incident Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-darkGray block mb-1">Category</label>
                <div className="p-3 bg-gray-50 rounded border">{blotter?.data?.bc_incident_type || "Not specified"}</div>
              </div>
              <div>
                <label className="text-sm text-darkGray block mb-1">Date of Incident</label>
                <div className="p-3 bg-gray-50 rounded border">{blotter?.data?.formattedIncidentDate}</div>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm text-darkGray block mb-1">Incident Description</label>
              <div className="p-3 bg-gray-50 rounded border min-h-24 whitespace-pre-wrap">
                {blotter?.data?.bc_allegation || "No description provided"}
              </div>
            </div>
            {/* <div>
              <label className="text-sm text-darkGray block mb-1">Handling Officer</label>
              <div className="p-3 bg-gray-50 rounded border">{bc_officer || "Not assigned"}</div>
            </div> */}
          </div>

          {/* Actions Footer */}
          <div className="flex justify-end gap-4 mt-8 print:hidden">
            <Link to="/blotter-record">
              <Button variant="outline" className="px-6">
                Back to Records
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}