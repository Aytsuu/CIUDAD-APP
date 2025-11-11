import { Button } from "@/components/ui/button/button";
import { Form, FormMessage, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form";
import { DeclineReqSchema } from "@/form-schema/decline-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {z} from "zod"
import { useDeclineRequest, useDeclineNonReq } from "./queries/personalClearanceUpdateQueries";
import { useDeclineServiceChargeRequest } from "./queries/serviceChargeQueries";
import { useDeclinePermitClearance } from "./queries/permitClearanceFetchQueries";

function DeclineRequestForm({id, isResident, isServiceCharge, isPermitClearance, onSuccess}:{
    id: string;
    isResident: boolean;
    isServiceCharge?: boolean;
    isPermitClearance?: boolean;
    onSuccess?: () => void;
}){

    const{mutate: declineResident, isPending: pendingResident} = useDeclineRequest(onSuccess)
    const{mutate: declineNonResident, isPending: pendingNonResident} = useDeclineNonReq(onSuccess)
    const{mutate: declineServiceCharge, isPending: pendingServiceCharge} = useDeclineServiceChargeRequest(onSuccess)
    const{mutate: declinePermitClearance, isPending: pendingPermitClearance} = useDeclinePermitClearance(onSuccess)

    const onSubmit = (value: z.infer<typeof DeclineReqSchema>) => {
        console.log("Data: ", value);

        if(isServiceCharge){
            declineServiceCharge({
                pay_id: id,
                reason: value.reason
            })
        } else if(isPermitClearance){
            declinePermitClearance({
                bpr_id: id,
                reason: value.reason
            })
        } else if(isResident){
            declineResident({
                cr_id: id,
                ...value,
            })
        }else {
            declineNonResident({
                nrc_id: id,
                ...value,
            })
        }
    };

    const form = useForm<z.infer<typeof DeclineReqSchema>>({
        resolver: zodResolver(DeclineReqSchema),
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
                        
                        <Button type="submit" disabled={pendingResident || pendingNonResident || pendingServiceCharge || pendingPermitClearance}>  {pendingResident || pendingNonResident || pendingServiceCharge || pendingPermitClearance ? "Submitting..." : "Submit"} </Button>  
                    </div>
                </form>
            </Form>
        </div>
    )

}
export default DeclineRequestForm