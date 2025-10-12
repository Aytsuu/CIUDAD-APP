import { formatDate } from "@/helpers/dateHelper"

interface SurveyIdentificationProps {
  surveyData: any
}

const SurveyIdentification = ({ surveyData }: SurveyIdentificationProps) => {
  return (
    <div className="mb-6">
      <div className="border-t-1 border-black pt-2 mb-4">
        <h3 className="text-sm font-bold mb-4">SURVEY IDENTIFICATION</h3>
      </div>

      <div className="flex">
        {/* Left side: Form fields with improved typewriter styling */}
        <div className="flex-1 pr-8">
          {/* Filed by row */}
          <div className="mb-6">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2 w-24">Profiled by:</span>
              <div className="flex-1 mr-8 relative">
                <div className="text-sm text-center py-1 min-h-[24px]">{surveyData?.filled_by || ""}</div>
                <div
                  className="w-full absolute bottom-0 h-px border-t border-dashed border-black"
                ></div>
              </div>
              <span className="text-sm font-medium">B/CHW</span>
            </div>
          </div>

          {/* Conforme row */}
          <div className="mb-6">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2 w-24">Conforme:</span>
              <div className="flex-1 mr-8 relative">
                <div className="flex flex-col items-center justify-center">
                  {/* Signature area */}
                  <div className="h-8 w-full flex justify-center items-end">
                    {surveyData?.signature ? (
                      <img
                        src={surveyData.signature || "/placeholder.svg"}
                        alt="Signature"
                        className="h-full max-w-32 object-contain object-bottom"
                      />
                    ) : (
                      <svg className="w-24 h-5 text-black" viewBox="0 0 100 30">
                        <path
                          d="M10,20 C20,5 30,35 40,20 C50,5 60,35 70,20 C80,5 90,20 95,15"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </div>
                  {/* Name area */}
                  <div className="text-sm text-center mt-1">{surveyData?.informant || "WELZON ENTERA"}</div>
                </div>
                <div className="w-full absolute bottom-0 h-px border-t border-dashed border-black"></div>
              </div>
              <div className="text-sm font-medium text-center leading-tight">
                <div>Informant</div>
                <div>(Name & Signature)</div>
              </div>
            </div>
          </div>

          {/* Checked by row */}
          <div className="mb-6">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2 w-20">Checked by (RN/RM):</span>
              <div className="flex-1 relative">
                <div className="text-sm text-center py-1 min-h-[24px]">{surveyData?.checked_by || ""}</div>
                <div className="w-full absolute bottom-0 h-px border-t border-dashed border-black"></div>
              </div>
            </div>
          </div>

          {/* Date row */}
          <div className="mb-6">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2 w-16">Date:</span>
              <div className="flex-1 relative">
                <div className="text-sm text-center py-1 min-h-[24px]">
                  {surveyData?.date ? formatDate(surveyData.date, "short") : ""}
                </div>
                <div className="w-full absolute bottom-0 h-px border-t border-dashed border-black"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: PSA definition box with exact styling */}
          <div className="w-80">
          <div className="border border-dashed border-black p-4 text-sm leading-relaxed bg-white">
            <p className="mb-4 text-justify">
              <span className="font-bold">Household </span>
              as defined by the Philippine Statistical Authority (PSA) is a{" "}
              <span className="italic font-medium">social unit</span> consisting of a person living alone or a group
              of persons who sleep in the same housing unit and have a common arrangement in the preparation and
              consumption of food.
            </p>
            <div className="text-center mt-6 pt-2 border-t border-dashed border-black">
              <div className="text-xs leading-tight">
                <div className="mb-1">
                  <span className="font-bold">-</span>{" "}
                  <span className="italic justify-normal">Manual on Field Health Services Information</span>
                </div>
                <div className="italic">
                  <span className="font-medium justify-start">(FHSIS)</span> ver. 2018 Department of Health
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveyIdentification