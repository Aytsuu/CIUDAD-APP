"use client"
import { z } from "zod"

import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { FormProvider, useForm } from "react-hook-form";

import { PostPartumSchema } from "@/form-schema/maternal/postpartum-schema"
import PostpartumFormFirstPg from "./postpartum-form-page1"
import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod";

export default function PostpartumForm(){
    const defaultValues = generateDefaultValues(PostPartumSchema);
    const [currentPage, setCurrentPage] = useState(1);

    const form = useForm<z.infer<typeof PostPartumSchema>>({
        resolver: zodResolver(PrenatalFormSchema),
        defaultValues   
    })

    const nextPage = () => {
        setCurrentPage((prev) => prev + 1);
    }

    const prevPage = () => {
        setCurrentPage((prev) => prev - 1);
    }

    return (
        <div>
            <FormProvider {...form}>
                {currentPage === 1 && (
                    <PostpartumFormFirstPg 
                        form={form}
                        onSubmit={()=>nextPage()}
                    />
                )}
            </FormProvider>
        </div>
    )
}