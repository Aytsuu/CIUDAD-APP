// import React from "react";
// import { z } from "zod";
// import { useNavigate, useLocation } from "react-router";
// import { demographicInfoSchema } from "@/form-schema/profiling-schema";
// import { generateDefaultValues } from "@/helpers/generateDefaultValues";
// import { zodResolver } from "@hookform/resolvers/zod";
// import LivingSoloForm from "./LivingSoloForm";
// import { formatHouseholds, formatResidents } from "@/pages/record/health-family-profiling/profilingFormats";
// import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
// import { toast } from "sonner";
// import { CircleAlert, CircleCheck } from "lucide-react";
// import { useForm } from "react-hook-form";
// import {
//   addFamily,
//   addFamilyComposition,
// } from "@/pages/record/health-family-profiling/family-profling/restful-api/profiingPostAPI";
// import { Form } from "@/components/ui/form/form";


// export default function SoloFormLayout() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
//   const [invalidResdent, setInvalidResident] = React.useState<boolean>(false);
//   const [invalidHousehold, setInvalidHousehold] = React.useState<boolean>(false)
//   const params = React.useMemo(() => location?.state.params || {}, [location.state]);
//   const residents = React.useMemo(() => formatResidents(params, false), [params.residents]);
//   const households = React.useMemo(() => formatHouseholds(params), [params.households]);

//   const defaultValues = React.useRef(
//     generateDefaultValues(demographicInfoSchema)
//   );
//   const form = useForm<z.infer<typeof demographicInfoSchema>>({
//     resolver: zodResolver(demographicInfoSchema),
//     defaultValues: defaultValues.current,
//     mode: "onChange",
//   });

//   const submit = async () => {
//       setIsSubmitting(true);
//       const formIsValid = await form.trigger();
//       const residentId = form.watch("id");
//       const householdId = form.watch("householdNo");
  
<<<<<<< HEAD
//       if (!formIsValid && !residentId && !householdId) {
//         setIsSubmitting(false);
//         setInvalidResident(true);
//         setInvalidHousehold(true);
//         toast("Please fill out all required fields", {
//           icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
//         });
//         return;
//       }
=======
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
>>>>>>> mobile-register
  
//       const data = form.getValues();
//       const familyNo = await addFamily(data, null, null);
//       const res = await addFamilyComposition(familyNo, data.id.split(" ")[0]);
  
//       if (res) {
//         toast("Record added successfully", {
//           icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//           action: {
//             label: "View",
//             onClick: () => navigate(-1),
//           },
//         });
//         setIsSubmitting(false);
//         form.reset(defaultValues.current);
//       }
//     };

//   return (
//     <div className="w-full flex justify-center">
//       <div className="w-1/2 grid gap-4 bg-white p-10 rounded-md">
//         <LayoutWithBack
//           title="Family Registration Form"
//           description="Family registration form for individuals living independently. Please fill out all required fields."
//         >
//           <Form {...form}>
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 submit();
//               }}
//               className="flex flex-col gap-10"
//             >
//               <LivingSoloForm 
//                 residents={residents} 
//                 households={households} 
//                 isSubmitting={isSubmitting}
//                 invalidResident={invalidResdent}
//                 invalidHousehold={invalidHousehold}
//                 form={form}
//               />
//             </form>
//           </Form>
//         </LayoutWithBack>
//       </div>
//     </div>
//   );
// }
