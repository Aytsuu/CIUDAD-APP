import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInstantFileUpload } from "@/hooks/use-file-upload";
import { CircleAlert, Loader2, Pen, Printer, Upload, X } from "lucide-react";
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { cn } from "@/lib/utils";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import { WARTemplatePDF } from "./WARTemplatePDF";
import { useUpdateTemplate } from "../queries/reportUpdate";
import { useGetSpecificTemplate } from "../queries/reportFetch";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Card, CardContent } from "@/components/ui/card/card";
import { useGetStaffByTitle } from "../../administration/queries/administrationFetchQueries";
import { formatStaffs } from "../../administration/administrationFormats";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";

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
  data,
} : {
  data: any;
}) => {
  const { uploadFile } = useInstantFileUpload({});
  const { mutateAsync: updateTemplate } = useUpdateTemplate();
  const { data: reportTemplate, isLoading: isLoadingTemplate } = useGetSpecificTemplate('WAR');  
  const { data: staffByTitle, isLoading: isLoadingStaffByTitle } = useGetStaffByTitle('all');
  const [pdfBlob, setPdfBlob] = React.useState<string>(''); 
  const [crew, setCrew] = React.useState<Record<string,any>[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const formattedStaffs = React.useMemo(() => formatStaffs(staffByTitle) ,[staffByTitle]);
  const isLoading = React.useMemo(() => 
    isLoadingTemplate || isLoadingStaffByTitle
  , [isLoadingTemplate, isLoadingStaffByTitle])

  const prepared_by = React.useMemo(() => 
    reportTemplate?.rte_prepared_by.split("-")[1] || 'Not Added' ,[reportTemplate]);
  const recommended_by = React.useMemo(() => 
    reportTemplate?.rte_recommended_by || 'Not Added' ,[reportTemplate]);
  const approved_by = React.useMemo(() => 
    reportTemplate?.rte_approved_by || 'Not Added' ,[reportTemplate]);

  React.useEffect(() => {
    if(prepared_by) {
      const group = reportTemplate?.rte_prepared_by.split("-")[0]
      const crewMembers = staffByTitle?.filter((staff: any) => staff.group == group);
      if(crewMembers) setCrew(crewMembers);
    }
  }, [prepared_by, staffByTitle, reportTemplate])

  const handlePrintClick = async () => {
    // Generate PDF blob
    const blob = await pdf(
      <WARTemplatePDF
        logo1={reportTemplate?.rte_logoLeft}
        logo2={reportTemplate?.rte_logoRight}
        reportPeriod=""
        data={data}
        preparedBy={prepared_by}
        recommendedBy={recommended_by}
        approvedBy={approved_by}
        crew={crew}
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

  const errorFeedback = () => {
    toast("Failed to change signer. Please try again.", {
      icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      style: {
        border: '1px solid rgb(225, 193, 193)',
        padding: '16px',
        color: '#b91c1c',
        background: '#fef2f2',
      },
      action: {
        label: <X size={14} className="bg-transparent"/>,
        onClick: () => toast.dismiss(),
      },
    });
  }

  const getName = (value: string) => {
    const array = value.split("-")[1];
    return array.split(" ").join(", ");
  }

  const changePreparedBy = (value: string) => {
    const name = getName(value);
    const teamHeadID = value.split(" ")[0]
    const group = staffByTitle.find((staff: any) => staff.staff_id == teamHeadID)?.group;
    const crewMembers = staffByTitle.filter((staff: any) => staff.group == group);

    if(name) {
      updateTemplate({
        data: {
          rte_prepared_by: `${group}-${name.toUpperCase()}`
        },
        type: 'WAR'
      }, {
        onSuccess: () => {
          setCrew(crewMembers)
        },
        onError: ()  => {
          errorFeedback();
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
        type: 'WAR'
      }, {
        onError: ()  => {
          errorFeedback();
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
        type: 'WAR'
      }, {
        onError: ()  => {
          errorFeedback();
        }
      })
    }
  }

  if(isLoading) {
    return (
      <div className="w-full flex flex-col gap-4">
        <Card className="rounded-none">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-buttonBlue" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Loading Document</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we load the staff information and document details...
                </p>
              </div>
              {/* Loading bars */}
              <div className="w-full max-w-md space-y-2">
                <div className="h-2 bg-gray-200 animate-pulse rounded-full"></div>
                <div className="h-2 bg-gray-200 animate-pulse rounded-full w-3/4"></div>
                <div className="h-2 bg-gray-200 animate-pulse rounded-full w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <div className="w-full flex flex-col border-r border-black h-full py-5">
                <div className="flex">
                  <div className="w-full h-full flex">
                    <Label className="w-full text-center">CREW MEMBER</Label>
                  </div>
                  <div className="w-1/2 h-full flex flex-col">
                    <Label className="w-full text-center">SIGNATURE</Label>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-7">
                  {crew?.map((member: any, idx: number) => 
                    <div className="w-full flex">
                      <div className="w-full flex justify-start px-7">
                        <Label className="w-full">{`${idx + 1}. 
                          ${member.lname.toUpperCase()}, ${member.fname.toUpperCase()}
                          ${member.mname ? member.mname.toUpperCase() : ''} 
                        `}</Label>
                      </div>
                      <div className="w-1/2 flex justify-start">
                        <div className="w-full flex px-5">
                          <Label className="w-full text-center">_________________________</Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-[80%] h-full flex flex-col justify-between py-5 px-2">
                <div className="h-full flex flex-col">
                  <Label className="w-full mb-10">PREPARED BY:</Label>
                  <div className="relative flex mb-2">
                    <Combobox
                      variant="modal"
                      customTrigger={<Pen size={16} className="absolute right-0 top-0 cursor-pointer"/>}
                      value=""
                      onChange={(value) => changePreparedBy(value)}
                      options={formattedStaffs}
                      emptyMessage="No staff available"
                    />
                    <Label className="w-full text-center">{prepared_by}</Label>
                  </div>
                  <Label className="w-full text-center">TEAM LEADER</Label>
                </div>
                <div className="h-full flex flex-col">
                  <Label className="w-full mb-10">RECOMMENDED BY:</Label>
                  <div className="relative flex mb-2">
                    <Combobox
                      variant="modal"
                      customTrigger={<Pen size={16} className="absolute right-0 top-0 cursor-pointer"/>}
                      value=""
                      onChange={(value) => changeRecommendedBy(value)}
                      options={formattedStaffs}
                      emptyMessage="No staff available"
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
                      onChange={(value) => changeApprovedBy(value)}
                      options={formattedStaffs}
                      emptyMessage="No staff available"
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
