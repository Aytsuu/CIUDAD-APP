import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useInstantFileUpload } from "@/hooks/use-file-upload";
import { Upload } from "lucide-react";
import React from "react";

export const WARTemplatePage1 = () => {
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
      <section className="w-full h-full bg-white mb-5 shadow-sm border flex flex-col items-center">
        <div className="w-[90%] h-full flex flex-col items-center gap-1">
          <div className="w-[60%] flex justify-between">
            <div className="flex flex-col items-center my-4 relative">
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
                  className="w-32 h-32 rounded-full object-cover bg-gray"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Upload size={24} className="text-white" />
                </div>
              </label>
            </div>
            <div className="text-center">
              <h1>REPUBLIC OF THE PHILIPPINES</h1>
              <h1>CITY OF CEBU</h1>
              <h1>CEBU CITY DISASTER RISK REDUCTION MANAGEMENT OFFICE</h1>
              <h1>Weekly Accomplishment Report  September 01-05, 2024 </h1>
              <h1>BARANGAY SAN ROQUE (CIUDAD) </h1>
            </div>
            <div className="flex flex-col items-center my-4 relative">
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
                  className="w-32 h-32 rounded-full object-cover bg-gray"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Upload size={24} className="text-white" />
                </div>
              </label>
            </div>
          </div>
          <Separator />
          <div className="w-full flex flex-col items-center">
            <h1>ACTION PHOTO REPORTS</h1>
            <div className="w-full">
              <h1>NAME OF INCIDENT OR ACTIVITY: </h1>
              <h1>DATE & TIME:</h1>
              <h1>LOCATION:</h1>
              <h1>ACTIONS TAKEN:</h1>
            </div>
            <div className="flex gap-10">
              <img className="w-[230px] h-[200px] bg-gray" />
              <img className="w-[230px] h-[200px] bg-gray" />
              <img className="w-[230px] h-[200px] bg-gray" />
            </div>
            <div className="w-[85%] flex justify-between">
              <div>
                <h1>PREPARED BY:</h1>
                <h1>Juno</h1>
                <h1>TEAM LEADER</h1>
              </div>
              <div>
                <h1>RECOMMENDED BY:</h1>
                <h1>Juno</h1>
                <h1>BARANGAY CAPTAIN</h1>
              </div>
              <div>
                <h1>APPROVED BY:</h1>
                <h1>Juno</h1>
                <h1>ASST. DEPARTMENT HEAD</h1>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="pb-10" />
    </div>
  );
};
