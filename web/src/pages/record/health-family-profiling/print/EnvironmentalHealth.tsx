import { equalsToken, tokenIncludes } from "./utils"

interface EnvironmentalHealthProps {
  waterSupplyType: string
  sanitaryClass: "sanitary" | "unsanitary" | null
  sanitaryFacilityType: string
  sanitaryFacilityDesc: string
  toiletShareStatus: "shared" | "not-shared" | null
  wasteType: string
  environmentalData: any
}

const EnvironmentalHealth = ({
  waterSupplyType,
  sanitaryClass,
  sanitaryFacilityType,
  sanitaryFacilityDesc,
  toiletShareStatus,
  wasteType,
  environmentalData,
}: EnvironmentalHealthProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold mb-3 bg-gray-200 p-1">ENVIRONMENTAL HEALTH AND SANITATION</h2>

      {/* Water Supply */}
      <div className="mb-4">
        <h3 className="text-sm font-bold mb-2">TYPE OF WATER SUPPLY</h3>
        <div className="grid grid-cols-3 gap-4 border border-black p-2">
          <div>
            <div className="font-bold text-xs mb-1">LEVEL I</div>
            <div className="text-xs">POINT SOURCE</div>
            <div className="text-xs mt-1">
              <label className="block">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={equalsToken(waterSupplyType, "LEVEL I")}
                  readOnly
                />
                Dug well protected/improved artesian or dug well without distribution/piping system supplying within
                50 meters
              </label>
            </div>
          </div>
          <div>
            <div className="font-bold text-xs mb-1">LEVEL II</div>
            <div className="text-xs">COMMUNAL FAUCET OR STAND POST</div>
            <div className="text-xs mt-1">
              <label className="block">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={equalsToken(waterSupplyType, "LEVEL II")}
                  readOnly
                />
                Piped water source with distribution system to a communal faucet or standpost supplying within 25
                meter radius
              </label>
            </div>
          </div>
          <div>
            <div className="font-bold text-xs mb-1">LEVEL III</div>
            <div className="text-xs">INDIVIDUAL CONNECTION</div>
            <div className="text-xs mt-1">
              <label className="block">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={equalsToken(waterSupplyType, "LEVEL III")}
                  readOnly
                />
                Piped water system with household taps supplied by MCWD, BWSA, Homeowners' Assoc/Subdivision
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Sanitary Facility */}
      <div className="mb-4">
        <h3 className="text-sm font-bold mb-2">TYPE OF SANITARY FACILITY</h3>
        <div className="border border-black p-2">
          {/* Table Headers with checkboxes */}
          <div className="grid grid-cols-2 gap-4 mb-3 border-b border-black pb-2">
            <div className="text-center">
              <label className="flex items-center justify-center text-xs font-bold">
                <input type="checkbox" className="mr-2" checked={sanitaryClass === "sanitary"} readOnly />
                SANITARY
              </label>
            </div>
            <div className="text-center">
              <label className="flex items-center justify-center text-xs font-bold">
                <input type="checkbox" className="mr-2" checked={sanitaryClass === "unsanitary"} readOnly />
                UNSANITARY
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={
                    equalsToken(sanitaryFacilityDesc, "POUR/FLUSH TYPE WITH SEPTIC TANK") ||
                    equalsToken(sanitaryFacilityType, "POUR/FLUSH TYPE WITH SEPTIC TANK")
                  }
                  readOnly
                />
                Pour/flush type with septic tank
              </label>
              <label className="block text-xs">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={
                    equalsToken(sanitaryFacilityDesc, "POUR/FLUSH TOILET CONNECTED TO SEPTIC TANK AND TO SEWERAGE SYSTEM") ||
                    equalsToken(sanitaryFacilityType, "POUR/FLUSH TOILET CONNECTED TO SEPTIC TANK AND TO SEWERAGE SYSTEM")
                  }
                  readOnly
                />
                Pour/flush toilet connected to septic tank AND to sewerage system
              </label>
              <label className="block text-xs">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={
                    equalsToken(sanitaryFacilityDesc, "VENTILATED PIT (VIP) LATRINE") ||
                    equalsToken(sanitaryFacilityType, "VENTILATED PIT (VIP) LATRINE")
                  }
                  readOnly
                />
                Ventilated Pit (VIP) Latrine
              </label>
            </div>
            <div>
              <label className="block text-xs">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={
                    equalsToken(sanitaryFacilityDesc, "WATER-SEALED TOILET WITHOUT SEPTIC TANK") ||
                    equalsToken(sanitaryFacilityType, "WATER-SEALED TOILET WITHOUT SEPTIC TANK")
                  }
                  readOnly
                />
                Water-sealed toilet without septic tank
              </label>
              <label className="block text-xs">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={
                    equalsToken(sanitaryFacilityDesc, "OVERHUNG LATRINE") ||
                    equalsToken(sanitaryFacilityType, "OVERHUNG LATRINE")
                  }
                  readOnly
                />
                Overhung latrine
              </label>
              <label className="block text-xs">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={
                    equalsToken(sanitaryFacilityDesc, "OPEN PIT LATRINE") ||
                    equalsToken(sanitaryFacilityType, "OPEN PIT LATRINE")
                  }
                  readOnly
                />
                Open Pit Latrine
              </label>
              <label className="block text-xs">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={
                    equalsToken(sanitaryFacilityDesc, "WITHOUT TOILET") ||
                    equalsToken(sanitaryFacilityType, "WITHOUT TOILET")
                  }
                  readOnly
                />
                Without toilet
              </label>
            </div>
          </div>
          <div className="mt-2 text-xs">
            Is Toilet
            <label className="ml-2">
              <input type="checkbox" className="mr-1" checked={toiletShareStatus === "not-shared"} readOnly />
              NOT SHARED with Other Household
            </label>
            or
            <label className="ml-2">
              <input type="checkbox" className="mr-1" checked={toiletShareStatus === "shared"} readOnly />
              SHARED with Other Household
            </label>
          </div>
        </div>
      </div>

      {/* Solid Waste Management */}
      <div className="mb-4">
        <h3 className="text-sm font-bold mb-2">SOLID WASTE MANAGEMENT</h3>
        <div className="border border-black p-2">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={equalsToken(wasteType, "WASTE SEGREGATION")}
                  readOnly
                />
                Waste Segregation
              </label>
              <label className="block">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={equalsToken(wasteType, "BACKYARD COMPOSTING")}
                  readOnly
                />
                Backyard Composting
              </label>
            </div>
            <div>
              <label className="block">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={
                    // Accept either "RECYCLING" or "RECYCLING/REUSE" saved values
                    equalsToken(wasteType, "RECYCLING/REUSE") ||
                    equalsToken(wasteType, "RECYCLING")
                  }
                  readOnly
                />
                Recycling/Reuse
              </label>
              <label className="block">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={
                    equalsToken(wasteType, "COLLECTED BY CITY COLLECTION AND DISPOSAL SYSTEM") ||
                    tokenIncludes(wasteType, "collectedbycity")
                  }
                  readOnly
                />
                Collected by City Collection and Disposal System
              </label>
            </div>
            <div>
              <label className="block">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={equalsToken(wasteType, "BURNING/BURYING")}
                  readOnly
                />
                Burning/Burying
              </label>
              <label className="block">
                <input type="checkbox" className="mr-1" checked={equalsToken(wasteType, "OTHERS")} readOnly />
                Others (pls. specify):{" "}
                {equalsToken(wasteType, "OTHERS") && environmentalData?.waste_management?.description && (
                  <span className="border-b border-black px-1">
                    {environmentalData.waste_management.description}
                  </span>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnvironmentalHealth
