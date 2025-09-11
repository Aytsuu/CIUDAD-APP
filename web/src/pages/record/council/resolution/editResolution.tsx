import { useState, useEffect } from 'react';
import {Button} from '../../../../components/ui/button/button.tsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Form } from "@/components/ui/form/form";
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormInput } from '@/components/ui/form/form-input.tsx';
import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input.tsx';
import { MediaUpload, MediaUploadType } from '@/components/ui/media-upload';
import { ConfirmationModal } from '@/components/ui/confirmation-modal.tsx';
import { FormComboCheckbox } from '@/components/ui/form/form-combo-checkbox';
import { ComboboxInput } from '@/components/ui/form/form-combo-box-search.tsx';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema.ts';
import { usingUpdateResolution } from './queries/resolution-update-queries.tsx';
import { useApprovedProposals } from './queries/resolution-fetch-queries';
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ResolutionEditFormProps {
    res_num: string,
    res_title: string,
    res_date_approved: string,
    res_area_of_focus: string[],
    resolution_files:{
        rf_id: number;
        rf_url: string;
    }[];
    gpr_id: number;
    onSuccess?: () => void; 
}

function EditResolution({ res_num, res_title, res_date_approved, res_area_of_focus, resolution_files, gpr_id, onSuccess }: ResolutionEditFormProps) {
    
    const { user } = useAuth();
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>(() => {
        return resolution_files?.map(file => ({
            id: `existing-${file.rf_id}`,
            name: `file-${file.rf_id}`, 
            type: 'document/pdf',
            url: file.rf_url 
        })) || [];
    }); 

    const [isEditing, setIsEditing] = useState(false);
    const [_isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [_formValues, setFormValues] = useState<z.infer<typeof resolutionFormSchema>>();
    const [selectedAreas, setSelectedAreas] = useState<string[]>(res_area_of_focus || []);

    // Fetch approved GAD proposals
    const { data: gadProposals = [], isLoading: isLoadingProposals } = useApprovedProposals();

    const form = useForm<z.infer<typeof resolutionFormSchema>>({
        resolver: zodResolver(resolutionFormSchema),
        mode: 'onChange',
        defaultValues: {
            res_num: res_num,
            res_title: res_title,        
            res_date_approved: res_date_approved,
            res_area_of_focus: res_area_of_focus,
            gpr_id: String(gpr_id)
        },
    });

    // Watch the area of focus to show/hide proposal reference
    const watchAreaOfFocus = form.watch("res_area_of_focus");
    
    // Update local state when form values change
    useEffect(() => {
        setSelectedAreas(watchAreaOfFocus || []);
    }, [watchAreaOfFocus]);

    const meetingAreaOfFocus = [
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste Committee" }
    ];

    const { mutate: updateEntry, isPending } = usingUpdateResolution(onSuccess);

    // Find the selected proposal for display
    const selectedProposal = gadProposals.find(
        (item) => item.id === form.watch("gpr_id")
    );

    // Check if GAD is selected
    const isGADSelected = selectedAreas.includes("gad");

    function onSubmit(values: z.infer<typeof resolutionFormSchema>) {
        const files = mediaFiles.map((media) => ({
            'id': media.id,
            'name': media.name,
            'type': media.type,
            'file': media.file
        }))          
           
        if(!values.gpr_id){
            values.gpr_id = "";
        }

        updateEntry({ 
            ...values, 
            files,
            res_num,
            staff: user?.staff?.staff_id 
        });

        setIsEditing(false);
    }

    const handleSaveClick = (_e: React.FormEvent) => {
        setFormValues(form.getValues());
        setIsConfirmOpen(true);
    };

    const handleConfirmSave = () => {
        setIsConfirmOpen(false);
        form.handleSubmit(onSubmit)();
    };


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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Resolution Number */}
                <FormInput
                    control={form.control}
                    name="res_num"
                    label="Resolution Number"
                    placeholder="Enter Resolution Number"
                    readOnly={true} 
                />

                {/* Resolution Title */}
                <FormTextArea
                    control={form.control}
                    name="res_title"
                    label="Resolution Title"  
                    placeholder="Enter Resolution Title"
                    readOnly={!isEditing} 
                />         

                {/* Resolution Date Approved */}
                <FormDateTimeInput
                    control={form.control}
                    name="res_date_approved"
                    label="Date Approved"
                    type="date"    
                    readOnly={!isEditing}
                />

                {/* Resolution Area of Focus */}
                <FormComboCheckbox
                    control={form.control}
                    name="res_area_of_focus"
                    label="Select Area of Focus"
                    options={meetingAreaOfFocus}
                    readOnly={!isEditing}
                />

                {/* GAD Proposal Reference - Only show if GAD is selected and in edit mode */}
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
                        readOnly={!isEditing}
                    />
                )}

                {/* Resolution File Upload */}
                <MediaUpload
                    title=""
                    description="Upload/Edit resolution file"
                    mediaFiles={mediaFiles}
                    activeVideoId={activeVideoId}
                    setMediaFiles={setMediaFiles}
                    setActiveVideoId={setActiveVideoId}
                    acceptableFiles='document'
                    maxFiles={1}
                />                            

                <div className="flex justify-end pt-5 space-x-2">
                    {!isEditing ? (
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsEditing(true);
                            }}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Edit"
                            )}
                        </Button>
                    ) : (
                        <ConfirmationModal
                            trigger={
                                <Button onClick={handleSaveClick}>Save</Button>
                            }
                            title="Confirm Save"
                            description="Are you sure you want to save the changes?"
                            actionLabel="Confirm"
                            onClick={handleConfirmSave}
                        />    
                    )}
                </div>
            </form>
        </Form>
    );
}

export default EditResolution;