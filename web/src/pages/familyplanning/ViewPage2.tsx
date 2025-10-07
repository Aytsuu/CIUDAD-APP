
import { useRef } from "react"; // Import useRef
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFPCompleteRecord } from "@/pages/familyplanning/request-db/GetRequest";
import type { FormData } from "@/form-schema/FamilyPlanningSchema";
import { useReactToPrint } from "react-to-print"; // Import ReactToPrint

const pregnancyQuestions = [
  { text: "Did you have a baby less than six (6) months ago, are you fully or nearly fully breastfeeding, and have you had no menstrual period since then?", key: "breastfeeding" },
  { text: "Have you abstained from sexual intercourse since your last menstrual period or delivery?", key: "abstained" },
  { text: "Have you had a baby in the last four (4) weeks?", key: "recent_baby" },
  { text: "Did your last menstrual period start within the past seven (7) days?", key: "recent_period" },
  { text: "Have you had miscarriage or abortion in the last seven (7) days?", key: "recent_abortion" },
  { text: "Have you been using a reliable contraceptive method consistently and correctly?", key: "using_contraceptive" },
];

export default function FamilyPlanningView2() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fprecordId } = location.state || {};

  // Create a ref for the component to be printed
  const componentRef = useRef<HTMLDivElement>(null);

  const { data: recordData, isLoading, isError, error } = useQuery<FormData, Error>({
    queryKey: ['fpCompleteRecordView', fprecordId],
    queryFn: () => getFPCompleteRecord(Number(fprecordId)),
    enabled: !!fprecordId,
  });

   const handlePrint = useReactToPrint({
    contentRef: componentRef, // Changed from 'content' to 'contentRef'
    pageStyle: `
      @page {
        size: 8.5in 13in;
        margin: 0.5in;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });


  if (isLoading) {
    return <div className="text-center py-8">Loading record details...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-red-500">Error loading record: {error?.message}</div>;
  }

  if (!recordData) {
    return <div className="text-center py-8">No record found for ID: {fprecordId}</div>;
  }

  return (
    <div className="mx-auto p-2 bg-white max-w-4xl text-xs">
      <div className="flex justify-between items-center mb-2 no-print"> {/* Add no-print class */}
        <Button
          className="text-black p-1 self-start"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={16} />
        </Button>
        <Button onClick={handlePrint} className="ml-auto">
          Print Side B
        </Button>
        {/* Print Button for ViewPage2 */}
        
      </div>

      {/* Wrap the content to be printed with the ref */}
      <div ref={componentRef} className="print-content">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs font-bold">SIDE B</div>
          <div className="text-xs font-bold">FP FORM 1</div>
        </div>

        <div className="text-center font-bold text-base  border border-black bg-gray-200">FAMILY PLANNING CLIENT ASSESSMENT RECORD</div>

        <div className="border border-black">
          {/* Service Provision Records */}
          <div className="p-2 mb-2">
            {recordData.serviceProvisionRecords && recordData.serviceProvisionRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black text-xs">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-black p-1 text-left w-[12%]">
                        <div className="font-bold">VITAL SIGNS</div>
                      </th>
                      <th className="border border-black p-1 text-left w-[12%]">
                        <div className="font-bold">DATE OF VISIT</div>
                        <div className="text-xs font-normal text-gray-600">(YYYY/MM/DD)</div>
                      </th>
                      <th className="border border-black p-1 text-left">
                        <div className="font-bold">MEDICAL FINDINGS</div>
                        <div className="text-xs font-normal text-gray-600 italic">
                          Medical observation, complaints/complication, service rendered/
                          procedures, laboratory examination, treatment and referrals
                        </div>
                      </th>
                      <th className="border border-black p-1 text-left w-[15%]">
                        <div className="font-bold">METHOD ACCEPTED</div>
                      </th>
                      <th className="border border-black p-1 text-left w-[20%]">
                        <div className="font-bold">NAME AND SIGNATURE OF SERVICE PROVIDER</div>
                      </th>
                      <th className="border border-black p-1 text-left w-[15%]">
                        <div className="font-bold">DATE OF FOLLOW-UP VISIT</div>
                        <div className="text-xs font-normal text-gray-600">(YYYY/MM/DD)</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordData.serviceProvisionRecords.map((service, index) => (
                      <tr key={index}>
                        <td className="border border-black p-1">Weight: {service.weight || ""}kg BP: {service.bloodPressure || ""}</td>
                        <td className="border border-black p-1">{service.dateOfVisit || ""}</td>
                        <td className="border border-black p-1">{service.medicalFindings || ""}</td>
                        <td className="border border-black p-1">{service.methodAccepted || ""}</td>
                        <td className="border border-black p-1">
                          {service.serviceProviderSignature ? (
                            <div className="mb-1">
                              <img
                                src={service.serviceProviderSignature}
                                alt="Provider Signature"
                                className="h-6 w-auto"
                              />
                            </div>
                          ) : null}
                          <div className="text-xs">{service.nameOfServiceProvider || ""}</div>
                        </td>
                        <td className="border border-black p-1">{service.dateOfFollowUp || ""}</td>
                      </tr>
                    ))}
                    {/* Empty rows to match form */}
                    {Array.from({ length: Math.max(0, 8 - (recordData.serviceProvisionRecords?.length || 0)) }).map((_, index) => (
                      <tr key={`empty-${index}`}>
                        <td className="border border-black p-1 h-8">&nbsp;</td>
                        <td className="border border-black p-1">&nbsp;</td>
                        <td className="border border-black p-1">&nbsp;</td>
                        <td className="border border-black p-1">&nbsp;</td>
                        <td className="border border-black p-1">&nbsp;</td>
                        <td className="border border-black p-1">&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-black">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-black p-1 text-left w-[12%]">
                        <div className="font-bold">DATE OF VISIT</div>
                        <div className="text-xs font-normal text-gray-600">(MM/DD/YYYY)</div>
                      </th>
                      <th className="border border-black p-1 text-left w-[28%]">
                        <div className="font-bold">MEDICAL FINDINGS</div>
                        <div className="text-xs font-normal text-gray-600">
                          Medical observation, complaints/complication, service rendered/
                          procedures, laboratory examination, treatment and referrals
                        </div>
                      </th>
                      <th className="border border-black p-1 text-left w-[15%]">
                        <div className="font-bold">METHOD ACCEPTED</div>
                      </th>
                      <th className="border border-black p-1 text-left w-[20%]">
                        <div className="font-bold">NAME AND SIGNATURE</div>
                        <div className="text-xs font-normal text-gray-600">OF SERVICE PROVIDER</div>
                      </th>
                      <th className="border border-black p-1 text-left w-[15%]">
                        <div className="font-bold">DATE OF FOLLOW-UP</div>
                        <div className="text-xs font-normal text-gray-600">VISIT (MM/DD/YYYY)</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <tr key={index}>
                        <td className="border border-black p-1 h-8">&nbsp;</td>
                        <td className="border border-black p-1">&nbsp;</td>
                        <td className="border border-black p-1">&nbsp;</td>
                        <td className="border border-black p-1">&nbsp;</td>
                        <td className="border border-black p-1">&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pregnancy Check Table */}
          <div className="border-t border-black p-2">
            <div className="font-bold text-sm mb-2">How to be Reasonably Sure a Client is Not Pregnant</div>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-2 text-left w-2/3 font-bold">Question</th>
                  <th className="border border-black p-2 text-center w-1/6 font-bold">Yes</th>
                  <th className="border border-black p-2 text-center w-1/6 font-bold">No</th>
                </tr>
              </thead>
              <tbody>
                {pregnancyQuestions.map((q, index) => (
                  <tr key={index}>
                    <td className="border border-black p-2">{q.text}</td>
                    <td className="border border-black p-2 text-center">
                      <input
                        type="radio"
                        checked={recordData.pregnancyCheck?.[q.key as keyof typeof recordData.pregnancyCheck] === true}
                        disabled
                        className="h-3 w-3"
                      />
                    </td>
                    <td className="border border-black p-2 text-center">
                      <input
                        type="radio"
                        checked={recordData.pregnancyCheck?.[q.key as keyof typeof recordData.pregnancyCheck] === false}
                        disabled
                        className="h-3 w-3"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Instructions */}
            <div className="mt-2 p-2 bg-gray-50 text-xs border border-gray-300">
              <div className="mb-1">
                <strong>▶</strong> If the client answered YES to at least one of the questions and she is free of signs or symptoms of
                pregnancy, provide client with desired method.
              </div>
              <div>
                <strong>▶</strong> If the client answered NO to all of the questions, pregnancy cannot be ruled out. The client should
                await menses or use a pregnancy test.
              </div>
            </div>
          </div>

          {/* Bottom Section - Method Information */}

        </div>
      </div> {/* End of print-content div */}

      {/* Navigation Buttons (outside print-content) */}
      <div className="flex justify-between mt-4 no-print"> {/* Add no-print class */}
        <Button
          onClick={() => navigate("/services/familyplanning")}
          className="text-xs px-3 py-1"
        >
          Back to Records
        </Button>
      </div>
    </div>
  );
}
