import React from "react";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router";
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
import {
  useAddFamily,
  useAddFamilyComposition,
} from "../../queries/profilingAddQueries";
import { useHouseholdsList, useResidentsList } from "../../queries/profilingFetchQueries";
import { useLoading } from "@/context/LoadingContext";
import { familyRegistered } from "@/redux/addRegSlice";
import { useDispatch } from "react-redux";
import { useSafeNavigate } from "@/hooks/use-safe-navigate";

export default function SoloFormLayout() {
  // ================= STATE INITIALIZATION ==================
  const dispatch = useDispatch();
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state])
  const defaultValues = generateDefaultValues(demographicInfoSchema);
  const form = useForm<z.infer<typeof demographicInfoSchema>>({
    resolver: zodResolver(demographicInfoSchema),
    defaultValues,
    mode: "onChange",
  });

  const { user } = useAuth();
  const { safeNavigate } = useSafeNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { mutateAsync: addFamily } = useAddFamily();
  const { mutateAsync: addFamilyComposition } = useAddFamilyComposition();
  const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList();
  const { data: householdsList, isLoading: isLoadingHouseholds } = useHouseholdsList();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [invalidResdent, setInvalidResident] = React.useState<boolean>(false);
  const [invalidHousehold, setInvalidHousehold] = React.useState<boolean>(false);
  const [residents, setResidents] = React.useState<any[]>([]);

  const formattedResidents = React.useMemo(() => formatResidents(residentsList), [residentsList]);
  const formattedHouseholds = React.useMemo(() => formatHouseholds(householdsList), [householdsList]);

  // ==================== SIDE EFFECTS ======================
  React.useEffect(() => {
    if(isLoadingHouseholds || isLoadingResidents) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoadingHouseholds, isLoadingResidents])

  React.useEffect(() => {
    setResidents(formattedResidents)
    const resident = formattedResidents.find((res: any) => res.id.split(" ")[0] === params?.residentId)
    if(resident) {
      setResidents([resident])
      form.setValue('id', resident.id)
    }
  }, [params, formattedResidents])

  React.useEffect(() => {
    const householdNo = form.watch('householdNo').split(" ")[0];
    const residentId = form.watch('id').split(" ")[0];
    let building = '';
    if(householdNo && residentId) {
      const ownedHouseholds = householdsList.filter((household: any) => {
        if(household.head_id === residentId) {
          return household.hh_id
        }
      });

      building = ownedHouseholds.some((household: any) => 
        household.hh_id === householdNo) ? 'owner' : '';

      form.setValue('building', building);
    }
  }, [form.watch('householdNo'), form.watch('id')])

  // ==================== HANDLERS ======================
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
      staffId: user?.djangoUser?.resident_profile?.staff?.staff_id || ""
    });

    addFamilyComposition([
      {
        "fam": family.fam_id, 
        "fc_role": "Independent", 
        "rp": residentId
      }
    ], {
      onSuccess: () => {
        dispatch(familyRegistered(true));
        safeNavigate.back();
      }
    });
  };

  // ==================== RENDER ======================
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