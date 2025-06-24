// import React from "react";
// import { Form } from "@/components/ui/form/form";
// import PersonalInfoForm from "./PersonalInfoForm";
// import { useResidentForm } from "./useResidentForm";
// import { useAuth } from "@/context/AuthContext";
// import { Origin, Type } from "../../profilingEnums";
// import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
// import { Card } from "@/components/ui/card/card";
// import { capitalizeAllFields } from "@/helpers/capitalize";
// import {
//   useAddAddress,
//   useAddPerAddress,
//   useAddResidentAndPersonal,
// } from "../../queries/profilingAddQueries";
// import {
//   useResidentsList,
//   useSitioList,
// } from "../../queries/profilingFetchQueries";
// import { formatResidents, formatSitio } from "../../profilingFormats";
// import { useLoading } from "@/context/LoadingContext";

// export default function ResidentCreateForm({ params }: { params: any }) {
//   // ============= STATE INITIALIZATION ===============
//   const { user } = useAuth();
//   const { showLoading, hideLoading } = useLoading();
//   const {
//     form,
//     defaultValues,
//     handleSubmitSuccess,
//     handleSubmitError,
//     populateFields,
//     checkDefaultValues,
//   } = useResidentForm("", params.origin);
//   const [addresses, setAddresses] = React.useState<any[]>([
//     {
//       add_province: "",
//       add_city: "",
//       add_barangay: "",
//       sitio: "",
//       add_external_sitio: "",
//       add_street: "",
//     },
//   ]);
//   const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
//   const { mutateAsync: addAddress } = useAddAddress();
//   const { mutateAsync: addPersonalAddress } = useAddPerAddress();

//   const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
//   const [isAssignmentOpen, setIsAssignmentOpen] = React.useState<boolean>(false);
//   const [isAllowSubmit, setIsAllowSubmit] = React.useState<boolean>(false);
//   const [validAddresses, setValidAddresses] = React.useState<boolean[]>([]);

//   const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList();
//   const { data: sitioList, isLoading: isLoadingSitio } = useSitioList();

//   const formattedSitio = React.useMemo(
//     () => formatSitio(sitioList) || [],
//     [sitioList]
//   );
//   const formattedResidents = React.useMemo(
//     () => formatResidents(residentsList),
//     [residentsList]
//   );

//   // ================== SIDE EFFECTS ==================
//   React.useEffect(() => {
//     if (isLoadingResidents || isLoadingSitio) {
//       showLoading();
//     } else {
//       hideLoading();
//     }
//   }, [isLoadingResidents, isLoadingSitio]);

//   React.useEffect(() => {
//     const subscription = form.watch((value) => {
//       setIsAllowSubmit(!checkDefaultValues(value, defaultValues));
//     });
//     return () => subscription.unsubscribe();
//   }, []);

//   // ==================== HANDLERS ====================
//   const validateAddresses = React.useCallback(
//     (addresses: any) => {
//       const validity = addresses.map(
//         (address: any) =>
//           address.add_province !== "" &&
//           address.add_city !== "" &&
//           address.add_barangay !== "" &&
//           (address.add_barangay === "San Roque"
//             ? address.sitio !== ""
//             : address.add_external_sitio !== "")
//       );

//       setValidAddresses(validity);
//       const isValidAll = validity.every((valid: any) => valid === true);
//       return isValidAll;
//     },
//     [addresses]
//   );

//   const handleComboboxChange = React.useCallback(() => {
//     const data = residentsList.find(
//       (resident: any) => resident.rp_id === form.watch("per_id").split(" ")[0]
//     );

//     populateFields(data?.personal_info);
//     setAddresses(data?.personal_info.per_addresses)
//   }, [form.watch("per_id")]);

//   const submit = async () => {
//     setIsSubmitting(true);

//     if (!(await form.trigger())) {
//       setIsSubmitting(false);
//       handleSubmitError("Please fill out all required fields");
//       return;
//     }

//     if (!validateAddresses(addresses)) {
//       setIsSubmitting(false);
//       handleSubmitError("Please fill out all required fields");
//       return;
//     }

//     try {
//       const personalInfo = capitalizeAllFields(form.getValues());
      
//       // // Safely get staff_id with proper type checking
//       const staffId = user?.djangoUser?.resident_profile?.staff?.staff_id;
      
//       if (!staffId) {
//         throw new Error("Staff information not available");
//       }

//       addResidentAndPersonal(
//         {
//           personalInfo: personalInfo,
//           staffId: staffId,
//         },
//         {
//           onSuccess: (resident) => {
//             addAddress(addresses, {
//               onSuccess: (new_addresses) => {
//                 const per_address = new_addresses?.map((address: any) => ({
//                   add: address.add_id,
//                   per: resident.per.per_id,
//                 }));

//                 addPersonalAddress(per_address, {
//                   onSuccess: () => {
//                     handleSubmitSuccess(
//                       "New record created successfully",
//                       `/resident/additional-registration`,
//                       {
//                         params: {
//                           residentId: resident.rp_id,
//                         },
//                       }
//                     );

