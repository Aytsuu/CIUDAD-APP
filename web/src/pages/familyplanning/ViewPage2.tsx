import { Button } from "@/components/ui/button/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router";


const pregnancyQuestions = [
  "Did you have a baby less than six (6) months ago, are you fully or nearly fully breastfeeding, and have you had no menstrual period since then?",
  "Have you abstained from sexual intercourse since your last menstrual period or delivery?",
  "Have you had a baby in the last four (4) weeks?",
  "Did your last menstrual period start within the past seven (7) days?",
  "Have you had miscarriage or abortion in the last seven (7) days?",
  "Have you been using a reliable contraceptive method consistently and correctly?",
]

export default function FamilyPlanningView2() {
 const navigate = useNavigate();

  return (
    <div className="container bg-white mx-auto p-4 max-w-7xl">
      {/* Header Section */}
      <Button
                    className="text-black p-2 self-start"
                    variant={"outline"}
                    onClick={() => navigate(-1)}
                >
                    <ChevronLeft />
                </Button>

      {/* Form Title */}
      <div className="mb-6">
        <div className="text-right text-sm text-gray-600 mb-2">SIDE B</div>
        <div className="text-right text-sm text-gray-600">FP FORM 1</div>
        <h1 className="text-center text-xl font-semibold mb-6">FAMILY PLANNING CLIENT ASSESSMENT RECORD</h1>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 text-sm font-medium bg-gray-50 w-32">
                DATE OF VISIT
                <br />
                (MM/DD/YYYY)
              </th>
              <th className="border border-gray-300 p-2 text-sm font-medium bg-gray-50 w-40">
                VITAL SIGNS
              </th>
              <th className="border border-gray-300 p-2 text-sm font-medium bg-gray-50">
                MEDICAL FINDINGS
                <br />
                <span className="font-normal text-xs">
                  (Medical observation, complaints / complication, service rendered/ procedures,laboratory examination,
                  treatment and referral)
                </span>
              </th>
              <th className="border border-gray-300 p-2 text-sm font-medium bg-gray-50 w-40">METHOD ACCEPTED</th>
              <th className="border border-gray-300 p-2 text-sm font-medium bg-gray-50 w-40">
                NAME AND<br />SIGNATURE OF<br />SERVICE<br />PROVIDER
              </th>
              <th className="border border-gray-300 p-2 text-sm font-medium bg-gray-50 w-32">
                DATE OF<br />FOLLOW-UP<br />VISIT<br />(MM/DD/YYYY)
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2 h-24"></td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pregnancy Questions Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">How to be Reasonably Sure a Client is Not Pregnant</h2>
        <div className="space-y-4">
          {pregnancyQuestions.map((question, index) => (
            <div key={index} className="flex items-start gap-8">
              <span className="text-sm min-w-[24px]">{index + 1}.</span>
              <div className="flex-1">
                <p className="text-sm mb-2">{question}</p>
                <RadioGroup className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`yes-${index}`} />
                    <label htmlFor={`yes-${index}`} className="text-sm">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`no-${index}`} />
                    <label htmlFor={`no-${index}`} className="text-sm">
                      No
                    </label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-2 text-sm">
        <p className="flex gap-2">
          <span>■</span>
          <span>
            If the client answered <strong>YES</strong> to at least one of the questions and she is free of signs or
            symptoms of pregnancy, provide client with desired method.
          </span>
        </p>
        <p className="flex gap-2">
          <span>■</span>
          <span>
            If the client answered <strong>NO</strong> to all of the questions, pregnancy cannot be ruled out. The
            client should await menses or use a pregnancy test.
          </span>
        </p>
      </div>

      {/* Cancel Button */}
      <div className="flex justify-end mt-8">
        <Button variant="destructive">CANCEL</Button>
      </div>
    </div>
  )
}

