import React from "react"
import { z } from "zod"
import { personalInfoSchema } from "@/form-schema/profiling-schema"
import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { 
    Form,
    FormField,
    FormControl,
    FormItem,
    FormMessage,
 } from "@/components/ui/form"
import { SelectLayout } from "@/components/ui/select/select-layout"
import api from "@/api/api"


export default function AssignPosition(
    {form} : {
        form: UseFormReturn<z.infer<typeof personalInfoSchema>>
    }
){

    const [positions, setPositions] = React.useState<Record<string,string>[]>([]);
    const hasFetchData = React.useRef(false);

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
                setPositions(data)
            })
            .catch((err) => console.log(err))
    }, [])

    console.log(positions)
    
    return (
        <Form {...form}>
            <form>
                {/* <FormField 
                    control={form.control}
                    name="assignPosition"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <SelectLayout 
                                    placeholder="Select"
                                    options={[

                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                /> */}
                <div className="flex justify-end">
                    <Button>
                        Register
                    </Button>
                </div>
            </form>
        </Form>
    )
}