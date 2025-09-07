// import { useState, useEffect } from 'react';
// import {Input} from '../../../../components/ui/input.tsx';
// import {Label} from '../../../../components/ui/label.tsx';
// import {DatePicker} from '../../../../components/ui/datepicker.tsx';
// import {Textarea} from '../../../../components/ui/textarea.tsx';
// import {Button} from '../../../../components/ui/button/button.tsx';
// import { Form, FormControl, FormField, FormItem, FormMessage, } from "@/components/ui/form/form";
// import { FormInput } from '@/components/ui/form/form-input.tsx';
// import { FormTextArea } from '@/components/ui/form/form-text-area';
// import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input.tsx';
// import { MediaUpload, MediaUploadType } from '@/components/ui/media-upload';
// import { FormComboCheckbox } from '@/components/ui/form/form-combo-checkbox';
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema.ts';
// import { useCreateResolution } from './queries/resolution-add-queries.tsx';
// import { Loader2 } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";



// interface ResolutionCreateFormProps {
//     onSuccess?: () => void; 
// }


// function AddResolution({ onSuccess }: ResolutionCreateFormProps) {

//     const { user } = useAuth();
//     const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
//     const [activeVideoId, setActiveVideoId] = useState<string>("");


//     //Create mutation
//     const { mutate: createResolution, isPending } = useCreateResolution(onSuccess);


//     const form = useForm<z.infer<typeof resolutionFormSchema>>({
//         resolver: zodResolver(resolutionFormSchema),
//         mode: 'onChange',
//         defaultValues: {
//             res_num: "",
//             res_title: "",        
//             res_date_approved: "",
//             res_area_of_focus: [],
//         },
//     });


//     const meetingAreaOfFocus = [
//         { id: "gad", name: "GAD" },
//         { id: "finance", name: "Finance" },
//         { id: "council", name: "Council" },
//         { id: "waste", name: "Waste Committee" }
//     ];

//     function onSubmit(values: z.infer<typeof resolutionFormSchema>) {
        
//         const files = mediaFiles.map((media) => ({
//             'name': media.name,
//             'type': media.type,
//             'file': media.file
//         }))        

//         const allValues = {
//             ...values,
//             files,
//             staff: user?.staff?.staff_id
//         }

//         createResolution(allValues)
//     }

//     return (
//         <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)}   className="space-y-4">

//                     {/*Resolution Number*/}
//                     <FormInput
//                         control={form.control}
//                         name="res_num"
//                         label="Resolution Number"
//                         placeholder="Enter Resolution Number"
//                     />

//                     {/*Resolution Title*/}
//                     <FormTextArea
//                         control={form.control}
//                         name="res_title"
//                         label="Resolution Title"  
//                         placeholder="Enter Resolution Title" 
//                     />         

//                     {/*Resolution Date Approved*/}
//                     <FormDateTimeInput
//                         control={form.control}
//                         name="res_date_approved"
//                         label="Date Approved"
//                         type="date"    
//                     />

//                     {/*Resolution File Upload*/}
//                     <MediaUpload
//                         title=""
//                         description="Upload Resolution File"
//                         mediaFiles={mediaFiles}
//                         activeVideoId={activeVideoId}
//                         setMediaFiles={setMediaFiles}
//                         setActiveVideoId={setActiveVideoId}
//                         acceptableFiles='document'
//                         maxFiles={1}
//                     />                             

//                     {/*Resolution Area of Focus*/}
//                     <FormComboCheckbox
//                         control={form.control}
//                         name="res_area_of_focus"
//                         label="Select Area of Focus"
//                         options={meetingAreaOfFocus}
//                     />                               

//                     <div className="flex justify-end pt-5 space-x-2">
//                         <Button type="submit" disabled={ isPending }>
//                             {isPending ? (
//                                 <>
//                                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                     Submitting...
//                                 </>
//                             ) : (
//                                 "Save"
//                             )}
//                         </Button>
//                     </div>
//             </form>
//         </Form>
//     );
// }

// export default AddResolution;






