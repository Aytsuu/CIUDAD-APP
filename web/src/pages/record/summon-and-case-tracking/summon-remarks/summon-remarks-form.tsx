import { MediaUpload, type MediaUploadType } from "@/components/ui/media-upload";
import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAddRemarks } from "../queries/summonInsertQueries";

export default function SummonRemarksForm({hs_id, st_id, sc_id, onSuccess}:{
    hs_id: string;
    st_id: string | number;
    sc_id: string;
    onSuccess?: () => void
}){
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const [remarks, setRemarks] = useState<string>("");
    const [close, setClose] = useState(false);
    const {mutate: Addremarks, isPending} = useAddRemarks(onSuccess)

    const isSubmitDisabled = isPending || mediaFiles.length === 0 || remarks.trim() === "";

    const handleSubmit = () => {
        if (mediaFiles.length === 0) {
            alert("Please upload at least one file");
            return;
        }

        const files = mediaFiles.map((media) => ({
            'name': media.name,
            'type': media.type,
            'file': media.file
        }))
        
        Addremarks({hs_id, st_id, sc_id, remarks, close, files});
    }

    const handleCheckboxChange = (checked: boolean) => {
        setClose(checked);
    }

    return(
        <div>
             <MediaUpload
                title="Supporting Documents"
                description="Upload all required files"
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
                activeVideoId={activeVideoId}
                setActiveVideoId={setActiveVideoId}
                acceptableFiles='image'
            />

            <div className="space-y-2 mt-4">
                <label className="text-sm font-medium text-gray-700">Remarks</label>
                <Textarea
                    placeholder="Enter your remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </div>

            <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                    id="close-hearing"
                    checked={close}
                    onCheckedChange={handleCheckboxChange}
                    className="border-gray-300 w-5 h-5"
                />
                <Label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Close hearing schedule
                </Label>
            </div>

            <div className="flex items-center justify-end pt-4">
                <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className="w-[100px]"
                >
                    {isPending ? "Submitting..." : "Submit"}
                </Button>
            </div>
        </div>
    )
}