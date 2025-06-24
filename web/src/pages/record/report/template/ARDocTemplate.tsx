import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useInstantFileUpload } from "@/hooks/use-file-upload";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { Loader2, Printer, Upload } from "lucide-react";
import React from "react";
import { ARTemplatePDF } from "./ARTemplatePDF";
import { Label } from "@/components/ui/label";
import { useUpdateTemplate } from "../queries/reportUpdate";
import { useGetSpecificTemplate } from "../queries/reportFetch";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";

export const ARDocTemplate = ({
  incident,
  dateTime,
  location,
  act_taken,
  images,
} : {
  incident: string;
  dateTime: string;
  location: string;
  act_taken: string;
  images: any[]
}) => {
  const { uploadFile } = useInstantFileUpload({});
  const { mutateAsync: updateTemplate } = useUpdateTemplate();
  const { data: reportTemplate, isLoading } = useGetSpecificTemplate('AR'); 
  const [pdfBlob, setPdfBlob] = React.useState<string>(''); 
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePrintClick = async () => {
    // Generate PDF blob
    const blob = await pdf(
      <ARTemplatePDF 
        logo1={reportTemplate.rte_logoLeft}
        logo2={reportTemplate.rte_logoRight}
        incidentName={incident}
        dateTime={dateTime}
        location={location}
        actionsTaken={act_taken}
        preparedBy={"JUNO"}
        recommendedBy={"JUNO"}
        approvedBy={"JUNO"}
        images={images}
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
          type: 'AR'  
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
          type: 'AR'  
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
        <div className="w-full h-full flex flex-col items-center gap-1">
          <div className="w-[53%] flex justify-between ">
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
                  alt="Logo"
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
              <Label>BARANGAY BASE RESPONDERS</Label>
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
                  alt="Logo"
                  className="w-[70px] h-[70px] rounded-full object-cover bg-gray"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Upload size={24} className="text-white" />
                </div>
              </label>
            </div>
          </div>
          <Separator className="bg-black mt-4"/>
          <div className="w-full flex flex-col items-center">
            <Label className="my-2">ACTION PHOTO REPORTS</Label>
            <div className="w-full flex flex-col space-y-2">
              <Label>NAME OF INCIDENT OR ACTIVITY: <span>{incident}</span></Label>
              <Label>DATE & TIME: <span>{dateTime}</span></Label>
              <Label>LOCATION: <span>{location}</span></Label>
              <Label>ACTIONS TAKEN: <span>{act_taken}</span></Label>
            </div>
            <div className="flex gap-8 mt-6">
              {images.map((image: any) => (
                <img src={image.arf_url} className="w-[250px] h-[220px] bg-gray" />
              ))}
            </div>
            <div className="w-[85%] flex justify-between mt-12">
              <div className="flex flex-col gap-2">
                <Label className="mb-5">PREPARED BY:</Label>
                <Label>Juno</Label>
                <Label>TEAM LEADER</Label>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="mb-5">RECOMMENDED BY:</Label>
                <Label>Juno</Label>
                <Label>BARANGAY CAPTAIN</Label>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="mb-5">APPROVED BY:</Label>
                <Label>Juno</Label>
                <Label>ASST. DEPARTMENT HEAD</Label>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="pb-10" />
    </div>
  );
};
