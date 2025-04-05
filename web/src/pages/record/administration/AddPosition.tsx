import { Form } from "@/components/ui/form/form";
import React from "react";
import { toast } from "sonner";
import { addPosition } from "./restful-api/administrationPostAPI";
import { useForm } from "react-hook-form";
import { Position } from "./administrationTypes";
import { positionFormSchema } from "@/form-schema/administration-schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/ui/form/form-input";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button/button";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { CircleAlert, CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { LoadButton } from "@/components/ui/button/load-button";
import { useAuth } from "@/context/AuthContext";


export default function AddPosition() {
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const { user }  = React.useRef(useAuth()).current;
  const form = useForm<z.infer<typeof positionFormSchema>>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      title: '',
      maximum: '1'
    }
  })

  const  navigate = useNavigate();

  // Prevent typing negative values and 0
  React.useEffect(() => {
    const max_holders = form.watch('maximum')
    if(max_holders === '0' || +max_holders < 0) {
      form.setValue('maximum', '1');
    }

  }, [form.watch('maximum')])

  // Add new position
  const submit = React.useCallback(async () => {
    setIsSubmitting(true);

    const formIsValid = await form.trigger()

    if(!formIsValid){
      setIsSubmitting(false);
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
      });
      return;
    }

    const values = form.getValues()
    const res = await addPosition(values, user?.staff.staff_id);

    if (res) {
      setIsSubmitting(false);
      toast("New record created successfully", {
        icon: (
          <CircleCheck size={24} className="fill-green-500 stroke-white" />
        ),
        action: {
          label: "View",
          onClick: () => navigate(-1),
        },
      });
      
      form.setValue('title', '');
      form.setValue('maximum', '1');

      // setPositions((prev: any) => [
      //   ...prev,
      //   {
      //     id: String(res.pos_id),
      //     name: res.pos_title,
      //     maximum: res.pos_max
      //   },
      // ]);
    }
  }, []);
  return (
    <main className="flex justify-center">
      <Card className="w-1/3 p-10">
        <LayoutWithBack
          title="New Position"
          description="Fill out all fields to proceed with creating new position."
        >
          <Form {...form}>
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
              className="w-full flex flex-col gap-10"
            >
              <div className="grid gap-4">
                <FormInput control={form.control} name="title" label="Title" placeholder="Enter position title"/>
                <FormInput control={form.control} name="maximum" label="Maximum Holders" placeholder="Enter maximum holders" type="number"/>
              </div>
              <div className="w-full flex justify-end">
                {!isSubmitting ? (<ConfirmationModal 
                  trigger={<Button>
                      Create
                    </Button>
                  }
                  title="Confirm Creation"
                  description="Are you sure you want to create new position?"
                  actionLabel="Confirm"
                  onClick={submit}
                />) : (
                  <LoadButton>Creating...</LoadButton>
                )}
              </div>
            </form>
          </Form>
        </LayoutWithBack>
      </Card>
    </main>
  );
}
