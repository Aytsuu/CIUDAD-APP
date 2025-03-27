import { UseFormReturn } from "react-hook-form";
import { Form } from "react-router";
import { z } from 'zod';

import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema";
import { DataTable } from "@/components/ui/table/data-table";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Label } from "@/components/ui/label";


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
                <Label className="text-black text-opacity-50 italic mb-10">Page 4</Label>
                <Form>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                    }}
                    >
                        <div className="">
                            
                        </div>
                    </form>
                </Form>
            </div>
        </>
    )
}