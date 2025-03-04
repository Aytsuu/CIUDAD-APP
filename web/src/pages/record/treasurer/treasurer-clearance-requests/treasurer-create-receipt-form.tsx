import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import ReceiptSchema from "@/form-schema/receipt-schema";


function ReceiptForm(){

    const onSubmit = (values: z.infer<typeof ReceiptSchema>) => {
        console.log(values)
    };

    const form = useForm<z.infer<typeof ReceiptSchema>>({
        resolver: zodResolver(ReceiptSchema),
        defaultValues: {
            serialNo: "",
        },
    });


    return(
     <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                control={form.control}
                name="serialNo"
                render={({field})=>(
                    <FormItem>
                        <FormLabel>Serial No.</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Enter receipt serial number"></Input>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}></FormField>

                <div className="flex justify-end mt-7">
                    <Button>Proceed</Button>
                </div>
            </form>
    </Form>
    )

}

export default ReceiptForm;