//                     setIsSubmitting(false);
//                     form.reset(defaultValues);
//                   },
//                 });
//               },
//             });
//           },
//         }
//       );
//     } catch (err) {
//       setIsSubmitting(false);
//       handleSubmitError(err instanceof Error ? err.message : "An error occurred");
//     }
//   };

//   return (
//     <LayoutWithBack title={params.title} description={params.description}>
//       <Card className="w-full p-10">
//         <div className="pb-4">
//           <h2 className="text-lg font-semibold">Personal Information</h2>
//           <p className="text-xs text-black/50">Fill out all necessary fields</p>
//         </div>
//         <Form {...form}>
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               submit();
//             }}
//             className="flex flex-col gap-4"
//           >
//             <PersonalInfoForm
//               formattedSitio={formattedSitio}
//               formattedResidents={formattedResidents}
//               addresses={addresses}
//               validAddresses={validAddresses}
//               form={form}
//               formType={Type.Create}
//               isSubmitting={isSubmitting}
//               submit={submit}
//               origin={params.origin ? params.origin : ""}
//               isReadOnly={form.watch("per_id") && params.origin == Origin.Administration 
//                 ? true : false
//               }
//               isAllowSubmit={isAllowSubmit}
//               setAddresses={setAddresses}
//               setValidAddresses={setValidAddresses}
//               onComboboxChange={handleComboboxChange}
//               isAssignmentOpen={isAssignmentOpen}
//               setIsAssignmentOpen={setIsAssignmentOpen}
//             />
//           </form>
//         </Form>
//       </Card>
//     </LayoutWithBack>
//   );
// }

import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { useAuth } from "@/context/AuthContext";
import { Origin, Type } from "../../profilingEnums";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { capitalizeAllFields } from "@/helpers/capitalize";
import {
  useAddAddress,
  useAddPerAddress,
  useAddResidentAndPersonal,
} from "../../queries/profilingAddQueries";
import { 
  useAddResidentAndPersonalHealth,
  useAddAddressHealth,
  useAddPerAddressHealth,
} from "../../../health-family-profiling/family-profling/queries/profilingAddQueries";
import {
  useResidentsList,
  useSitioList,
} from "../../queries/profilingFetchQueries";
import { 
  useResidentsListHealth, 
  useSitioListHealth 
} from "../../../health-family-profiling/family-profling/queries/profilingFetchQueries";
import { formatResidents, formatSitio } from "../../profilingFormats";
import { useLoading } from "@/context/LoadingContext";

