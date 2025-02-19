import { Link } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import { Button } from "../ui/button";

export default function ViewInfo() {
  {/* Sample Data */}
  const resident = { fullName: "Christian", dob: "25/01/2004" };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Link
            to="/"
            className="text-black p-2 hover:bg-darkGray/25 hover:rounded-full"
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
            <Button variant={"destructive"}>Reject</Button>
            <Button className="bg-green-600 hover:bg-green-500">Approve</Button>
        </div>
      </div>

      <hr className="h-4 bg-darkBlue1 my-4" />
      {/* Sections */}
      <div className="h-auto w-full grid grid-rows-4 bg-white gap-y-2 p-2">
        <section className="row-span-1 p-3 grid grid-cols-8 border-b-4 border-darkBlue1">
          <h2 className="font-semibold text-l text-darkBlue2 col-span-1">
            Resident Profile
          </h2>
          <img src="" alt="Resident Profile" />
        </section>

        {/* Personal Information */}
        <section className="row-span-1 p-3 grid grid-cols-8 border-b-4 border-darkBlue1">
          <h2 className="font-semibold text-l text-darkBlue2 col-span-1">
            Personal Information
          </h2>

          {/* Form  */}
          <div className="col-span-7 grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Last Name
              </label>
              <input
                type="text"
                value={resident.fullName}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGray">
                First Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Middle Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Suffix
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Sex
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Status
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Date of Birth
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Place of Birth
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Citizenship
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Contact
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Religion
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
          </div>
        </section>

        {/* Parents Information */}

        <section className="row-span-1 p-3 grid grid-cols-8 border-b-4 border-darkBlue1">
          {/* Father's Information */}
          <h2 className="font-semibold text-l text-darkBlue2 col-span-1">
            Father's Information
          </h2>

          {/* Form  */}
          <div className="col-span-7 grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Last Name
              </label>
              <input
                type="text"
                value={resident.fullName}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGray">
                First Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Middle Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Suffix
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Date of Birth
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Status
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Religion
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Educational Attainment
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
          </div>
        </section>

        {/* Mother's Information */}
        <section className="row-span-1 p-3 grid grid-cols-8 border-b-4 border-darkBlue1">
          <h2 className="font-semibold text-l text-darkBlue2 col-span-1">
            Mother's Information
          </h2>

          {/* Form  */}
          <div className="col-span-7 grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Last Name
              </label>
              <input
                type="text"
                value={resident.fullName}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGray">
                First Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Middle Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Suffix
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Date of Birth
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Status
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Religion
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Educational Attainment
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
          </div>
        </section>

        {/*Dependents Information */}
        <section className="row-span-1 p-3 grid grid-cols-8">
          <h2 className="font-semibold text-l text-darkBlue2 col-span-1">
            Dependent's Information
          </h2>

          {/* Form  */}
          <div className="col-span-7 grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Last Name
              </label>
              <input
                type="text"
                value={resident.fullName}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGray">
                First Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Middle Name
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Suffix
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Date of Birth
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-darkGray">
                Status
              </label>
              <input
                type="text"
                value={new Date(resident.dob).toLocaleDateString("en-PH")}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
