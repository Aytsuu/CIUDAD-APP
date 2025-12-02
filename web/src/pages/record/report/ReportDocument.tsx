import React from "react"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { ARDocTemplate } from "./template/ARDocTemplate"
import { WARDocTemplate } from "./template/WARDocTemplate"
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocation } from "react-router"
import { getDateTimeFormat } from "@/helpers/dateHelper"
import { useAddARFile, useAddWARFile } from "./queries/reportAdd"
import { showErrorToast, showSuccessToast } from "@/components/ui/toast"
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload"
import { useGetARInfo, useGetWARInfo } from "./queries/reportFetch"
import { useLoading } from "@/context/LoadingContext"
import { useDeleteARFile, useDeleteWARFile } from "./queries/reportDelete"
import { useUpdateAR, useUpdateWAR } from "./queries/reportUpdate"

export default function ReportDocument() {
  // ----------------- STATE INITIALIZATION ---------------------
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state] );
  const data = React.useMemo(() => params?.data, [params]);
  const type = React.useMemo(() => params?.type, [params]);
  const { showLoading, hideLoading } = useLoading();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isRemoving, setIsRemoving] = React.useState<boolean>(false);
  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([])

  // For Acknolwedgement Report Document
  const { mutateAsync: addARFile } = useAddARFile();
  const { mutateAsync: deleteARFile } = useDeleteARFile();
  const { mutateAsync: updateAR } = useUpdateAR();
  const { data: ARInfo, isLoading: isLoadingARInfo } = useGetARInfo(
    type === 'AR' ? data.id : null
  ) 
  const images = React.useMemo(() => ARInfo?.ar_files?.filter((file: any) =>   
    !file.is_supp), [ARInfo]);
  const arDocs = React.useMemo(() => ARInfo?.ar_files?.filter((file: any) => 
    file.is_supp), [ARInfo])

  // For Weekly Accomplishment Report Document
  const { mutateAsync: addWARFile } = useAddWARFile();
  const { mutateAsync: deleteWARFile } = useDeleteWARFile();
  const { mutateAsync: updateWAR } = useUpdateWAR();
  const { data: WARInfo, isLoading: isLoadingWARInfo } = useGetWARInfo(type !== 'AR' ? data.id : null)
  const compositions = React.useMemo(() => WARInfo?.war_composition || [], [WARInfo])
  const warDocs = React.useMemo(() => WARInfo?.war_files, [WARInfo]);

  // Determine current info
  const isLoadingDetails = type === "AR" ? isLoadingARInfo : isLoadingWARInfo;
  const currentInfo = type === "AR" ? ARInfo : WARInfo; 
  const currentDocs = type === "AR" ? arDocs : warDocs; 
  const signed = currentInfo?.status?.toLowerCase() === 'signed' || currentDocs?.length > 0
  const formatDocs = React.useMemo(() => currentDocs?.map((doc: any) => ({
    id: doc.warf_id || doc.id,
    name: doc.warf_name || doc.name,
    type: doc.warf_type || doc.type,
    file: null,
    url: doc.warf_url || doc.url,
  })), [currentDocs])

  // ----------------- SIDE EFFECTS ---------------------
  React.useEffect(() => {
    if(isLoadingARInfo || isLoadingWARInfo) showLoading();
    else hideLoading();
  }, [isLoadingARInfo, isLoadingWARInfo])

  React.useEffect(() => {
    if(!formatDocs || formatDocs.length === 0) return;
    setMediaFiles(formatDocs);
  }, [formatDocs])

  React.useEffect(() => {
    const files = mediaFiles?.map((media: any) => ({
      'name': media.name,
      'type': media.type,
      'file': media.file
    })).filter((media) => media.file);

    if(files.length === 0) return;
    setIsSubmitting(true);
    try {
      if (type === "AR") {
        // Adding signed document for acknolwedgement report
        addARFile({
          'files': files,
          'arf_is_supp': true,
          'ar_id': ARInfo?.id
        }, {
          onSuccess: () => {
            showSuccessToast("Document uploaded successfully");
            setIsSubmitting(false)
          }
        })
      } else {
        // Adding signed document for weekly accomplishment report
        addWARFile({
          'files': files,
          'war_id': WARInfo?.id
        }, {
          onSuccess: () => {
            showSuccessToast("Document uploaded successfully");
            setIsSubmitting(false)
          }
        })
      }
    } catch (err) {
      setIsSubmitting(false);
      setMediaFiles([]);
      showErrorToast("Failed to upload document. Please try again.");
    }
    
  }, [mediaFiles, type])

  // ----------------- HANDLERS ---------------------
  const removeDocument = async (id: string) => {
    setIsSubmitting(true);
    setIsRemoving(true);
    try {
      if(type == "AR") {
        await deleteARFile(id);
        await updateAR({
          data: {
            ar_status: 'Unsigned'
          },
          ar_id: currentInfo.id
        });
      }
      else {
        await deleteWARFile(id);
        await updateWAR({
          data: {
            war_status: 'Unsigned'
          },
          war_id: currentInfo.id
        });
      }

      showSuccessToast("Document deleted successfully");
      setIsSubmitting(false);
      setIsRemoving(false);
    } catch (err) {
      setIsSubmitting(false);
      setIsRemoving(false);
      setMediaFiles(formatDocs)
      showErrorToast("Failed to delete document. Please try again.")
    }
  }

  // ----------------- RENDER ---------------------
  return (
    <LayoutWithBack 
      title={type === "AR" ? "Acknowledgement Report Document" : "Weekly AR Document"} 
      description={type === "AR" ? 
        "Review and manage your AR document" : 
        "Review and manage your Weekly AR document"
      }
    >
      <div className="w-full h-full flex">
        {/* Sidebar document details */}
        <div className="w-80 mr-4">
          <Card className="rounded-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Status</h3>
                {isLoadingDetails ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 transition-all">
                      {signed ? <CircleCheck className="h-5 w-5 fill-green-500 stroke-white"/> :
                        <CircleAlert className="h-4 w-4 text-amber-500" />
                      }
                      <Badge variant="outline" className={
                        signed ? "bg-green-50 text-green-700 border-green-200" :
                                "bg-amber-50 text-amber-700 border-amber-200"
                      }>
                        {signed ? "Signed" : "Unsigned"}
                      </Badge>
                    </div>
                    {!signed && (
                      <p className="text-xs text-muted-foreground">
                        Status will update to <span className="font-medium text-red-500">LAPSED</span> by the end of the week
                        if no document is uploaded.
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Actions Section */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-medium">Actions</h3>
                {isLoadingDetails ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="relative">
                    {isSubmitting && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-md">
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isRemoving ? "Removing..." : "Uploading..."}
                        </div>
                      </div>
                    )}
                    <MediaUpload 
                      title={signed ? "Supporting Document" :
                        "Mark as Signed"
                      }
                      description={signed ? "uploaded signed document" :
                          "Upload signed document"}
                      mediaFiles={mediaFiles}
                      setMediaFiles={setMediaFiles}
                      maxFiles={1}
                      viewMode="list"
                      acceptableFiles="image"
                      onRemoveMedia={removeDocument}
                    />
                  </div>
                )}
              </div>

              {/* Document Info Section */}
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium">Document Info</h3>
                {isLoadingDetails ? (
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-muted-foreground">Created:</span>
                    <Skeleton className="h-3 w-16" />
                    <span className="text-muted-foreground">Document ID:</span>
                    <Skeleton className="h-3 w-12" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{type === "AR" ? ARInfo?.date : WARInfo?.created_at}</span>
                    <span className="text-muted-foreground">Document ID:</span>
                    <span>{type === "AR" ? `AR-${ARInfo?.id}` : `WAR-${WARInfo?.id}`}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document - Scrollable content */}
        <div className="w-full flex flex-col gap-4">
          {type === "AR" ? 
            <ARDocTemplate
              incident={ARInfo?.ar_title}
              dateTime={getDateTimeFormat(`${ARInfo?.ar_date_completed} ${ARInfo?.ar_time_completed}`)}
              location={ARInfo?.ar_area}
              act_taken={ARInfo?.ar_action_taken}
              images={images}
              completeData={{
                ...ARInfo,
                ar_files: images
              }}
            /> : 
            <WARDocTemplate 
              data={compositions.map((comp: any) => ({
                incident_area: comp.ar.ar_area,
                act_undertaken: comp.ar.ar_action_taken,
                time_started: comp.ar.ar_time_started,
                time_completed: comp.ar.ar_time_completed,
                result: comp.ar.ar_result
              }))}
              reportPeriod={data?.reportPeriod}
            />
            }
        </div>
      </div>
    </LayoutWithBack>
  )
}