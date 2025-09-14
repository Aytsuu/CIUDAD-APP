import { useRef, useState } from "react";
import { format, isValid } from "date-fns";
import { getValueByPath } from "./ChildHealthutils";
import { VitalSignsTable } from "./tables/VitalSignsTable";
import { BFCheckTable } from "./tables/BFTable";
import { ImmunizationTable } from "./tables/ImmunizationTable";
import { SupplementStatusTable } from "./tables/SupplementStatusTable";
import { calculateAge } from "@/helpers/ageCalculator";
import { Button } from "@/components/ui/button/button";
import { Printer, Download, Eye } from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";

// Import jsPDF
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PatientSummarySectionProps {
  recordsToDisplay: any[];
  fullHistoryData: any[];
  chhistId: string;
}

export function PatientSummarySection({
  recordsToDisplay,
  fullHistoryData,
  chhistId,
}: PatientSummarySectionProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (recordsToDisplay.length === 0) return null;

  // New function to generate PDF using jsPDF and open in new tab
  const generatePDF = async () => {
    if (!printRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [215.9, 330.2] // Long bond paper size (8.5 x 13 inches)
      });

      const imgWidth = 190; // mm
      const pageHeight = 320; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Instead of saving, open in new tab
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      // Clean up the URL object after use
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      <CardLayout
        cardClassName="px-4"
        content={
          <>
            {/* Print/Export Controls */}
            <div className="no-print mb-4 justify-end flex items-center space-x-2">
             
              
              <Button
                onClick={generatePDF}
                variant="outline"
                disabled={isGeneratingPDF}
                className="flex gap-2 py-2 px-4 rounded border border-zinc-400 bg-blue-50 hover:bg-blue-100"
              >
                <Eye /> {isGeneratingPDF ? "Generating..." : "View PDF"}
              </Button>
            </div>

            {/* Content to be printed/exported */}
            <div ref={printRef}>
              {/* Your existing content */}
              <div className="print-section">
                <h2 className="text-xl font-bold text-gray-800 text-center mb-10">
                  CHILD HEALTH RECORD
                </h2>

                <div className="flex justify-end mb-10">
                  <div className="space-y-2 mb-4">
                    <p>
                      <strong>Family no:</strong>{" "}
                      <span className="underline">
                        {getValueByPath(recordsToDisplay[0], [
                          "chrec_details",
                          "family_no",
                        ]) || "N/A"}
                      </span>
                    </p>
                    <p>
                      <strong>UFC no:</strong>{" "}
                      <span className="underline">
                        {getValueByPath(recordsToDisplay[0], [
                          "chrec_details",
                          "ufc_no",
                        ]) || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Main content area with patient details and immunization table */}
              <div className="print-section flex flex-col lg:flex-row gap-10 mb-4 w-full">
                {/* Patient details - takes about 50% width on larger screens */}
                <div className="lg:w-[50%] space-y-4">
                  <div>
                    <div className="space-y-4 mb-4">
                      <div className="flex justify-between w-full">
                        <p>
                          <strong>Name:</strong>{" "}
                          <span className="underline">
                            {getValueByPath(recordsToDisplay[0], [
                              "chrec_details",
                              "patrec_details",
                              "pat_details",
                              "personal_info",
                              "per_fname",
                            ]) || "N/A"}{" "}
                            {getValueByPath(recordsToDisplay[0], [
                              "chrec_details",
                              "patrec_details",
                              "pat_details",
                              "personal_info",
                              "per_lname",
                            ]) || ""}{" "}
                            {getValueByPath(recordsToDisplay[0], [
                              "chrec_details",
                              "patrec_details",
                              "pat_details",
                              "personal_info",
                              "per_mname",
                            ]) || ""}
                          </span>
                        </p>
                        <p>
                          <strong>Sex:</strong>{" "}
                          <span className="underline">
                            {getValueByPath(recordsToDisplay[0], [
                              "chrec_details",
                              "patrec_details",
                              "pat_details",
                              "personal_info",
                              "per_sex",
                            ]) || "N/A"}
                          </span>
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p>
                          <strong>Date of Birth:</strong>{" "}
                          <span className="underline">
                            {isValid(
                              new Date(
                                getValueByPath(recordsToDisplay[0], [
                                  "chrec_details",
                                  "patrec_details",
                                  "pat_details",
                                  "personal_info",
                                  "per_dob",
                                ])
                              )
                            )
                              ? format(
                                  new Date(
                                    getValueByPath(recordsToDisplay[0], [
                                      "chrec_details",
                                      "patrec_details",
                                      "pat_details",
                                      "personal_info",
                                      "per_dob",
                                    ])
                                  ),
                                  "MMM. d yyyy"
                                )
                              : "N/A"}
                          </span>
                        </p>
                        <p>
                          <strong>Birth Order:</strong>{" "}
                          <span className="underline">
                            {getValueByPath(recordsToDisplay[0], [
                              "chrec_details",
                              "birth_order",
                            ]) || "N/A"}
                          </span>
                        </p>
                      </div>
                      <p>
                        <strong>Place of Delivery:</strong>{" "}
                        {(() => {
                          const deliveryType = getValueByPath(recordsToDisplay[0], [
                            "chrec_details",
                            "place_of_delivery_type",
                          ]);

                          if (!deliveryType) return "N/A";

                          return (
                            <span className="space-x-2">
                              <span>
                                (<span>{deliveryType === "Hospital Gov't/Private" ? "✓" : " "}</span>)
                                Hospital Gov't/Private
                              </span>
                              <span>
                                (<span>{deliveryType === "Home" ? "✓" : " "}</span>)
                                Home
                              </span>
                              <span>
                                (<span>{deliveryType === "Private Clinic" ? "✓" : " "}</span>)
                                Private Clinic
                              </span>
                              <span>
                                (<span>{deliveryType === "Lying In" ? "✓" : " "}</span>)
                                Lying In
                              </span>
                              <span>
                                (<span>{deliveryType === "HC" ? "✓" : " "}</span>)
                                Health Center
                              </span>
                            </span>
                          );
                        })()}
                      </p>
                      <p>
                        {(() => {
                          const deliveryType = getValueByPath(recordsToDisplay[0], [
                            "chrec_details",
                            "place_of_delivery_type",
                          ]);

                          if (deliveryType === "HC") {
                            return (
                              <span>
                                <strong>Place of Delivery:</strong>{" "}
                                <span className="underline">Health Center</span>
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </p>
                    </div>

                    {/* Mother Section */}
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <strong>Mother:</strong>
                        <span className="underline">
                          {getValueByPath(recordsToDisplay[0], [
                            "chrec_details",
                            "patrec_details",
                            "pat_details",
                            "family_head_info",
                            "family_heads",
                            "mother",
                            "personal_info",
                          ])
                            ? `${
                                getValueByPath(recordsToDisplay[0], [
                                  "chrec_details",
                                  "patrec_details",
                                  "pat_details",
                                  "family_head_info",
                                  "family_heads",
                                  "mother",
                                  "personal_info",
                                  "per_fname",
                                ]) || ""
                              } ${
                                getValueByPath(recordsToDisplay[0], [
                                  "chrec_details",
                                  "patrec_details",
                                  "pat_details",
                                  "family_head_info",
                                  "family_heads",
                                  "mother",
                                  "personal_info",
                                  "per_lname",
                                ]) || ""
                              }`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <strong>Age:</strong>
                        <span className="underline">
                          {(() => {
                            const dob = getValueByPath(recordsToDisplay[0], [
                              "chrec_details",
                              "patrec_details",
                              "pat_details",
                              "family_head_info",
                              "family_heads",
                              "mother",
                              "personal_info",
                              "per_dob",
                            ]);
                            return isValid(new Date(dob))
                              ? calculateAge(new Date(dob).toISOString())
                              : "N/A";
                          })()}
                        </span>
                      </div>
                    </div>
                    <p className="mb-4">
                      <strong>Occupation:</strong>{" "}
                      <span className="underline">
                        {getValueByPath(recordsToDisplay[0], [
                          "chrec_details",
                          "mother_occupation",
                        ]) || "N/A"}
                      </span>
                    </p>

                    {/* Father Section */}
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <strong>Father:</strong>
                        <span className="underline">
                          {getValueByPath(recordsToDisplay[0], [
                            "chrec_details",
                            "patrec_details",
                            "pat_details",
                            "family_head_info",
                            "family_heads",
                            "father",
                            "personal_info",
                          ])
                            ? `${
                                getValueByPath(recordsToDisplay[0], [
                                  "chrec_details",
                                  "patrec_details",
                                  "pat_details",
                                  "family_head_info",
                                  "family_heads",
                                  "father",
                                  "personal_info",
                                  "per_fname",
                                ]) || ""
                              } ${
                                getValueByPath(recordsToDisplay[0], [
                                  "chrec_details",
                                  "patrec_details",
                                  "pat_details",
                                  "family_head_info",
                                  "family_heads",
                                  "father",
                                  "personal_info",
                                  "per_lname",
                                ]) || ""
                              }`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <strong>Age:</strong>
                        <span className="underline">
                          {(() => {
                            const dob = getValueByPath(recordsToDisplay[0], [
                              "chrec_details",
                              "patrec_details",
                              "pat_details",
                              "family_head_info",
                              "family_heads",
                              "father",
                              "personal_info",
                              "per_dob",
                            ]);
                            return isValid(new Date(dob))
                              ? calculateAge(new Date(dob).toISOString())
                              : "N/A";
                          })()}
                        </span>
                      </div>
                    </div>
                    <p>
                      <strong>Occupation:</strong>{" "}
                      <span className="underline">
                        {getValueByPath(recordsToDisplay[0], [
                          "chrec_details",
                          "father_occupation",
                        ]) || "N/A"}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p>
                      <strong>Date referred for newborn screening:</strong>{" "}
                      <span className="underline">
                        {isValid(
                          new Date(
                            getValueByPath(recordsToDisplay[0], [
                              "chrec_details",
                              "newborn_screening",
                            ])
                          )
                        )
                          ? format(
                              new Date(
                                getValueByPath(recordsToDisplay[0], [
                                  "chrec_details",
                                  "newborn_screening",
                                ])
                              ),
                              "MMM dd, yyyy"
                            )
                          : "N/A"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Type of Feeding:</strong>{" "}
                      <span className="underline">
                        {getValueByPath(recordsToDisplay[0], [
                          "chrec_details",
                          "type_of_feeding",
                        ]) || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Immunization table - takes about 50% width on larger screens */}
                <div className="lg:w-[50%]">
                  <span className="font-bold block mb-2">Type of immunization</span>
                  <div className="overflow-x-auto">
                    <ImmunizationTable
                      fullHistoryData={fullHistoryData}
                      chhistId={chhistId}
                    />
                  </div>
                  <div className="space-y-2 mt-4">
                    <p className="mt-5">
                      <strong>Child protected at Birth:</strong>{" "}
                    </p>
                    <p className="ml-4">
                      <strong>Date assessed:</strong>{" "}
                      <span className="underline">
                        {isValid(
                          new Date(
                            getValueByPath(recordsToDisplay[0], [
                              "chrec_details",
                              "created_at",
                            ])
                          )
                        )
                          ? format(
                              new Date(
                                getValueByPath(recordsToDisplay[0], [
                                  "chrec_details",
                                  "created_at",
                                ])
                              ),
                              "MMM dd yyyy"
                            )
                          : "N/A"}
                      </span>
                    </p>
                    <p className="">
                      <strong>TT status of mother:</strong>{" "}
                      <span className="underline">
                        {getValueByPath(recordsToDisplay[0], ["tt_status"]) ||
                          "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* BF Check and other tables - full width */}
              <div className="print-full-width space-y-4">
                <div className="print-table-container print-section">
                  <span className="print-table-title font-bold block mb-2">
                    Exclusive BF check:
                  </span>
                  <div className="overflow-x-auto">
                    <BFCheckTable
                      fullHistoryData={fullHistoryData}
                      chhistId={chhistId}
                    />
                  </div>
                </div>

                <div className="print-table-container print-section">
                  <SupplementStatusTable
                    fullHistoryData={fullHistoryData}
                    chhistId={chhistId}
                  />
                </div>

                <div className="print-table-container print-section">
                  <VitalSignsTable
                    fullHistoryData={fullHistoryData}
                    chhistId={chhistId}
                  />
                </div>
              </div>
            </div>
          </>
        }
      />
    </>
  );
}