import { FormControl, Form, FormItem } from "@/components/ui/form/form";
import { MediaUpload, type MediaUploadType } from "@/components/ui/media-upload";
import { useForm } from "react-hook-form";
import {z} from "zod"
import { Button } from "@/components/ui/button/button";
import { useAddBudgetPlanSuppDoc } from "./queries/budgetPlanInsertQueries";
import { zodResolver } from "@hookform/resolvers/zod";
import { BudgetPlanSuppDocSchema } from "@/form-schema/treasurer/supp-doc-schema";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import React from "react";

export default function BudgetPlanSuppDocForm({plan_id, onSuccess}: {
    plan_id: number;
    onSuccess: () => void;
    }){

    const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = React.useState<string>("");
    const {mutate: addSuppDoc, isPending} = useAddBudgetPlanSuppDoc(onSuccess);

    const form = useForm<z.infer<typeof BudgetPlanSuppDocSchema>>({
        resolver: zodResolver(BudgetPlanSuppDocSchema),
        defaultValues: {
            description: ""
        }
    })

    const onSubmit = () => {
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

            addSuppDoc({
                plan_id,
                file: files,
                description: values.description
            })
        }catch(err){
            throw err;
        }
    };

    return (
          <div className="max-h-[80vh] overflow-y-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormItem>
                        <FormControl>
                            <MediaUpload
                                title="Supporting Documents"
                                description="Upload all required files"
                                mediaFiles={mediaFiles}
                                setMediaFiles={setMediaFiles}
                                activeVideoId={activeVideoId}
                                setActiveVideoId={setActiveVideoId}
                                maxFiles={1}
                                acceptableFiles="image"
                            />
                        </FormControl>
                    </FormItem>


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