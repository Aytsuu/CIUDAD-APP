import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import BarangayServiceFormSchema from "@/form-schema/barangay-service-schema";
import { Checkbox } from "@/components/ui/checkbox";


function BarangayServiceForm(){

    const onSubmit = (values: z.infer<typeof BarangayServiceFormSchema>) => {
        console.log(values)
    };

    const form = useForm<z.infer<typeof BarangayServiceFormSchema>>({
        resolver: zodResolver(BarangayServiceFormSchema),
        defaultValues: {
            serialNo: "",
            requestor: "",
            purposes: []    
        },
    });


    return(
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
                <FormField
                    control={form.control}
                    name="serialNo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Receipt Serial No.:</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g.(123456)" type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                control={form.control}
                name="requestor"
                render={({field})=> (
                    <FormItem>
                        <FormLabel>Requestor</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Enter requestor name"></Input>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}></FormField>

                <FormField
                    control={form.control}
                    name="purposes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Select a purpose:</FormLabel>
                            <div className="flex flex-col gap-3 border border-gray-300 p-2">
                                {[
                                    "Disco",
                                    "Bingo",
                                    "Peryahan",
                                    "Exhibit per stall",
                                    "Commercial Billboards for Business",
                                    "Professional Billboards, Signs, Advertisements",
                                ].map((purpose) => (
                                    <div key={purpose} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={field.value?.includes(purpose)}
                                            onCheckedChange={(checked: boolean) => {
                                                field.onChange(
                                                    checked
                                                        ? [...field.value, purpose] // Add selected purpose
                                                        : field.value.filter((p: string) => p !== purpose) // Remove unselected purpose
                                                );
                                            }}
                                        />
                                        <FormLabel>{purpose}</FormLabel>
                                    </div>
                                ))}
                            </div>
                            <FormMessage/>
                        </FormItem>
                    )}
                ></FormField>     
        </div>

        <div className="flex justify-end mt-[2rem]">
            <Button>Proceed</Button>
        </div>

        </form>
    </Form>
    )

    

}

export default BarangayServiceForm;