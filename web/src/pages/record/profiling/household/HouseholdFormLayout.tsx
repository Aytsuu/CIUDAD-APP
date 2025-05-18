import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import HouseholdProfileForm from "./HouseholdProfileForm";
import { formatResidents, formatSitio } from "../profilingFormats";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useForm } from "react-hook-form";
import { householdFormSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { useAuth } from "@/context/AuthContext";
import { useAddHousehold } from "../queries/profilingAddQueries";
import { useResidentsList } from "../queries/profilingFetchQueries";
import { useLoading } from "@/context/LoadingContext";
import { useLocation } from "react-router";

export default function HouseholdFormLayout() {
  // =============== STATE INITIALIZATION ==================
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const { user } = useAuth();
  const {showLoading, hideLoading} = useLoading();
  const [invalidHouseHead, setInvalidHouseHead] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const defaultValues = generateDefaultValues(householdFormSchema);
  const form = useForm<z.infer<typeof householdFormSchema>>({
      resolver: zodResolver(householdFormSchema),
      defaultValues
  });
  const { mutateAsync: addHousehold} = useAddHousehold();
  const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList();

  const formattedResidents = React.useMemo(() => formatResidents(residentsList) || [], [residentsList])

  // =================== SIDE EFFECTS ======================
  React.useEffect(() => {
    if(isLoadingResidents) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoadingResidents])

  React.useEffect(() => {
    const resident = formattedResidents.find((res: any) => res.id.split(" ")[0] === params.residentId)
    if(resident) {
      form.setValue('householdHead', resident.id)
    }
  }, [params, formattedResidents])

  // ==================== HANDLERS ========================
  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();
    const householdHead = form.watch("householdHead")
    if (!formIsValid || !householdHead) {
      !householdHead && setInvalidHouseHead(true)
      setIsSubmitting(false);
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        style: {
          border: '1px solid rgb(225, 193, 193)',
          padding: '16px',
          color: '#b91c1c',
          background: '#fef2f2',
        },
      });
      return;
    }

    const householdInfo = form.getValues();
    addHousehold({
      householdInfo: householdInfo, 
      staffId: user?.staff.staff_id
    }, {
      onSuccess: () => {
        setIsSubmitting(false);
        form.reset(defaultValues.current);
      }
    });
  };
  
  // ==================== RENDER ======================
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