export default function ResidentCreateForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const {
    form,
    defaultValues,
    handleSubmitSuccess,
    handleSubmitError,
    populateFields,
    checkDefaultValues,
  } = useResidentForm("", params?.origin);
  const [addresses, setAddresses] = React.useState<any[]>([
    {
      add_province: "",
      add_city: "",
      add_barangay: "",
      sitio: "",
      add_external_sitio: "",
      add_street: "",
    },
  ]);
  
  // Main database mutations
  const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
  const { mutateAsync: addAddress } = useAddAddress();
  const { mutateAsync: addPersonalAddress } = useAddPerAddress();
  
  // Health database mutations
  const { mutateAsync: addResidentAndPersonalHealth } = useAddResidentAndPersonalHealth();
  const { mutateAsync: addAddressHealth } = useAddAddressHealth();
  const { mutateAsync: addPersonalAddressHealth } = useAddPerAddressHealth();
  
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = React.useState<boolean>(false);
  const [isAllowSubmit, setIsAllowSubmit] = React.useState<boolean>(false);
  const [validAddresses, setValidAddresses] = React.useState<boolean[]>([]);
  const { data: residentsList, isLoading: isLoadingResidents } =
    useResidentsList(params?.origin === Origin.Administration);
  const { data: residentsListHealth, isLoading: isLoadingResidentsHealth } = useResidentsListHealth();
  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList();
  const { data: sitioListHealth, isLoading: isLoadingSitioHealth } = useSitioListHealth();

  // Formatted data - prioritize main database but fallback to health database
  const formattedSitio = React.useMemo(
    () => formatSitio(sitioList) || formatSitio(sitioListHealth) || [],
    [sitioList, sitioListHealth]
  );
  
  const formattedResidents = React.useMemo(
    () => formatResidents(residentsList) || formatResidents(residentsListHealth) || [],
    [residentsList, residentsListHealth]
  );

  // ================== SIDE EFFECTS ==================
  React.useEffect(() => {
    if (isLoadingResidents || isLoadingSitio || isLoadingResidentsHealth || isLoadingSitioHealth) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoadingResidents, isLoadingSitio, isLoadingResidentsHealth, isLoadingSitioHealth, showLoading, hideLoading]);

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      setIsAllowSubmit(!checkDefaultValues(value, defaultValues));
    });
    return () => subscription.unsubscribe();
  }, [form, checkDefaultValues, defaultValues]);

  // ==================== HANDLERS ====================
  const validateAddresses = React.useCallback(
    (addresses: any[]) => {
      const validity = addresses.map(
        (address: any) =>
          address.add_province !== "" &&
          address.add_city !== "" &&
          address.add_barangay !== "" &&
          (address.add_barangay === "San Roque"
            ? address.sitio !== ""
            : address.add_external_sitio !== "")
      );

      setValidAddresses(validity);
      const isValidAll = validity.every((valid: any) => valid === true);
      return isValidAll;
    },
    [setValidAddresses]
  );

  const handleComboboxChange = React.useCallback(() => {
    const selectedId = form.watch("per_id")?.split(" ")[0];
    if (!selectedId) return;

    // Try to find data in main database first, then health database
    const mainData = residentsList?.find(
      (resident: any) => resident.rp_id === selectedId
    );
    const healthData = residentsListHealth?.find(
      (resident: any) => resident.rp_id === selectedId
    );

    // Use main database data if available, otherwise use health database data
    const dataToUse = mainData || healthData;
    
    if (dataToUse?.personal_info) {
      populateFields(dataToUse.personal_info);
      setAddresses(dataToUse.personal_info.per_addresses || addresses);
    }
  }, [form, residentsList, residentsListHealth, populateFields, addresses]);

  const submit = async () => {
    setIsSubmitting(true);

    if (!(await form.trigger())) {
      setIsSubmitting(false);
      handleSubmitError("Please fill out all required fields");
      return;
    }

    if (!validateAddresses(addresses)) {
      setIsSubmitting(false);
      handleSubmitError("Please fill out all required fields");
      return;
    }

    try {
      const personalInfo = capitalizeAllFields(form.getValues());
      
      // // Safely get staff_id with proper type checking
      const staffId = user?.staff?.staff_id;
      
      if (!staffId) {
        throw new Error("Staff information not available");
      }

      // First insertion - Main database
      addResidentAndPersonal(
        {
          personalInfo: personalInfo,
          staffId: staffId,
        },
        {
          onSuccess: (resident) => {
            // Second insertion - Health database
            addResidentAndPersonalHealth(
              {
                personalInfo: personalInfo,
                staffId: staffId,
              },
              {
                onSuccess: (healthResident) => {
                  // Third - Insert addresses to main database
                  addAddress(addresses, {
                    onSuccess: (new_addresses) => {
                      // Fourth - Insert addresses to health database
                      addAddressHealth(addresses, {
                        onSuccess: (new_addresses_health) => {
                          // Fifth - Link addresses to resident in main database
                          const per_address = new_addresses?.map((address: any) => ({
                            add: address.add_id,
                            per: resident.per.per_id,
                          }));

                          addPersonalAddress(per_address, {
                            onSuccess: () => {
                              // Sixth - Link addresses to resident in health database
                              const per_address_health = new_addresses_health?.map((address: any) => ({
                                add: address.add_id,
                                per: healthResident.per.per_id,
                              }));

                              addPersonalAddressHealth(per_address_health, {
                                onSuccess: () => {
                                  handleSubmitSuccess(
                                    "New record created successfully in both main and health databases",
                                    `/resident/additional-registration`,
                                    {
                                      params: {
                                        residentId: resident.rp_id,
                                      },
                                    }
                                  );

                                  setIsSubmitting(false);
                                  form.reset(defaultValues);
                                },
                                onError: (error) => {
                                  setIsSubmitting(false);
                                  handleSubmitError("Failed to link address to resident in health database. Please try again.");
                                  console.error("Health address linking error:", error);
                                }
                              });
                            },
                            onError: (error) => {
                              setIsSubmitting(false);
                              handleSubmitError("Failed to link address to resident in main database. Please try again.");
                              console.error("Main address linking error:", error);
                            }
                          });
                        },
                        onError: (error) => {
                          setIsSubmitting(false);
                          handleSubmitError("Failed to create address in health database. Please try again.");
                          console.error("Health address creation error:", error);
                        }
                      });
                    },
                    onError: (error) => {
                      setIsSubmitting(false);
                      handleSubmitError("Failed to create address in main database. Please try again.");
                      console.error("Main address creation error:", error);
                    }
                  });
                },
                onError: (error) => {
                  setIsSubmitting(false);
                  handleSubmitError("Failed to create health database record. Please try again.");
                  console.error("Health database insertion error:", error);
                }
              }
            );
          },
          onError: (error) => {
            setIsSubmitting(false);
            handleSubmitError("Failed to create main database record. Please try again.");
            console.error("Main database insertion error:", error);
          }
        }
      );
    } catch (err) {
      setIsSubmitting(false);
      handleSubmitError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <LayoutWithBack title={params?.title} description={params?.description}>
      <Card className="w-full p-10">
        <div className="pb-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <p className="text-xs text-black/50">Fill out all necessary fields</p>
        </div>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-4"
          >
            <PersonalInfoForm
              formattedSitio={formattedSitio}
              formattedResidents={formattedResidents}
              addresses={addresses}
              validAddresses={validAddresses}
              form={form}
              formType={Type.Create}
              isSubmitting={isSubmitting}
              submit={submit}
              origin={params?.origin ? params.origin : ""}
              isReadOnly={form.watch("per_id") && params?.origin == Origin.Administration 
                ? true : false
              }
              isAllowSubmit={isAllowSubmit}
              setAddresses={setAddresses}
              setValidAddresses={setValidAddresses}
              onComboboxChange={handleComboboxChange}
              isAssignmentOpen={isAssignmentOpen}
              setIsAssignmentOpen={setIsAssignmentOpen}
            />
          </form>
        </Form>
      </Card>
    </LayoutWithBack>
  );
}

