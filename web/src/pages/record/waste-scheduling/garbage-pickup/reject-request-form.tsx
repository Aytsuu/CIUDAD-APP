import { Button } from "@/components/ui/button/button";
import { Form, FormMessage, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form";
import { RejectPickupRequestSchema } from "@/form-schema/garbage-pickup-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {z} from "zod"
import { useAddDecision } from "./queries/GarbageRequestInsertQueries";


function RejectPickupForm({garb_id, onSuccess}:{
    garb_id: string;
    onSuccess?: () => void;
}){

    const{mutate: createDecision} = useAddDecision(onSuccess)

    const onSubmit = (value: z.infer<typeof RejectPickupRequestSchema>) => {
        console.log("Data: ", value);
        createDecision({
            ...value,
            garb_id: garb_id,
        })
    };

    const form = useForm<z.infer<typeof RejectPickupRequestSchema>>({
        resolver: zodResolver(RejectPickupRequestSchema),
        defaultValues: {
            reason: ""
        }
    })

   return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="pb-5">
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (  
                                <FormItem>
                                    <FormLabel>Reason</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="State your reason"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex justify-end mt-[20px]">
                        <Button type="submit">Confirm</Button>  
                    </div>
                </form>
            </Form>
        </div>
    )

}
export default RejectPickupForm