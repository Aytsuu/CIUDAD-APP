import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { profilingFormSchema } from "@/form-schema/profiling-schema"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"

const defaultValues = generateDefaultValues(profilingFormSchema)

export default function ProfilingRequestForm(){

    const form = useForm<z.infer<typeof profilingFormSchema>>({
        resolver: zodResolver(profilingFormSchema),
        defaultValues
    })

    return (
        <>
        </>
    )
}