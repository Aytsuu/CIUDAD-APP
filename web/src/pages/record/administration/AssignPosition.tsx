import React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { personalInfoSchema } from "@/form-schema/profiling-schema"
import { positionAssignmentSchema } from "@/form-schema/administration-schema"
import { useForm, UseFormReturn } from "react-hook-form"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button/button"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { staff } from "./restful-api/administrationPostAPI"
import { personal } from "../profiling/restful-api/profiingPostAPI"
import { CircleCheck, Loader2 } from "lucide-react"
import { Form } from "@/components/ui/form/form"
import { FormSelect } from "@/components/ui/form/form-select"
import { useQuery } from "@tanstack/react-query"
import { getPositions } from "./restful-api/administrationGetAPI"
import { toast } from "sonner"
import { LoadButton } from "@/components/ui/button/load-button"


export default function AssignPosition(
    {personalInfoform, close} : {
        personalInfoform: UseFormReturn<z.infer<typeof personalInfoSchema>>
        close: () => void
    }
){
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
    const personalDefaults = generateDefaultValues(personalInfoSchema)
    const defaultValues = generateDefaultValues(positionAssignmentSchema)
    const form = useForm<z.infer<typeof positionAssignmentSchema>>({
        resolver: zodResolver(positionAssignmentSchema),
        defaultValues
    })

    const { data: positions, isLoading: isLoadingPositions} = useQuery({
        queryKey: ['positions'],
        queryFn: getPositions,
        refetchOnMount: true,
        staleTime: 0
    })


    const submit = async () => {
        setIsSubmitting(true)
        
        const formIsValid = form.trigger()

        if(!formIsValid) return;


        const personalId = personalInfoform.getValues().per_id.split(" ")[0];
        const positionId = form.getValues().assignPosition;

        // If resident exists, assign
        if(personalId) {

            const res = await staff(personalId, positionId);

            if(res) deliverFeedback();
          
        } else { // Register resident before assignment, if not
            const personalInfo = personalInfoform.getValues()
            const perId = await personal(personalInfo)
            const res = await staff(perId, positionId)

            if(res) deliverFeedback(); 
        }

    }

    const deliverFeedback = () => {

        // Clear
        form.setValue('assignPosition', ''); 
        personalInfoform.reset(personalDefaults)
        close();

        // Deliver feedback
        toast('Record added successfully', {
            icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
            action: {
                label: "View",
                onClick: () => navigate(-1)
            }
        });
        setIsSubmitting(false);

    }

    if(isLoadingPositions) {
        return <Loader2 className="h-5 w-5 animate-spin" />
    }
    
    return (
        <Form {...form}>
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    submit();
                }}

                className="grid gap-8"
            >
                <FormSelect control={form.control} name="assignPosition" options={positions} readOnly={false}/>
                <div className="flex justify-end">
                    {!isSubmitting ? (<Button type="submit">
                        Register
                    </Button>) : (
                        <LoadButton>
                            Assigning...
                        </LoadButton>
                    )}
                </div>
            </form>
        </Form>
    )
}