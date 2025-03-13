import { Form, UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"

export default function PrenatalFormSecPg(
    {form, onSubmit}: {
        form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>,
        onSubmit: () => void,
    }
){
    const submmit = () => {
        form.trigger(["previousPregnancy"])
    }

    return(
        <div className="flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
            
        </div>
    )
}