import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pen, Printer, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Combobox } from "@/components/ui/combobox";
import { fileToBase64 } from "@/helpers/fileHelpers";
import { showErrorToast } from "@/components/ui/toast";
import { useGetSpecificTemplate } from "../../report/queries/reportFetch";
import { useUpdateTemplate } from "../../report/queries/reportUpdate";
import { formatStaffs } from "../../administration/AdministrationFormats";
import { Button } from "@/components/ui/button/button";
import { getMonthName, getMonths } from "@/helpers/dateHelper";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { capitalize } from "@/helpers/capitalize";
import { CertTemplatePDF } from "./CertTemplatePDF";

const ITEMS_PER_PAGE = 10;

export const CertDocTemplate = ({
  staff,
}: {
  staff: Record<string, any>[];
}) => {
  //------------------- STATE INITIALIZATION ---------------------
  const { mutateAsync: updateTemplate } = useUpdateTemplate();
  const { data: reportTemplate } =
    useGetSpecificTemplate("CERTIFICATION");
  const [month, setMonth] = React.useState<string>(getMonthName(new Date().toISOString()));
  const [pdfBlob, setPdfBlob] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const formattedStaffs = React.useMemo(() => formatStaffs(staff), [staff]);

  const prepared_by = reportTemplate?.rte_prepared_by || "NOT ADD"
  const recommended_by = reportTemplate?.rte_recommended_by || "NOT ADDED"
  const approved_by = reportTemplate?.rte_approved_by || "NOT ADDED"


  // Pagination calculations
  const totalPages = Math.ceil(staff.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentStaff = staff.slice(startIndex, endIndex);

  //------------------- SIDE EFFECTS ---------------------
  React.useEffect(() => {
    return () => {
      if (pdfBlob) {
        URL.revokeObjectURL(pdfBlob);
      }
    };
  }, []);

  //------------------- HANDLERS ---------------------
  const handlePrintClick = async () => {
    // Generate PDF blob
    const blob = await pdf(
      <CertTemplatePDF
        logo1={reportTemplate?.rte_logoLeft}
        logo2={reportTemplate?.rte_logoRight}
        staff={staff}
        preparedBy={prepared_by}
        recommendedBy={recommended_by}
        approvedBy={approved_by}
        month={`${month.toUpperCase()} ${new Date().getFullYear()}`}
      />  
    ).toBlob();

    // Create object URL
    const pdfUrl = URL.createObjectURL(blob);

    // Open in new tab
    window.open(pdfUrl, "_blank");

    // Store blob to revoke URL later
    setPdfBlob(pdfUrl);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleImageUpload = React.useCallback(async (files: any[]) => {
    if (files.length === 0) return;
    const base64 = await fileToBase64(files[0]);
    const file = {
      name: `media_${files[0].name}_${Date.now()}.${
        files[0].type.split("/")[1]
      }${Math.random().toString(36).substring(2, 8)}`,
      type: files[0].type,
      file: base64,
    };
    return file;
  }, []);

  const handleLeftLogoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    try {
      const file = await handleImageUpload(files);
      console.log;
      if (file) {
        updateTemplate({
          data: {
            logo_left: file,
          },
          type: "CERTIFICATION",
        });
      }
    } catch (err) {
      showErrorToast("Failed to upload logo. Please try again.");
      throw err;
    }
  };

  const handleRightLogoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    try {
      const file = await handleImageUpload(files);
      if (file) {
        updateTemplate({
          data: {
            logo_right: file,
          },
          type: "CERTIFICATION",
        });
      }
    } catch (err) {
      showErrorToast("Failed to upload logo. Please try again.");
      throw err;
    }
  };

  const getName = (value: string) => {
    const name = value.split("-")[1];
    const array = name.split(" ");
    return (`${array[0]}, ${array[1]} ${array.length == 3 && array[2]}`);
  };

  const changePreparedBy = (value: string) => {
    const name = getName(value);

    if (name) {
      updateTemplate(
        {
          data: {
            rte_prepared_by: name.toUpperCase(),
          },
          type: "CERTIFICATION",
        },
        {
          onError: () => {
            showErrorToast("Failed to change signer. Please try again.");
          },
        }
      );
    }
  };

  const changeRecommendedBy = (value: string) => {
    const name = getName(value);
    if (name) {
      updateTemplate(
        {
          data: {
            rte_recommended_by: name.toUpperCase(),
          },
          type: "CERTIFICATION",
        },
        {
          onError: () => {
            showErrorToast("Failed to change signer. Please try again.");
          },
        }
      );
    }
  };

  const changeApprovedBy = (value: string) => {
    const name = getName(value);
    if (name) {
      updateTemplate(
        {
          data: {
            rte_approved_by: name.toUpperCase(),
          },
          type: "CERTIFICATION",
        },
        {
          onError: () => {
            showErrorToast("Failed to change signer. Please try again.");
          },
        }
      );
    }
  };

  // Logo component
  const LogoUpload = ({
    logoUrl,
    onLogoChange,
    inputId,
  }: {
    logoUrl?: string;
    onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputId: string;
    alt: string;
  }) => (
    <div className="flex flex-col items-center relative">
      <Input
        type="file"
        ref={fileInputRef}
        onChange={onLogoChange}
        accept="image/*"
        className="hidden"
        id={inputId}
      />

      <label htmlFor={inputId} className="relative cursor-pointer group">
        {logoUrl ? (
          <>
            <img
              src={logoUrl}
              className="w-[70px] h-[70px] rounded-full object-cover bg-gray-100 border-2 border-gray-200"
            />
            {/* Hover overlay for existing logo */}
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Upload size={16} className="text-white mb-1" />
              <span className="text-white text-xs font-medium">Change</span>
            </div>
          </>
        ) : (
          <div className="w-[70px] h-[70px] rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center group-hover:border-gray-500 group-hover:bg-gray-200 transition-all duration-200">
            <Upload
              size={20}
              className="text-gray-500 group-hover:text-gray-600 mb-1"
            />
            <span className="text-gray-600 text-xs font-medium group-hover:text-gray-700">
              Logo
            </span>
          </div>
        )}
      </label>

      {!logoUrl && (
        <div className="mt-2 text-center">
          <p className="text-xs font-medium text-gray-600">
            Click to upload logo
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-[800px]">
      <section className="relative w-full h-full bg-white mb-5 shadow-sm border flex flex-col items-center p-16">
        <TooltipLayout
          trigger={
            <div
              className="absolute top-2 right-2 bg-black/50 p-2 rounded-sm cursor-pointer"
              onClick={handlePrintClick}
            >
              <Printer size={20} className="text-white" />
            </div>
          }
          content={"Print/Pdf"}
        />

        {/* Pagination Controls - Top */}
        <div className="absolute top-2 left-2 flex items-center gap-2 bg-gray-100 p-2 rounded-sm">
          {totalPages > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm font-medium px-2">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight size={16} />
              </Button>
            </>
          )}
          <div className="w-40">
            <SelectLayout 
              value={month}
              options={getMonths.map((month) => ({
                id: month,
                name: capitalize(month) as string
              }))}
              onChange={(value: string) => setMonth(value)}
              placeholder={month}
              withRest={false}
            />
          </div>
        </div>

        <div className="w-full h-full flex flex-col items-center gap-2 mt-4">
          <div className="w-[95%] flex justify-between ">
            <LogoUpload
              logoUrl={reportTemplate?.rte_logoLeft}
              onLogoChange={handleLeftLogoChange}
              inputId="logo-1"
              alt="Left Logo"
            />

            <div className="flex flex-col gap-2 text-center">
              <Label>REPUBLIC OF THE PHILIPPINES</Label>
              <Label>CITY OF CEBU</Label>
              <Label>CEBU CITY DISASTER RISK REDUCTION MANAGEMENT OFFICE</Label>
              <Label>BARANGAY SAN ROQUE (CIUDAD) </Label>
            </div>

            <LogoUpload
              logoUrl={reportTemplate?.rte_logoRight}
              onLogoChange={handleRightLogoChange}
              inputId="logo-2"
              alt="Right Logo"
            />
          </div>
          <div className="w-full h-full flex flex-col">
            <div className="w-full h-full flex flex-col items-center">
              <div className="w-full flex justify-center">
                <div className="w-[80%] flex flex-col h-full py-5">
                  <div className="w-full flex flex-col mb-8 gap-2">
                    <Label className="text-center">CERTIFICATION</Label>
                    <Label>
                      This is to certify that the following names listed below are the BARANGAY BASE RESPONDERS OF BARANGAY SAN ROQUE (CIUDAD)
                      satisfactory rendered their services.
                    </Label>
                  </div>
                  <div className="w-[80%]">
                    <div className="flex">
                      <div className="w-full h-full flex">
                        <div className="w-1/2 h-full flex">
                          <Label className="w-full text-center">NAMES</Label>
                        </div>
                      </div>
                      <div className="w-1/2 h-full flex flex-col">
                        <Label className="w-full text-center">SIGNATURE</Label>
                      </div>
                    </div>
                    <div className="flex flex-col mt-7">
                      {currentStaff?.map((member: any, idx: number) => (
                        <div key={idx} className="w-full flex">
                          <div className="w-full flex justify-start">
                            <Label className="text-[15px]">{`${startIndex + idx + 1}. 
                              ${member.lname.toUpperCase()}, ${member.fname.toUpperCase()}
                              ${member.mname ? member.mname.toUpperCase() : ""} 
                            `}</Label>
                          </div>
                          <div className="w-1/2 flex justify-start">
                            <div className="w-full flex px-5">
                              <Label className="w-full text-center">
                                ______________________________
                              </Label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Label className="mt-8">
                    This certification is issued upon the request set forth by the office of the Barangay Base Responders for the month of {month.toUpperCase()} {new Date().getFullYear()}.
                  </Label>
                </div>
              </div>
              <div className="w-full h-full flex flex-col items-center">
                <div className="w-[80%] h-full flex flex-row justify-between gap-3 py-5">
                  <div className="w-full h-full flex flex-col">
                    <Label className="w-full mb-10">PREPARED BY:</Label>
                    <div className="relative flex mb-2">
                      <Combobox
                        variant="modal"
                        customTrigger={
                          <Pen
                            size={16}
                            className="absolute right-0 top-0 cursor-pointer"
                          />
                        }
                        value=""
                        onChange={(value) => changePreparedBy(value as string)}
                        options={formattedStaffs}
                        emptyMessage="No staff available"
                        size={1000}
                      />
                      <Label className="w-full text-center">{prepared_by}</Label>
                    </div>
                    <Label className="w-full text-center">TEAM LEADER</Label>
                  </div>
                  <div className="w-full h-full flex flex-col">
                    <Label className="w-full mb-10">RECOMMENDED BY:</Label>
                    <div className="relative flex mb-2">
                      <Combobox
                        variant="modal"
                        customTrigger={
                          <Pen
                            size={16}
                            className="absolute right-0 top-0 cursor-pointer"
                          />
                        }
                        value=""
                        onChange={(value) =>
                          changeRecommendedBy(value as string)
                        }
                        options={formattedStaffs}
                        emptyMessage="No staff available"
                        size={700}
                      />
                      <Label className="w-full text-center">{recommended_by}</Label>
                    </div>
                    <Label className="w-full text-center">
                      BARANGAY CAPTAIN
                    </Label>
                  </div>
                  <div className="w-full h-full flex flex-col">
                    <Label className="w-full mb-10">APPROVED BY:</Label>
                    <div className="relative flex mb-2">
                      <Combobox
                        variant="modal"
                        customTrigger={
                          <Pen
                            size={16}
                            className="absolute right-0 top-0 cursor-pointer"
                          />
                        }
                        value=""
                        onChange={(value) => changeApprovedBy(value as string)}
                        options={formattedStaffs}
                        emptyMessage="No staff available"
                        size={700}
                      />
                      <Label className="w-full text-center">{approved_by}</Label>
                    </div>
                    <Label className="w-full text-center">
                      ASST. DEPARTMENT HEAD
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};