// import { useState, useEffect } from 'react';
// import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
// import {Input} from '../../../../components/ui/input.tsx';
// import {Label} from '../../../../components/ui/label.tsx';
// import {DatePicker} from '../../../../components/ui/datepicker.tsx';
// import {Textarea} from '../../../../components/ui/textarea.tsx';
// import {Button} from '../../../../components/ui/button/button.tsx';
// import { Form, FormControl, FormField, FormItem, FormMessage, } from "@/components/ui/form/form";
// import { FormInput } from '@/components/ui/form/form-input.tsx';
// import { FormTextArea } from '@/components/ui/form/form-text-area';
// import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input.tsx';
// import { MediaUpload, MediaUploadType } from '@/components/ui/media-upload';
// import { FormComboCheckbox } from '@/components/ui/form/form-combo-checkbox';
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema.ts';
// import { useResolution } from './queries/resolution-fetch-queries';
// import { useCreateResolution } from './queries/resolution-add-queries.tsx';
// import { Loader2 } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";

// interface ResolutionCreateFormProps {
//     onSuccess?: () => void; 
// }

// function AddResolution({ onSuccess }: ResolutionCreateFormProps) {
//     const { user } = useAuth();
//     const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
//     const [activeVideoId, setActiveVideoId] = useState<string>("");
//     const [resolutionType, setResolutionType] = useState<"new" | "old">("new");
//     const [resolutionNumbers, setResolutionNumbers] = useState<string[]>([]);

//     // Fetch mutation
//     const { data: resolutionData = [] } = useResolution();    

//     // Create mutation
//     const { mutate: createResolution, isPending } = useCreateResolution(onSuccess);

//     const form = useForm<z.infer<typeof resolutionFormSchema>>({
//         resolver: zodResolver(resolutionFormSchema),
//         mode: 'onChange',
//         defaultValues: {
//             res_num: "",
//             res_title: "",        
//             res_date_approved: "",
//             res_area_of_focus: [],
//         },
//     });

//     // Extract resolution numbers from fetched data
//     useEffect(() => {
//         if (resolutionData && resolutionData.length > 0) {
//             const numbers = resolutionData.map((resolution: any) => resolution.res_num);
//             setResolutionNumbers(numbers);
//         }
//     }, [resolutionData]);    


//     //Validator for the res_num format
//     const validateResolutionNumberFormat = (resNum: string): boolean => {
//         const pattern = /^\d{3}-\d{2}$/;
//         return pattern.test(resNum);
//     };    


//     const meetingAreaOfFocus = [
//         { id: "gad", name: "GAD" },
//         { id: "finance", name: "Finance" },
//         { id: "council", name: "Council" },
//         { id: "waste", name: "Waste Committee" }
//     ];


//     function onSubmit(values: z.infer<typeof resolutionFormSchema>) {
        
//         // For new resolutions, ensure res_num is empty
//         if (resolutionType === "new") {
//             values.res_num = "";
//         } else{
            
//             if (resolutionNumbers.includes(values.res_num)) {
//                 form.setError("res_num", {
//                     type: "manual",
//                     message: `Resolution number already exists. Please use a different number.`,
//                 });                
//                 return; // Stop form submission
//             }

//             if (!validateResolutionNumberFormat(values.res_num)) {
//                 form.setError("res_num", {
//                     type: "manual",
//                     message: "Resolution number must be in the format: 001-25 (3 digits, dash, 2 digits)",
//                 });                
//                 return;                 
//             }              
//         }
        
//         const files = mediaFiles.map((media) => ({
//             'name': media.name,
//             'type': media.type,
//             'file': media.file
//         }))        

//         const allValues = {
//             ...values,
//             files,
//             staff: user?.staff?.staff_id
//         }

//         createResolution(allValues)
//     }

//     return (
//         <div className="space-y-4">
//             {/* Tabs for New/Old Resolution */}
//             <Tabs 
//                 value={resolutionType} 
//                 onValueChange={(value) => setResolutionType(value as "new" | "old")}
//                 className="w-full"
//             >
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="new">New Resolution</TabsTrigger>
//                     <TabsTrigger value="old">Existing Resolution</TabsTrigger>
//                 </TabsList>
//             </Tabs>

