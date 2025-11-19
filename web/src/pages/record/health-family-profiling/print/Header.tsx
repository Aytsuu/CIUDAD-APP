import cityHealthLogo from "../print/logo/city-health-logo.svg"
import officialSealCebu from "../print/logo/official-seal-cebu.svg"
import { equalsCI, inSetCI, norm } from "./utils" 

interface HeaderProps {
  householdData: any
  buildingType: string
}

const Header = ({ householdData, buildingType }: HeaderProps) => {
  return (
    <>
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <div className="flex justify-between items-center">
          <div className="w-32 h-32 flex items-center justify-center">
            <img
              src={cityHealthLogo || "/placeholder.svg"}
              alt="City Health Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 text-center">
            <p className="text-sm font-bold font-canterbury">Republic of the Philippines</p>
            <p className="text-base font-bold">City of Cebu</p>
            <p className="text-base font-bold">CITY HEALTH DEPARTMENT</p>
            <p className="text-xs">Gen. Maxilom Ave. Ext., Carreta, Cebu City, Philippines</p>
            <p className="text-xs">Tel No.: (032) 414-5170, (032) 232-6969</p>
            <p className="text-xs">Email add: cebucity.chd@gmail.com, chocommunication1022@gmail.com</p>
          </div>
          <div className="w-32 h-32 flex items-center justify-center">
            <img
              src={officialSealCebu || "/placeholder.svg"}
              alt="Official Seal of Cebu"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Title and Building Type */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-center flex-1">FAMILY Profile Form</h1>
      </div>

      {/* Health Center/ Station and Building Type */}
      <div className="mb-4 space-y-3">
        {/* Health Center/ Station */}
        <div className="flex items-center">
          <span className="text-sm font-bold mr-2">Health Center/ Station:</span>
          <div className="border-b border-black flex-1 px-2 text-sm min-h-[24px] flex items-center">
            {householdData?.address?.barangay || "San Roque"}
          </div>
        </div>

        {/* Building Type */}
        <div className="border border-black p-2">
          <div className="flex items-center">
            <span className="text-xs font-bold mr-4">Building Occupancy:</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center text-xs">
                <input type="checkbox" className="mr-1" checked={equalsCI(buildingType, "OWNER")} readOnly />
                OWNER
              </label>
              <label className="flex items-center text-xs">
                <input type="checkbox" className="mr-1" checked={equalsCI(buildingType, "RENTER")} readOnly />
                RENTER
              </label>
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={!!norm(buildingType) && !inSetCI(buildingType, ["OWNER", "RENTER"])}
                  readOnly
                />
                OTHERS
                {/* If needed, render specific other type here */}
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
