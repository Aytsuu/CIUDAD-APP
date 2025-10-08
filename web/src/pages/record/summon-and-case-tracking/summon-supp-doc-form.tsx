import { SummonSuppDocSchema } from "@/form-schema/summon-supp-doc-schema";
import { MediaUpload, type MediaUploadType } from "@/components/ui/media-upload";
import { Form, FormControl, FormItem } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { useForm } from "react-hook-form";
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAddSuppDoc } from "./queries/summonInsertQueries";

export default function SummonSuppDocForm({hs_id, sc_id, onSuccess}: {
    hs_id: string;
    sc_id: string;
    onSuccess: () => void;
}) {
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const {mutate: addDocs, isPending} = useAddSuppDoc(onSuccess);

    const form = useForm<z.infer<typeof SummonSuppDocSchema>>({
        resolver: zodResolver(SummonSuppDocSchema),
        defaultValues: {
            reason: ""
        },
    });
    
    const onSubmit = (_values: z.infer<typeof SummonSuppDocSchema>) => {
        try{
            if (mediaFiles.length === 0) {
                alert("Please upload at least one file");
                return;
            }
            const values = form.getValues();
            const files = mediaFiles.map((media) => ({
                'name': media.name,
                'type': media.type,
                'file': media.file
            }))

             addDocs({
                ss_id,
                sc_id,
                file: files,
                reason: values.reason
            })
        }catch(err){
            console.error(err)
        }
    }

    return(
        <div className="space-y-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormItem>
                        <FormControl>
                            <MediaUpload
                                title="Supporting Documents"
                                description="Upload all required files"
                                mediaFiles={mediaFiles}
                                setMediaFiles={setMediaFiles}
                                activeVideoId={activeVideoId}
                                setActiveVideoId={setActiveVideoId}
                            />
                        </FormControl>
                    </FormItem>
                    
                    <FormTextArea
                        control={form.control}
                        label="Reason"
                        name="reason"
                        placeholder="Enter a reason for reschedule"
                    />

                    <div className="flex items-center justify-end pt-4">
                        <Button 
                            type="submit" 
                            disabled={isPending}
                            className="w-[100px]"
                        >
                            {isPending ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}