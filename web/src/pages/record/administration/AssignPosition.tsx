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
// import { usePositions } from "./queries/administrationFetchQueries";
// import { formatPositions } from "./AdministrationFormats";
// import { useAddStaff } from "./queries/administrationAddQueries";
// import { useAddResidentAndPersonal } from "../profiling/queries/profilingAddQueries";

// export default function AssignPosition({
//   personalInfoform,
//   close,
// }: {
//   personalInfoform: UseFormReturn<z.infer<typeof personalInfoSchema>>;
//   close: () => void;
// }) {
//   // ============= STATE INITIALIZATION ===============
//   const { user } = React.useRef(useAuth()).current;
//   const {data: positions, isLoading: isLoadingPositions} = usePositions();
//   const {mutateAsync: addResidentAndPersonal} = useAddResidentAndPersonal();
//   const {mutateAsync: addStaff} = useAddStaff();
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
//       console.log(residentId, positionId)
//       addStaff({
//         residentId: residentId, 
//         positionId: positionId,
//         staffId: user?.djangoUser?.resident_profile?.staff?.staff_id || ""
//       }, {
//         onSuccess: () => {
//           deliverFeedback()
//         }
//       });

//     } else {
//       // Register resident before assignment, if not
//       const personalInfo = personalInfoform.getValues();

//       if(!personalInfo) return;
      
//       addResidentAndPersonal({
//         personalInfo: personalInfo,
//         staffId: user?.djangoUser?.resident_profile?.staff?.staff_id || ""
//       }, {
//         onSuccess: (resident) => {
//           addStaff({
//             residentId: resident.rp_id, 
//             positionId: positionId,
//             staffId: user?.djangoUser?.resident_profile?.staff?.staff_id || ""
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
//           options={formatPositions(positions)}
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

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { positionAssignmentSchema } from "@/form-schema/administration-schema";
import { useForm, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { Loader2, CircleCheck } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { LoadButton } from "@/components/ui/button/load-button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Import hooks for both databases
import { usePositions } from "./queries/administrationFetchQueries";
import { usePositionsHealth } from "../health/administration/queries/administrationFetchQueries";
import { formatPositions } from "./AdministrationFormats";
import { useAddStaff } from "./queries/administrationAddQueries";
import { useAddStaffHealth } from "../health/administration/queries/administrationAddQueries";
import { useAddResidentAndPersonal } from "../profiling/queries/profilingAddQueries";
import { useAddResidentAndPersonalHealth } from "../health-family-profiling/family-profling/queries/profilingAddQueries";

export default function AssignPosition({
  personalInfoform,
  close,
}: {
  personalInfoform: UseFormReturn<z.infer<typeof personalInfoSchema>>;
  close: () => void;
}) {
  // ============= STATE INITIALIZATION ===============
  const { user } = useAuth();
  const { data: positions, isLoading: isLoadingPositions } = usePositions();
  const { data: positionsHealth, isLoading: isLoadingPositionsHealth } = usePositionsHealth();
  
  // Mutation hooks for both databases
  const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
  const { mutateAsync: addResidentAndPersonalHealth } = useAddResidentAndPersonalHealth();
  const { mutateAsync: addStaff } = useAddStaff();
  const { mutateAsync: addStaffHealth } = useAddStaffHealth();
  
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const personalDefaults = generateDefaultValues(personalInfoSchema);
  const defaultValues = generateDefaultValues(positionAssignmentSchema);
  
  const form = useForm<z.infer<typeof positionAssignmentSchema>>({
    resolver: zodResolver(positionAssignmentSchema),
    defaultValues,
  });

  // ==================== HANDLERS ====================
  const submit = async () => {
    setIsSubmitting(true);

    const formIsValid = await form.trigger();
    if (!formIsValid) {
      setIsSubmitting(false);
      return;
    }
    
    const staffId = user?.staff?.staff_id || "";
    if (!staffId) {
      toast.error("Cannot assign position. Staff ID is missing.");
      setIsSubmitting(false);
      return;
    }
    
    const residentId = personalInfoform.getValues().per_id?.split(" ")[0];
    const positionId = form.getValues().assignPosition;

    // If resident exists, assign to both databases
    if (residentId) {
      try {
        // Main database assignment
        await addStaff({
          residentId,
          positionId,
          staffId,
        });
        
        // Health database assignment
        await addStaffHealth({
          residentId,
          positionId,
          staffId,
        });
        
        deliverFeedback("Position assigned successfully to both databases!");
      } catch (error) {
        console.error("Assignment error:", error);
        toast.error("Failed to assign position to both databases");
        setIsSubmitting(false);
      }
    } else {
      // Register resident in both databases before assignment
      try {
        const personalInfo = personalInfoform.getValues();
        if (!personalInfo) {
          toast.error("Missing personal information.");
          setIsSubmitting(false);
          return;
        }

        // Register in main database
        const mainResident = await addResidentAndPersonal({
          personalInfo,
          staffId,
        });
        
        // Register in health database
        const healthResident = await addResidentAndPersonalHealth({
          personalInfo,
          staffId,
        });

        // Assign position in main database
        await addStaff({
          residentId: mainResident.rp_id,
          positionId,
          staffId,
        });
        
        // Assign position in health database
        await addStaffHealth({
          residentId: healthResident.rp_id,
          positionId,
          staffId,
        });
        
        deliverFeedback("Resident registered and position assigned in both databases!");
      } catch (error) {
        console.error("Registration/assignment error:", error);
        toast.error("Failed to register resident or assign position");
        setIsSubmitting(false);
      }
    }
  };

  const deliverFeedback = (message?: string) => {
    form.setValue("assignPosition", "");
    personalInfoform.reset(personalDefaults);
    close();
    setIsSubmitting(false);
    
    if (message) {
      toast.success(message, {
        icon: <CircleCheck size={18} />,
      });
    }
  };

  // Show loading state if positions are loading
  if (isLoadingPositions || isLoadingPositionsHealth) {
    return <Loader2 className="h-5 w-5 animate-spin" />;
  }

  // Use positions from main database as primary, fallback to health database
  const availablePositions = positions || positionsHealth;

  return (
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
          options={formatPositions(availablePositions)}
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
