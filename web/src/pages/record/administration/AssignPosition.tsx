import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { positionAssignmentSchema } from "@/form-schema/administration-schema";
import { useForm, UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button/button";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { CircleCheck, Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { toast } from "sonner";
import { LoadButton } from "@/components/ui/button/load-button";
import { useAuth } from "@/context/AuthContext";
import { usePositions } from "./queries/administrationFetchQueries";
import { formatPositions } from "./AdministrationFormats";
import { useAddStaff } from "./queries/administrationAddQueries";
import { useAddResidentAndPersonal } from "../profiling/queries/profilingAddQueries";

export default function AssignPosition({
  personalInfoform,
  close,
}: {
  personalInfoform: UseFormReturn<z.infer<typeof personalInfoSchema>>;
  close: () => void;
}) {
  // ============= STATE INITIALIZATION ===============
  const { user } = React.useRef(useAuth()).current;
  const {data: positions, isLoading: isLoadingPositions} = usePositions();
  const {mutateAsync: addResidentAndPersonal} = useAddResidentAndPersonal();
  const {mutateAsync: addStaff} = useAddStaff();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const personalDefaults = React.useRef(
    generateDefaultValues(personalInfoSchema)
  ).current;
  const defaultValues = React.useRef(
    generateDefaultValues(positionAssignmentSchema)
  ).current;
  const form = useForm<z.infer<typeof positionAssignmentSchema>>({
    resolver: zodResolver(positionAssignmentSchema),
    defaultValues,
  });

  // ==================== HANDLERS ====================
  const submit = async () => {
    setIsSubmitting(true);

    const formIsValid = await form.trigger();

    if (!formIsValid) {
      setIsSubmitting(false)
      return;
    }
    
    const residentId = personalInfoform.getValues().per_id.split(" ")[0];
    const positionId = form.getValues().assignPosition;

    // If resident exists, assign
    if (residentId) {
      addStaff({
        residentId: residentId, 
        positionId: positionId,
        staffId: user?.staff.staff_id
      }, {
        onSuccess: () => {
          deliverFeedback()
        }
      });

    } else {
      // Register resident before assignment, if not
      const personalInfo = personalInfoform.getValues();

      if(!personalInfo) return;
      
      addResidentAndPersonal({
        personalInfo: personalInfo,
        staffId: user?.staff.staff_id
      }, {
        onSuccess: (resident) => {
          addStaff({
            residentId: resident.rp_id, 
            positionId: positionId,
            staffId: user?.staff.staff_id
          }, {
            onSuccess: () => deliverFeedback()
          });
        }
      });
    }

  };

  const deliverFeedback = () => {
    // Clear
    form.setValue("assignPosition", "");
    personalInfoform.reset(personalDefaults);
    close();
    setIsSubmitting(false);
  };

  if (isLoadingPositions) {
    return <Loader2 className="h-5 w-5 animate-spin" />;
  }

  return (
    // ==================== RENDER ====================
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          submit();
        }}
        className="grid gap-8"
      >
        <FormSelect
          control={form.control}
          name="assignPosition"
          options={formatPositions(positions)}
          readOnly={false}
        />
        <div className="flex justify-end">
          {!isSubmitting ? (
            <Button type="submit">Register</Button>
          ) : (
            <LoadButton>Assigning...</LoadButton>
          )}
        </div>
      </form>
    </Form>
  );
}
// import React from "react";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { personalInfoSchema } from "@/form-schema/profiling-schema";
// import { positionAssignmentSchema } from "@/form-schema/administration-schema";
// import { useForm, UseFormReturn } from "react-hook-form";
// import { useNavigate } from "react-router";
// import { Button } from "@/components/ui/button/button";
// import { generateDefaultValues } from "@/helpers/generateDefaultValues";
// import { CircleCheck, Loader2 } from "lucide-react";
// import { Form } from "@/components/ui/form/form";
// import { FormSelect } from "@/components/ui/form/form-select";
// import { toast } from "sonner";
// import { LoadButton } from "@/components/ui/button/load-button";
// import { useAuth } from "@/context/AuthContext";
// import { usePositionsHealth } from "../health/administration/queries/administrationFetchQueries";
// import { formatPositions } from "./AdministrationFormats";
// import { useAddStaffHealth } from "../../record/health/administration/queries/administrationAddQueries";
// import { useAddResidentAndPersonalHealth } from "../../record/health-family-profiling/family-profling/queries/profilingAddQueries";
// export default function AssignPosition({
//   personalInfoform,
//   close,
// }: {
//   personalInfoform: UseFormReturn<z.infer<typeof personalInfoSchema>>;
//   close: () => void;
// }) {
//   // ============= STATE INITIALIZATION ===============
//   const { user } = React.useRef(useAuth()).current;
//   const {data: positionsHealth, isLoading: isLoadingPositions} = usePositionsHealth() ;
//   const {mutateAsync: addResidentAndPersonalHealth} = useAddResidentAndPersonalHealth();
//   const {mutateAsync: addStaffHealth} = useAddStaffHealth();
//   const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
//   const personalDefaults = React.useRef(
//     generateDefaultValues(personalInfoSchema)
//   ).current;
//   const defaultValues = React.useRef(
//     generateDefaultValues(positionAssignmentSchema)
//   ).current;
//   const form = useForm<z.infer<typeof positionAssignmentSchema>>({
//     resolver: zodResolver(positionAssignmentSchema),
//     defaultValues,
//   });

