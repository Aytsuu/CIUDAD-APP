// import { MediaUpload, type MediaUploadType } from "@/components/ui/media-upload";
// import { Form, FormControl, FormItem } from "@/components/ui/form/form";
// import { Button } from "@/components/ui/button/button";
// import { useState } from "react";
// import { useAddHearingMinutes } from "./queries/summonInsertQueries";

// export default function HearingMinutesForm({hs_id, onSuccess}: {
//     hs_id: string;
//     onSuccess: () => void;
// }){
//     const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
//     const [activeVideoId, setActiveVideoId] = useState<string>("");
//     const {mutate: addMinutes, isPending} = useAddHearingMinutes(onSuccess)


//     return(
//         <div className="space-y-4">
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                     <FormItem>
//                         <FormControl>
//                             <MediaUpload
//                                 title="Supporting Documents"
//                                 description="Upload all required files"
//                                 mediaFiles={mediaFiles}
//                                 setMediaFiles={setMediaFiles}
//                                 activeVideoId={activeVideoId}
//                                 setActiveVideoId={setActiveVideoId}
//                                 maxFiles={1}
//                                 acceptableFiles='document'
//                             />
//                         </FormControl>
//                     </FormItem>

//                     <div className="flex items-center justify-end pt-4">
//                         <Button 
//                             type="submit" 
//                             disabled={isPending}
//                             className="w-[100px]"
//                         >
//                             {isPending ? "Submitting..." : "Submit"}
//                         </Button>
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     )
// }


import { MediaUpload, type MediaUploadType } from "@/components/ui/media-upload";
import { Button } from "@/components/ui/button/button";
import { useState } from "react";
import { useAddHearingMinutes } from "./queries/summonInsertQueries";

export default function HearingMinutesForm({hs_id, sc_id, onSuccess}: {
    hs_id: string;
    sc_id: string;
    onSuccess: () => void;
}){
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const {mutate: addMinutes, isPending} = useAddHearingMinutes(onSuccess)

    const isSubmitDisabled = isPending || mediaFiles.length === 0;

    const handleSubmit = () => {
        if (mediaFiles.length === 0) {
            alert("Please upload at least one file");
            return;
        }
        const file = mediaFiles.map((media) => ({
            'name': media.name,
            'type': media.type,
            'file': media.file
        }))
        
        addMinutes({hs_id, sc_id, file});
    }

    return(
        <div className="space-y-4">
            <MediaUpload
                title="Supporting Documents"
                description="Upload all required files"
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
                activeVideoId={activeVideoId}
                setActiveVideoId={setActiveVideoId}
                maxFiles={1}
                acceptableFiles='document'
            />

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