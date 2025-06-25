// import { Form } from "@/components/ui/form/form";
// import React from "react";
// import { toast } from "sonner";
// import { useForm } from "react-hook-form";
// import { positionFormSchema, useValidatePosition } from "@/form-schema/administration-schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { FormInput } from "@/components/ui/form/form-input";
// import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
// import { Card } from "@/components/ui/card/card";
// import { CircleAlert } from "lucide-react";
// import { useLocation, useNavigate } from "react-router";
// import { useAuth } from "@/context/AuthContext";
// import { useAddPosition } from "./queries/administrationAddQueries";
// import { useEditPosition } from "./queries/administrationUpdateQueries";
// import { renderActionButton } from "./administrationActionConfig";
// import { Type } from "./administrationEnums";


// export default function PositionForm() {
//   const  navigate = useNavigate();
//   const { user }  = useAuth();
//   const { mutate: addPosition, isPending: isAdding } = useAddPosition();
//   const { mutate: editPosition, isPending: isUpdating } = useEditPosition();
//   const [isSubmitting, setIsSubmitting] = React.useState(false);
//   const location = useLocation();
//   const params = React.useMemo(() => location.state?.params || {}, [location.state])
//   const formType = React.useMemo(() => params?.type || '', [params])
//   const { isPositionUnique } = useValidatePosition();
//   const form = useForm({
//     resolver: zodResolver(positionFormSchema(isPositionUnique, formType)),
//     defaultValues: {
//       pos_title: '',
//       pos_max: '1'
//     }
//   })

//   React.useEffect(() => {
//     if(isAdding || isUpdating) setIsSubmitting(true);
//     else setIsSubmitting(false);
//   }, [isAdding || isUpdating])

//   // Prevent typing negative values and 0
//   React.useEffect(() => {
//     const max_holders = form.watch('pos_max')
//     const maxHoldersNumber = Number(max_holders);
//     if (max_holders === '0' || maxHoldersNumber < 0) {
//       form.setValue('pos_max', '1');
//     }

//   }, [form.watch('pos_max')]);
 
//   // Execute population of fields if type edit
//   React.useEffect(() => {
//     if(formType === Type.Edit) populateFields();
//   }, [formType])

//   const populateFields = React.useCallback(() => {
//     const position = params.data;
//     form.setValue("pos_title", position.pos_title);
//     form.setValue("pos_max", String(position.pos_max));

//   }, [params.data]);

//   // Add new position
//   const submit = React.useCallback(async () => {
//     const formIsValid = await form.trigger()
//     if(!formIsValid){
//       (!form.watch('pos_title') || !form.watch('pos_max')) && 
//       toast("Please fill out all required fields", {
//         icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
//       });
    
//       return;
//     }
    
//     const values = form.getValues()
//     if(formType === Type.Add) {
//       addPosition(
//         {
//           data: values, 
//           staffId: user?.djangoUser?.resident_profile?.staff?.staff_id || ""
//         }, {
//           onSuccess: () => {
//             form.setValue('pos_title', '');
//             form.setValue('pos_max', '1');
//           }
//         }
//       )    
//     } else {
//       const positionId = params.data.pos_id;
//       const values = form.getValues();
//       editPosition({positionId: positionId, values: values})
//     }
//   }, [addPosition, user, navigate]);

//   return (
//     <main className="flex justify-center">
//       <Card className="w-1/3 p-10">
//         <LayoutWithBack
//           title={params.title}
//           description={params.description}
//         >
//           <Form {...form}>
//             <form 
//               onSubmit={(e) => {
//                 e.preventDefault()
//                 submit()
//               }}
//               className="w-full flex flex-col gap-10"
//             >
//               <div className="grid gap-4">
//                 <FormInput control={form.control} name="pos_title" label="Title" placeholder="Enter position title"/>
//                 <FormInput control={form.control} name="pos_max" label="Maximum Holders" placeholder="Enter maximum holders" type="number"/>
//               </div>
//               <div className="w-full flex justify-end">
//                 {renderActionButton({
//                   formType,
//                   isSubmitting,
//                   submit
//                 })}
//               </div>
//             </form>
//           </Form>
//         </LayoutWithBack>
//       </Card>
//     </main>
//   );
// }
import { Form } from "@/components/ui/form/form";
import React from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { positionFormSchema, useValidatePosition } from "@/form-schema/administration-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/ui/form/form-input";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { CircleAlert, CircleCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useAddPosition } from "./queries/administrationAddQueries";
import { useEditPosition } from "./queries/administrationUpdateQueries";
import { useAddPositionHealth } from "../health/administration/queries/administrationAddQueries";
import { useEditPositionHealth } from "../health/administration/queries/administrationUpdateQueries";
import { renderActionButton } from "./administrationActionConfig";
import { Type } from "./administrationEnums";

