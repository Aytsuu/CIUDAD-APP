import React from "react";
import { z } from "zod";
import { useLocation } from "react-router";
import { demographicInfoSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { zodResolver } from "@hookform/resolvers/zod";
import LivingSoloForm from "./LivingSoloForm";
import { formatHouseholds, formatResidents } from "../../profilingFormats";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form/form";
import { useAuth } from "@/context/AuthContext";
import { useAddFamily } from "../../queries/profilingAddQueries";

export default function SoloFormLayout() {
  const location = useLocation();
  const defaultValues = React.useRef(
    generateDefaultValues(demographicInfoSchema)
  );
  const form = useForm<z.infer<typeof demographicInfoSchema>>({
    resolver: zodResolver(demographicInfoSchema),
    defaultValues: defaultValues.current,
    mode: "onChange",
  });

  const { user } = React.useRef(useAuth()).current;
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [invalidResdent, setInvalidResident] = React.useState<boolean>(false);
  const [invalidHousehold, setInvalidHousehold] = React.useState<boolean>(false)
  const params = React.useMemo(() => location?.state.params || {}, [location.state]);
  const residents = React.useMemo(() => formatResidents(params, false), [params.residents]);
  const households = React.useMemo(() => formatHouseholds(params), [params.households]);
  const { mutateAsync: addFamily} = useAddFamily(form.getValues());

  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();
    const residentId = form.watch("id");
    const householdId = form.watch("householdNo");

    if (!formIsValid && !residentId && !householdId) {
      setIsSubmitting(false);
      setInvalidResident(true);
      setInvalidHousehold(true);
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
      return;
    }

    console.log(user?.staff.staff_id)
    await addFamily({
      fatherId: null, 
      motherId: null, 
      guardId: null, 
      staffId: user?.staff.staff_id
    });

    setIsSubmitting(false);
    form.reset(defaultValues.current);
  };

  console.log(user)

  return (
    <div className="w-full flex justify-center">
      <div className="w-1/2 grid gap-4 bg-white p-10 rounded-md">
        <LayoutWithBack
          title="Family Registration Form"
          description="Family registration form for individuals living independently. Please fill out all required fields."
        >
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="flex flex-col gap-10"
            >
              <LivingSoloForm 
                residents={residents} 
                households={households} 
                isSubmitting={isSubmitting}
                invalidResident={invalidResdent}
                invalidHousehold={invalidHousehold}
                form={form}
                onSubmit={submit}
              />
            </form>
          </Form>
        </LayoutWithBack>
      </div>
    </div>
  );
}
