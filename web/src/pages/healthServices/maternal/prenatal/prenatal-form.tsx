"use client"
import { useState } from "react"

import { FormProvider } from "react-hook-form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"
import PrenatalFormFirstPg from "./prenatal-form-page1"
import PrenatalFormSecPg from "./prenatal-form-page2"
import PrenatalFormThirdPg from "./prenatal-form-page3"
import PrenatalFormFourthPq from "./prenatal-form-page4"

import { Card } from "@/components/ui/card/card"

// import { Button } from "@/components/ui/button"
import { generateDefaultValues } from "@/helpers/generateDefaultValues";



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
        // window.scrollTo(0, 0);
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
                        <PrenatalFormSecPg 
                            form={form}
                            onSubmit={()=>nextPage()}
                            back={()=>prevPage()}
                        />
                    )}
                    {currentPage === 3 && (
                        <PrenatalFormThirdPg
                            form={form}
                            onSubmit={()=>nextPage()}
                            back={()=>prevPage()}
                        />
                    )}
                    {currentPage === 4 && (
                        <PrenatalFormFourthPq
                            form={form}
                            onSubmit={() => nextPage()}
                            back={() => prevPage()}
                        />
                    )}
                </FormProvider>
                
            </Card>
        </div>
    )
}