import { useState, useEffect } from "react";
import { FormControl, Form, FormItem, FormMessage, FormField } from "@/components/ui/form/form";
import { MediaUpload, type MediaUploadType } from "@/components/ui/media-upload";
import { useForm } from "react-hook-form";
import {z} from "zod"
import { Button } from "@/components/ui/button/button";
import { useAddBudgetPlanSuppDoc } from "./queries/budgetPlanInsertQueries";
import { zodResolver } from "@hookform/resolvers/zod";
import { BudgetPlanSuppDocSchema } from "@/form-schema/treasurer/supp-doc-schema";
import { FormTextArea } from "@/components/ui/form/form-text-area";

export default function BudgetPlanSuppDocForm({plan_id, onSuccess}: {
    plan_id: number;
    onSuccess: () => void;
    }){

    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const {mutate: addSuppDoc, isPending} = useAddBudgetPlanSuppDoc(onSuccess);

    const form = useForm<z.infer<typeof BudgetPlanSuppDocSchema>>({
        resolver: zodResolver(BudgetPlanSuppDocSchema),
        defaultValues: {
            files: [],
            description: ""
        }
    })

    //  useEffect(() => {
    //     const uploadedFiles = mediaFiles
    //         .filter(file => file.status === 'uploaded' && file.publicUrl && file.storagePath)
    //         .map(file => ({
    //             publicUrl: file.publicUrl!,
    //             storagePath: file.storagePath!,
    //             type: file.type,
    //             name: file.file.name
    //         }));
        
    //     form.setValue('files', uploadedFiles);
    // }, [mediaFiles, form]);

    const onSubmit = (values: z.infer<typeof BudgetPlanSuppDocSchema>) => {
        const payload = values.files.map(file => ({
            ...file,
            plan_id,
            description: values.description // Include the description with each file
        }));
        
        addSuppDoc(payload);
    };

    return (
          <div className="max-h-[80vh] overflow-y-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="files"
                        render={() => (
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormTextArea
                        control={form.control}
                        name="description"
                        label="Description"
                    />
                    
                    <div className="flex items-center justify-end">
                        <Button type="submit" className="w-[100px]" disabled={isPending}>
                            {isPending ? "Uploading..." : "Submit"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}