// import React from "react";
// import { Form } from "@/components/ui/form/form";
// import PersonalInfoForm from "./PersonalInfoForm";
// import { useResidentForm } from "./useResidentForm";
// import { useAuth } from "@/context/AuthContext";
// import { Origin, Type } from "../../profilingEnums";
// import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
// import { Card } from "@/components/ui/card/card";
// import { capitalizeAllFields } from "@/helpers/capitalize";
// import {
//   useAddAddress,
//   useAddPerAddress,
//   useAddResidentAndPersonal,
// } from "../../queries/profilingAddQueries";
// import { 
//   useAddResidentAndPersonalHealth,
//   useAddAddressHealth,
//   useAddPerAddressHealth,
// } from "../../../health-family-profiling/family-profling/queries/profilingAddQueries";
// import {
//   useResidentsList,
//   useSitioList,
// } from "../../queries/profilingFetchQueries";
// import { 
//   useResidentsListHealth, 
//   useSitioListHealth 
// } from "../../../health-family-profiling/family-profling/queries/profilingFetchQueries";
// import { formatResidents, formatSitio } from "../../profilingFormats";
// import { useLoading } from "@/context/LoadingContext";

// export default function ResidentCreateForm({ params }: { params: any }) {
//   // ============= STATE INITIALIZATION ===============
//   const { user } = useAuth();
//   const { showLoading, hideLoading } = useLoading();
//   const {
//     form,
//     defaultValues,
//     handleSubmitSuccess,
//     handleSubmitError,
//     populateFields,
//     checkDefaultValues,
//   } = useResidentForm("", params.origin);
  
//   const [addresses, setAddresses] = React.useState<any[]>([
//     {
//       add_province: "",
//       add_city: "",
//       add_barangay: "",
//       sitio: "",
//       add_external_sitio: "",
//       add_street: "",
//     },
//   ]);
  
//   // Main database mutations
//   const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
//   const { mutateAsync: addAddress } = useAddAddress();
//   const { mutateAsync: addPersonalAddress } = useAddPerAddress();
  
//   // Health database mutations
//   const { mutateAsync: addResidentAndPersonalHealth } = useAddResidentAndPersonalHealth();
//   const { mutateAsync: addAddressHealth } = useAddAddressHealth();
//   const { mutateAsync: addPersonalAddressHealth } = useAddPerAddressHealth();
  
//   const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
//   const [isAssignmentOpen, setIsAssignmentOpen] = React.useState<boolean>(false);
//   const [isAllowSubmit, setIsAllowSubmit] = React.useState<boolean>(false);
//   const [validAddresses, setValidAddresses] = React.useState<boolean[]>([]);
  
//   // Data fetching
//   const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList();
//   const { data: residentsListHealth, isLoading: isLoadingResidentsHealth } = useResidentsListHealth();
//   const { data: sitioList, isLoading: isLoadingSitio } = useSitioList();
//   const { data: sitioListHealth, isLoading: isLoadingSitioHealth } = useSitioListHealth();

//   // Formatted data
//   const formattedSitio = React.useMemo(
//     () => formatSitio(sitioList) || [],
//     [sitioList]
//   );
//   const formattedSitioHealth = React.useMemo(
//     () => formatSitio(sitioListHealth) || [],
//     [sitioListHealth]
//   );
//   const formattedResidents = React.useMemo(
//     () => formatResidents(residentsList),
//     [residentsList]
//   );
//   const formattedResidentsHealth = React.useMemo(
//     () => formatResidents(residentsListHealth),
//     [residentsListHealth]
//   );

//   // ================== SIDE EFFECTS ==================
//   React.useEffect(() => {
//     if (isLoadingResidents || isLoadingSitio || isLoadingResidentsHealth || isLoadingSitioHealth) {
//       showLoading();
//     } else {
//       hideLoading();
//     }
//   }, [isLoadingResidents, isLoadingSitio, isLoadingResidentsHealth, isLoadingSitioHealth, showLoading, hideLoading]);

//   React.useEffect(() => {
//     const subscription = form.watch((value) => {
//       setIsAllowSubmit(!checkDefaultValues(value, defaultValues));
//     });
//     return () => subscription.unsubscribe();
//   }, [form, checkDefaultValues, defaultValues]);

