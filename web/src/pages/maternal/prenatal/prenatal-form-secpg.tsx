import { Form, UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"

export default function PrenatalFormSecPg(
    {form, onSubmit}: {
        form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>,
        onSubmit: () => void,
    }
){
    const submit = () => {
        form.trigger(["previousPregnancy", "tetanusToxoid", "presentPregnancy", "labResults"]).then((isValid) => {
            if(isValid){
                onSubmit();
            }
        })
    }

    return(
        <div className="flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
            <Form {...form}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                }}
                >
                <div></div>
                </form>
            </Form>
        </div>
    )
}