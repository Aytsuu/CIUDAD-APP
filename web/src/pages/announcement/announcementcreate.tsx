import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import AnnouncementSchema from "@/form-schema/Announcement/announcementschema";
import { usePostAnnouncement, usePostAnnouncementRecipient } from "./queries/announcementAddQueries";
import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card";
import { FileText, Calendar, Users, Send, MessageSquare } from "lucide-react";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import axios from "axios";
import { usePositions } from "@/pages/record/administration/queries/administrationFetchQueries";

function capitalizeWords(str: string) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const AnnouncementCreate = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  type AnnouncementCreateFormValues = z.infer<typeof AnnouncementSchema> & {
    pos_category: string;
    pos_group: string;
  };

  const defaultValues: AnnouncementCreateFormValues = {
    ann_title: "",
    ann_details: "",
    ann_start_at: "",
    ann_end_at: "",
    ann_event_start: "",
    ann_event_end: "",
    ann_type: "",
    ar_type: [],
    recipient: "everyone",
    staff: user?.staff?.staff_id || "",
    pos_category: "",
    pos_group: "",
    ann_to_sms: false,
    ann_to_email: false,
  };

  const form = useForm<AnnouncementCreateFormValues>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues,
  });

  const annType = form.watch("ann_type");
  const recipientType = form.watch("recipient");
  const posCategory = form.watch("pos_category");
  const posGroup = form.watch("pos_group");

  React.useEffect(() => {
    if (annType === "general") {
      form.setValue("ann_start_at", "");
      form.setValue("ann_end_at", "");
      form.setValue("ann_event_start", "");
      form.setValue("ann_event_end", "");
    }
    form.setValue("ar_type", []);
    form.setValue("pos_category", "");
    form.setValue("pos_group", "");
  }, [annType, recipientType, form]);

  const { mutateAsync: postAnnouncement } = usePostAnnouncement();
  const { mutateAsync: postAnnouncementRecipient } = usePostAnnouncementRecipient();

  const { data: positions = [] } = usePositions();

  const categoryOptions = React.useMemo(() => {
    const cats = positions.map((p: { pos_category: any; }) => p.pos_category).filter(Boolean);
    const uniqueCats = Array.from(new Set(cats));
    return uniqueCats.map((cat) => ({
      id: String(cat),
      name: capitalizeWords(String(cat)),
    }));
  }, [positions]);

  const groupOptions = React.useMemo(() => {
    if (!posCategory) return [];
    const groups = positions
      .filter((p: { pos_category: string; }) => p.pos_category === posCategory)
      .map((p: { pos_group: any; }) => p.pos_group)
      .filter(Boolean);
    const uniqueGroups = Array.from(new Set(groups));
    return uniqueGroups.map((grp) => ({
      id: String(grp),
      name: capitalizeWords(String(grp)),
    }));
  }, [positions, posCategory]);

  const positionsForGroup = React.useMemo(() => {
    if (!posCategory || !posGroup) return [];
    return positions.filter(
      (p: { pos_category: string; pos_group: string; }) => p.pos_category === posCategory && p.pos_group === posGroup
    );
  }, [positions, posCategory, posGroup]);

  const onSubmit = async (data: AnnouncementCreateFormValues) => {
    try {
      const cleanedData: Record<string, any> = {};
      for (const key in data) {
        const value = (data as any)[key];
        cleanedData[key] = value !== "" && value !== undefined ? value : null;
      }

      // Remove ar_type, pos_category, pos_group before sending announcement data
      const { ar_type, pos_category, pos_group, ...announcementData } = cleanedData;

      console.log("Sending announcement payload:", announcementData);

      const createdAnnouncement = await postAnnouncement(announcementData);

      const recipientsPayload = (ar_type ?? []).map((type: string) => ({
        ann: createdAnnouncement?.ann_id,
        ar_type: type,
      }));

      console.log("Recipients payload:", recipientsPayload);

      if (recipientsPayload.length > 0) {
        await postAnnouncementRecipient({ recipients: recipientsPayload });
      }

      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Validation errors from backend:", error.response.data);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <LayoutWithBack
      title="Create Announcement"
      description="Fill in the details below to create and distribute your announcement"
    >
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </div>
                <CardDescription>Enter the main details of your announcement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormSelect
                  control={form.control}
                  name="ann_type"
                  label="Announcement Type"
                  options={[
                    { id: "general", name: "General" },
                    { id: "public", name: "Public" },
                    { id: "event", name: "Event" },
                  ]}
                />

                <FormInput
                  control={form.control}
                  name="ann_title"
                  label="Announcement Title"
                  placeholder="Enter a clear and descriptive title"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Announcement Details</label>
                  <textarea
                    {...form.register("ann_details")}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                    placeholder="Provide detailed information about the announcement"
                  />
                  {form.formState.errors.ann_details && (
                    <p className="text-sm text-red-500">{form.formState.errors.ann_details.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            {["event", "public", "general"].includes(annType) && (
              <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-lg">Schedule</CardTitle>
                  </div>
                  <CardDescription>Set when your announcement will be active</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormDateTimeInput control={form.control} name="ann_start_at" type="datetime-local" label="Start Date & Time" />
                  <FormDateTimeInput control={form.control} name="ann_end_at" type="datetime-local" label="End Date & Time" />

                  {annType === "event" && (
                    <>
                      <FormDateTimeInput control={form.control} name="ann_event_start" type="datetime-local" label="Event Start Date & Time" />
                      <FormDateTimeInput control={form.control} name="ann_event_end" type="datetime-local" label="Event End Date & Time" />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recipients */}
            {["event", "general"].includes(annType) && (
              <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-lg">Recipients</CardTitle>
                  </div>
                  <CardDescription>Choose audience, positions, and age group</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormSelect
                    control={form.control}
                    name="recipient"
                    label="Target Audience"
                    options={[
                      { id: "everyone", name: "Everyone" },
                      { id: "resident", name: "Resident" },
                      { id: "staff", name: "Staff" },
                    ]}
                  />

                  {recipientType === "staff" && (
                    <>
                      <FormSelect
                        control={form.control}
                        name="pos_category"
                        label="Position Category"
                        options={categoryOptions}
                      />

                      {posCategory && (
                        <FormSelect
                          control={form.control}
                          name="pos_group"
                          label="Position Group"
                          options={groupOptions}
                        />
                      )}

                      {posGroup && (
                        <FormComboCheckbox
                          control={form.control}
                          name="ar_type"
                          options={positionsForGroup.map((pos: { pos_title: any; }) => ({
                            id: pos.pos_title,
                            name: pos.pos_title,
                          }))}
                        />
                      )}
                    </>
                  )}

                  {recipientType === "resident" && (
                    <FormComboCheckbox
                      control={form.control}
                      name="ar_type"
                      options={[
                        { id: "all", name: "All" },
                        { id: "adolecent", name: "Adolocent" },
                        { id: "adult", name: "Adult" },
                        { id: "senior citizen", name: "Senior Citizen" },
                      ]}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notification Options */}
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Notification Options</CardTitle>
                </div>
                <CardDescription>Choose how to notify recipients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="ann_to_sms" {...form.register("ann_to_sms")} className="h-4 w-4" />
                    <label htmlFor="ann_to_sms" className="text-sm font-medium text-gray-700">Send SMS Notification</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="ann_to_email" {...form.register("ann_to_email")} className="h-4 w-4" />
                    <label htmlFor="ann_to_email" className="text-sm font-medium text-gray-700">Send Email Notification</label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" /> Create Announcement
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </LayoutWithBack>
  );
};

export default AnnouncementCreate;


// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import type { z } from "zod";
// import { Form } from "@/components/ui/form/form";
// import { FormInput } from "@/components/ui/form/form-input";
// import { FormSelect } from "@/components/ui/form/form-select";
// import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
// import AnnouncementSchema from "@/form-schema/Announcement/announcementschema";
// import { usePostAnnouncement, usePostAnnouncementRecipient } from "./queries/announcementAddQueries";
// import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
// import { Button } from "@/components/ui/button/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card";
// import { FileText, Calendar, Users, Send, MessageSquare } from "lucide-react";
// import React from "react";
// import { useAuth } from "@/context/AuthContext";
// import { useQueryClient } from "@tanstack/react-query";
// import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
// import axios from "axios";
// import { usePositions } from "@/pages/record/administration/queries/administrationFetchQueries";

// const AnnouncementCreate = () => {
//   const queryClient = useQueryClient();
//   const { user } = useAuth();

//   type AnnouncementCreateFormValues = z.infer<typeof AnnouncementSchema> & {
//     pos_category: string;
//     pos_group: string;
//   };

//   const defaultValues: AnnouncementCreateFormValues = {
//     ann_title: "",
//     ann_details: "",
//     ann_start_at: "",
//     ann_end_at: "",
//     ann_event_start: "",
//     ann_event_end: "",
//     ann_type: "",
//     ar_type: [],
//     recipient: "everyone",
//     staff: user?.staff?.staff_id || "",
//     pos_category: "",
//     pos_group: "",
//     ann_to_sms: false,
//     ann_to_email: false,
//   };

//   const form = useForm<AnnouncementCreateFormValues>({
//     resolver: zodResolver(AnnouncementSchema),
//     defaultValues,
//   });

//   const annType = form.watch("ann_type");
//   const recipientType = form.watch("recipient");
//   const posCategory = form.watch("pos_category");
//   const posGroup = form.watch("pos_group");

//   // Reset certain fields when annType or recipientType changes
//   React.useEffect(() => {
//     if (annType === "general") {
//       form.setValue("ann_start_at", "");
//       form.setValue("ann_end_at", "");
//       form.setValue("ann_event_start", "");
//       form.setValue("ann_event_end", "");
//     }
//     form.setValue("ar_type", []);
//     form.setValue("pos_category", "");
//     form.setValue("pos_group", "");
//   }, [annType, recipientType, form]);

//   const { mutateAsync: postAnnouncement } = usePostAnnouncement();
//   const { mutateAsync: postAnnouncementRecipient } = usePostAnnouncementRecipient();

//   const { data: positions = [] } = usePositions();

//   // Extract unique categories
//   const uniqueCategories = React.useMemo(() => {
//     const cats = positions.map((p: { pos_category: any; }) => p.pos_category).filter(Boolean);
//     return Array.from(new Set(cats));
//   }, [positions]);

//   // Groups filtered by selected category
//   const groupsForCategory = React.useMemo(() => {
//     if (!posCategory) return [];
//     const groups = positions
//       .filter((p: { pos_category: string; }) => p.pos_category === posCategory)
//       .map((p: { pos_group: string; }) => p.pos_group)
//       .filter(Boolean);
//     return Array.from(new Set(groups));
//   }, [positions, posCategory]);

//   // Positions filtered by selected category + group
//   const positionsForGroup = React.useMemo(() => {
//     if (!posCategory || !posGroup) return [];
//     return positions.filter(
//       (p: { pos_category: string; pos_group: string; }) => p.pos_category === posCategory && p.pos_group === posGroup
//     );
//   }, [positions, posCategory, posGroup]);

//   const onSubmit = async (data: AnnouncementCreateFormValues) => {
//     try {
//       // Clean data: empty string => null
//       const cleanedData: Record<string, any> = {};
//       for (const key in data) {
//         const value = (data as any)[key];
//         cleanedData[key] = value !== "" && value !== undefined ? value : null;
//       }

//       // Remove ar_type before sending announcement data
//       const { ar_type, pos_category, pos_group, ...announcementData } = cleanedData;

//       console.log("Sending announcement payload:", announcementData);

//       // Create announcement
//       const createdAnnouncement = await postAnnouncement(announcementData);

//       // Build recipients payload from selected positions (ar_type)
//       const recipientsPayload = (ar_type ?? []).map((type: string) => ({
//         ann: createdAnnouncement?.ann_id,
//         ar_type: type, // pos_title string, adjust if backend expects pos_id
//       }));

//       console.log("Recipients payload:", recipientsPayload);

//       // Send recipients if any
//       if (recipientsPayload.length > 0) {
//         await postAnnouncementRecipient({
//           recipients: recipientsPayload,
//         });
//       }

//       // Refresh announcement list
//       queryClient.invalidateQueries({ queryKey: ["announcements"] });
//     } catch (error) {
//       if (axios.isAxiosError(error) && error.response) {
//         console.error("Validation errors from backend:", error.response.data);
//       } else {
//         console.error("Unexpected error:", error);
//       }
//     }
//   };

  
//   return (
//     <LayoutWithBack
//       title="Create Announcement"
//       description="Fill in the details below to create and distribute your announcement"
//     >
//       <div className="max-w-4xl mx-auto">
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             {/* Basic Info */}
//             <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
//               <CardHeader className="pb-4">
//                 <div className="flex items-center gap-2">
//                   <FileText className="h-5 w-5 text-gray-600" />
//                   <CardTitle className="text-lg">Basic Information</CardTitle>
//                 </div>
//                 <CardDescription>Enter the main details of your announcement</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <FormSelect
//                   control={form.control}
//                   name="ann_type"
//                   label="Announcement Type"
//                   options={[
//                     { id: "general", name: "General" },
//                     { id: "public", name: "Public" },
//                     { id: "event", name: "Event" },
//                   ]}
//                 />

//                 <FormInput
//                   control={form.control}
//                   name="ann_title"
//                   label="Announcement Title"
//                   placeholder="Enter a clear and descriptive title"
//                 />

//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-700">Announcement Details</label>
//                   <textarea
//                     {...form.register("ann_details")}
//                     className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
//                     placeholder="Provide detailed information about the announcement"
//                   />
//                   {form.formState.errors.ann_details && (
//                     <p className="text-sm text-red-500">{form.formState.errors.ann_details.message}</p>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Schedule */}
//             {["event", "public", "general"].includes(annType) && (
//               <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
//                 <CardHeader className="pb-4">
//                   <div className="flex items-center gap-2">
//                     <Calendar className="h-5 w-5 text-gray-600" />
//                     <CardTitle className="text-lg">Schedule</CardTitle>
//                   </div>
//                   <CardDescription>Set when your announcement will be active</CardDescription>
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <FormDateTimeInput control={form.control} name="ann_start_at" type="datetime-local" label="Start Date & Time" />
//                   <FormDateTimeInput control={form.control} name="ann_end_at" type="datetime-local" label="End Date & Time" />

//                   {annType === "event" && (
//                     <>
//                       <FormDateTimeInput control={form.control} name="ann_event_start" type="datetime-local" label="Event Start Date & Time" />
//                       <FormDateTimeInput control={form.control} name="ann_event_end" type="datetime-local" label="Event End Date & Time" />
//                     </>
//                   )}
//                 </CardContent>
//               </Card>
//             )}

//             {/* Recipients */}
//             {["event", "general"].includes(annType) && (
//               <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
//                 <CardHeader className="pb-4">
//                   <div className="flex items-center gap-2">
//                     <Users className="h-5 w-5 text-gray-600" />
//                     <CardTitle className="text-lg">Recipients</CardTitle>
//                   </div>
//                   <CardDescription>Choose audience, positions, and age group</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <FormSelect
//                     control={form.control}
//                     name="recipient"
//                     label="Target Audience"
//                     options={[
//                       { id: "everyone", name: "Everyone" },
//                       { id: "resident", name: "Resident" },
//                       { id: "staff", name: "Staff" },
//                     ]}
//                   />

//                   {recipientType === "staff" && (
//                     <>
//                       {/* Position Category select */}
//                       <FormSelect
//                         control={form.control}
//                         name="pos_category"
//                         label="Category"
//                         options={uniqueCategories.map((cat) => ({ id: cat as string, name: cat as string }))}
//                       />

//                       {/* Position Group select */}
//                       {posCategory && (
//                         <FormSelect
//                           control={form.control}
//                           name="pos_group"
//                           label="Groups"
//                           options={groupsForCategory.map((grp) => ({ id: String(grp), name: String(grp) }))}
//                         />
//                       )}

//                       {/* Positions checkboxes */}
//                       {posGroup && (
//                         <FormComboCheckbox
//                           control={form.control}
//                           name="ar_type"
//                           label = "Positions"
//                           options={positionsForGroup.map((pos: { pos_title: any; }) => ({
//                             id: pos.pos_title,
//                             name: pos.pos_title,
//                           }))}
//                         />
//                       )}
//                     </>
//                   )}

//                   {recipientType === "resident" && (
//                     <FormComboCheckbox
//                       control={form.control}
//                       name="ar_type"
//                       options={[
//                         { id: "all", name: "All" },
//                         { id: "adolecent", name: "Adoloscent (10-19 years old)" },
//                         { id: "adult", name: "Adult (20-59 years old)" },
//                         { id: "senior citizen", name: "Senior Citizen (60+ years old)" },
//                       ]}
//                     />
//                   )}
//                 </CardContent>
//               </Card>
//             )}

//             {/* Notification Options */}
//             <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
//               <CardHeader className="pb-4">
//                 <div className="flex items-center gap-2">
//                   <MessageSquare className="h-5 w-5 text-gray-600" />
//                   <CardTitle className="text-lg">Notification Options</CardTitle>
//                 </div>
//                 <CardDescription>Choose how to notify recipients</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center space-x-6">
//                   <div className="flex items-center space-x-2">
//                     <input type="checkbox" id="ann_to_sms" {...form.register("ann_to_sms")} className="h-4 w-4" />
//                     <label htmlFor="ann_to_sms" className="text-sm font-medium text-gray-700">Send SMS Notification</label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <input type="checkbox" id="ann_to_email" {...form.register("ann_to_email")} className="h-4 w-4" />
//                     <label htmlFor="ann_to_email" className="text-sm font-medium text-gray-700">Send Email Notification</label>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <div className="flex justify-end pt-4">
//               <Button type="submit">
//                 <Send className="h-4 w-4 mr-2" /> Create Announcement
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </div>
//     </LayoutWithBack>
//   );
// };

// export default AnnouncementCreate;

