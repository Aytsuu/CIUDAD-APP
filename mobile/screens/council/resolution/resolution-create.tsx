//RESOLUTION CREATE


// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { ChevronLeft } from 'lucide-react-native';
// import { z } from 'zod';
// import { useRouter } from 'expo-router';
// import { Button } from '@/components/ui/button';
// import { FormInput } from '@/components/ui/form/form-input';
// import { FormTextArea } from '@/components/ui/form/form-text-area';
// import FormComboCheckbox from '@/components/ui/form/form-combo-checkbox';
// import { FormDateTimeInput } from '@/components/ui/form/form-date-or-time-input';
// import DocumentPickerComponent, {DocumentItem} from '@/components/ui/document-upload';
// import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema';
// import { useCreateResolution } from './queries/resolution-add-queries';


// interface ResolutionCreateFormProps {
//     onSuccess?: () => void; 
// }

// function ResolutionCreate({ onSuccess }: ResolutionCreateFormProps) {
//     const router = useRouter();
//     const [selectedDocuments, setSelectedDocuments] = React.useState<DocumentItem[]>([]);
//     const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([])
    
//     // Create mutation
//     const { mutate: createResolution, isPending } = useCreateResolution(() => {
//         onSuccess?.();
//         setTimeout(() => {
//             router.back();
//         }, 700);
//     });

//     const meetingAreaOfFocus = [
//         { id: "gad", name: "GAD" },
//         { id: "finance", name: "Finance" },
//         { id: "council", name: "Council" },
//         { id: "waste", name: "Waste Committee" }
//     ];

//     const form = useForm<z.infer<typeof resolutionFormSchema>>({
//         resolver: zodResolver(resolutionFormSchema),
//         mode: 'onChange',
//         defaultValues: {
//             res_title: "",        
//             res_date_approved: "",
//             res_area_of_focus: [],
//         },
//     });
 


//     const onSubmit = (values: z.infer<typeof resolutionFormSchema>) => {
        
//         const resFiles = selectedDocuments.map((docs: any) => ({
//             name: docs.name,
//             type: docs.type,
//             file: docs.file
//         }))

//         const resSuppDocs = selectedImages.map((img: any) => ({
//             name: img.name,
//             type: img.type,
//             file: img.file
//         }))

//         const allValues = {
//             ...values,
//             resFiles,
//             resSuppDocs
//         }

//         createResolution(allValues);
//         // console.log("NEW RESOLUTION: ", values)
//     };

//     return (
//         <_ScreenLayout
//             headerBetweenAction={<Text className="text-[13px]">Add New Resolution</Text>}
//             headerAlign="left"
//             showBackButton={true}
//             showExitButton={false}
//             customLeftAction={
//                 <TouchableOpacity onPress={() => router.back()}>
//                     <ChevronLeft size={24} color="black" />
//                 </TouchableOpacity>
//             }
//             scrollable={true}
//             keyboardAvoiding={true}
//             contentPadding="medium"
//             loading={isPending}
//             loadingMessage="Saving resolution..."
//             footer={
//                 <TouchableOpacity
//                     className="bg-primaryBlue py-3 rounded-md w-full items-center"
//                     onPress={form.handleSubmit(onSubmit)}
//                 >
//                     <Text className="text-white text-base font-semibold">Save Resolution</Text>
//                 </TouchableOpacity>
//             }
//             stickyFooter={true}
//         >
//             <View className="w-full space-y-4 px-4 pt-5">
//                 {/* Resolution Title */}
//                 <FormTextArea
//                     control={form.control}
//                     name="res_title"
//                     label="Resolution Title"  
//                     placeholder="Enter Resolution Title" 
//                 />         

//                 {/* Resolution Date Approved */}
//                 <FormDateTimeInput
//                     control={form.control}
//                     name="res_date_approved"
//                     label="Date Approved"
//                     type="date"    
//                 />

//                 {/* Resolution Area of Focus */}
//                 <FormComboCheckbox
//                     control={form.control}
//                     name="res_area_of_focus"
//                     label="Select Area of Focus"
//                     options={meetingAreaOfFocus}
//                 />                               

//                 <View className="pt-5">
//                     <Text className="text-[12px] font-PoppinsRegular pb-1">Resolution File</Text>
//                     <DocumentPickerComponent
//                         selectedDocuments={selectedDocuments}
//                         setSelectedDocuments={setSelectedDocuments}
//                         multiple={true} 
//                         maxDocuments={1} 
//                     />
//                 </View>

//                 <View className="pt-5">
//                     <Text className="text-[12px] font-PoppinsRegular pb-1">Supporting Document</Text>
//                     <MediaPicker
//                         selectedImages={selectedImages}
//                         setSelectedImages={setSelectedImages}
//                         multiple={true}
//                         maxImages={5}
//                     />    
//                 </View>
//             </View>
//         </_ScreenLayout>
//     );
// }

// export default ResolutionCreate;












import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form/form-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import FormComboCheckbox from '@/components/ui/form/form-combo-checkbox';
import { FormDateTimeInput } from '@/components/ui/form/form-date-or-time-input';
import DocumentPickerComponent, {DocumentItem} from '@/components/ui/document-upload';
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import _ScreenLayout from '@/screens/_ScreenLayout';
import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema';
import { useCreateResolution } from './queries/resolution-add-queries';
import { useApprovedProposals } from './queries/resolution-fetch-queries';
import { useResolution } from './queries/resolution-fetch-queries';

interface ResolutionCreateFormProps {
    onSuccess?: () => void; 
}

