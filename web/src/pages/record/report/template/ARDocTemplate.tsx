import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useInstantFileUpload } from "@/hooks/use-file-upload";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Upload } from "lucide-react";
import React from "react";
import { ARTemplatePDF } from "./ARTemplatePDF";
import { Label } from "@/components/ui/label";

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
  const [logo1, setLogo1] = React.useState<string>();
  const [file1, setFile1] = React.useState<any>();
  const { uploadFile } = useInstantFileUpload({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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

    setFile1(newFile);

    const { publicUrl, storagePath } = await uploadFile(newFile.file);
    if (publicUrl) {
      setLogo1(publicUrl);
      setFile1((prev: any) => ({
        ...prev,
        storagePath,
        status: "uploaded",
      }));
    }
  };
  return (
    <div className="w-full h-[700px]">
      <div className="mb-4">
        <PDFViewer
          className="w-full h-[700px] bg-blue-500 text-black hover:bg-blue-600"
        >
          <ARTemplatePDF 
              logo1={logo1}
              logo2={logo1}
              incidentName={""}
              dateTime={""}
              location={""}
              actionsTaken={""}
              preparedBy={""}
              recommendedBy={""}
              approvedBy={""}
            />
        </PDFViewer>
      </div>
      <section className="w-full h-full bg-white mb-5 shadow-sm border flex flex-col items-center p-[30px]">
        <div className="w-full h-full flex flex-col items-center gap-1">
          <div className="w-[53%] flex justify-between ">
            <div className="flex flex-col items-center relative">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                id="logo-1"
              />

              <label htmlFor="logo-1" className="relative cursor-pointer">
                <img
                  src={file1?.previewUrl}
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
              <Label>BARANGAY BASE RESPONDERS</Label>
              <Label>BARANGAY SAN ROQUE (CIUDAD) </Label>
            </div>
            <div className="flex flex-col items-center relative">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                id="logo-1"
              />

              <label htmlFor="logo-1" className="relative cursor-pointer">
                <img
                  src={file1?.previewUrl}
                  alt="Profile"
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
              <img className="w-[250px] h-[220px] bg-gray" />
              <img className="w-[250px] h-[220px] bg-gray" />
              <img className="w-[250px] h-[220px] bg-gray" />
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
