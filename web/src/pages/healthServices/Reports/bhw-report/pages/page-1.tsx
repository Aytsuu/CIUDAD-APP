"use client"

import { Card } from "@/components/ui/card"

export default function BHWReportPage1() {
  return (
    <Card className="w-full max-w-5xl mx-auto p-8 bg-white shadow-lg print:shadow-none">
      {/* Header */}
      <div className=" p-4 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center text-xs text-center">
            CITY HEALTH DEPT LOGO
          </div>

          <div className="flex-1 text-center px-4">
            <p className="font-semibold">Republic of the Philippines</p>
            <p className="font-semibold">City of Cebu</p>
            <p className="font-bold text-lg">CITY HEALTH DEPARTMENT</p>
            <p className="text-sm">Gen. Maxilom Avenue, Cebu City, Philippines</p>
            <p className="text-sm">Email add: chocommunication1022@gmail.com</p>
          </div>

          <div className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center text-xs text-center">
            OFFICIAL SEAL
          </div>
        </div>

        <h1 className="text-center font-bold text-xl mt-6 mb-6">BHW MONTHLY ACCOMPLISHMENT REPORT</h1>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="flex">
            <span className="font-semibold">NAME OF BHW:</span>
            <span className="flex-1 border-b border-black ml-2">_______________________</span>
          </div>
          <div className="flex">
            <span className="font-semibold">MONTH:</span>
            <span className="flex-1 border-b border-black ml-2">_____________</span>
          </div>
          <div className="flex">
            <span className="font-semibold">BARANGAY:</span>
            <span className="flex-1 border-b border-black ml-2">_______________________</span>
          </div>
          <div className="flex">
            <span className="font-semibold">YEAR:</span>
            <span className="flex-1 border-b border-black ml-2">_____________</span>
          </div>
          <div className="flex col-span-2">
            <span className="font-semibold">SITIO:</span>
            <span className="flex-1 border-b border-black ml-2">_______________________</span>
          </div>
        </div>
      </div>

      {/* I. OPT RESULTS */}
      <div className="mb-6">
        <h2 className="font-bold text-sm mb-2">I. OPT RESULTS</h2>

        <table className="w-full border-2 border-black text-xs">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="border-r-2 border-black p-2 text-left font-bold">WEIGHT FOR AGE</th>
              <th colSpan={2} className="border-r-2 border-black p-2 text-center font-bold">
                NORMAL
              </th>
              <th colSpan={2} className="border-r-2 border-black p-2 text-center font-bold">
                UNDERWEIGHT
              </th>
              <th colSpan={2} className="border-r-2 border-black p-2 text-center font-bold">
                SEVERELY UNDERWEIGHT
              </th>
              <th colSpan={2} className="p-2 text-center font-bold">
                OVERWEIGHT/ OBESE
              </th>
            </tr>
            <tr className="border-b border-black">
              <th className="border-r-2 border-black p-2"></th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r-2 border-black p-2 text-center font-bold">F</th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r-2 border-black p-2 text-center font-bold">F</th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r-2 border-black p-2 text-center font-bold">F</th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="p-2 text-center font-bold">F</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b-2 border-black">
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="p-2"></td>
            </tr>
            <tr className="border-b-2 border-black">
              <th className="border-r-2 border-black p-2 text-left font-bold">HEIGHT FOR AGE</th>
              <th colSpan={2} className="border-r-2 border-black p-2 text-center font-bold">
                NORMAL
              </th>
              <th colSpan={2} className="border-r-2 border-black p-2 text-center font-bold">
                TALL
              </th>
              <th colSpan={2} className="border-r-2 border-black p-2 text-center font-bold">
                STUNTED
              </th>
              <th colSpan={2} className="p-2 text-center font-bold">
                SEVERELY STUNTED
              </th>
            </tr>
            <tr className="border-b border-black">
              <th className="border-r-2 border-black p-2"></th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r-2 border-black p-2 text-center font-bold">F</th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r-2 border-black p-2 text-center font-bold">F</th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r-2 border-black p-2 text-center font-bold">F</th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="p-2 text-center font-bold">F</th>
            </tr>
            <tr className="border-b-2 border-black">
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="p-2"></td>
            </tr>
            <tr className="border-b-2 border-black">
              <th className="border-r-2 border-black p-2 text-left font-bold">WEIGHT FOR LENGTH/HEIGHT</th>
              <th colSpan={2} className="border-r-2 border-black p-2 text-center font-bold">
                NORMAL
              </th>
              <th colSpan={2} className="border-r-2 border-black p-2 text-center font-bold">
                MODERATELY WASTED
              </th>
              <th colSpan={2} className="border-r-2 border-black p-2 text-center font-bold">
                SEVERELY WASTED
              </th>
              <th colSpan={2} className="p-2 text-center font-bold">
                OVERWEIGHT/ OBESE
              </th>
            </tr>
            <tr className="border-b border-black">
              <th className="border-r-2 border-black p-2"></th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r-2 border-black p-2 text-center font-bold">F</th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r-2 border-black p-2 text-center font-bold">F</th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r-2 border-black p-2 text-center font-bold">F</th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="p-2 text-center font-bold">F</th>
            </tr>
            <tr>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* II-III Monitoring Sections */}
      <div className="mb-4 text-sm space-y-1">
        <div className="flex">
          <span className="font-bold">II. MONTHLY MONITORING OF CHILDREN 0-23 MOS:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
        <div className="flex">
          <span className="font-bold">III. MONTHLY MONITORING OF CHILDREN WITH GROWTH PROBLEM 0-71 MOS:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
      </div>

      {/* IV. MICRONUTRIENT SUPPLEMENTATION */}
      <div className="mb-6">
        <h2 className="font-bold text-sm mb-2">IV. MICRONUTRIENT SUPPLEMENTATION:</h2>

        {/* Vitamin A Table */}
        <table className="w-full border-2 border-black mb-4 text-xs">
          <thead>
            <tr className="border-b-2 border-black">
              <th rowSpan={2} className="border-r-2 border-black p-2 text-left font-bold w-1/3"></th>
              <th colSpan={3} className="border-r-2 border-black p-2 text-center font-bold">
                6-11 MONTHS
              </th>
              <th colSpan={5} className="p-2 text-center font-bold">
                12-59 MONTHS
              </th>
            </tr>
            <tr className="border-b border-black">
              <th colSpan={2} className="border-r border-black p-2 text-center font-bold">
                SINGLE DOSE
              </th>
              <th className="border-r-2 border-black p-2 text-center font-bold">TOTAL</th>
              <th colSpan={2} className="border-r border-black p-2 text-center font-bold">
                1ST DOSE
              </th>
              <th colSpan={2} className="border-r border-black p-2 text-center font-bold">
                2ND DOSE
              </th>
              <th className="p-2 text-center font-bold">TOTAL</th>
            </tr>
            <tr className="border-b border-black">
              <th className="border-r-2 border-black p-2"></th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r border-black p-2 text-center font-bold">F</th>
              <th className="border-r-2 border-black p-2"></th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r border-black p-2 text-center font-bold">F</th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r border-black p-2 text-center font-bold">F</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black">
              <td className="border-r-2 border-black p-2 font-semibold">VITAMIN A (100,000 iu)</td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="p-2"></td>
            </tr>
            <tr>
              <td className="border-r-2 border-black p-2 font-semibold">VITAMIN A (200,000 iu)</td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="p-2"></td>
            </tr>
          </tbody>
        </table>

        {/* Micronutrient Powder Table */}
        <table className="w-full border-2 border-black text-xs">
          <thead>
            <tr className="border-b-2 border-black">
              <th rowSpan={2} className="border-r-2 border-black p-2 text-left font-bold w-1/3"></th>
              <th colSpan={3} className="border-r-2 border-black p-2 text-center font-bold">
                6-11 MONTHS
              </th>
              <th colSpan={3} className="p-2 text-center font-bold">
                12-59 MONTHS
              </th>
            </tr>
            <tr className="border-b border-black">
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r border-black p-2 text-center font-bold">F</th>
              <th className="border-r-2 border-black p-2 text-center font-bold">TOTAL</th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r border-black p-2 text-center font-bold">F</th>
              <th className="p-2 text-center font-bold">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black">
              <td className="border-r-2 border-black p-2 font-semibold">MICRONUTRIENT POWDER (MNP) - 60 sachets</td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="p-2"></td>
            </tr>
            <tr>
              <td className="border-r-2 border-black p-2 font-semibold">MICRONUTRIENT POWDER (MNP) - 120 sachets</td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Page Number */}
      <div className="text-center text-sm text-muted-foreground mt-8">Page 1 of 2</div>
    </Card>
  )
}
