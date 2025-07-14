import { SummonSuppDocEditSchema } from "@/form-schema/summon-supp-doc-schema";
import { MediaUpload, type MediaUploadType } from "@/components/ui/media-upload";
import { FormField, Form, FormControl, FormMessage, FormItem } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { useForm } from "react-hook-form";
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useUpdateSuppDoc } from "./queries/summonUpdateQueries";

export default function SummonSuppDocEditForm({csd_id, csd_url, csd_description, onSuccess}: {
    csd_id: string;
    csd_url: string;
    csd_description: string;
    onSuccess: () => void;
}) {
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>(() => {
        return csd_url ? [{
            id: `existing-${csd_id}`,
            type: 'document',
            status: 'uploaded' as const,
            publicUrl: csd_url,
            previewUrl: csd_url,
            storagePath: '',
            file: new File([], csd_url.split('/').pop() || 'document')
        }] : [];
    });
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const {mutate: updateDocs, isPending} = useUpdateSuppDoc(onSuccess);
    const isSubmitDisabled = isPending || mediaFiles.some(file => file.status === 'uploading');

    const form = useForm<z.infer<typeof SummonSuppDocEditSchema>>({
        resolver: zodResolver(SummonSuppDocEditSchema),
        defaultValues: {
            supp_doc: csd_url,
            description: csd_description,
            csd_id: String(csd_id)
        },
    });

    useEffect(() => {
        if (mediaFiles[0]?.publicUrl) {
            form.setValue('supp_doc', mediaFiles[0].publicUrl);
        } else {
            form.setValue('supp_doc', '');
        }
    }, [mediaFiles, form]);

    const onSubmit = (values: z.infer<typeof SummonSuppDocEditSchema>) => {
        if (!mediaFiles[0]?.publicUrl) {
            form.setError('supp_doc', {message: 'Please upload a document'});
            return;
        }

        updateDocs({
            csd_id: values.csd_id,
            values: {              
                description: values.description,
                supp_doc: values.supp_doc
            },
            mediaFiles            
        });
    }

    return (
        <div className="space-y-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                        console.error('Form submission errors:', errors);
                    })}
                    className="space-y-6"
                >
                    <FormField
                        control={form.control}
                        name="supp_doc"
                        render={({ field }) => (
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
                            onClick={() => console.log('Button clicked')}
                        > 
                            {isPending ? "Submitting..." : "Save"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}