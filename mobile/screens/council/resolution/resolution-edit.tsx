import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { z } from 'zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FormInput } from '@/components/ui/form/form-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import FormComboCheckbox from '@/components/ui/form/form-combo-checkbox';
import { FormDateTimeInput } from '@/components/ui/form/form-date-or-time-input';
import DocumentPickerComponent, {DocumentItem} from '@/components/ui/document-upload';
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import PageLayout from "@/screens/_PageLayout";
import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema';
import { usingUpdateResolution } from './queries/resolution-update-queries';
import { useApprovedProposals } from './queries/resolution-fetch-queries';
import { useAuth } from '@/contexts/AuthContext';


interface ResolutionCreateFormProps {
    onSuccess?: () => void; 
}

function ResolutionEdit({ onSuccess }: ResolutionCreateFormProps) {
    const { user } = useAuth(); 
    const {
        res_num,
        res_title,
        res_date_approved,
        res_area_of_focus,
        resolution_files,
        resolution_supp,
        gpr_id,
    } = useLocalSearchParams();

    const parsedFiles = resolution_files ? JSON.parse(resolution_files as string) : [];

    const parsedSuppDocs = resolution_supp ? JSON.parse(resolution_supp as string) : [];

    const parsedAreaOfFocus = typeof res_area_of_focus === 'string' 
        ? res_area_of_focus.split(',') 
        : [];

    // Ensure gpr_id is empty string if undefined/null
    const safeGprId = gpr_id && gpr_id !== 'undefined' && gpr_id !== 'null' 
        ? String(gpr_id) 
        : '';

    const router = useRouter();
    const [selectedDocuments, setSelectedDocuments] = useState<DocumentItem[]>(
        parsedFiles.map((file: any) => ({
        id: `existing-${file.rf_id}`,
        name: file.rf_name || `file-${file.rf_id}`,
        type: 'application/pdf',
        uri: file.rf_url
        }))
    );

    const [selectedImages, setSelectedImages] = useState<MediaItem[]>(
        parsedSuppDocs.map((file: any) => ({
        id: `existing-${file.rsd_id}`,
        name: file.rsd_name || `file-${file.rsd_id}`,
        type: 'image/jpeg',
        uri: file.rsd_url
        }))
    );    

    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

    // Fetch mutation
    const { data: gadProposals = [] } = useApprovedProposals();
    
    // Update mutation
    const { mutate: updateEntry, isPending } = usingUpdateResolution(() => {
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
            res_num: String(res_num),
            res_title: String(res_title),        
            res_date_approved: String(res_date_approved),
            res_area_of_focus: parsedAreaOfFocus,
            gpr_id: safeGprId // Use the safe version
        },
    });

    // Watch the area of focus to show/hide proposal reference
    const watchAreaOfFocus = form.watch("res_area_of_focus");

    // Update local state when form values change
    useEffect(() => {
        setSelectedAreas(watchAreaOfFocus || []);
    }, [watchAreaOfFocus]);

    // Check if GAD is selected
    const isGADSelected = selectedAreas.includes("gad");

    const onSubmit = (values: z.infer<typeof resolutionFormSchema>) => {
        // Ensure gpr_id is empty string if not selected or undefined
        if (!values.gpr_id) {
            values.gpr_id = "";
        }

        const resFiles = selectedDocuments.map((docs: any) => ({
            id: docs.id,
            name: docs.name,
            type: docs.type,
            file: docs.file
        }))

        const resSuppDocs = selectedImages.map((img: any) => ({
            id: img.id,
            name: img.name,
            type: img.type,
            file: img.file
        }))
      
        updateEntry({ 
            ...values, 
            resFiles,
            resSuppDocs,
            res_num: String(res_num),
            staff_id: user?.staff?.staff_id      
        });
    };

    return (
        <PageLayout
            headerTitle={<Text className="text-[13px]">Edit Resolution</Text>}
            leftAction={
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={24} color="black" />
                </TouchableOpacity>
            }
            footer={
                <TouchableOpacity
                    className="bg-primaryBlue py-4 rounded-xl w-full items-center"
                    onPress={form.handleSubmit(onSubmit)}
                    disabled={isPending}
                >
                    <View className="flex-row justify-center items-center gap-2">
                        {isPending && (
                            <ActivityIndicator size="small" color="white" className="ml-2" />
                        )}                           
                        <Text className="text-white text-base font-semibold">
                            {isPending ? "Saving..." : "Save Resolution"}
                        </Text>                                   
                    </View>           
                </TouchableOpacity>
            }
        >
            <View className="w-full space-y-4 px-6 pt-5">

                <FormInput
                    control={form.control}
                    name="res_num"
                    label="Resolution Number"
                    placeholder="Enter Resolution Number"
                    editable={false} 
                />            

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

                <View className="pt-7">
                    <Text className="text-[12px] font-PoppinsRegular pb-1">Supporting Document</Text>
                    <MediaPicker
                        selectedImages={selectedImages}
                        setSelectedImages={setSelectedImages}
                        limit={5}
                    />  
                </View>
            </View>
        </PageLayout>
    );
}

export default ResolutionEdit;