import { Form } from "@/components/ui/form/form";
import React from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { positionFormSchema, useValidatePosition } from "@/form-schema/administration-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/ui/form/form-input";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { CircleAlert } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useAddPosition } from "./queries/administrationAddQueries";
import { useEditPosition } from "./queries/administrationUpdateQueries";
import { renderActionButton } from "./administrationActionConfig";
import { Type } from "./administrationEnums";


export default function PositionForm() {
  const  navigate = useNavigate();
  const { user }  = React.useRef(useAuth()).current;
  const { mutate: addPosition, isPending: isAdding } = useAddPosition();
  const { mutate: editPosition, isPending: isUpdating } = useEditPosition();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params || {}, [location.state])
  const formType = React.useMemo(() => params?.type || '', [params])
  const { isPositionUnique } = useValidatePosition();
  const form = useForm({
    resolver: zodResolver(positionFormSchema(isPositionUnique, formType)),
    defaultValues: {
      pos_title: '',
      pos_max: '1'
    }
  })

  React.useEffect(() => {
    if(isAdding || isUpdating) setIsSubmitting(true);
    else setIsSubmitting(false);
  }, [isAdding || isUpdating])

  // Prevent typing negative values and 0
  React.useEffect(() => {
    const max_holders = form.watch('pos_max')
    const maxHoldersNumber = Number(max_holders);
    if (max_holders === '0' || maxHoldersNumber < 0) {
      form.setValue('pos_max', '1');
    }

  }, [form.watch('pos_max')]);
 
  // Execute population of fields if type edit
  React.useEffect(() => {
    if(formType === Type.Edit) populateFields();
  }, [formType])

  const populateFields = React.useCallback(() => {
    const position = params.data;
    form.setValue("pos_title", position.pos_title);
    form.setValue("pos_max", String(position.pos_max));

  }, [params.data]);

  // Add new position
  const submit = React.useCallback(async () => {
    const formIsValid = await form.trigger()
    if(!formIsValid){
      (!form.watch('pos_title') || !form.watch('pos_max')) && 
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
      });
    
      return;
    }
    
    const values = form.getValues()
    if(formType === Type.Add) {
      addPosition(
        {data: values, staffId: user?.staff.staff_id}, {
          onSuccess: () => {
            form.setValue('pos_title', '');
            form.setValue('pos_max', '1');
          }
        }
      )    
    } else {
      const positionId = params.data.pos_id;
      const values = form.getValues();
      editPosition({positionId: positionId, values: values})
    }
  }, [addPosition, user, navigate]);

  return (
    <main className="flex justify-center">
      <Card className="w-1/3 p-10">
        <LayoutWithBack
          title={params.title}
          description={params.description}
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
                <FormInput control={form.control} name="pos_title" label="Title" placeholder="Enter position title"/>
                <FormInput control={form.control} name="pos_max" label="Maximum Holders" placeholder="Enter maximum holders" type="number"/>
              </div>
              <div className="w-full flex justify-end">
                {renderActionButton({
                  formType,
                  isSubmitting,
                  submit
                })}
              </div>
            </form>
          </Form>
        </LayoutWithBack>
      </Card>
    </main>
  );
}
