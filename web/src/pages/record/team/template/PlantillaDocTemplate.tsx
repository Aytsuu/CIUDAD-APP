import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pen, Printer, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { cn } from "@/lib/utils";
import { pdf } from "@react-pdf/renderer";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Combobox } from "@/components/ui/combobox";
import { formatStaffs } from "../../administration/AdministrationFormats";
import { fileToBase64 } from "@/helpers/fileHelpers";
import { showErrorToast } from "@/components/ui/toast";
import { useUpdateTemplate } from "../../report/queries/reportUpdate";
import { useGetSpecificTemplate } from "../../report/queries/reportFetch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button/button";
import { PlantillaTemplatePDF } from "./PlantillaTemplatePDF";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { getMonthName, getMonths } from "@/helpers/dateHelper";
import { capitalize } from "@/helpers/capitalize";

const header = [
  {
    colName: 'NAMES',
    size: 'w-[250px]'
  },
  {
    colName: 'DESIGNATION',
    size: 'w-[250px]'
  },
  {
    colName: 'PERIOD COVERED',
    size: 'w-[170px]'
  },
  {
    colName: 'RATE/AMOUNT',
    size: 'w-[170px]'
  },
]

const ITEMS_PER_PAGE = 10;

export const PlantillaDocTemplate = ({
  staff
} : {
  staff: Record<string, any>[]
}) => {
  //------------------- STATE INITIALIZATION ---------------------
  const [pdfBlob, setPdfBlob] = React.useState<string>(''); 
  // const [tableData, setTableData] = React.useState<any[]>([])
  const [month, setMonth] = React.useState<string>(getMonthName(new Date().toISOString()));
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [rate, setRate] = React.useState<number>(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { mutateAsync: updateTemplate } = useUpdateTemplate();
  const { data: reportTemplate } = useGetSpecificTemplate('PLANTILLA');  
  const formattedStaffs = React.useMemo(() => formatStaffs(staff) ,[staff]);

  const prepared_by = reportTemplate?.rte_prepared_by || 'NOT ADDED';
  const recommended_by = reportTemplate?.rte_recommended_by || 'NOT ADDED';
  const approved_by = reportTemplate?.rte_approved_by || 'NOT ADDED';

  // Pagination calculations
  const totalPages = Math.ceil(staff.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentStaff = staff.slice(startIndex, endIndex);

  //------------------- SIDE EFFECTS ---------------------
  React.useEffect(() => {
    return (() => {
      if(pdfBlob) {
        URL.revokeObjectURL(pdfBlob);
      }
    })
  }, [])

  //------------------- HANDLERS ---------------------
  const handlePrintClick = async () => {
    // Generate PDF blob
    const blob = await pdf(
      <PlantillaTemplatePDF
        logo={reportTemplate?.rte_logoTop}
        rate={rate}
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
    window.open(pdfUrl, '_blank');
    
    // Store blob to revoke URL later
    setPdfBlob(pdfUrl);
  }

  const handleImageUpload = React.useCallback(async (files: any[]) => {
    if (files.length === 0) return;
    const base64 = await fileToBase64(files[0]);
    const file = {
      name: `media_${files[0].name}_${Date.now()}.${files[0].type.split('/')[1]}${Math.random().toString(36).substring(2, 8)}`,
      type: files[0].type, 
      file: base64,
    }
    return file;
  }, []);
    
  const handleTopLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    try {
      const file = await handleImageUpload(files);

      if(file){
        updateTemplate({
          data: {
            logo_top: file
          },
          type: 'PLANTILLA'  
        })
      }
    } catch (err) {
      showErrorToast("Failed to upload logo. Please try again.");
      throw err;
    }
  }

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

  const getName = (value: string) => {
    const name = value.split("-")[1];
    const array = name.split(" ");
    return (`${array[0]}, ${array[1]} ${array.length == 3 && array[2]}`);
  };

  const changePreparedBy = (value: string) => {
    const name = getName(value);

    if(name) {
      updateTemplate({
        data: {
          rte_prepared_by: name.toUpperCase()
        },
        type: 'PLANTILLA'
      }, {
        onError: ()  => {
          showErrorToast("Failed to change signer. Please try again.");
        }
      })
    }
  } 

  const changeRecommendedBy = (value: string) => {
    const name = getName(value);
    if(name) {
      updateTemplate({
        data: {
          rte_recommended_by: name.toUpperCase()
        },
        type: 'PLANTILLA'
      }, {
        onError: ()  => {
          showErrorToast("Failed to change signer. Please try again.");
        }
      });
    }
  }

  const changeApprovedBy = (value: string) => {
    const name = getName(value);
    if(name) {
      updateTemplate({
        data: {
          rte_approved_by: name.toUpperCase()
        },
        type: 'PLANTILLA'
      }, {
        onError: ()  => {
          showErrorToast("Failed to change signer. Please try again.");
        }
      })
    }
  }

  console.log(rate)

  // Logo component (copied from ARDocTemplate)
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
            <Upload size={20} className="text-gray-500 group-hover:text-gray-600 mb-1" />
            <span className="text-gray-600 text-xs font-medium group-hover:text-gray-700">Logo</span>
          </div>
        )}
      </label>
    </div>
  );

  return (
    <div className="w-full h-[900px]">
      <section className="relative w-full h-full bg-white mb-5 shadow-sm border flex flex-col items-center p-[30px]">
        <TooltipLayout
          trigger={
            <div className="absolute top-2 right-2 bg-black/50 p-2 rounded-sm cursor-pointer"
              onClick={handlePrintClick}
            >
              <Printer size={20} className="text-white" />
            </div>
          }
          content={"Print/Pdf"}
        />

        {/* Pagination Controls - Top */}
        <div className="absolute top-2 left-2 flex items-center gap-2 p-2 rounded-sm">
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
          <div className="flex items-center gap-2">
            <SelectLayout 
              withReset={false}
              value={month}
              options={getMonths.map((month) => ({
                id: month,
                name: capitalize(month) as string
              }))}
              onChange={(value: string) => setMonth(value)}
              placeholder={month}
              className="w-40"
            />
            <div className="w-40 flex items-center border shadow-sm rounded-lg px-4">
              <Label>Rate:</Label>
              <Input 
                value={rate}
                onChange={(e) => {
                  const value = e.target.value

                  if(value == "") setRate(0)
                  else setRate(parseFloat(e.target.value))
                }}
                type="text"
                className="border-none shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </div>

        <div className="w-full h-full flex flex-col items-center gap-2">
          <div className="w-[57%] flex flex-col items-center justify-center">
            <LogoUpload
              logoUrl={reportTemplate?.rte_logoTop}
              onLogoChange={handleTopLogoChange}
              inputId="logo-1"
              alt="top logo"
            />
            
            <div className="flex flex-col gap-2 text-center mt-2">
              <Label>Republic of the Philippines</Label>
              <Label>City of Cebu</Label>
              <Label>BARANGAY SAN ROQUE (CIUDAD) </Label>
            </div>
          </div>

          <Separator className="bg-black/40"/>

          <div className="w-[57%] flex flex-col items-center justify-center mb-4"> 
            <div className="flex flex-col gap-2 text-center">
              <Label>PLANTILLA</Label>
              <Label>AUTHORITY TO SERVER</Label>
              <Label>Personnel of the Barangay Base Responders, Barangay San Roque (Ciudad), Cebu City</Label>
            </div>
          </div>

          <div className="w-full h-full flex flex-col">
            <div className="w-full">
              <Table>
                <TableHeader className="h-10">
                  <TableRow>
                      {header.map((head, idx) => (
                        <TableHead 
                          key={`head-${idx}`}
                          className={cn("text-center text-[13px] text-black px-2 py-2 border border-black", head.size)}
                        >     
                          {head.colName}      
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStaff.map((staffMember: any, index: number) => (
                    <TableRow key={`row-${startIndex + index}`}>
                      <TableCell className="text-center text-[13px] border border-black">
                        {`${staffMember.lname}, ${staffMember.fname} ${staffMember.mname ? staffMember.mname : ''}`}
                      </TableCell>
                      <TableCell className="text-center text-[13px] border border-black">BARANGAY BASE RESPONDER</TableCell>
                      <TableCell className="text-center text-[13px] border border-black">{month.toUpperCase()} {new Date().getFullYear()}</TableCell>
                      <TableCell className="text-center text-[13px] border border-black">{`${rate}.00`}</TableCell>
                    </TableRow>
                  ))}  
                </TableBody>
              </Table>
            </div>
            <div className="w-full h-full flex flex-col items-center mt-4">
              <Label>
                List of names who have rendered services to <span className="underline">Barangay San Roque (Ciudad)</span> as Barangay
                Base Responders for the month of {month.toUpperCase()} {new Date().getFullYear()}. It shall be understood that such voluntary act will cease automatically
                if the persons will render his/her resignation.
              </Label>
              <div className="w-[80%] h-full flex flex-row justify-between gap-3 py-8 px-2">
                <div className="w-full h-full flex flex-col">
                  <Label className="w-full mb-10">PREPARED BY:</Label>
                  <div className="relative flex mb-2">
                    <Combobox
                      variant="modal"
                      customTrigger={<Pen size={16} className="absolute right-0 top-0 cursor-pointer"/>}
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
                      customTrigger={<Pen size={16} className="absolute right-0 top-0 cursor-pointer"/>}
                      value=""
                      onChange={(value) => changeRecommendedBy(value as string)}
                      options={formattedStaffs}
                      emptyMessage="No staff available"
                      size={700}
                    />
                    <Label className="w-full text-center">{recommended_by}</Label>
                  </div>
                  <Label className="w-full text-center">BARANGAY CAPTAIN</Label>
                </div>
                <div className="w-full h-full flex flex-col">
                  <Label className="w-full mb-10">APPROVED BY:</Label>
                  <div className="relative flex mb-2">
                    <Combobox
                      variant="modal"
                      customTrigger={<Pen size={16} className="absolute right-0 top-0 cursor-pointer"/>}
                      value=""
                      onChange={(value) => changeApprovedBy(value as string)}
                      options={formattedStaffs}
                      emptyMessage="No staff available"
                      size={700}
                    />
                    <Label className="w-full text-center">{approved_by}</Label>
                  </div>
                  <Label className="w-full text-center">ASST. DEPARTMENT HEAD</Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="pb-10" />
    </div>
  );
};