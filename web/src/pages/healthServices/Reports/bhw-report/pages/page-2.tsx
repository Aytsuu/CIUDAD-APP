"use client"

import { Card } from "@/components/ui/card"

export default function BHWReportPage2() {
  return (
    <Card className="w-full max-w-5xl mx-auto p-8 bg-white shadow-lg print:shadow-none">
      {/* V. DEWORMING */}
      <div className="mb-6">
        <h2 className="font-bold text-sm mb-2">V. DEWORMING</h2>
        <table className="w-full border-2 border-black text-xs">
          <thead>
            <tr className="border-b-2 border-black">
              <th colSpan={3} className="border-r-2 border-black p-2 text-center font-bold">
                PSAC 1-4 YEARS OLD
              </th>
              <th colSpan={3} className="border-r-2 border-black p-2 text-center font-bold">
                SAC 5-9 YEARS OLD
              </th>
              <th colSpan={3} className="p-2 text-center font-bold">
                ADOLESCENTS 10-18 YEARS OLD
              </th>
            </tr>
            <tr className="border-b border-black">
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r border-black p-2 text-center font-bold">F</th>
              <th className="border-r-2 border-black p-2 text-center font-bold">TOTAL</th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r border-black p-2 text-center font-bold">F</th>
              <th className="border-r-2 border-black p-2 text-center font-bold">TOTAL</th>
              <th className="border-r border-black p-2 text-center font-bold">M</th>
              <th className="border-r border-black p-2 text-center font-bold">F</th>
              <th className="p-2 text-center font-bold">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r-2 border-black p-2"></td>
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

      {/* VI-VIII Sections */}
      <div className="mb-4 text-sm space-y-1">
        <div className="flex">
          <span className="font-bold">VI. NO. OF HOUSEHOLD PROFILED:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
        <div className="flex">
          <span className="font-bold">VII. NEW CHILDREN 0-12 MOS:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
        <div className="flex">
          <span className="font-bold">VIII. FIC DEFAULTERS FOLLOWED-UP:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
      </div>

      {/* Antigen Table */}
      <table className="w-full border-2 border-black mb-6 text-xs">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="border-r-2 border-black p-2 text-center font-bold">ANTIGEN</th>
            <th className="border-r-2 border-black p-2 text-center font-bold">2ND DOSE</th>
            <th className="p-2 text-center font-bold">3RD DOSE</th>
          </tr>
        </thead>
        <tbody>
          {["BCG", "HEP B< 24 hrs.", "PENTAVALENT", "AMV", "OPV/IPV", "PCV 13"].map((antigen, idx) => (
            <tr key={idx} className={idx < 5 ? "border-b border-black" : ""}>
              <td className="border-r-2 border-black p-2 font-semibold">{antigen}</td>
              <td className="border-r-2 border-black p-2"></td>
              <td className="p-2"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* IX-XVI Sections */}
      <div className="mb-4 text-sm space-y-1">
        <div>
          <p className="font-bold">IX. NEW AP</p>
          <div className="flex">
            <span className="font-bold">PREGNANT WOMEN DURING THE 1st TRIMESTER(up to 12 weeks):</span>
            <span className="flex-1 border-b border-black ml-2"></span>
          </div>
          <div className="flex">
            <span className="font-bold">PREGNANT WOMEN ABOVE 12 WEEKS:</span>
            <span className="flex-1 border-b border-black ml-2"></span>
          </div>
        </div>
        <div className="flex">
          <span className="font-bold">X. TT2 - TT3 PLUS:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
        <div className="flex">
          <span className="font-bold">XI. 4 ANC (PREGNANT ) FOLLOW-UP:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
        <div>
          <p className="font-bold">XII. POSTPARTUM VISIT:</p>
          <div className="flex ml-4">
            <span className="font-bold">within 24 HRS:</span>
            <span className="flex-1 border-b border-black ml-2"></span>
          </div>
          <div className="flex ml-4">
            <span className="font-bold">within 1 week:</span>
            <span className="flex-1 border-b border-black ml-2"></span>
          </div>
        </div>
        <div className="flex">
          <span className="font-bold">XIII. NEW FAMILY PLANNING CASE FOUND:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
        <div className="flex">
          <span className="font-bold">XIV. FOLLOW - UP DEFAULTERS FOR FAMILY PLANNING CURRENT USER:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
        <div className="flex">
          <span className="font-bold">XV. NEW CASE FOUND EXCLUSIVELY BREASTFED:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
        <div className="flex">
          <span className="font-bold">XVI. DISEASE SURVEILLANCE:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
      </div>

      {/* XVII. REFERRALS/FOLLOW-UP CASES */}
      <div className="mb-6">
        <h2 className="font-bold text-sm mb-2">XVII. REFERRALS/FOLLOW-UP CASES</h2>
        <table className="w-full border-2 border-black text-xs">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="border-r-2 border-black p-2 text-left font-bold w-1/3"></th>
              <th className="border-r-2 border-black p-2 text-center font-bold">REFER</th>
              <th className="p-2 text-center font-bold">FOLLOW - UP</th>
            </tr>
          </thead>
          <tbody>
            {[
              "FEVER",
              "DENGUE",
              "IRA",
              "PNEUMONIA",
              "ARI / LRES",
              "TYPHOID FEVER",
              "HEPATITIS",
              "INFLUENZA",
              "HYPERTENSIVE",
              "DIABETES",
              "MELLITUS",
              "TUBERCULOSIS",
              "LEPROSY",
              "OTHERS",
            ].map((disease, idx) => (
              <tr key={idx} className={idx < 13 ? "border-b border-black" : ""}>
                <td className="border-r-2 border-black p-2 font-semibold">{disease}</td>
                <td className="border-r-2 border-black p-2"></td>
                <td className="p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* XVIII. CLINIC ATTENDANCE */}
      <div className="mb-6 text-sm space-y-1">
        <h2 className="font-bold">XVIII. CLINIC ATTENDANCE:</h2>
        <div className="flex">
          <span className="font-bold">NO. OF WORKING DAYS:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
        <div className="flex">
          <span className="font-bold">NO. OF DAYS WORKED:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
        <div className="flex">
          <span className="font-bold">NO. OF DAYS ABSENT:</span>
          <span className="flex-1 border-b border-black ml-2"></span>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-8 space-y-6 text-sm">
        <div>
          <p className="font-bold mb-1">SUBMITTED BY:</p>
          <div className="border-b border-black w-64 mb-1"></div>
          <p className="text-center w-64 italic">Barangay Health Worker</p>
        </div>

        <div>
          <p className="font-bold mb-1">NOTED BY:</p>
          <div className="border-b border-black w-64 mb-1"></div>
          <p className="text-center w-64 italic">Public Health Midwife</p>
        </div>

        <div>
          <p className="font-bold mb-1">APPROVED BY:</p>
          <div className="border-b border-black w-64 mb-1"></div>
          <p className="text-center w-64 italic">Medical Officer</p>
        </div>
      </div>

      {/* Page Number */}
      <div className="text-center text-sm text-muted-foreground mt-8">Page 2 of 2</div>
    </Card>
  )
}
