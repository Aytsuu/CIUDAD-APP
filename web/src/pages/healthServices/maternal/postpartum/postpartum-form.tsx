import { UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { Form } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"

import { PostPartumSchema } from "@/form-schema/maternal/postpartum-schema"

export default function PostpartumForm(
    {form, onSubmit}: {
        form: UseFormReturn<z.infer<typeof PostPartumSchema>>,
        onSubmit: () => void,
    }
){

    const submit = () => {
        form.trigger(['mothersPersonalInfo', 'postpartumInfo']).then((isValid) => {
            if(isValid) {
                onSubmit();
            }
        })
    }

    return (
        <div className="flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
            <div className="pb-4">
                <h2 className="text-3xl font-bold text-center">POSTPARTUM RECORD</h2>
            </div>
            {/* forms */}
            <Form {...form}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                }}
                >
                    <div>
                        <FormInput control={form.control} label="Last Name" name="mothersPersonalInfo.motherLName" placeholder="Last Name"/>
                        <FormInput control={form.control} label="First Name" name="mothersPersonalInfo.motherFName" placeholder="First Name"/>
                        <FormInput
                            control={form.control}
                            label="Middle Name"
                            name="mothersPersonalInfo.motherLName"
                            placeholder="Last Name"
                        />
                        <FormInput
                            control={form.control}
                            label="Last Name"
                            name="mothersPersonalInfo.motherLName"
                            placeholder="Last Name"
                        />
                    </div>
                </form>
                
            </Form>
            
        </div>
    )
}