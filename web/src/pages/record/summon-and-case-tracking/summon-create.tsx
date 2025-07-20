import { Button } from "@/components/ui/button/button";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import SummonSchema from "@/form-schema/summon-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod"
import { useForm } from "react-hook-form";
import { useAddCaseActivity } from "./queries/summonInsertQueries";

function CreateNewSummon({sr_id, onSuccess}:{
    sr_id: number, 
    onSuccess: () => void
}){
    const {mutate: createSummon} = useAddCaseActivity(onSuccess)

    const reasons = [
        { id: "Unresolved", name: "Unresolved" },
        { id: "Complainant is Absent/Unavailable", name: "Complainant is Absent/Unavailable" },
        { id: "Accused is Absent/Unavailable", name: "Accused is Absent/Unavailable" },
    ];
    
    
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
        console.log('Values', values)
        createSummon(values)
    }

    const onError = (errors: any) => {
        console.log('Form errors:', errors); // This will show validation errors
    };

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

                    <div className="flex justify-end mt-[20px]">
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default CreateNewSummon