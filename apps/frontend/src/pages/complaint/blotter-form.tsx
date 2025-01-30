import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SelectLayout } from "@/components/ui/select/select-layout";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import ComplaintformSchema from "@/form-schema/complaint-schema";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";


// Global Styling
const style = {
    0: "w-full flex flex-row gap-10",
    1: "w-[10%]",
    2: "w-full flex flex-row gap-3",
}


export default function BlotterForm(){

    const form = useForm<z.infer<typeof ComplaintformSchema>>({
        resolver: zodResolver(ComplaintformSchema),
        defaultValues: {
            accusedName: "",
            accusedAddress: "",
            complainantName: "",
            complainantAddress: "",
            complaintDate: "",
            complaintType: "",
            complaintAllegation: "",
        },
    });

    function onSubmit(values: z.infer<typeof ComplaintformSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }

    return(
        <div className="w-full h-[100vh] bg-snow flex flex-col justify-center items-center">
            <div className="w-1/2 h-1/2 bg-white border border-gray rounded-[10px] p-5 flex flex-col gap-10 overflow-auto">        

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        {/* Accused's Details */}

                        <div className={style[0]}>
                            <Label className={style[1]}>Accused:</Label>
                            <div className={style[2]}> 
                                
                                <FormField
                                    control={form.control}
                                    name="accusedName"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                    
                                <FormField
                                    control={form.control}
                                    name="accusedAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Complainant's Details */}

                        <div className={style[0]}>
                            <Label className={style[1]}>Complainant:</Label>
                            <div className={style[2]}> 
                                <div className="flex flex-col gap-3">
                                    <FormField
                                        control={form.control}
                                        name="complainantName"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                            
                                    <FormField
                                        control={form.control}
                                        name="complainantAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="complaintDate"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Date of Incident</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="complaintType"
                                        render={({}) => (
                                            <FormItem>
                                            <FormLabel>Type of Incident</FormLabel>
                                            <FormControl>
                                                <SelectLayout
                                                    label="Incidents"
                                                    placeholder="Select"
                                                    options={[{id: "1", name: "bahog tae"}]}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Allegation */}

                        <div className="w-full flex flex-col gap-3">
                            <FormField
                                control={form.control}
                                name="complaintAllegation"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Allegation</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Please enter your allegations." {...field}/>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
                
            </div>
        </div>
    );
}