//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                     {/* Resolution Number - Only show for Old resolutions */}
//                     {resolutionType === "old" && (
//                         <FormInput
//                             control={form.control}
//                             name="res_num"
//                             label="Resolution Number"
//                             placeholder="Enter Resolution Number"
//                         />
//                     )}

//                     {/* Resolution Title */}
//                     <FormTextArea
//                         control={form.control}
//                         name="res_title"
//                         label="Resolution Title"  
//                         placeholder="Enter Resolution Title" 
//                     />         

//                     {/* Resolution Date Approved */}
//                     <FormDateTimeInput
//                         control={form.control}
//                         name="res_date_approved"
//                         label="Date Approved"
//                         type="date"    
//                     />

//                     {/* Resolution File Upload */}
//                     <MediaUpload
//                         title=""
//                         description="Upload Resolution File"
//                         mediaFiles={mediaFiles}
//                         activeVideoId={activeVideoId}
//                         setMediaFiles={setMediaFiles}
//                         setActiveVideoId={setActiveVideoId}
//                         acceptableFiles='document'
//                         maxFiles={1}
//                     />                             

//                     {/* Resolution Area of Focus */}
//                     <FormComboCheckbox
//                         control={form.control}
//                         name="res_area_of_focus"
//                         label="Select Area of Focus"
//                         options={meetingAreaOfFocus}
//                     />                               

//                     <div className="flex justify-end pt-5 space-x-2">
//                         <Button type="submit" disabled={isPending}>
//                             {isPending ? (
//                                 <>
//                                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                     Submitting...
//                                 </>
//                             ) : (
//                                 "Save"
//                             )}
//                         </Button>
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     );
// }

// export default AddResolution;









import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import {Input} from '../../../../components/ui/input.tsx';
import {Label} from '../../../../components/ui/label.tsx';
import {DatePicker} from '../../../../components/ui/datepicker.tsx';
import {Textarea} from '../../../../components/ui/textarea.tsx';
import { Skeleton } from '@/components/ui/skeleton';
import {Button} from '../../../../components/ui/button/button.tsx';
import { Form, FormControl, FormField, FormItem, FormMessage, } from "@/components/ui/form/form";
import { FormInput } from '@/components/ui/form/form-input.tsx';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input.tsx';
import { MediaUpload, MediaUploadType } from '@/components/ui/media-upload';
import { FormComboCheckbox } from '@/components/ui/form/form-combo-checkbox';
import { ComboboxInput } from '@/components/ui/form/form-combo-box-search.tsx'; // Import the ComboboxInput
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema.ts';
import { useResolution } from './queries/resolution-fetch-queries';
import { useApprovedProposals } from './queries/resolution-fetch-queries';
import { useCreateResolution } from './queries/resolution-add-queries.tsx';
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ResolutionCreateFormProps {
    onSuccess?: () => void; 
}


