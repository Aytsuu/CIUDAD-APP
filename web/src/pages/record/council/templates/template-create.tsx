import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {Textarea} from '@/components/ui/textarea.tsx';
import { FormInput } from "@/components/ui/form/form-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
import { FormSelect } from "@/components/ui/form/form-select";
import {Label} from '../../../../components/ui/label.tsx';
import {Button} from '../../../../components/ui/button/button.tsx';
import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form/form";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import documentTemplateFormSchema from "@/form-schema/council/documentTemlateSchema.tsx";


function TemplateCreateForm() {
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");

    const form = useForm<z.infer<typeof documentTemplateFormSchema>>({
        resolver: zodResolver(documentTemplateFormSchema),
        defaultValues: {
            temp_title: "",
            temp_w_sign: false,
            temp_w_seal: false,
            temp_body: "", 
        },
    });


    function onSubmit(values: z.infer<typeof documentTemplateFormSchema>) {
        console.log("Values", values);
    }

    const departmentOptions = [
        { id: "hr", name: "Human Resources" },
        { id: "it", name: "IT Department" },
        { id: "finance", name: "Finance" },
    ]

    return (
        <div className="flex flex-col p-2 min-h-0 h-auto rounded-lg overflow-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <MediaUpload
                        title=""
                        description=""
                        mediaFiles={mediaFiles}
                        activeVideoId={activeVideoId}
                        setMediaFiles={setMediaFiles}
                        setActiveVideoId={setActiveVideoId}
                    />
                    
                    <FormComboCheckbox
                        control={form.control}
                        name="temp_departments"
                        label="Document Footer"
                        options={departmentOptions}
                        placeholder="Select"
                        showBadges={true}
                    />
                    
                    <FormInput
                        control={form.control}
                        name="temp_title"
                        label="Title"
                        placeholder="Enter Template Title"
                        readOnly={false}
                    />


                    <FormField
                        control={form.control}
                        name="temp_body"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Template Body</FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="w-full p-2 shadow-sm h-96 mt-[12px] rounded-[5px] resize-none"
                                        placeholder="Enter Body"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />  
                    <div className="flex justify-end pb-6 pt-6 gap-2">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            Preview
                        </Button>
                        <Button className="flex items-center gap-2">Save</Button>
                    </div>

                </form>
            </Form>
        </div>
    
    );
}
export default TemplateCreateForm;