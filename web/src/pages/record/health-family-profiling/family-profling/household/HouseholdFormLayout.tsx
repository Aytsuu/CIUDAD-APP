import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import HouseholdProfileForm from "./HouseholdProfileForm";
import { formatResidents, formatSitio } from "../../profilingFormats";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useForm } from "react-hook-form";
import { householdFormSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { useAuth } from "@/context/AuthContext";
import { useAddHousehold } from "../queries/profilingAddQueries";
import { useHouseholds, useResidents, useSitio } from "../queries/profilingFetchQueries";

export default function HouseholdFormLayout() {
  const { user } = useAuth();
  const [invalidHouseHead, setInvalidHouseHead] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const defaultValues = React.useRef(generateDefaultValues(householdFormSchema));
  const form = useForm<z.infer<typeof householdFormSchema>>({
      resolver: zodResolver(householdFormSchema),
      defaultValues: defaultValues.current,
  });
  const { data: sitio, isLoading: isLoadingSitio } = useSitio();
  const { data: residents, isLoading: isLoadingResidents } = useResidents();
  const { data: households, isLoading: isLoadingHouseholds } = useHouseholds();
  const { mutateAsync: addHousehold} = useAddHousehold();
  const [formattedSitio, setSitio] = React.useState(() => formatSitio({sitio: sitio}));
  const [formattedResidents, setFormattedResidents] = React.useState(() =>
    formatResidents({residents: residents, households: households})
  );

  React.useEffect(()=>{
    setFormattedResidents(() =>
      formatResidents({residents: residents, households: households})
    );
    
    setSitio(() => formatSitio({sitio: sitio}));
  }, [residents, households, sitio])

  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();

    if (!formIsValid || form.watch("householdHead") === '') {
      setInvalidHouseHead(true)
      setIsSubmitting(false);
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
      return;
    }

    const householdInfo = form.getValues();
    await addHousehold({
      householdInfo: householdInfo, 
      staffId: user?.staff.staff_id
    });

    setIsSubmitting(false);
    form.reset(defaultValues.current);
  };

  if(isLoadingResidents || isLoadingHouseholds 
    || isLoadingSitio
  ) {
    return (
      <div>Loading...</div>
    )
  }

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
                sitio={formattedSitio}
                residents={formattedResidents}
                isSubmitting={isSubmitting}
                invalidHouseHead={invalidHouseHead}
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