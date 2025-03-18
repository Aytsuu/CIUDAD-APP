import React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { personalInfoSchema } from "@/form-schema/profiling-schema"
import { positionAssignmentSchema } from "@/form-schema/administration-schema"
import { useForm, UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { staff } from "./administrationPostRequest"
import { personal } from "../profiling/profilingPostRequests"
import api from "@/api/api"
import { 
    Form,
    FormField,
    FormControl,
    FormItem,
    FormMessage,
 } from "@/components/ui/form"


export default function AssignPosition(
    {personalInfoform, close} : {
        personalInfoform: UseFormReturn<z.infer<typeof personalInfoSchema>>
        close: () => void
    }
){

    const [positions, setPositions] = React.useState<{id: string, name: string}[]>([]);
    const hasFetchData = React.useRef(false);
    const personalDefaults = generateDefaultValues(personalInfoSchema)
    const defaultValues = generateDefaultValues(positionAssignmentSchema)
    const form = useForm<z.infer<typeof positionAssignmentSchema>>({
        resolver: zodResolver(positionAssignmentSchema),
        defaultValues
    })

    React.useEffect(()=>{

        if(!hasFetchData.current){
            getPositions()
            hasFetchData.current = true
        }
    }, [])

    const getPositions = React.useCallback(() => {
        api
            .get('administration/positions/')
            .then((res) => res.data)
            .then((data) => {

                const formattedData = data.map((item: {pos_id: string, pos_title: string}) => ({
                    id: String(item.pos_id),
                    name: item.pos_title
                }))

                setPositions(formattedData)
            })
            .catch((err) => console.log(err))
    }, [])

    const submit = async () => {
        const personalId = personalInfoform.getValues().id;
        const positionId = form.getValues().assignPosition;

        // If resident exists, assign
        if(personalId) {
            await staff(personalId, positionId);
            
        } else { // Register resident before assignment, if not
            const personalInfo = personalInfoform.getValues()
            const perId = await personal(personalInfo)
            await staff(perId, positionId)
        }

        // Clear
        form.setValue('assignPosition', ''); 
        personalInfoform.reset(personalDefaults)
        close();
    }
    
    return (
        <Form {...form}>
            <form 
                onSubmit={form.handleSubmit(submit)}
            >
                <FormField 
                    control={form.control}
                    name="assignPosition"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <SelectLayout 
                                    placeholder="Select"
                                    options={positions}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Button type="submit">
                        Register
                    </Button>
                </div>
            </form>
        </Form>
    )
}