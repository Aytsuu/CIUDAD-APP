import { UseFormReturn } from "react-hook-form";
import { Form } from "react-router";
import { z } from 'zod';

import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema";
import { DataTable } from "@/components/ui/table/data-table";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";


export default function PrenatalFormFourthPq(
    {form, onSubmit, back}: {
        form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>,
        onSubmit: () => void,
        back: () => void,
    }
){
    const submit = () => {
        form.trigger("prenatalCare").then((isValid) => {
            if(isValid){
                onSubmit();
            }
        })
    }

    type prenatalCareTypes = {
        date: string;
        aogWeeks: number;
        aogDays: number;
        wt: number;
        systolic: number;
        diastolic: number;
        leopoldsFindings: string;
        complaints: string;
        advises: string;

    }

    return(
        <>
            <div className="flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
                <Form>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                    }}
                    >
                        <div>
                            
                        </div>
                    </form>
                </Form>
            </div>
        </>
    )
}