import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessFormSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button/button";
import { toast } from "sonner";
import { CircleAlert, CircleCheck } from "lucide-react";
import { LoadButton } from "@/components/ui/button/load-button";

export default function BusinessProfileForm() {

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const defaultValues = React.useRef(generateDefaultValues(businessFormSchema));
  const form = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: defaultValues.current
  })

  const submit = React.useCallback( async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();

    if(!formIsValid) {
      setIsSubmitting(false)
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
      return;
    }
    
  }, [])

  return (
    <div className="w-full p-10">
      <Form {...form}>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex flex-col gap-8"
        >

            <div className="w-full">
              <Label className="text-lg font-semibold">Respondent Information</Label>
              <p className="text-xs text-black/50 mb-4">Fill out all necessary fields</p>

              <div className="grid grid-cols-4 gap-4">
                <FormInput control={form.control} name="respondentLname" label="Last Name" placeholder="Enter last name"/>
                <FormInput control={form.control} name="respondentFname" label="First Name" placeholder="Enter first name"/>
                <FormInput control={form.control} name="respondentMname" label="Middle Name" placeholder="Enter middle name"/>
                <FormDateInput control={form.control} name="respondentDob" label="Date of Birth"/>
              </div>
            </div>

            <Separator/>

            <div className="w-full">
              <Label className="text-lg font-semibold">Business Information</Label>
              <p className="text-xs text-black/50 mb-4">Fill out all necessary fields</p>

              <div className="grid grid-cols-4 gap-4">
                <FormInput control={form.control} name="name" label="Business Name" placeholder="Enter business name"/>
                <FormInput control={form.control} name="grossSales" label="Gross Sales" placeholder="Enter gross sales"/>
                <FormSelect control={form.control} name="sitio" label="Sitio" options={[]}/>
                <FormInput control={form.control} name="street" label="Street Address" placeholder="Enter street address"/>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              {!isSubmitting ? (<Button type="submit" className="w-32">
                    Register
                  </Button>) : (
                    <LoadButton>
                      Registering...
                    </LoadButton>
                  )
                }
            </div>
        </form>
      </Form>
    </div>
  );
}
