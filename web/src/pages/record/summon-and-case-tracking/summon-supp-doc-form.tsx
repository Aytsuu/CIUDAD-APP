import { SummonSuppDocSchema } from "@/form-schema/summon-supp-doc-schema";
import { MediaUpload, type MediaUploadType } from "@/components/ui/media-upload";
import { FormField, Form, FormControl, FormMessage, FormItem } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { useForm } from "react-hook-form";
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useAddSuppDoc } from "./queries/summonInsertQueries";

export default function SummonSuppDocForm({ca_id, onSuccess}: {
    ca_id: string;
    onSuccess: () => void;
}) {
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const {mutate: addDocs, isPending} = useAddSuppDoc(onSuccess);

    // Check if media is still uploading
    const isMediaUploading = mediaFiles.some(file => file.status === 'uploading');
    const isSubmitDisabled = isPending || isMediaUploading;

    const form = useForm<z.infer<typeof SummonSuppDocSchema>>({
        resolver: zodResolver(SummonSuppDocSchema),
        defaultValues: {
            supp_doc: "",
            description: ""
        },
    });

    useEffect(() => {
        if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
            form.setValue('supp_doc', mediaFiles[0].publicUrl);
        } else {
            form.setValue('supp_doc', '');
        }
    }, [mediaFiles, form]);
    
    const onSubmit = (values: z.infer<typeof SummonSuppDocSchema>) => {
        if (!mediaFiles[0]?.publicUrl) {
            form.setError('supp_doc', {message: 'Please upload a document'});
            return;
        }

        addDocs({
            ...values,
            ca_id: ca_id,
            media: mediaFiles[0]
        });
    }

    return(
        <div className="space-y-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="supp_doc"
                        render={({ }) => (
                            <FormItem>
                                <FormControl>
                                    <MediaUpload
                                        title=""
                                        description=""
                                        mediaFiles={mediaFiles}
                                        setMediaFiles={setMediaFiles}
                                        activeVideoId={activeVideoId}
                                        setActiveVideoId={setActiveVideoId}
                                        maxFiles={1}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormTextArea
                        control={form.control}
                        label="Description"
                        name="description"
                        placeholder="Enter a description for this document"
                    />

                    <div className="flex items-center justify-end pt-4">
                        <Button 
                            type="submit" 
                            disabled={isSubmitDisabled}
                            className="w-[100px]"
                        >
                            {isPending ? "Submitting..." : "Save"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}