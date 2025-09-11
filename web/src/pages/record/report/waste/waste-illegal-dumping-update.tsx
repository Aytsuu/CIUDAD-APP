import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { useState } from "react";
import { useUpdateWasteReport } from "./queries/waste-ReportUpdateQueries";
import { Loader2 } from "lucide-react";

interface WasteReportResolvedProps{
    rep_id: number
    is_resolve: boolean
    onSuccess?: () => void;
}

function WasteReportResolved( { rep_id, is_resolve, onSuccess  }: WasteReportResolvedProps){
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");


    const { mutate: updateRep, isPending } = useUpdateWasteReport(rep_id, onSuccess);


    const handleMarkAsResolved = () => {
        const files = mediaFiles.map((media) => ({
            'id': media.id,
            'name': media.name,
            'type': media.type,
            'file': media.file
        }))             


        // Prepare the update data
        const updateData = {
            rep_status: "resolved",
            files: files
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
                            disabled={is_resolve || isPending} // Disable during loading
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit"
                            )}
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