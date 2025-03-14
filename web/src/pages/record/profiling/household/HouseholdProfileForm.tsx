import { Input } from "@/components/ui/input";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { householdSchema } from "@/form-schema/household-schema";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import { Label } from "@/components/ui/label";

const defaultValues = generateDefaultValues(householdSchema)

export default function HouseholdProfileForm(){

    const form = useForm<z.infer<typeof householdSchema>>({
        resolver: zodResolver(householdSchema),
        defaultValues
    })

    return (
        <Form {...form}>
            <form className="grid gap-4">
                <FormField
                    control={form.control}
                    name="generatedHouseNo"
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
                            <FormLabel>Existing House No. </FormLabel>
                            <FormControl>
                                <Input placeholder="Enter existing house no. (e.g.,H0232)" {...field}/>
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
                    <div className="flex gap-2">
                        <Label className="font-normal">Resident not found?</Label>
                        <Label className="font-normal text-teal cursor-pointer hover:underline">Profile Resident</Label>
                    </div>
                </div>

                <Button className="mt-5">
                    Register
                </Button>
            </form>
        </Form>
    )
}