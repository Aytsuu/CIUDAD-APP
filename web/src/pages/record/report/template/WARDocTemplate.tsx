import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInstantFileUpload } from "@/hooks/use-file-upload";
import { Loader2, Printer, Upload } from "lucide-react";
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { cn } from "@/lib/utils";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import { WARTemplatePDF } from "./WARTemplatePDF";
import { useUpdateTemplate } from "../queries/reportUpdate";
import { useGetSpecificTemplate } from "../queries/reportFetch";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";

const header = [
  {
    colName: 'INCIDENT AREA',
    size: 'w-[250px]'
  },
  {
    colName: 'ACTIVITIES UNDERTAKEN',
    size: 'w-[200px]'
  },
  {
    colName: 'TIME FRAME/STARTED',
    size: 'w-[170px]'
  },
  {
    colName: 'TIME FRAME/COMPLETED',
    size: 'w-[170px]'
  },
  {
    colName: 'RESULT',
    size: 'w-[334px]'
  },
]

export const WARDocTemplate = ({
  data
} : {
  data: any
}) => {
  const { uploadFile } = useInstantFileUpload({});
  const { mutateAsync: updateTemplate } = useUpdateTemplate();
  const { data: reportTemplate, isLoading } = useGetSpecificTemplate('WAR');  
  const [pdfBlob, setPdfBlob] = React.useState<string>(''); 
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePrintClick = async () => {
    // Generate PDF blob
    const blob = await pdf(
      <WARTemplatePDF
        logo1={reportTemplate?.rte_logoLeft}
        logo2={reportTemplate?.rte_logoRight}
        reportPeriod=""
        data={data}
        preparedBy={"JUNO"}
        recommendedBy={"JUNO"}
        approvedBy={"JUNO"}
      />
    ).toBlob();

    // Create object URL
    const pdfUrl = URL.createObjectURL(blob);
    
    // Open in new tab
    window.open(pdfUrl, '_blank');
    
    // Store blob to revoke URL later
    setPdfBlob(pdfUrl);
  }

  React.useEffect(() => {
    return (() => {
      if(pdfBlob) {
        URL.revokeObjectURL(pdfBlob);
      }
    })
  }, [])
    
  const handleLeftLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    try {
      const publicUrl = await handleImageUpload(files);
      if(publicUrl){
        updateTemplate({
          data: {
            rte_logoLeft: publicUrl
          },
          type: 'WAR'  
        })
      }
    } catch (err) {
      throw err;
    }
  }
  
  const handleRightLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    try {
      const publicUrl = await handleImageUpload(files);
      if(publicUrl){
        updateTemplate({
          data: {
            rte_logoRight: publicUrl
          },
          type: 'WAR'  
        })
      }
    } catch (err) {
      throw err;
    }
  }

  const handleImageUpload = React.useCallback(async (files: any[]) => {
    if (files.length === 0) return;

    const newFile = {
      type: files[0].type.startsWith("image/")
        ? "image"
        : files[0].type.startsWith("video/")
        ? "video"
        : ("document" as "image" | "video" | "document"),
      file: files[0],
      status: "uploading" as const,
      previewUrl: URL.createObjectURL(files[0]),
    };

    const { publicUrl } = await uploadFile(newFile.file);
    if (publicUrl) {
      return publicUrl
    }
    return null;
  }, []);

  if(isLoading) {
    return (
      <div className="w-full h-[700px] flex justify-center items-center bg-white border">
        <Loader2 size={30} className="animate-spin text-black/40" />
      </div>
    )
  }

  return (
    <div className="w-full h-[700px]">
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
        <div className="w-full h-full flex flex-col items-center gap-2">
          <div className="w-[50%] flex justify-between ">
            <div className="flex flex-col items-center relative">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleLeftLogoChange}
                accept="image/*"
                className="hidden"
                id="logo-1"
              />

              <label htmlFor="logo-1" className="relative cursor-pointer">
                <img
                  src={reportTemplate?.rte_logoLeft}
                  alt="Profile"
                  className="w-[70px] h-[70px] rounded-full object-cover bg-gray"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Upload size={24} className="text-white" />
                </div>
              </label>
            </div>
            <div className="flex flex-col gap-2 text-center">
              <Label>REPUBLIC OF THE PHILIPPINES</Label>
              <Label>CITY OF CEBU</Label>
              <Label>CEBU CITY DISASTER RISK REDUCTION MANAGEMENT OFFICE</Label>
              <Label>Weekly Accomplishment Report September 01-05, 2024 </Label>
              <Label>BARANGAY SAN ROQUE (CIUDAD) </Label>
            </div>
            <div className="flex flex-col items-center relative">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleRightLogoChange}
                accept="image/*"
                className="hidden"
                id="logo-2"
              />

              <label htmlFor="logo-2" className="relative cursor-pointer">
                <img
                  src={reportTemplate?.rte_logoRight}
                  alt="Profile"
                  className="w-[70px] h-[70px] rounded-full object-cover bg-gray"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Upload size={24} className="text-white" />
                </div>
              </label>
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
                  {data.map((row: any, rowIndex: number) => (
                    <TableRow key={`row-${rowIndex}`}>
                      {Object.entries(row).map(([_, value], cellIndex) => (
                        <TableCell
                          key={`cell-${cellIndex}`}
                          className="text-center text-[13px] border border-black" // Responsive font size and padding
                        >
                          {value as string}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="w-full h-full flex border-x border-b border-black">
              <div className="w-full flex border-r border-black h-full py-5">
                <div className="w-full h-full flex flex-col">
                  <Label className="w-full text-center">CREW MEMBER</Label>
                </div>
                <div className="w-1/2 h-full flex flex-col">
                  <Label className="w-full text-center">SIGNATURE</Label>
                </div>
              </div>
              <div className="w-[80%] h-full flex flex-col justify-between py-5 px-2">
                <div className="h-full flex flex-col">
                  <Label className="w-full mb-10">PREPARED BY:</Label>
                  <Label className="w-full text-center">JUNO</Label>
                  <Label className="w-full text-center">TEAM LEADER</Label>
                </div>
                <div className="h-full flex flex-col">
                  <Label className="w-full mb-10">RECOMMENDED BY:</Label>
                  <Label className="w-full text-center">JUNO</Label>
                  <Label className="w-full text-center">BARANGAY CAPTAIN</Label>
                </div>
                <div className="h-full flex flex-col">
                  <Label className="w-full mb-10">APPROVED BY:</Label>
                  <Label className="w-full text-center">JUNO</Label>
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
