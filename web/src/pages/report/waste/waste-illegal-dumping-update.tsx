import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { useState, useEffect } from "react";
import { useUpdateWasteReport } from "./queries/waste-ReportUpdateQueries";

interface WasteReportResolvedProps{
    rep_id: number
    is_resolve: boolean
    onSuccess?: () => void;
}

interface ResolvedImage {
    name: string;
    type: string;
    path: string;
    url: string;
}

function WasteReportResolved( { rep_id, is_resolve, onSuccess  }: WasteReportResolvedProps){
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const [resolvedImages, setResolvedImages] = useState<ResolvedImage[]>([]);


    const { mutate: updateRep } = useUpdateWasteReport(rep_id, onSuccess);

    // Update form when media files change
    useEffect(() => {
        if (mediaFiles.length > 0) {
            const validImages = mediaFiles
                .filter(file => file.publicUrl)
                .map(file => ({
                    name: file.file?.name || '',
                    type: file.file?.type || '',
                    path: file.storagePath || '',
                    url: file.publicUrl || ''
                }));
            
            setResolvedImages(validImages);
        } else {
            setResolvedImages([]);
        }
    }, [mediaFiles]);


    const handleMarkAsResolved = () => {

        // Prepare the update data
        const updateData = {
            rep_status: "resolved",
            rep_resolved_img: resolvedImages 
        };
        
        updateRep(updateData);
        // console.log("RESOLVE DATA: ", updateData)
    };

    return(
        <div className="w-full h-full">
            <MediaUpload
                title=""
                description=""
                mediaFiles={mediaFiles}
                activeVideoId={activeVideoId}
                setMediaFiles={setMediaFiles}
                setActiveVideoId={setActiveVideoId}
                maxFiles={3}
            />
            <div className="flex justify-end pt-16">
                <ConfirmationModal
                    trigger={
                        <Button 
                            disabled={is_resolve}
                        >
                            Submit
                        </Button>
                    }
                    title="Mark as resolved"
                    description="Are you sure you want to mark this report as resolved?"
                    actionLabel="Confirm"
                    onClick={handleMarkAsResolved}
                />                    
            </div>
        </div>
    );
}

export default WasteReportResolved;