function AddResolution({ onSuccess }: ResolutionCreateFormProps) {
    const { user } = useAuth();
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const [resolutionType, setResolutionType] = useState<"new" | "old">("new");
    const [resolutionNumbers, setResolutionNumbers] = useState<string[]>([]);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

    // Fetch mutation
    const { data: resolutionData = [] } = useResolution();    
    const { data: gadProposals = [], isLoading: isLoadingProposals } = useApprovedProposals();

    // Create mutation
    const { mutate: createResolution, isPending } = useCreateResolution(onSuccess);

    const form = useForm<z.infer<typeof resolutionFormSchema>>({
        resolver: zodResolver(resolutionFormSchema),
        mode: 'onChange',
        defaultValues: {
            res_num: "",
            res_title: "",        
            res_date_approved: "",
            res_area_of_focus: [],
            gpr_id: "",
        },
    });

    // Watch the area of focus to show/hide proposal reference
    const watchAreaOfFocus = form.watch("res_area_of_focus");
    
    // Update local state when form values change
    useEffect(() => {
        setSelectedAreas(watchAreaOfFocus || []);
    }, [watchAreaOfFocus]);

    // Extract resolution numbers from fetched data
    useEffect(() => {
        if (resolutionData && resolutionData.length > 0) {
            const numbers = resolutionData.map((resolution: any) => resolution.res_num);
            setResolutionNumbers(numbers);
        }
    }, [resolutionData]);    

    // Validator for the res_num format
    const validateResolutionNumberFormat = (resNum: string): boolean => {
        const pattern = /^\d{3}-\d{2}$/;
        return pattern.test(resNum);
    };    

    const meetingAreaOfFocus = [
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste Committee" }
    ];


    const selectedProposal = gadProposals.find(
        (item) => item.id === form.watch("gpr_id")
    );


    // Check if GAD is selected
    const isGADSelected = selectedAreas.includes("gad");

    function onSubmit(values: z.infer<typeof resolutionFormSchema>) {
        
        // For new resolutions, ensure res_num is empty
        if (resolutionType === "new") {
            values.res_num = "";
        } else {
            
            if (resolutionNumbers.includes(values.res_num)) {
                form.setError("res_num", {
                    type: "manual",
                    message: `Resolution number already exists. Please use a different number.`,
                });                
                return; // Stop form submission
            }

            if (!validateResolutionNumberFormat(values.res_num)) {
                form.setError("res_num", {
                    type: "manual",
                    message: "Resolution number must be in the format: 001-25 (3 digits, dash, 2 digits)",
                });                
                return;                 
            }              
        }

        if(!values.gpr_id){
            values.gpr_id = "";
        }
        
        const files = mediaFiles.map((media) => ({
            'name': media.name,
            'type': media.type,
            'file': media.file
        }))        

        const allValues = {
            ...values,
            files,
            staff: user?.staff?.staff_id
        }

        createResolution(allValues)
        // console.log("CREATED RESOLUTION: ", allValues)
    }

    if (isLoadingProposals) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        );
    }    

    return (
        <div className="space-y-4">
            {/* Tabs for New/Old Resolution */}
            <Tabs 
                value={resolutionType} 
                onValueChange={(value) => setResolutionType(value as "new" | "old")}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="new">New Resolution</TabsTrigger>
                    <TabsTrigger value="old">Existing Resolution</TabsTrigger>
                </TabsList>
            </Tabs>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Resolution Number - Only show for Old resolutions */}
                    {resolutionType === "old" && (
                        <FormInput
                            control={form.control}
                            name="res_num"
                            label="Resolution Number"
                            placeholder="Enter Resolution Number"
                        />
                    )}

                    {/* Resolution Title */}
                    <FormTextArea
                        control={form.control}
                        name="res_title"
                        label="Resolution Title"  
                        placeholder="Enter Resolution Title" 
                    />         

                    {/* Resolution Date Approved */}
                    <FormDateTimeInput
                        control={form.control}
                        name="res_date_approved"
                        label="Date Approved"
                        type="date"    
                    />

                    {/* Resolution Area of Focus */}
                    <FormComboCheckbox
                        control={form.control}
                        name="res_area_of_focus"
                        label="Select Area of Focus"
                        options={meetingAreaOfFocus}
                    />                           

                    {/* Proposal Reference - Only show if GAD is selected */}
                    {isGADSelected && (
                        <ComboboxInput
                            value={selectedProposal?.name || ""}
                            options={gadProposals}
                            label="GAD Proposal Reference"
                            placeholder="Select an approved GAD proposal..."
                            emptyText="No approved GAD proposals found."
                            onSelect={(_value, item) => {
                                if (item) form.setValue("gpr_id", item.id);
                            }}
                            displayKey="name"   
                            valueKey="id"        
                            className="w-full"
                        />
                    )}

                    {/* Resolution File Upload */}
                    <MediaUpload
                        title=""
                        description="Upload Resolution File"
                        mediaFiles={mediaFiles}
                        activeVideoId={activeVideoId}
                        setMediaFiles={setMediaFiles}
                        setActiveVideoId={setActiveVideoId}
                        acceptableFiles='document'
                        maxFiles={1}
                    />                             

                    <div className="flex justify-end pt-5 space-x-2">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default AddResolution;