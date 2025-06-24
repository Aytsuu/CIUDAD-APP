import React from "react"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { ARDocTemplate } from "./template/ARDocTemplate"
import { WARDocTemplate } from "./template/WARDocTemplate"
import { CircleAlert, FileText, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Input } from "@/components/ui/input"
import { useInstantFileUpload } from "@/hooks/use-file-upload"
import { useLocation } from "react-router"
import { getDateTimeFormat } from "@/helpers/dateFormatter"
import { useAddARFile, useAddWARFile } from "./queries/reportAdd"
import { useAuth } from "@/context/AuthContext"

export default function ReportDocument() {
  const { user } = useAuth();
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const { uploadFile } = useInstantFileUpload({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const data = React.useMemo(() => params?.data, [params]);
  const type = React.useMemo(() => params?.type, [params]);

  // For Acknolwedgement Report Document
  const { mutateAsync: addARFile } = useAddARFile();
  const images = React.useMemo(() => data?.ar_files?.filter((file: any) => 
    file.arf_type.startsWith('image/')), [data]);
  const arDocs = React.useMemo(() => data?.ar_files?.filter((file: any) => 
    file.arf_type.startsWith('application/')), [data])

  // For Weekly Accomplishment Report Document
  const { mutateAsync: addWARFile } = useAddWARFile();
  const compositions = React.useMemo(() => data?.war_composition || [], [data])
  const warDocs = React.useMemo(() => data?.war_files, [data]);

  const handleOpenDocument = () => { 
    // Open document in new tab
    window.open(type ==="AR" ? 
      arDocs[0].arf_url: warDocs[0].warf_url
    , '_blank');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Uploading...')
    const files = Array.from(e.target.files || []);
    if(files.length === 0) return;
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

    const { publicUrl, storagePath } = await uploadFile(newFile.file);
    if (publicUrl) {

      console.log(type)
      
      if (type === "AR") {
        // Adding signed document for acknolwedgement report
        addARFile([{
          'arf_name': newFile.file.name,
          'arf_type': newFile.file.type,
          'arf_path': storagePath,
          'arf_url': publicUrl,
          'ar': data.id,
          'staff': user?.djangoUser?.resident_profile?.staff?.staff_id
        }], {
          onSuccess: () => {
            
          }
        })
      } else {
        // Adding signed document for weekly accomplishment report
        addWARFile([{
          'warf_name': newFile.file.name,
          'warf_type': newFile.file.type,
          'warf_path': storagePath,
          'warf_url': publicUrl,
          'war': data.id,
          'staff': user?.djangoUser?.resident_profile?.staff?.staff_id
        }], {
          onSuccess: () => {

          }
        })
      }
    }
  }

  return (
    <LayoutWithBack 
      title={type === "AR" ? "Acknowledgement Report Document" : "Weekly AR Document"} 
      description={type === "AR" ? 
        "Review and manage your AR document" : 
        "Review and manage your Weekly AR document"
      }
    >
      <div className="w-full h-full flex">
        <div className="w-80 pr-6">
          <Card className="rounded-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Status</h3>
                <div className="flex items-center gap-2">
                  <CircleAlert className="h-4 w-4 text-amber-500" />
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {data.status}
                  </Badge>
                </div>
                {data.status === "Unsigned" && <p className="text-xs text-muted-foreground">
                  Status will update to <span className="font-medium text-red-500">LAPSED</span> by the end of the week
                  if no document is uploaded.
                </p>}
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-medium">Actions</h3>
                {data.status === "Unsigned" ? (<>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" 
                    className="flex justify-center items-center cursor-pointer bg-buttonBlue 
                            text-white px-3 py-2 gap-2 rounded-lg"
                  >
                      <Upload className="h-4 w-4" />
                      <span className="text-[13px] font-medium">Upload signed document</span>
                  </label>
                </>) : (
                  <>
                    <label 
                      className="flex justify-center items-center cursor-pointer bg-buttonBlue 
                              text-white px-3 py-2 gap-2 rounded-lg"
                      onClick={handleOpenDocument}
                    >
                        <FileText className="h-4 w-4" />
                        <span className="text-[13px] font-medium">Open document</span>
                    </label>
                  </>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium">Document Info</h3>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{data.date}</span>
                  <span className="text-muted-foreground">Document ID:</span>
                  <span>{data.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document - Scrollable content */}
        <div className="w-full flex flex-col gap-4">
          {type === "AR" ? 
            <ARDocTemplate
              incident={data.ar_title}
              dateTime={getDateTimeFormat(`${data.ar_date_completed} ${data.ar_time_completed}`)}
              location={`Sitio ${data.ar_sitio}, ${data.ar_street}`}
              act_taken={data.ar_action_taken}
              images={images}
            /> : 
            <WARDocTemplate 
              data={compositions.map((comp: any) => ({
                incident_area: `Sitio ${comp.ar.ar_sitio}, ${comp.ar.ar_street}`,
                act_undertaken: comp.ar.ar_action_taken,
                time_started: comp.ar.ar_time_started,
                time_completed: comp.ar.ar_time_completed,
                result: comp.ar.ar_result
              }))}
            />
            }
        </div>
      </div>
    </LayoutWithBack>
  )
}
