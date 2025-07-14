import { SummonSuppDocSchema } from "@/form-schema/summon-supp-doc-schema";
import { MediaUpload, type MediaUploadType } from "@/components/ui/media-upload";
import { FormField, Form, FormControl, FormMessage, FormItem, FormLabel } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { useForm } from "react-hook-form";
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod";


export default function SummonSuppDocForm(){
    const form = useForm<z.infer<typeof SummonSuppDocSchema>>({
            resolver: zodResolver(SummonSuppDocSchema),
            defaultValues: {
                supp_doc: "",
                description: ""
            },
        });
    return(
        <div>
            <Form {...form}>
                <form>
                
                <FormTextArea
                    control={form.control}
                    label="Description"
                    name="description"
                />
                </form>
            </Form>
        </div>
    )
}