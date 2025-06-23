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
import { CircleCheck, Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { toast } from "sonner";
import { LoadButton } from "@/components/ui/button/load-button";
import { useAuth } from "@/context/AuthContext";

// Import hooks for both main and health databases
import { usePositions } from "./queries/administrationFetchQueries";
import { usePositionsHealth } from "../health/administration/queries/administrationFetchQueries";
import { formatPositions } from "./AdministrationFormats";
import { useAddStaff } from "./queries/administrationAddQueries";
import { useAddStaffHealth } from "../../record/health/administration/queries/administrationAddQueries";
import { useAddResidentAndPersonal } from "../profiling/queries/profilingAddQueries";
import { useAddResidentAndPersonalHealth } from "../../record/health-family-profiling/family-profling/queries/profilingAddQueries";

export default function AssignPosition({
  personalInfoform,
  close,
}: {
  personalInfoform: UseFormReturn<z.infer<typeof personalInfoSchema>>;
  close: () => void;
}) {
  // ============= STATE INITIALIZATION ===============
  const { user } = useAuth();
  
  // Fetch positions from both databases
  const { data: positions, isLoading: isLoadingPositions } = usePositions();
  const { data: positionsHealth, isLoading: isLoadingPositionsHealth } = usePositionsHealth();
  
  // Mutation hooks for both databases
  const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
  const { mutateAsync: addResidentAndPersonalHealth } = useAddResidentAndPersonalHealth();
  const { mutateAsync: addStaff } = useAddStaff();
  const { mutateAsync: addStaffHealth } = useAddStaffHealth();
  
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
      setIsSubmitting(false);
      return;
    }

    // Guard: ensure staff_id exists
    const staffId = user?.djangoUser?.resident_profile?.staff?.staff_id;
    if (!staffId) {
      toast.error("Cannot assign position. Staff ID is missing.");
      setIsSubmitting(false);
      return;
    }

    const residentId = personalInfoform.getValues().per_id.split(" ")[0];
    const positionId = form.getValues().assignPosition;

    try {
      if (residentId) {
        // If resident exists, assign position to both databases
        await handleExistingResidentAssignment(residentId, positionId, staffId);
      } else {
        // Register resident in both databases, then assign position
        await handleNewResidentRegistrationAndAssignment(positionId, staffId);
      }
    } catch (error) {
      console.error("Assignment failed:", error);
      toast.error("Failed to assign position. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleExistingResidentAssignment = async (
    residentId: string,
    positionId: string,
    staffId: string
  ) => {
    try {
      // Execute both database insertions in parallel
      const [mainResult, healthResult] = await Promise.allSettled([
        addStaff({
          residentId,
          positionId,
          staffId,
        }),
        addStaffHealth({
          residentId,
          positionId,
          staffId,
        }),
      ]);

      // Check if both operations succeeded
      if (mainResult.status === "fulfilled" && healthResult.status === "fulfilled") {
        deliverFeedback("Position successfully assigned to both databases!");
      } else {
        // Handle partial failures
        const failedOperations = [];
        if (mainResult.status === "rejected") failedOperations.push("main database");
        if (healthResult.status === "rejected") failedOperations.push("health database");
        
        toast.error(`Assignment failed for: ${failedOperations.join(", ")}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error("Failed to assign position to existing resident.");
      setIsSubmitting(false);
      throw error;
    }
  };

  const handleNewResidentRegistrationAndAssignment = async (
    positionId: string,
    staffId: string
  ) => {
    const personalInfo = personalInfoform.getValues();
    if (!personalInfo) {
      toast.error("Missing personal information.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Register resident in both databases in parallel
      const [mainResidentResult, healthResidentResult] = await Promise.allSettled([
        addResidentAndPersonal({
          personalInfo,
          staffId,
        }),
        addResidentAndPersonalHealth({
          personalInfo,
          staffId,
        }),
      ]);

      // Check if both registrations succeeded
      if (mainResidentResult.status === "fulfilled" && healthResidentResult.status === "fulfilled") {
        const mainResident = mainResidentResult.value;
        const healthResident = healthResidentResult.value;

        // Now assign positions in both databases
        const [mainStaffResult, healthStaffResult] = await Promise.allSettled([
          addStaff({
            residentId: mainResident.rp_id,
            positionId,
            staffId,
          }),
          addStaffHealth({
            residentId: healthResident.rp_id,
            positionId,
            staffId,
          }),
        ]);

        // Check if both staff assignments succeeded
        if (mainStaffResult.status === "fulfilled" && healthStaffResult.status === "fulfilled") {
          deliverFeedback("Resident registered and position assigned in both databases!");
        } else {
          const failedAssignments = [];
          if (mainStaffResult.status === "rejected") failedAssignments.push("main database");
          if (healthStaffResult.status === "rejected") failedAssignments.push("health database");
          
          toast.error(`Staff assignment failed for: ${failedAssignments.join(", ")}`);
          setIsSubmitting(false);
        }
      } else {
        // Handle registration failures
        const failedRegistrations = [];
        if (mainResidentResult.status === "rejected") failedRegistrations.push("main database");
        if (healthResidentResult.status === "rejected") failedRegistrations.push("health database");
        
        toast.error(`Resident registration failed for: ${failedRegistrations.join(", ")}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error("Failed to register new resident.");
      setIsSubmitting(false);
      throw error;
    }
  };

  const deliverFeedback = (message: string = "Operation completed successfully!") => {
    form.setValue("assignPosition", "");
    personalInfoform.reset(personalDefaults);
    close();
    setIsSubmitting(false);
    toast.success(message, {
      icon: <CircleCheck size={18} />,
    });
  };

  // Show loading state if either database is loading
  if (isLoadingPositions || isLoadingPositionsHealth) {
    return <Loader2 className="h-5 w-5 animate-spin" />;
  }

  // Use positions from main database (you can modify this logic as needed)
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