//   // ==================== HANDLERS ====================
//   const submit = async () => {
//     setIsSubmitting(true);

//     const formIsValid = await form.trigger();

//     if (!formIsValid) {
//       setIsSubmitting(false)
//       return;
//     }
    
//     const residentId = personalInfoform.getValues().per_id.split(" ")[0];
//     const positionId = form.getValues().assignPosition;

//     // If resident exists, assign
//     if (residentId) {
//       addStaffHealth({
//         residentId: residentId, 
//         positionId: positionId,
//         staffId: user?.staff.staff_id
//       }, {
//         onSuccess: () => {
//           deliverFeedback()
//         }
//       });

//     } else {
//       // Register resident before assignment, if not
//       const personalInfo = personalInfoform.getValues();

//       if(!personalInfo) return;
      
//       addResidentAndPersonalHealth({
//         personalInfo: personalInfo,
//         staffId: user?.staff.staff_id
//       }, {
//         onSuccess: (resident) => {
//           addStaffHealth({
//             residentId: resident.rp_id, 
//             positionId: positionId,
//             staffId: user?.staff.staff_id
//           }, {
//             onSuccess: () => deliverFeedback()
//           });
//         }
//       });
//     }

//   };

//   const deliverFeedback = () => {
//     // Clear
//     form.setValue("assignPosition", "");
//     personalInfoform.reset(personalDefaults);
//     close();
//     setIsSubmitting(false);
//   };

//   if (isLoadingPositions) {
//     return <Loader2 className="h-5 w-5 animate-spin" />;
//   }

//   return (
//     // ==================== RENDER ====================
//     <Form {...form}>
//       <form
//         onSubmit={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           submit();
//         }}
//         className="grid gap-8"
//       >
//         <FormSelect
//           control={form.control}
//           name="assignPosition"
//           options={formatPositions(positionsHealth)}
//           readOnly={false}
//         />
//         <div className="flex justify-end">
//           {!isSubmitting ? (
//             <Button type="submit">Register</Button>
//           ) : (
//             <LoadButton>Assigning...</LoadButton>
//           )}
//         </div>
//       </form>
//     </Form>
//   );
// }
// import React from "react";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { personalInfoSchema } from "@/form-schema/profiling-schema";
// import { positionAssignmentSchema } from "@/form-schema/administration-schema";
// import { useForm, UseFormReturn } from "react-hook-form";
// import { Button } from "@/components/ui/button/button";
// import { generateDefaultValues } from "@/helpers/generateDefaultValues";
// import { CircleCheck, Loader2 } from "lucide-react";
// import { Form } from "@/components/ui/form/form";
// import { FormSelect } from "@/components/ui/form/form-select";
// import { toast } from "sonner";
// import { LoadButton } from "@/components/ui/button/load-button";
// import { useAuth } from "@/context/AuthContext";
// import { usePositionsHealth } from "../health/administration/queries/administrationFetchQueries";
// import { formatPositions } from "./AdministrationFormats";
// import { useAddStaffHealth } from "../../record/health/administration/queries/administrationAddQueries";
// import { useAddResidentAndPersonalHealth } from "../../record/health-family-profiling/family-profling/queries/profilingAddQueries";

