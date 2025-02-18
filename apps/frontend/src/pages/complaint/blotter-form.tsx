import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import ComplaintformSchema from "@/form-schema/complaint-schema";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

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
            complaintImg: null,
        },
    });

    function onSubmit(values: z.infer<typeof ComplaintformSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }

    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full h-2/8 rounded-[10px] p-5 overflow-auto">

                <div className="flex flex-row gap-4">

                    {/* Accused's Details */}

                    <div className="w-full flex flex-col gap-10 p-5">
                        <div className="w-full flex flex-col gap-4">
                            <Label className="w-full text-center font-semibold text-[16px] text-darkBlue1">Accused</Label>
                            <div className="w-full grid grid-cols-1 gap-3"> 
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

                        <div className="w-full flex flex-col gap-4">
                            <Label className="w-full text-center font-semibold text-[16px] text-darkBlue1">Complainant</Label>
                            <div className="w-full grid grid-cols-1 gap-3"> 
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
                            </div>
                        </div>
                    </div>

                    {/* Complaint Details */}

                    <div className="w-full flex flex-col gap-4 p-5">
                        <Label className="w-full text-center font-semibold text-[16px] text-darkBlue1">Incident Details</Label>
                        <div className="w-full h-full grid grid-cols-1 gap-3">
                            <div className="w-full flex flex-row gap-3">
                                <FormField
                                    control={form.control}
                                    name="complaintDate"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Date</FormLabel>
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
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Type</FormLabel> 
                                        <FormControl>
                                            <SelectLayout
                                                label="Incidents"
                                                placeholder="Select"
                                                options={[{id: "1", name: "bahog tae"}]}
                                                value={field.value}
                                                onChange={field.onChange}
                                                className=""
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="complaintAllegation"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Allegation</FormLabel>
                                    <FormControl>
                                        <Textarea className="h-[11.5rem]" placeholder="Please enter your allegations." {...field}/>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="complaintImg"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Supporting Document (Image)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="file"
                                            onChange={(e)=>{
                                                const file = e.target.files ? e.target.files[0] : null;
                                                field.onChange(file);
                                            }}
                                            ref={field.ref}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full p-5 flex flex-row justify-end"> 
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </Form>
    );
}