import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import HouseholdProfileForm from "./HouseholdProfileForm";
import { formatAddresses, formatResidents } from "../profilingFormats";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useForm } from "react-hook-form";
import { householdFormSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { useAuth } from "@/context/AuthContext";
import { useAddHousehold } from "../queries/profilingAddQueries";
import { usePerAddressesList, useResidentsList } from "../queries/profilingFetchQueries";
import { usePerAddressesListHealth, useResidentsListHealth } from "../../health-family-profiling/family-profling/queries/profilingFetchQueries";
import { useAddHouseholdHealth } from "../../health-family-profiling/family-profling/queries/profilingAddQueries";
import { useLoading } from "@/context/LoadingContext";
import { useLocation } from "react-router";
import { householdRegistered } from "@/redux/addRegSlice";
import { useDispatch } from "react-redux";
import { useSafeNavigate } from "@/hooks/use-safe-navigate";

export default function HouseholdFormLayout() {
  // =============== STATE INITIALIZATION ==================
  const dispatch = useDispatch();
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const { user } = useAuth();
  const { safeNavigate } = useSafeNavigate(); 
  const {showLoading, hideLoading} = useLoading();
  const [invalidHouseHead, setInvalidHouseHead] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [residents, setResidents] = React.useState<any[]>([]);
  const [addresses, setAddresses] = React.useState<any[]>([]);
  const defaultValues = generateDefaultValues(householdFormSchema);
  const form = useForm<z.infer<typeof householdFormSchema>>({
      resolver: zodResolver(householdFormSchema),
      defaultValues
  });
  const { mutateAsync: addHousehold} = useAddHousehold();
  const { mutateAsync: addHouseholdHealth} = useAddHouseholdHealth();

  const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList();
  const { data: perAddressList, isLoading: isLoadingPerAddress } = usePerAddressesList();

  const { data: residentsListHealth, isLoading: isLoadingResidentsHealth } = useResidentsListHealth();
  const { data: perAddressListHealth, isLoading: isLoadingPerAddressHealth } = usePerAddressesListHealth();

  const formattedAddresses = React.useMemo(() => formatAddresses(perAddressList), [perAddressList])
  const formattedResidents = React.useMemo(() => formatResidents(residentsList), [residentsList])

  // =================== SIDE EFFECTS ======================
  React.useEffect(() => {
    if(isLoadingResidents || isLoadingPerAddress) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoadingResidents, isLoadingPerAddress])

  React.useEffect(() => {
    setResidents(formattedResidents);
    const resident = formattedResidents.find((res: any) => res.id.split(" ")[0] === params?.residentId)
    if(resident) {
      setResidents([resident]);
      form.setValue('householdHead', resident.id)
    }
  }, [params, formattedResidents])

  React.useEffect(() => {
    const head = form.watch('householdHead');
    if(head) {
      const resident = residents.find((res: any) => res.id === head);
      if(resident) {
        const addresses = formattedAddresses.filter((add: any) => add.per_id === resident.per_id);
        console.log(addresses)
        setAddresses(addresses);
      }
    } else {
      setAddresses([]);    
    }
  }, [form.watch('householdHead')])

  // ==================== HANDLERS ========================
  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();
    const householdHead = form.watch("householdHead");
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
      onSuccess: (household) => {
        dispatch(householdRegistered({reg: true, hh_id: household.hh_id}));
        safeNavigate.back();
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
                addresses={addresses}
                residents={residents}
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
// import React from "react";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import HouseholdProfileForm from "./HouseholdProfileForm";
// import { formatAddresses, formatResidents } from "../profilingFormats";
// import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
// import { useForm } from "react-hook-form";
// import { householdFormSchema } from "@/form-schema/profiling-schema";
// import { generateDefaultValues } from "@/helpers/generateDefaultValues";
// import { toast } from "sonner";
// import { CircleAlert } from "lucide-react";
// import { Form } from "@/components/ui/form/form";
// import { useAuth } from "@/context/AuthContext";
// import { useAddHousehold } from "../queries/profilingAddQueries";
// import { usePerAddressesList, useResidentsList } from "../queries/profilingFetchQueries";
// import { useLoading } from "@/context/LoadingContext";
// import { useLocation } from "react-router";
// import { householdRegistered } from "@/redux/addRegSlice";
// import { useDispatch } from "react-redux";
// import { useSafeNavigate } from "@/hooks/use-safe-navigate";

// export default function HouseholdFormLayout() {
//   // =============== STATE INITIALIZATION ==================
//   const dispatch = useDispatch();
//   const location = useLocation();
//   const params = React.useMemo(() => location.state?.params, [location.state]);
//   const { user } = useAuth();
//   const { safeNavigate } = useSafeNavigate(); 
//   const {showLoading, hideLoading} = useLoading();
//   const [invalidHouseHead, setInvalidHouseHead] = React.useState<boolean>(false);
//   const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
//   const [residents, setResidents] = React.useState<any[]>([]);
//   const [addresses, setAddresses] = React.useState<any[]>([]);
//   const defaultValues = generateDefaultValues(householdFormSchema);
//   const form = useForm<z.infer<typeof householdFormSchema>>({
//       resolver: zodResolver(householdFormSchema),
//       defaultValues
//   });
//   const { mutateAsync: addHousehold} = useAddHousehold();
//   const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList();
//   const { data: perAddressList, isLoading: isLoadingPerAddress } = usePerAddressesList();

//   const formattedAddresses = React.useMemo(() => formatAddresses(perAddressList), [perAddressList])
//   const formattedResidents = React.useMemo(() => formatResidents(residentsList), [residentsList])

//   // =================== SIDE EFFECTS ======================
//   React.useEffect(() => {
//     if(isLoadingResidents || isLoadingPerAddress) {
//       showLoading();
//     } else {
//       hideLoading();
//     }
//   }, [isLoadingResidents, isLoadingPerAddress])

//   React.useEffect(() => {
//     setResidents(formattedResidents);
//     const resident = formattedResidents.find((res: any) => res.id.split(" ")[0] === params?.residentId)
//     if(resident) {
//       setResidents([resident]);
//       form.setValue('householdHead', resident.id)
//     }
//   }, [params, formattedResidents])

//   React.useEffect(() => {
//     const head = form.watch('householdHead');
//     if(head) {
//       const resident = residents.find((res: any) => res.id === head);
//       if(resident) {
//         const addresses = formattedAddresses.filter((add: any) => add.per_id === resident.per_id);
//         console.log(addresses)
//         setAddresses(addresses);
//       }
//     } else {
//       setAddresses([]);    
//     }
//   }, [form.watch('householdHead')])

//   // ==================== HANDLERS ========================
//   const submit = async () => {
//     setIsSubmitting(true);
//     const formIsValid = await form.trigger();
//     const householdHead = form.watch("householdHead");
//     if (!formIsValid || !householdHead) {
//       !householdHead && setInvalidHouseHead(true)
//       setIsSubmitting(false);
//       toast("Please fill out all required fields", {
//         icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
//         style: {
//           border: '1px solid rgb(225, 193, 193)',
//           padding: '16px',
//           color: '#b91c1c',
//           background: '#fef2f2',
//         },
//       });
//       return;
//     }

//     const householdInfo = form.getValues();
//     addHousehold({
//       householdInfo: householdInfo, 
//       staffId: user?.staff?.staff_id 
//     }, {
//       onSuccess: (household) => {
//         dispatch(householdRegistered({reg: true, hh_id: household.hh_id}));
//         safeNavigate.back();
//       }
//     });
//   };
  
//   // ==================== RENDER ======================
//   return (
//     <div className="w-full flex justify-center">
//       <div className="w-1/2 grid gap-4 bg-white p-10 rounded-md">
//         <LayoutWithBack
//           title="Household Registration Form"
//           description="All fields are required"
//         >
//           <Form {...form}>
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 submit();
//               }}
//               className="grid gap-4"
//             >
//               <HouseholdProfileForm
//                 addresses={addresses}
//                 residents={residents}
//                 isSubmitting={isSubmitting}
//                 invalidHouseHead={invalidHouseHead}
//                 form={form}
//                 onSubmit={submit}
//               />
//             </form>
//           </Form>
//         </LayoutWithBack>
//       </div>
//     </div>
//   );
// }