//   // ==================== HANDLERS ====================
//   const validateAddresses = React.useCallback(
//     (addresses: any[]) => {
//       const validity = addresses.map(
//         (address: any) =>
//           address.add_province !== "" &&
//           address.add_city !== "" &&
//           address.add_barangay !== "" &&
//           (address.add_barangay === "San Roque"
//             ? address.sitio !== ""
//             : address.add_external_sitio !== "")
//       );

//       setValidAddresses(validity);
//       const isValidAll = validity.every((valid: any) => valid === true);
//       return isValidAll;
//     },
//     [setValidAddresses]
//   );

//   const handleComboboxChange = React.useCallback(() => {
//     const data = residentsList?.find(
//       (resident: any) => resident.rp_id === form.watch("per_id").split(" ")[0]
//     );
//     const healthData = residentsListHealth?.find(
//       (resident: any) => resident.rp_id === form.watch("per_id").split(" ")[0]
//     );

//     populateFields(healthData?.personal_info);
//     populateFields(data?.personal_info);
//     setAddresses(data?.personal_info.per_addresses)
//   }, [form.watch("per_id")]);

//   const submit = async () => {
//     setIsSubmitting(true);

//     if (!(await form.trigger())) {
//       setIsSubmitting(false);
//       handleSubmitError("Please fill out all required fields");
//       return;
//     }

//     if (!validateAddresses(addresses)) {
//       setIsSubmitting(false);
//       handleSubmitError("Please fill out all required fields");
//       return;
//     }

//     try {
//       const personalInfo = capitalizeAllFields(form.getValues());
      
//       // // Safely get staff_id with proper type checking
//       const staffId = user?.djangoUser?.resident_profile?.staff?.staff_id;
      
//       if (!staffId) {
//         throw new Error("Staff information not available");
//       }

//       addResidentAndPersonal(
//         {
//           personalInfo: personalInfo,
//           staffId: staffId,
//         },
//         {
//           onSuccess: (resident) => {
//             // Second insertion - Health database
//             addResidentAndPersonalHealth(
//               {
//                 personalInfo: personalInfo,
//                 staffId: staffId,
//               },
//               {
//                 onSuccess: (healthResident) => {
//                   // Third - Insert addresses to main database
//                   addAddress(addresses, {
//                     onSuccess: (new_addresses) => {
//                       // Fourth - Insert addresses to health database
//                       addAddressHealth(addresses, {
//                         onSuccess: (new_addresses_health) => {
//                           // Fifth - Link addresses to resident in main database
//                           const per_address = new_addresses?.map((address: any) => ({
//                             add: address.add_id,
//                             per: resident.per.per_id,
//                           }));

//                           addPersonalAddress(per_address, {
//                             onSuccess: () => {
//                               // Sixth - Link addresses to resident in health database
//                               const per_address_health = new_addresses_health?.map((address: any) => ({
//                                 add: address.add_id,
//                                 per: healthResident.per.per_id,
//                               }));

//                               addPersonalAddressHealth(per_address_health, {
//                                 onSuccess: () => {
//                                   handleSubmitSuccess(
//                                     "New record created successfully in both main and health databases",
//                                     `/resident/additional-registration`,
//                                     {
//                                       params: {
//                                         residentId: resident.rp_id,
//                                       },
//                                     }
//                                   );

//                                   setIsSubmitting(false);
//                                   form.reset(defaultValues);
//                                 },
//                                 onError: (error) => {
//                                   setIsSubmitting(false);
//                                   handleSubmitError("Failed to link address to resident in health database. Please try again.");
//                                   console.error("Health address linking error:", error);
//                                 }
//                               });
//                             },
//                             onError: (error) => {
//                               setIsSubmitting(false);
//                               handleSubmitError("Failed to link address to resident in main database. Please try again.");
//                               console.error("Main address linking error:", error);
//                             }
//                           });
//                         },
//                         onError: (error) => {
//                           setIsSubmitting(false);
//                           handleSubmitError("Failed to create address in health database. Please try again.");
//                           console.error("Health address creation error:", error);
//                         }
//                       });
//                     },
//                     onError: (error) => {
//                       setIsSubmitting(false);
//                       handleSubmitError("Failed to create address in main database. Please try again.");
//                       console.error("Main address creation error:", error);
//                     }
//                   });
//                 },
//                 onError: (error) => {
//                   setIsSubmitting(false);
//                   handleSubmitError("Failed to create health database record. Please try again.");
//                   console.error("Health database insertion error:", error);
//                 }
//               }
//             );
//           },
//           onError: (error) => {
//             setIsSubmitting(false);
//             handleSubmitError("Failed to create main database record. Please try again.");
//             console.error("Main database insertion error:", error);
//           }
//         }
//       );
//     } catch (err) {
//       setIsSubmitting(false);
//       handleSubmitError(err instanceof Error ? err.message : "An error occurred");
//     }
//   };

