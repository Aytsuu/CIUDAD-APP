import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"
import PermitClearanceFormSchema from "@/form-schema/permitClearance-schema";
import { useForm } from "react-hook-form";
import { SelectLayout } from "@/components/ui/select/select-layout";

const annualGrossSales = [
    { id: "0", name: "0000000" }
];

const purposeOptions = [
    { id: "1", name: "Commercial Building Permit" },
    { id: "2", name: "Residential Permit" },
    { id: "3", name: "Business Permit" },
    { id: "4", name: "Water Connection Permit (Commercial)" },
    { id: "5", name: "Water Connection Permit (Residential)" },
    { id: "6", name: "Electrical Permit Connection (Commercial)" },
];

function PermitClearanceForm() {
    const form = useForm<z.infer<typeof PermitClearanceFormSchema>>({
        resolver: zodResolver(PermitClearanceFormSchema),
        defaultValues: {
            serialNo: "",
            businessName: "",
            requestor: "",
            address: "",
            grossSales: "",
            purposes: "",
        },
    })

    const onSubmit = (values: z.infer<typeof PermitClearanceFormSchema>) => {
        console.log(values)
    };
    
    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid max-w-3xl mx-auto gap-7">
                    <div className="grid grid-cols-2 gap-5 w-full">
                        <div>
                            <FormField
                                control={form.control}
                                name="serialNo"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Serial No. </FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" placeholder="e.g.(123456)"></Input>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}>
                            </FormField>
                        </div>

                        <div>
                            <FormField
                                control={form.control}
                                name="businessName"
                                render={({field}) =>(
                                    <FormItem>
                                        <FormLabel>Business Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter business name"></Input>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}>
                            </FormField>
                        </div>

                        <div>
                            <FormField
                                control={form.control}
                                name="address"
                                render={({field})=>(
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter business address"></Input>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}>
                            </FormField>
                        </div>

                        <div>
                            <FormField
                                control={form.control}
                                name="grossSales"
                                render={({field})=> (
                                    <FormItem>
                                        <FormLabel>Gross Sales</FormLabel>
                                        <FormControl>
                                            <SelectLayout {...field} className="w-full" options={annualGrossSales} label="" placeholder="Select Annual Gross Sales" value={field.value} onChange={field.onChange}></SelectLayout>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}>
                            </FormField>
                        </div>

                        <div>
                            <FormField
                                control={form.control}
                                name="requestor"
                                render={({field}) =>(
                                    <FormItem>
                                        <FormLabel>Requestor</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter requestor name"></Input>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}>
                            </FormField>
                        </div>
                    </div>

                    <div>       
                        <FormField
                            control={form.control}
                            name="purposes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select purpose(s):</FormLabel>
                                    <FormControl>
                                        <SelectLayout
                                            {...field}
                                            className="w-full"
                                            options={purposeOptions}
                                            label=""
                                            placeholder="Select a purpose"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button>Proceed</Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}

export default PermitClearanceForm