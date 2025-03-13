"use client"

import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"
import { FormProvider } from "react-hook-form"
import PrenatalFormFirstPg from "./prenatal-form-firstpg"
import { useForm } from "react-hook-form"
import { Card } from "@/components/ui/card/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
// import { Button } from "@/components/ui/button"
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { useState } from "react"



// interface PrenatalFormProps {
//     recordType: string;
// }

export default function PrenatalForm(){
    const defaultValues = generateDefaultValues(PrenatalFormSchema)
    const [currentPage, setCurrentPage] = useState(1); 

    const form = useForm<z.infer<typeof PrenatalFormSchema>>({
        resolver: zodResolver(PrenatalFormSchema),
        defaultValues
    })

    // set to next page
    const nextPage = () => {
        setCurrentPage((prev) => prev + 1);
    }

    const prevPage = () => {
        setCurrentPage((prev) => prev -1);
    }

    return(
        <div>
            <Card className="w-full border-none shadow-none rounded-b-lg rounded-t-none">
                <FormProvider {...form}>
                    {currentPage === 1 && (
                        <PrenatalFormFirstPg 
                            form={form}
                            onSubmit={()=>nextPage()}
                        />
                    )}
                    {currentPage === 2 && (
                        <></>
                    )}
                </FormProvider>
                
            </Card>
        </div>
    )
}