//   return (
//     <LayoutWithBack title={params.title} description={params.description}>
//       <Card className="w-full p-10">
//         <div className="pb-4">
//           <h2 className="text-lg font-semibold">Personal Information</h2>
//           <p className="text-xs text-black/50">Fill out all necessary fields</p>
//         </div>
//         <Form {...form}>
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               submit();
//             }}
//             className="flex flex-col gap-4"
//           >
//             <PersonalInfoForm
//               formattedSitio={formattedSitio}
//               formattedResidents={formattedResidents}
//               addresses={addresses}
//               validAddresses={validAddresses}
//               form={form}
//               formType={Type.Create}
//               isSubmitting={isSubmitting}
//               submit={submit}
//               origin={params.origin ? params.origin : ""}
//               isReadOnly={form.watch("per_id") && params.origin == Origin.Administration 
//                 ? true : false
//               }
//               isAllowSubmit={isAllowSubmit}
//               setAddresses={setAddresses}
//               setValidAddresses={setValidAddresses}
//               onComboboxChange={handleComboboxChange}
//               isAssignmentOpen={isAssignmentOpen}
//               setIsAssignmentOpen={setIsAssignmentOpen}
//             />
//           </form>
//         </Form>
//       </Card>
//     </LayoutWithBack>
//   );
// }


// import React from "react";
// import { Form } from "@/components/ui/form/form";
// import PersonalInfoForm from "./PersonalInfoForm";
// import { useResidentForm } from "./useResidentForm";
// import { useAuth } from "@/context/AuthContext";
// import { Type } from "../../profilingEnums";
// import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
// import { Card } from "@/components/ui/card/card";
// import { capitalizeAllFields } from "@/helpers/capitalize";
// import { 
//   useAddResidentAndPersonalHealth,
//   useAddAddressHealth,
//   useAddPerAddressHealth,
// } from "../../../health-family-profiling/family-profling/queries/profilingAddQueries";
// import { 
//   useResidentsListHealth, 
//   useSitioListHealth 
// } from "../../../health-family-profiling/family-profling/queries/profilingFetchQueries";
// import { formatResidents, formatSitio } from "../../profilingFormats";
// import { useLoading } from "@/context/LoadingContext";

// export default function ResidentCreateForm({ params }: { params: any }) {
//   // ============= STATE INITIALIZATION ===============
//   const { user } = useAuth();
//   const { showLoading, hideLoading } = useLoading();
//   const {
//     form,
//     defaultValues,
//     handleSubmitSuccess,
//     handleSubmitError,
//     populateFields,
//     checkDefaultValues,
//   } = useResidentForm("", params.origin);
//   const [addresses, setAddresses] = React.useState<any[]>([
//     {
//       add_province: "",
//       add_city: "",
//       add_barangay: "",
//       sitio: "",
//       add_external_sitio: "",
//       add_street: "",
//     },
//   ]);
//   const { mutateAsync: addResidentAndPersonalHealth } = useAddResidentAndPersonalHealth();
//   const { mutateAsync: addAddressHealth } = useAddAddressHealth();
//   const { mutateAsync: addPersonalAddressHealth } = useAddPerAddressHealth();
//   const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
//   const [isAssignmentOpen, setIsAssignmentOpen] = React.useState<boolean>(false);
//   const [isAllowSubmit, setIsAllowSubmit] = React.useState<boolean>(false);
//   const [validAddresses, setValidAddresses] = React.useState<boolean[]>([]);
//   const { data: residentsListHealth, isLoading: isLoadingResidentsHealth } = useResidentsListHealth();
//   const { data: sitioListHealth, isLoading: isLoadingSitioHealth } = useSitioListHealth();

//   const formattedSitioHealth = React.useMemo(
//     () => formatSitio(sitioListHealth) || [],
//     [sitioListHealth]
//   );
//   const formattedResidentsHealth = React.useMemo(
//     () => formatResidents(residentsListHealth),
//     [residentsListHealth]
//   );

//   // ================== SIDE EFFECTS ==================
//   React.useEffect(() => {
//     if (isLoadingResidentsHealth || isLoadingSitioHealth) {
//       showLoading();
//     } else {
//       hideLoading();
//     }
//   }, [isLoadingResidentsHealth, isLoadingSitioHealth, showLoading, hideLoading]);

//   React.useEffect(() => {
//     const subscription = form.watch((value) => {
//       setIsAllowSubmit(!checkDefaultValues(value, defaultValues));
//     });
//     return () => subscription.unsubscribe();
//   }, [form, checkDefaultValues, defaultValues]);

//   // ==================== HANDLERS ====================
//   const validateAddresses = React.useCallback(
//     (addresses: any[]) => {
//       const validity = addresses.map(
//         (address: any) =>
//           address.add_province !== "" &&
//           address.add_city !== "" &&
//           address.add_barangay !== "" &&
//           (address.add_barangay === "San Roque"
//             ? address.sitio !== ""
//             : address.add_external_sitio !== "")
//       );

//       setValidAddresses(validity);
//       const isValidAll = validity.every((valid: any) => valid === true);
//       return isValidAll;
//     },
//     [setValidAddresses]
//   );

