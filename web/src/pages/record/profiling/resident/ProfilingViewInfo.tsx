import { Link } from "react-router";
import { BsChevronLeft } from "react-icons/bs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";


export default function ProfileViewInfo() {
  {/* Sample Data */}
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            {/* Header - Stacks vertically on mobile */}
            <Button 
              className="text-black p-2 self-start"
              variant={"outline"}
              onClick={() => navigate(-1)}
            >
              <BsChevronLeft />
            </Button>
            <div className="flex flex-col">
              <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                Resident Details
              </h1>
              <p className="text-xs sm:text-sm text-darkGray">
                View resident information
              </p>
            </div>  
          </div>
      </div>

      <hr className="h-2 bg-darkBlue1 my-6 rounded-full" />
      
      {/* Sections */}
      <div className="w-full space-y-6 bg-white rounded-lg shadow-sm">
        <section className="p-4 md:p-6 border-b-2 border-darkBlue1">
          <h2 className="font-semibold text-xl text-darkBlue2 mb-4">
            Profile
          </h2>
          <div className="flex items-center gap-4">
            <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center">
              <span className="text-sm text-gray-500">No Image</span>
            </div>
            <div>
              <h3 className="text-lg font-medium">Christian</h3>
              <span className="text-sm text-gray-600">ID: RES-2023-001</span>
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className="p-4 md:p-6 border-b-2 border-darkBlue1">
          <h2 className="font-semibold text-xl text-darkBlue2 mb-4">
            Personal Information
          </h2>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {
              personal.map((info) => (
                <div key={info.id}>
                  <label className="block text-sm font-medium text-darkGray mb-1">
                    {info.label}
                  </label>
                  <Input
                    type="text"
                    value={info.value}
                    readOnly
                  />
                </div>
              ))
            }
          </div>
        </section>
      </div>
    </div>
  );
}