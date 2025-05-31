import React from "react";
import { z } from "zod";
import { useNavigate } from "react-router";
import { demographicInfoSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { zodResolver } from "@hookform/resolvers/zod";
import LivingSoloForm from "./LivingSoloForm";
import { formatHouseholds, formatResidents } from "../../profilingFormats";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { toast } from "sonner";
import { CircleAlert, CircleCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form/form";
import { useAuth } from "@/context/AuthContext";
import {
  useAddFamily,
  useAddFamilyComposition,
} from "../../queries/profilingAddQueries";
import { useHouseholdsList, useResidentsList } from "../../queries/profilingFetchQueries";
import { useLoading } from "@/context/LoadingContext";

export default function SoloFormLayout() {
  const navigate = useNavigate();
  const defaultValues = React.useRef(
    generateDefaultValues(demographicInfoSchema)
  );
  const form = useForm<z.infer<typeof demographicInfoSchema>>({
    resolver: zodResolver(demographicInfoSchema),
    defaultValues: defaultValues.current,
    mode: "onChange",
  });

  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { mutateAsync: addFamily } = useAddFamily();
  const { mutateAsync: addFamilyComposition } = useAddFamilyComposition();
  const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList();
  const { data: householdsList, isLoading: isLoadingHouseholds } = useHouseholdsList();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [invalidResdent, setInvalidResident] = React.useState<boolean>(false);
  const [invalidHousehold, setInvalidHousehold] =
    React.useState<boolean>(false);
  const formattedResidents = React.useMemo(
    () => formatResidents(residentsList),
    [residentsList]
  );
  const formattedHouseholds = React.useMemo(
    () => formatHouseholds(householdsList),
    [householdsList]
  );

  React.useEffect(() => {
    if(isLoadingHouseholds || isLoadingResidents) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoadingHouseholds, isLoadingResidents])

  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();
    const residentId = form.watch("id").split(" ")[0];
    const householdId = form.watch("householdNo");

    if (!formIsValid && !residentId && !householdId) {
      setIsSubmitting(false);
      setInvalidResident(true);
      setInvalidHousehold(true);
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

    const family = await addFamily({ 
      demographicInfo: form.getValues(),
      staffId: user?.staff.staff_id 
    });

    addFamilyComposition([
      {
        "fam": family.fam_id, 
        "fc_role": "Independent", 
        "rp": residentId
      }
    ], {
      onSuccess: () => {
        toast("Record added successfully", {
          icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        });
        navigate(-1);
        setIsSubmitting(false);
        form.reset(defaultValues.current);
      }
    });
  };

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
                residents={formattedResidents}
                households={formattedHouseholds}
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