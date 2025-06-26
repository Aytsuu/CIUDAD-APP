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
import { Loader2, UserPlus, Building2, CheckCircle2, XCircle } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { LoadButton } from "@/components/ui/button/load-button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Import hooks for both databases
import { usePositions } from "./queries/administrationFetchQueries";
import { usePositionsHealth } from "../health/administration/queries/administrationFetchQueries";
import { formatPositions } from "./administrationFormats";
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

  // Get resident info for preview
  const residentInfo = personalInfoform.getValues();
  const isExistingResident = !!residentInfo.per_id?.split(" ")[0];

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
      // Register resident before assignment, if not
      const personalInfo = personalInfoform.getValues();

      if(!personalInfo) return;
      
      addResidentAndPersonal({
        personalInfo: personalInfo,
        staffId: user?.staff?.staff_id || ""
      }, {
        onSuccess: (resident) => {
          addStaff({
            residentId: resident.rp_id, 
            positionId: positionId,
            staffId: user?.staff?.staff_id || ""
          }, {
            onSuccess: () => deliverFeedback()
          });
        }
      });
    }
  };

  const deliverFeedback = (message?: string) => {
    form.setValue("assignPosition", "");
    personalInfoform.reset(personalDefaults);
    close();
    setIsSubmitting(false);
  };

  if (isLoadingPositions) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-buttonBlue">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-buttonBlue/60" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-buttonBlue animate-pulse"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-/70">Loading positions...</p>
      </div>
    );
  }

  // Use positions from main database as primary, fallback to health database
  const availablePositions = positions || positionsHealth;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Position Assignment</h2>
            <p className="text-blue-100 text-sm">
              {isExistingResident ? 'Assign position to existing resident' : 'Register new resident and assign position'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        {/* Resident Info Preview */}
        {(residentInfo.per_fname || residentInfo.per_lname) && (
          <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Resident Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="ml-2 text-gray-900">
                      {`${residentInfo.per_fname || ''} ${residentInfo.per_lname || ''}`.trim() || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isExistingResident 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isExistingResident ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Existing Resident
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          New Registration
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              submit();
            }}
            className="space-y-8"
          >

          <FormSelect
            control={form.control}
            name="assignPosition"
            label="Select Position"
            options={formatPositions(positions)}
            readOnly={false}
          />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={close}
                className="sm:flex-none sm:px-8 h-12"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              <div className="flex-1">
                {!isSubmitting ? (
                  <Button 
                    type="submit" 
                    className="w-full h-12"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isExistingResident ? 'Assign Position' : 'Register & Assign'}
                  </Button>
                ) : (
                  <Button className="w-full h-12">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isExistingResident ? 'Assigning Position...' : 'Registering & Assigning...'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Footer Info */}
      <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {isExistingResident 
            ? 'This will assign the selected position to the existing resident.'
            : 'This will first register the resident in the system, then assign the selected position.'
          }
        </p>
      </div>
    </div>
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
