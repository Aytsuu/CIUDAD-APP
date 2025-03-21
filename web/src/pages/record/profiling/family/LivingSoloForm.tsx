import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { demographicInfo } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { family, familyComposition, building } from "../restful-api/profiingPostAPI";

export default function LivingSoloForm(
    {residents} : {
        residents: Record<string, string>[]
    }
) {
    const defaultValues = generateDefaultValues(demographicInfo)
    const [residentSearch, setResidentSearch] = React.useState<string>('')
    const [isResidentFound, setIsResidentFound] = React.useState<boolean>(false)

    React.useEffect(()=>{
        
        const searchedResident = residents.find((value) => value.per_id == residentSearch)

        if(searchedResident){
            setIsResidentFound(true)
        } else {
            setIsResidentFound(false)
        }

    }, [residentSearch, residents])
    
    const form = useForm<z.infer<typeof demographicInfo>>({
        resolver: zodResolver(demographicInfo),
        defaultValues,
        mode: "onChange" 
    })

    const submit = async () => {
        if(isResidentFound){

            const data = form.getValues()

            const familyNo = await family(data, null, null)
            familyComposition(familyNo, residentSearch)
            const buildId = await building(familyNo,data)

            if (buildId) {
                setResidentSearch('')
                form.reset(defaultValues)
            }
        }
    }

    return (
        <div className="grid gap-3">
            <Label className="text-black/70">Resident Number</Label>
            <div className="grid gap-2">
                <Input placeholder="Enter resident #" value={residentSearch} onChange={(e)=> setResidentSearch(e.target.value)}/>
                {!isResidentFound && residentSearch.length > 0 &&
                    <Label className="text-red-500 text-[13px]">Resident does not exist</Label>
                }
            </div>
            <Form {...form}>
                <form
                    onSubmit={(form.handleSubmit(submit))}
                    className="flex flex-col gap-10"
                >
                    <div className="grid gap-3">
                        <FormField
                            control={form.control}
                            name='householdNo'
                            render={({field}) => (
                                <FormItem>
                                <FormLabel className="font-medium text-black/65">
                                    Household Number
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter your household # (e.g.,H04123)' {...field}/>
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='building'
                            render={({field}) => (
                                <FormItem>
                                <FormLabel className="font-medium text-black/65">
                                    Building
                                </FormLabel>
                                <FormControl>
                                    <SelectLayout
                                        placeholder='Select'
                                        className='w-full'
                                        options={[
                                            {id: "owner", name: "Owner"},
                                            {id: "renter", name: "Renter"},
                                            {id: "other", name: "Other"},
                                        ]}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='indigenous'
                            render={({field}) => (
                                <FormItem>
                                <FormLabel className="font-medium text-black/65"> 
                                    Indigenous People
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
                                <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* Submit Button */}
                     <Button type="submit">
                        Register
                    </Button>   
                </form>
            </Form>
        </div>
    )
}