//   const handleComboboxChange = React.useCallback(() => {
//     const healthData = residentsListHealth?.find(
//       (resident: any) => resident.rp_id === form.watch("per_id").split(" ")[0]
//     );
//     populateFields(healthData?.personal_info);
//   }, [form, residentsListHealth, populateFields]);

//   const submit = async () => {
//     setIsSubmitting(true);

//     if (!(await form.trigger())) {
//       setIsSubmitting(false);
//       handleSubmitError("Please fill out all required fields");
//       return;
//     }

//     if (!validateAddresses(addresses)) {
//       setIsSubmitting(false);
//       handleSubmitError("Please fill out all required fields");
//       return;
//     }

//     try {
//       const personalInfo = capitalizeAllFields(form.getValues());
      
//       // Insert into health database only
//       addResidentAndPersonalHealth(
//         {
//           personalInfo: personalInfo,
//           staffId: user?.staff.staff_id,
//         },
//         {
//           onSuccess: (resident) => {
//             // Add addresses to health database
//             addAddressHealth(addresses, {
//               onSuccess: (new_addresses) => {
//                 const per_address = new_addresses?.map((address: any) => ({
//                   add: address.add_id,
//                   per: resident.per.per_id,
//                 }));

//                 addPersonalAddressHealth(per_address, {
//                   onSuccess: () => {
//                     handleSubmitSuccess(
//                       "New record created successfully in health database",
//                       `/resident/additional-registration`,
//                       {
//                         params: {
//                           residentId: resident.rp_id,
//                         },
//                       }
//                     );

//                     setIsSubmitting(false);
//                     form.reset(defaultValues);
//                   },
//                   onError: (error) => {
//                     setIsSubmitting(false);
//                     handleSubmitError("Failed to create address record. Please try again.");
//                     console.error("Address insertion error:", error);
//                   }
//                 });
//               },
//               onError: (error) => {
//                 setIsSubmitting(false);
//                 handleSubmitError("Failed to create address. Please try again.");
//                 console.error("Address creation error:", error);
//               }
//             });
//           },
//           onError: (error) => {
//             setIsSubmitting(false);
//             handleSubmitError("Failed to create health database record. Please try again.");
//             console.error("Health database insertion error:", error);
//           }
//         }
//       );
//     } catch (err) {
//       setIsSubmitting(false);
//       handleSubmitError("An unexpected error occurred. Please try again.");
//       console.error("Submit error:", err);
//     }
//   };

//   return (
//     // ==================== RENDER ====================
//     <LayoutWithBack title={params.title} description={params.description}>
//       <Card className="w-full p-10">
//         <div className="pb-4">
//           <h2 className="text-lg font-semibold">Personal Information</h2>
//           <p className="text-xs text-black/50">Fill out all necessary fields</p>
//         </div>
//         <Form {...form}>
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               submit();
//             }}
//             className="flex flex-col gap-4"
//           >
//             <PersonalInfoForm
//               formattedSitio={formattedSitioHealth}
//               formattedResidents={formattedResidentsHealth}
//               addresses={addresses}
//               validAddresses={validAddresses}
//               form={form}
//               formType={Type.Create}
//               isSubmitting={isSubmitting}
//               submit={submit}
//               origin={params.origin ? params.origin : ""}
//               isReadOnly={false}
//               isAllowSubmit={isAllowSubmit}
//               setAddresses={setAddresses}
//               setValidAddresses={setValidAddresses}
//               onComboboxChange={handleComboboxChange}
//               isAssignmentOpen={isAssignmentOpen}
//               setIsAssignmentOpen={setIsAssignmentOpen}
//             />
//           </form>
//         </Form>
//       </Card>
//     </LayoutWithBack>
//   );
// }
// import React from "react";
// import { Form } from "@/components/ui/form/form";
// import PersonalInfoForm from "./PersonalInfoForm";
// import { useResidentForm } from "./useResidentForm";
// import { useAuth } from "@/context/AuthContext";
// import { Type } from "../../profilingEnums";
// import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
// import { Card } from "@/components/ui/card/card";
// import { capitalizeAllFields } from "@/helpers/capitalize";
// import {
//   useAddAddress,
//   useAddPerAddress,
//   useAddResidentAndPersonal,
// } from "../../queries/profilingAddQueries";
// import {
//   useResidentsList,
//   useSitioList,
// } from "../../queries/profilingFetchQueries";
// import { formatResidents, formatSitio } from "../../profilingFormats";
// import { useLoading } from "@/context/LoadingContext";