function ResolutionCreate({ onSuccess }: ResolutionCreateFormProps) {
    const router = useRouter();
    const [selectedDocuments, setSelectedDocuments] = React.useState<DocumentItem[]>([]);
    const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([]);
    const [resolutionType, setResolutionType] = useState<'new' | 'old'>('new');
    const [resolutionNumbers, setResolutionNumbers] = useState<string[]>([]);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    
    // Fetch existing resolutions
    const { data: resolutionData = [] } = useResolution();
    const { data: gadProposals = [] } = useApprovedProposals();

    // Create mutation
    const { mutate: createResolution, isPending } = useCreateResolution(() => {
        onSuccess?.();
        setTimeout(() => {
            router.back();
        }, 700);
    });

    const proposalOptions = gadProposals.map(item => ({
        label: item.name,
        value: item.id,
    }));

    const meetingAreaOfFocus = [
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste Committee" }
    ];

    const form = useForm<z.infer<typeof resolutionFormSchema>>({
        resolver: zodResolver(resolutionFormSchema),
        mode: 'onChange',
        defaultValues: {
            res_num: "",
            res_title: "",        
            res_date_approved: "",
            res_area_of_focus: [],
            gpr_id: ""
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

    // Check if GAD is selected
    const isGADSelected = selectedAreas.includes("gad");
    
    const validateResolutionNumberFormat = (resNum: string): boolean => {
        const pattern = /^\d{3}-\d{2}$/;
        return pattern.test(resNum);
    };

    const onSubmit = (values: z.infer<typeof resolutionFormSchema>) => {
        // For new resolutions, ensure res_num is empty
        if (resolutionType === "new") {
            values.res_num = "";
        } else {
            // For old resolutions, check if the resolution number already exists
            if (resolutionNumbers.includes(values.res_num)) {
                form.setError("res_num", {
                    type: "manual",
                    message: "Resolution number already exists. Please use a different number.",
                });                
                return; 
            }

            if (!validateResolutionNumberFormat(values.res_num)) {
                form.setError("res_num", {
                    type: "manual",
                    message: "Resolution number must be in the format: 001-25 (3 digits, dash, 2 digits)",
                });                
                return;                 
            }        
            
        }
        
    
        if (Number(values.gpr_id) === 0) {
            values.gpr_id = "";
        }

        
        const resFiles = selectedDocuments.map((docs: any) => ({
            name: docs.name,
            type: docs.type,
            file: docs.file
        }));

        const resSuppDocs = selectedImages.map((img: any) => ({
            name: img.name,
            type: img.type,
            file: img.file
        }));

        const allValues = {
            ...values,
            resFiles,
            resSuppDocs
        };

        createResolution(allValues);
        // console.log("RESOLUTION ON SUBMIT: ", allValues)
    };

    // Custom tab component for React Native
    const TabButton = ({ 
        title, 
        isActive, 
        onPress 
    }: { 
        title: string; 
        isActive: boolean; 
        onPress: () => void; 
    }) => (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-1 py-3 px-4 items-center rounded-md ${
                isActive ? 'bg-primaryBlue' : 'bg-gray-200'
            }`}
        >
            <Text className={`font-semibold ${
                isActive ? 'text-white' : 'text-gray-600'
            }`}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <_ScreenLayout
            headerBetweenAction={<Text className="text-[13px]">Add New Resolution</Text>}
            headerAlign="left"
            showBackButton={true}
            showExitButton={false}
            customLeftAction={
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={24} color="black" />
                </TouchableOpacity>
            }
            scrollable={true}
            keyboardAvoiding={true}
            contentPadding="medium"
            loading={isPending}
            loadingMessage="Saving resolution..."
            footer={
                <TouchableOpacity
                    className="bg-primaryBlue py-3 rounded-md w-full items-center"
                    onPress={form.handleSubmit(onSubmit)}
                    disabled={isPending}
                >
                    <Text className="text-white text-base font-semibold">
                        {isPending ? "Saving..." : "Save Resolution"}
                    </Text>
                </TouchableOpacity>
            }
            stickyFooter={true}
        >
            <View className="w-full space-y-4 px-4 pt-5">
                {/* Tabs for New/Old Resolution */}
                <View className="flex-row gap-2 mb-10">
                    <TabButton
                        title="New Resolution"
                        isActive={resolutionType === 'new'}
                        onPress={() => setResolutionType('new')}
                    />
                    <TabButton
                        title="Existing Resolution"
                        isActive={resolutionType === 'old'}
                        onPress={() => setResolutionType('old')}
                    />
                </View>

                {/* Resolution Number - Only show for Old resolutions */}
                {resolutionType === 'old' && (
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

                {/* GAD Proposal Reference - Only show if GAD is selected */}
                {isGADSelected && (
                    <View className="pt-5">
                        <FormSelect
                            control={form.control}
                            name="gpr_id"
                            label="GAD Proposal Reference"
                            options={proposalOptions}
                            placeholder="Select Approved Proposals"
                        />   
                    </View>
                )}                        

                <View className="pt-5">
                    <Text className="text-[12px] font-PoppinsRegular pb-1">Resolution File</Text>
                    <DocumentPickerComponent
                        selectedDocuments={selectedDocuments}
                        setSelectedDocuments={setSelectedDocuments}
                        multiple={true} 
                        maxDocuments={1} 
                    />
                </View>

                <View className="pt-5">
                    <Text className="text-[12px] font-PoppinsRegular pb-1">Supporting Document</Text>
                    <MediaPicker
                        selectedImages={selectedImages}
                        setSelectedImages={setSelectedImages}
                        multiple={true}
                        maxImages={5}
                    />    
                </View>
            </View>
        </_ScreenLayout>
    );
}

export default ResolutionCreate;