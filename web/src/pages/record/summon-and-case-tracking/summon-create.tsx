import { Button } from "@/components/ui/button/button";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import SummonSchema from "@/form-schema/summon-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod"
import { useForm } from "react-hook-form";


function CreateNewSummon(){


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
                },
            });
    return(
        <div>
            <Form {...form}>
                <form>
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
                </form>
            </Form>

            <div className="flex justify-end mt-[20px]">
                <Button>Save</Button>
            </div>
        </div>
    )
}

export default CreateNewSummon