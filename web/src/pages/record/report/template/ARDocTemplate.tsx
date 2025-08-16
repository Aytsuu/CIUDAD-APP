import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { pdf } from "@react-pdf/renderer";
import { CircleAlert, Loader2, Pen, Printer, Upload, X } from "lucide-react";
import React from "react";
import { ARTemplatePDF } from "./ARTemplatePDF";
import { Label } from "@/components/ui/label";
import { useUpdateTemplate } from "../queries/reportUpdate";
import { useGetSpecificTemplate } from "../queries/reportFetch";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Card, CardContent } from "@/components/ui/card/card";
import { Combobox } from "@/components/ui/combobox";
import { useGetStaffByTitle } from "../../administration/queries/administrationFetchQueries";
import { formatStaffs } from "../../administration/AdministrationFormats";
import { toast } from "sonner";

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
  images: any[];
}) => {
  const { mutateAsync: updateTemplate } = useUpdateTemplate();
  const { data: reportTemplate, isLoading: isLoadingTemplate } = useGetSpecificTemplate('AR'); 
  const { data: staffByTitle, isLoading: isLoadingStaffByTitle } = useGetStaffByTitle('all');
  const [pdfBlob, setPdfBlob] = React.useState<string>(''); 
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const formattedStaffs = React.useMemo(() => formatStaffs(staffByTitle) ,[staffByTitle]);
  const isLoading = React.useMemo(() => 
    isLoadingTemplate || isLoadingStaffByTitle
  , [isLoadingTemplate, isLoadingStaffByTitle])

  const prepared_by = React.useMemo(() => 
    reportTemplate?.rte_prepared_by || 'Not Added' ,[reportTemplate]);
  const recommended_by = React.useMemo(() => 
    reportTemplate?.rte_recommended_by || 'Not Added' ,[reportTemplate]);
  const approved_by = React.useMemo(() => 
    reportTemplate?.rte_approved_by || 'Not Added' ,[reportTemplate]);

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
        preparedBy={prepared_by}
        recommendedBy={recommended_by}
        approvedBy={approved_by}
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
    return value.split(" ").map((val, idx) => {
      if(idx > 1) {
        return val
      }
    }).filter(Boolean).join(", ");
  }

  const changePreparedBy = (value: string) => {
    const name = getName(value);
    if(name) {
      updateTemplate({
        data: {
          rte_prepared_by: name.toUpperCase()
        },
        type: 'AR'
      }, {
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
        type: 'AR'
      }, {
        onError: ()  => {
          errorFeedback();
        }
      })
    }
  }

  const changeApprovedBy = (value: string) => {
    const name = getName(value);
    if(name) {
      updateTemplate({
        data: {
          rte_approved_by: name.toUpperCase()
        },
        type: 'AR'
      }, {
        onError: ()  => {
          errorFeedback();
        }
      })
    }
  }

  const handleImageUpload = React.useCallback(async (files: any[]) => {
    if (files.length === 0) return;

    // const newFile = {
    //   type: files[0].type.startsWith("image/")
    //     ? "image"
    //     : files[0].type.startsWith("video/")
    //     ? "video"
    //     : ("document" as "image" | "video" | "document"),
    //   file: files[0],
    //   status: "uploading" as const,
    //   previewUrl: URL.createObjectURL(files[0]),
    // };

    return null;
  }, []);

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
                <div className="relative">
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
              <div className="flex flex-col gap-2">
                <Label className="mb-5">RECOMMENDED BY:</Label>
                <div className="relative">
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
              <div className="flex flex-col gap-2">
                <Label className="mb-5">APPROVED BY:</Label>
                <div className="relative">
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
      </section>
      <div className="pb-10" />
    </div>
  );
};