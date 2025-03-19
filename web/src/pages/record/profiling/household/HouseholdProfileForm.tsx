import React from "react";
import { Input } from "@/components/ui/input";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { householdSchema } from "@/form-schema/profiling-schema";
import { Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { household } from "../profilingPostRequests";
import api from "@/api/api";


const defaultValues = generateDefaultValues(householdSchema)

export default function HouseholdProfileForm(){

    const form = useForm<z.infer<typeof householdSchema>>({
        resolver: zodResolver(householdSchema),
        defaultValues
    })

    const [sitio, setSitio] = React.useState<{id: string, name: string}[]>([])
    const hasFetchData = React.useRef(false)

    React.useEffect(()=>{
        if(!hasFetchData.current){
            getSitio()
            hasFetchData.current = true
        }
    }, [])

    const getSitio = React.useCallback(async () => {

        try {

            const res = await api.get('profiling/sitio/')
            const sitioList = res.data.map((item: { sitio_id: string, sitio_name: string }) => ({ 
                id: String(item.sitio_id), 
                name: item.sitio_name 
            }));
            setSitio(sitioList);

        } catch (err) {
            console.log(err)
        }
    }, []);

    const submit = async () => {
        const data = form.getValues()
        const res = await household(data);

        if (res) {
            form.reset(defaultValues)
        }
    }

    return (
        <Form {...form}>
            <form 
                onSubmit={form.handleSubmit(submit)}
                className="grid gap-4"
            >

                <FormField
                    control={form.control}
                    name="householdNo"
                    render={({field}) => (
                        <FormItem>
                        <FormLabel>Generated House No.</FormLabel>
                        <FormControl>
                            <Input {...field}/>
                        </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="existingHouseNo"
                    render={({field}) => (
                        <FormItem>
                        <FormLabel>Existing House No.</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter existing house no. (e.g.,H0232)" {...field}/>
                        </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nhts"
                    render={({field}) => (
                        <FormItem>
                        <FormLabel className="font-medium text-black/65">
                            NHTS Household
                        </FormLabel>
                        <FormControl>
                            <SelectLayout
                                placeholder='Select'
                                className='w-full'
                                options={[
                                    {id: "no", name: "No"},
                                    {id: "yes", name: "Yes"}
                                ]}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='sitio'
                    render={({field}) => (
                        <FormItem>
                        <FormLabel className="font-medium text-black/65">
                            Sitio
                        </FormLabel>
                        <FormControl>
                            <SelectLayout
                                placeholder='Select'
                                className='w-full'
                                options={sitio}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="street"
                    render={({field}) => (
                        <FormItem>
                        <FormLabel>House Street Address</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter your house's street address" {...field}/>
                        </FormControl>
                        </FormItem>
                    )}
                />
                <div className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="householdHead"
                        render={({field}) => (
                            <FormItem>
                            <FormLabel>Household Head</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter resident no." {...field}/>
                            </FormControl>  
                            </FormItem>
                        )}  
                    />
                    <div className="flex gap-2 items-center">
                        <Label className="font-normal">Resident not found?</Label>
                        <Link to='/resident-registration' state={{params: {origin: 'household', householdInfo: form.getValues()}}}>
                            <Label 
                                className="font-normal text-teal cursor-pointer hover:underline"
                            >
                                Redirect to Registration
                            </Label>
                        </Link>
                    </div>
                </div>
                        
                <Button type="submit" className="mt-5">
                    Register
                </Button>
            </form>
        </Form>
    )
}