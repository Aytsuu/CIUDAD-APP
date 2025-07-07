import { Button } from "@/components/ui/button/button";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import SummonSchema from "@/form-schema/summon-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod"
import { useForm } from "react-hook-form";
// import { useAddCaseActivity } from "./queries/summonInsertQueries";
import { useGetServiceChargeTemplates } from "./queries/summonFetchQueries";
import { Skeleton } from "@/components/ui/skeleton";

function CreateNewSummon({sr_id, onSuccess}:{
    sr_id: number, 
    onSuccess: () => void
}){
    const {data: templates = [], isLoading} = useGetServiceChargeTemplates()
    // const {mutate: createSummon} = useAddCaseActivity(onSuccess)


    const reasons = [
        { id: "First Hearing", name: "First Hearing" },
        { id: "Unresolved", name: "Unresolved" },
        { id: "Complainant is Absent/Unavailable", name: "Complainant is Absent/Unavailable" },
        { id: "Accused is Absent/Unavailable", name: "Accused is Absent/Unavailable" },
    ];

    const templateOptions = templates.map(template => ({
        id: String(template.temp_id),  
        name: template.temp_title
    }));
    
    const form = useForm<z.infer<typeof SummonSchema>>({
            resolver: zodResolver(SummonSchema),
                defaultValues: {
                    reason: "",
                    hearingDate: "",
                    hearingTime: "",
                    sr_id: String(sr_id),
                },
            });

    const onSubmit = (values: z.infer<typeof SummonSchema>) => {
        console.log('Form Values', values);
        
        try {
            const selectedTemplate = templates.find(
                template => template.temp_id === Number(values.template)
            );
            
            if (!selectedTemplate) {
                throw new Error('No template found with the selected ID');
            }
            
            console.log('Selected Template:', selectedTemplate);
            // createSummon(values)
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const onError = (errors: any) => {
        console.log('Form errors:', errors); // This will show validation errors
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        );
    }

    return(
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                    <FormSelect
                        control={form.control}
                        name="reason"
                        label="Reason"
                        options={reasons}
                    />

                    <FormDateTimeInput
                        control={form.control}
                        name="hearingDate"
                        label="Hearing Date"
                        type="date"
                    />

                    {/* Time input */}
                    <FormDateTimeInput
                        control={form.control}
                        name="hearingTime"
                        label="Hearing Time"
                        type="time"
                    />

                    <FormSelect
                        control = {form.control}
                        name="template"
                        label="Template"
                        options={templateOptions}
                    />

                    <div className="flex justify-end mt-[20px]">
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default CreateNewSummon