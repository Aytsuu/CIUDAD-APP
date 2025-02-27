import { Link } from "react-router";
import { BsChevronLeft } from "react-icons/bs";
import { Button } from "../../components/ui/button";

export default function ViewInfo() {
  {/* Sample Data */}
  const resident = { fullName: "Christian", dob: "25/01/2004" };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-x-3">
          <Link
            to="/"
            className="text-black p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <BsChevronLeft />
          </Link>
          <div className="flex flex-col">
            <h1 className="font-semibold text-2xl text-darkBlue2">
              Resident Details
            </h1>
            <p className="text-sm text-darkGray">Uploaded via Mobile Phone</p>
            <p className="text-sm text-darkGray">
              {new Date().toLocaleDateString("en-PH")}
            </p>
          </div>
        </div>
        <div className="flex gap-x-4">
            <Button variant={"destructive"} className="rounded-md shadow-sm">Reject</Button>
            <Button className="bg-green-600 hover:bg-green-500 rounded-md shadow-sm">Approve</Button>
        </div>
      </div>

      <hr className="h-2 bg-darkBlue1 my-6 rounded-full" />
      
      {/* Sections */}
      <div className="w-full space-y-6 bg-white rounded-lg shadow-sm">
        <section className="p-4 md:p-6 border-b-2 border-darkBlue1">
          <h2 className="font-semibold text-xl text-darkBlue2 mb-4">
            Resident Profile
          </h2>
          <div className="flex items-center gap-4">
            <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center">
              <span className="text-sm text-gray-500">No Image</span>
            </div>
            <div>
              <h3 className="text-lg font-medium">{resident.fullName}</h3>
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
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={resident.fullName}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                First Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Suffix
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Sex
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Status
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Date of Birth
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Place of Birth
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Citizenship
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Contact
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Religion
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          </div>
        </section>

        {/* Parents Information */}
        <section className="p-4 md:p-6 border-b-2 border-darkBlue1">
          {/* Father's Information */}
          <h2 className="font-semibold text-xl text-darkBlue2 mb-4">
            Father's Information
          </h2>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={resident.fullName}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                First Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Suffix
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Date of Birth
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Status
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Religion
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Educational Attainment
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          </div>
        </section>

        {/* Mother's Information */}
        <section className="p-4 md:p-6 border-b-2 border-darkBlue1">
          <h2 className="font-semibold text-xl text-darkBlue2 mb-4">
            Mother's Information
          </h2>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={resident.fullName}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                First Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Suffix
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Date of Birth
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Status
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Religion
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Educational Attainment
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          </div>
        </section>

        {/*Dependents Information */}
        <section className="p-4 md:p-6">
          <h2 className="font-semibold text-xl text-darkBlue2 mb-4">
            Dependent's Information
          </h2>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={resident.fullName}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                First Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Suffix
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Date of Birth
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray mb-1">
                Status
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}