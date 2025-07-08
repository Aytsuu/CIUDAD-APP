import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { useState, useEffect } from "react";
import { useUpdateWasteReport } from "./queries/waste-ReportUpdateQueries";

interface WasteReportResolvedProps{
    rep_id: number
    is_resolve: boolean
}

function WasteReportResolved( { rep_id, is_resolve }: WasteReportResolvedProps){
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const [resolvedImg, setResolvedImg] = useState<string>(""); 


    const { mutate: updateRep } = useUpdateWasteReport(rep_id);

    // Update form when media files change
    useEffect(() => {
        if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
            setResolvedImg(mediaFiles[0].publicUrl);
        } else {
            setResolvedImg("");
        }
    }, [mediaFiles]);


    const handleMarkAsResolved = () => {

        // Prepare the update data
        const updateData = {
            rep_status: "resolved",
            rep_resolved_img: resolvedImg
        };
        
        updateRep(updateData);
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