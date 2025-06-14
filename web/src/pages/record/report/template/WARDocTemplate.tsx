import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/table/data-table";
import { useInstantFileUpload } from "@/hooks/use-file-upload";
import { Upload } from "lucide-react";
import React from "react";
import { WARDummy } from "@/template/report/acknowledgement/ARTemplateColumns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { cn } from "@/lib/utils";
import { PDFViewer } from "@react-pdf/renderer";
import { WARTemplatePDF } from "./WARTemplatePDF";

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

export const WARDocTemplate = () => {
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
          <WARTemplatePDF
                logo1={logo1}
                logo2={logo1}
                reportPeriod=""
                tableData={WARDummy}
                preparedBy={"JUNO"}
                recommendedBy={"JUNO"}
                approvedBy={"JUNO"}
              />
        </PDFViewer>
      </div>
      <section className="w-full h-full bg-white mb-5 shadow-sm border flex flex-col items-center p-[30px]">
        <div className="w-full h-full flex flex-col items-center gap-2">
          <div className="w-[50%] flex justify-between ">
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
              <Label>Weekly Accomplishment Report September 01-05, 2024 </Label>
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
                  {WARDummy.map((row, rowIndex) => (
                    <TableRow key={`row-${rowIndex}`}>
                      {Object.entries(row).map(([_, value], cellIndex) => (
                        <TableCell
                          key={`cell-${cellIndex}`}
                          className="text-center text-[13px] border border-black" // Responsive font size and padding
                        >
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* <DataTable 
                columns={WARTemplateColumns} 
                data={WARDummy}
                headerClassName="bg-white border border-black text-black text-[13px]"
                cellClassName="border border-black text-black"
              /> */}
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