// export default function AssignPosition({
//   personalInfoform,
//   close,
// }: {
//   personalInfoform: UseFormReturn<z.infer<typeof personalInfoSchema>>;
//   close: () => void;
// }) {
//   // ============= STATE INITIALIZATION ===============
//   const { user } = useAuth(); // ✅ fixed: don't use useRef for context
//   const { data: positionsHealth, isLoading: isLoadingPositions } = usePositionsHealth();
//   const { mutateAsync: addResidentAndPersonalHealth } = useAddResidentAndPersonalHealth();
//   const { mutateAsync: addStaffHealth } = useAddStaffHealth();
//   const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

//   const personalDefaults = React.useRef(
//     generateDefaultValues(personalInfoSchema)
//   ).current;
//   const defaultValues = React.useRef(
//     generateDefaultValues(positionAssignmentSchema)
//   ).current;

//   const form = useForm<z.infer<typeof positionAssignmentSchema>>({
//     resolver: zodResolver(positionAssignmentSchema),
//     defaultValues,
//   });

//   // ==================== HANDLERS ====================
//   const submit = async () => {
//     setIsSubmitting(true);

//     const formIsValid = await form.trigger();
//     if (!formIsValid) {
//       setIsSubmitting(false);
//       return;
//     }

//     // ✅ Guard: ensure staff_id exists
//     if (!user?.staff?.staff_id) {
//       toast.error("Cannot assign position. Staff ID is missing.");
//       setIsSubmitting(false);
//       return;
//     }

//     const residentId = personalInfoform.getValues().per_id.split(" ")[0];
//     const positionId = form.getValues().assignPosition;

//     if (residentId) {
//       // If resident exists, assign position
//       addStaffHealth(
//         {
//           residentId,
//           positionId,
//           staffId: user.staff.staff_id,
//         },
//         {
//           onSuccess: () => {
//             deliverFeedback();
//           },
//           onError: (error) => {
//             toast.error("Failed to assign position.");
//             console.error(error);
//             setIsSubmitting(false);
//           },
//         }
//       );
//     } else {
//       // Register resident and then assign
//       const personalInfo = personalInfoform.getValues();

//       if (!personalInfo) {
//         toast.error("Missing personal information.");
//         setIsSubmitting(false);
//         return;
//       }

//       addResidentAndPersonalHealth(
//         {
//           personalInfo,
//           staffId: user.staff.staff_id,
//         },
//         {
//           onSuccess: (resident) => {
//             addStaffHealth(
//               {
//                 residentId: resident.rp_id,
//                 positionId,
//                 staffId: user.staff.staff_id,
//               },
//               {
//                 onSuccess: () => deliverFeedback(),
//                 onError: (error) => {
//                   toast.error("Failed to assign staff after registration.");
//                   console.error(error);
//                   setIsSubmitting(false);
//                 },
//               }
//             );
//           },
//           onError: (error) => {
//             toast.error("Failed to register resident.");
//             console.error(error);
//             setIsSubmitting(false);
//           },
//         }
//       );
//     }
//   };

//   const deliverFeedback = () => {
//     form.setValue("assignPosition", "");
//     personalInfoform.reset(personalDefaults);
//     close();
//     setIsSubmitting(false);
//     toast.success("Position successfully assigned.", {
//       icon: <CircleCheck size={18} />,
//     });
//   };

//   if (isLoadingPositions) {
//     return <Loader2 className="h-5 w-5 animate-spin" />;
//   }

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           submit();
//         }}
//         className="grid gap-8"
//       >
//         <FormSelect
//           control={form.control}
//           name="assignPosition"
//           options={formatPositions(positionsHealth)}
//           readOnly={false}
//         />
//         <div className="flex justify-end">
//           {!isSubmitting ? (
//             <Button type="submit">Register</Button>
//           ) : (
//             <LoadButton>Assigning...</LoadButton>
//           )}
//         </div>
//       </form>
//     </Form>
//   );
// }
