import { BsChevronLeft } from "react-icons/bs";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router-dom";

export function BlotterViewSkeleton() {
  return (
    <div className="w-full h-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex flex-row mb-4 sm:mb-0">
          <div className="flex items-center mr-4">
            <Button className="text-black p-2 self-start" variant="outline">
              <Link to="/blotter-record">
                <BsChevronLeft />
              </Link>
            </Button>
          </div>
          <div>
            <div className="h-7 w-48 bg-gray-200 rounded-md animate-pulse mb-1"></div>
            <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse mb-1"></div>
            <div className="h-4 w-40 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <div className="h-10 w-28 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />

      {/* Complainant and Accused Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Complainant Card */}
        <div className="border rounded-md p-4 bg-white">
          <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse mb-4"></div>
          <div className="space-y-3">
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse mb-1"></div>
              <div className="h-5 w-48 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse mb-1"></div>
              <div className="h-5 w-full max-w-md bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Accused Card */}
        <div className="border rounded-md p-4 bg-white">
          <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse mb-4"></div>
          <div className="space-y-3">
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse mb-1"></div>
              <div className="h-5 w-48 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse mb-1"></div>
              <div className="h-5 w-full max-w-md bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Details */}
      <div className="border rounded-md p-4 bg-white mb-6">
        <div className="h-6 w-36 bg-gray-200 rounded-md animate-pulse mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse mb-1"></div>
            <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse mb-1"></div>
            <div className="h-5 w-48 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
        <div>
          <div className="h-4 w-40 bg-gray-200 rounded-md animate-pulse mb-1"></div>
          <div className="h-24 w-full bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Supporting Documents */}
      <div className="border rounded-md p-4 bg-white mb-6">
        <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="border rounded-md p-2 flex flex-col">
              <div className="w-full h-40 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 w-32 mx-auto bg-gray-200 rounded-md animate-pulse mb-1"></div>
              <div className="h-4 w-24 mx-auto bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}