export default function PositionForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Main database mutations
  const { mutate: addPosition, isPending: isAddingMain } = useAddPosition();
  const { mutate: editPosition, isPending: isUpdatingMain } = useEditPosition();
  
  // Health database mutations
  const { mutate: addPositionHealth, isPending: isAddingHealth } = useAddPositionHealth();
  const { mutate: editPositionHealth, isPending: isUpdatingHealth } = useEditPositionHealth();
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params || {}, [location.state]);
  const formType = React.useMemo(() => params?.type || '', [params]);
  const { isPositionUnique } = useValidatePosition();
  
  const form = useForm({
    resolver: zodResolver(positionFormSchema(isPositionUnique, formType)),
    defaultValues: {
      pos_title: '',
      pos_max: '1'
    }
  });

  // Update submitting state based on all pending operations
  React.useEffect(() => {
    const anyPending = isAddingMain || isUpdatingMain || isAddingHealth || isUpdatingHealth;
    setIsSubmitting(anyPending);
  }, [isAddingMain, isUpdatingMain, isAddingHealth, isUpdatingHealth]);

  // Prevent typing negative values and 0
  React.useEffect(() => {
    const max_holders = form.watch('pos_max');
    const maxHoldersNumber = Number(max_holders);
    if (max_holders === '0' || maxHoldersNumber < 0) {
      form.setValue('pos_max', '1');
    }
  }, [form.watch('pos_max')]);
 
  // Execute population of fields if type edit
  React.useEffect(() => {
    if (formType === Type.Edit) populateFields();
  }, [formType]);

  const populateFields = React.useCallback(() => {
    const position = params.data;
    form.setValue("pos_title", position.pos_title);
    form.setValue("pos_max", String(position.pos_max));
  }, [params.data]);

  // Validate staff ID staffId: user?.staff?.staff_id || ""
  const getValidatedStaffId = React.useCallback(() => {
    const staffId = user?.staff?.staff_id || "";
    if (!staffId) {
      console.error('Staff ID is missing from user context');
      toast("Error: Staff ID not found. Please log in again.", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
      });
      return null;
    }
    return staffId;
  }, [user]);

  // Handle double insertion for add operation
  const handleAddPosition = React.useCallback(async (values: any) => {
    const staffId = getValidatedStaffId();
    if (!staffId) return;

    console.log('Starting double insertion with values:', values);
    console.log('Staff ID:', staffId);

    // Add to main database first
    addPosition(
      { data: values, staffId },
      {
        onSuccess: (mainResult) => {
          console.log('Main database insertion successful:', mainResult);
          
          // After successful main database insertion, add to health database
          addPositionHealth(
            { data: values, staffId },
            {
              onSuccess: (healthResult) => {
                console.log('Health database insertion successful:', healthResult);
                // Reset form only after both operations succeed
                form.setValue('pos_title', '');
                form.setValue('pos_max', '1');
                toast("Position added to both databases successfully", {
                  icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
                });
              },
              onError: (healthError: any) => {
                console.error('Failed to add to health database:', healthError);
                console.error('Health database error details:', {
                  message: healthError?.message,
                  response: healthError?.response?.data,
                  status: healthError?.response?.status
                });
                toast("Warning: Position added to main database but failed to add to health database", {
                  icon: <CircleAlert size={24} className="fill-yellow-500 stroke-white" />
                });
              }
            }
          );
        },
        onError: (mainError: any) => {
          console.error('Failed to add to main database:', mainError);
          console.error('Main database error details:', {
            message: mainError?.message,
            response: mainError?.response?.data,
            status: mainError?.response?.status
          });
          toast("Failed to add position to main database", {
            icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
          });
        }
      }
    );
  }, [addPosition, addPositionHealth, form, getValidatedStaffId]);

  // Handle double update for edit operation
  const handleEditPosition = React.useCallback(async (positionId: string, values: any) => {
    console.log('Starting double update with:', { positionId, values });

    // Update main database first
    editPosition(
      { positionId, values },
      {
        onSuccess: (mainResult) => {
          console.log('Main database update successful:', mainResult);
          
          // After successful main database update, update health database
          editPositionHealth(
            { positionId, values },
            {
              onSuccess: (healthResult) => {
                console.log('Health database update successful:', healthResult);
                toast("Position updated in both databases successfully", {
                  icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
                });
                navigate(-1);
              },
              onError: (healthError: any) => {
                console.error('Failed to update health database:', healthError);
                console.error('Health database update error details:', {
                  message: healthError?.message,
                  response: healthError?.response?.data,
                  status: healthError?.response?.status
                });
                toast("Warning: Position updated in main database but failed to update in health database", {
                  icon: <CircleAlert size={24} className="fill-yellow-500 stroke-white" />
                });
                navigate(-1);
              }
            }
          );
        },
        onError: (mainError: any) => {
          console.error('Failed to update main database:', mainError);
          console.error('Main database update error details:', {
            message: mainError?.message,
            response: mainError?.response?.data,
            status: mainError?.response?.status
          });
          toast("Failed to update position in main database", {
            icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
          });
        }
      }
    );
  }, [editPosition, editPositionHealth, navigate]);

  const submit = React.useCallback(async () => {
  const formIsValid = await form.trigger();
  if (!formIsValid) {
    const missingFields = [];
    if (!form.watch('pos_title')) missingFields.push('Title');
    if (!form.watch('pos_max')) missingFields.push('Maximum Holders');
    
    toast(`Please fill out all required fields: ${missingFields.join(', ')}`, {
      icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
    });
    return;
  }
  
  const values = form.getValues();
  if (formType === Type.Add) {
    await handleAddPosition(values); // Use handleAddPosition instead of direct addPosition
  } else {
    const positionId = params.data.pos_id;
    if (!positionId) {
      console.error('Position ID is missing for edit operation');
      toast("Error: Position ID not found for update", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
      });
      return;
    }
    await handleEditPosition(positionId, values);
  }
}, [form, formType, params.data, handleAddPosition, handleEditPosition]);

  return (
    <main className="flex justify-center">
      <Card className="w-1/3 p-10">
        <LayoutWithBack
          title={params.title}
          description={params.description}
        >
          <Form {...form}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="w-full flex flex-col gap-10"
            >
              <div className="grid gap-4">
                <FormInput control={form.control} name="pos_title" label="Title" placeholder="Enter position title"/>
                <FormInput control={form.control} name="pos_max" label="Maximum Holders" placeholder="Enter maximum holders" type="number"/>
              </div>
              <div className="w-full flex justify-end">
                {renderActionButton({
                  formType,
                  isSubmitting,
                  submit
                })}
              </div>
            </form>
          </Form>
        </LayoutWithBack>
      </Card>
    </main>
  );
}