// export default function ResidentCreateForm({ params }: { params: any }) {
//   // ============= STATE INITIALIZATION ===============
//   const { user } = useAuth();
//   const { showLoading, hideLoading } = useLoading();
//   const {
//     form,
//     defaultValues,
//     handleSubmitSuccess,
//     handleSubmitError,
//     populateFields,
//     checkDefaultValues,
//   } = useResidentForm("", params.origin);
//   const [addresses, setAddresses] = React.useState<any[]>([
//     {
//       add_province: "",
//       add_city: "",
//       add_barangay: "",
//       sitio: "",
//       add_external_sitio: "",
//       add_street: "",
//     },
//   ]);
//   const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
//   const { mutateAsync: addAddress } = useAddAddress();
//   const { mutateAsync: addPersonalAddress } = useAddPerAddress();
//   const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
//   const [isAssignmentOpen, setIsAssignmentOpen] =
//     React.useState<boolean>(false);
//   const [isAllowSubmit, setIsAllowSubmit] = React.useState<boolean>(false);
//   const [validAddresses, setValidAddresses] = React.useState<boolean[]>([]);
//   const { data: residentsList, isLoading: isLoadingResidents } =
//     useResidentsList();
//   const { data: sitioList, isLoading: isLoadingSitio } = useSitioList();

//   const formattedSitio = React.useMemo(
//     () => formatSitio(sitioList) || [],
//     [sitioList]
//   );
//   const formattedResidents = React.useMemo(
//     () => formatResidents(residentsList),
//     [residentsList]
//   );

//   // ================== SIDE EFFECTS ==================
//   React.useEffect(() => {
//     if (isLoadingResidents || isLoadingSitio) {
//       showLoading();
//     } else {
//       hideLoading();
//     }
//   }, [origin, isLoadingResidents, isLoadingSitio]);

//   React.useEffect(() => {
//     const subscription = form.watch((value) => {
//       setIsAllowSubmit(!checkDefaultValues(value, defaultValues));
//     });
//     return () => subscription.unsubscribe();
//   }, []);

//   // ==================== HANDLERS ====================
//   const validateAddresses = React.useCallback(
//     (addresses: any) => {
//       const validity = addresses.map(
//         (address: any) =>
//           address.add_province !== "" &&
//           address.add_city !== "" &&
//           address.add_barangay !== "" &&
//           (address.add_barangay === "San Roque"
//             ? address.sitio !== ""
//             : address.add_external_sitio !== "")
//       );

//       setValidAddresses(validity);
//       const isValidAll = validity.every((valid: any) => valid === true);
//       return isValidAll;
//     },
//     [addresses]
//   );

//   const handleComboboxChange = React.useCallback(() => {
//     const data = residentsList.find(
//       (resident: any) => resident.rp_id === form.watch("per_id").split(" ")[0]
//     );

//     populateFields(data?.personal_info);
//   }, [form.watch("per_id")]);

//   const submit = async () => {
//     setIsSubmitting(true);

//     if (!(await form.trigger())) {
//       setIsSubmitting(false);
//       handleSubmitError("Please fill out all required fields");
//       return;
//     }

//     if (!validateAddresses(addresses)) {
//       setIsSubmitting(false);
//       handleSubmitError("Please fill out all required fields");
//       return;
//     }

//     try {
//       const personalInfo = capitalizeAllFields(form.getValues());
//       addResidentAndPersonal(
//         {
//           personalInfo: personalInfo,
//           staffId: user?.staff.staff_id,
//         },
//         {
//           onSuccess: (resident) => {
//             addAddress(addresses, {
//               onSuccess: (new_addresses) => {
//                 const per_address = new_addresses?.map((address: any) => ({
//                   add: address.add_id,
//                   per: resident.per.per_id,
//                 }));

//                 addPersonalAddress(per_address, {
//                   onSuccess: () => {
//                     handleSubmitSuccess(
//                       "New record created successfully",
//                       `/resident/additional-registration`,
//                       {
//                         params: {
//                           residentId: resident.rp_id,
//                         },
//                       }
//                     );

//                     setIsSubmitting(false);
//                     form.reset(defaultValues);
//                   },
//                 });
//               },
//             });
//           },
//         }
//       );
//     } catch (err) {
//       throw err;
//     }
//   };

//   return (
//     // ==================== RENDER ====================
//     <LayoutWithBack title={params.title} description={params.description}>
//       <Card className="w-full p-10">
//         <div className="pb-4">
//           <h2 className="text-lg font-semibold">Personal Information</h2>
//           <p className="text-xs text-black/50">Fill out all necessary fields</p>
//         </div>
//         <Form {...form}>
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               submit();
//             }}
//             className="flex flex-col gap-4"
//           >
//             <PersonalInfoForm
//               formattedSitio={formattedSitio}
//               formattedResidents={formattedResidents}
//               addresses={addresses}
//               validAddresses={validAddresses}
//               form={form}
//               formType={Type.Create}
//               isSubmitting={isSubmitting}
//               submit={submit}
//               origin={params.origin ? params.origin : ""}
//               isReadOnly={false}
//               isAllowSubmit={isAllowSubmit}
//               setAddresses={setAddresses}
//               setValidAddresses={setValidAddresses}
//               onComboboxChange={handleComboboxChange}
//               isAssignmentOpen={isAssignmentOpen}
//               setIsAssignmentOpen={setIsAssignmentOpen}
//             />
//           </form>
//         </Form>
//       </Card>
//     </LayoutWithBack>
//   );
// }