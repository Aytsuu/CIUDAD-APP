import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router";
import HouseholdProfileForm from "./HouseholdProfileForm";
import { formatResidents, formatSitio } from "../profilingFormats";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useForm } from "react-hook-form";
import { householdFormSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { toast } from "sonner";
import { CircleAlert, CircleCheck } from "lucide-react";
import { addHousehold } from "../restful-api/profiingPostAPI";
import { Form } from "@/components/ui/form/form";

export default function HouseholdFormLayout() {

  const navigate = useNavigate()
  const location = useLocation();
  const [invalidHouseHead, setInvalidHouseHead] = React.useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const defaultValues = React.useRef(generateDefaultValues(householdFormSchema));
  const form = useForm<z.infer<typeof householdFormSchema>>({
      resolver: zodResolver(householdFormSchema),
      defaultValues: defaultValues.current,
  });
  const params = React.useMemo(() => {
    return location.state?.params || {};
  }, [location.state]);

  const [residents, setResidents] = React.useState(() =>
    formatResidents(params, true)
  );
  const sitio = React.useRef(formatSitio(params));

  // Function to update residents after a new household is registered
  const updateResidents = React.useCallback((newHousehold: any) => {
    setResidents((prevResidents: any) => {
      return prevResidents.filter(
        (resident: any) => resident.id.split(" ")[0] !== newHousehold.rp.rp_id
      );
    });
  }, []);

  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();

    if (!formIsValid && form.watch("householdHead") === '') {
      setInvalidHouseHead(true)
      setIsSubmitting(false);
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
      return;
    }

    const data = form.getValues();
    const res = await addHousehold(data);

    if (res) {
      updateResidents(res); // Update residents in the parent component
      toast("Record added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        action: {
          label: "View",
          onClick: () => navigate(-1),
        },
      });
      setIsSubmitting(false);
      form.reset(defaultValues.current);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-1/2 grid gap-4 bg-white p-10 rounded-md">
        <LayoutWithBack
          title="Household Registration Form"
          description="All fields are required"
        >
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="grid gap-4"
            >
              <HouseholdProfileForm
                sitio={sitio.current}
                residents={residents}
                isSubmitting={isSubmitting}
                invalidHouseHead={invalidHouseHead}
                form={form}
              />
            </form>
          </Form>
        </LayoutWithBack>
      </div>
    </div>
  );
}
