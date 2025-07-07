import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import SummonSchema from "@/form-schema/summon-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useForm } from "react-hook-form";
import { useGetServiceChargeTemplates } from "./queries/summonFetchQueries";
import { Skeleton } from "@/components/ui/skeleton";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import SummonPreview from "./summon-preview";

function CreateNewSummon({ sr_id, onSuccess }: {
    sr_id: number, 
    onSuccess: () => void
}) {
    const [openPreview, setOpenPreview] = useState(false);
    const { data: templates = [], isLoading } = useGetServiceChargeTemplates();

    const reasons = [
        { id: "First Hearing", name: "First Hearing" },
        { id: "Unresolved", name: "Unresolved" },
        { id: "Complainant is Absent/Unavailable", name: "Complainant is Absent/Unavailable" },
        { id: "Accused is Absent/Unavailable", name: "Accused is Absent/Unavailable" },
    ];

    const templateOptions = templates.map(template => ({
        id: String(template.temp_id),  
        name: template.temp_title
    }));
    
    const form = useForm<z.infer<typeof SummonSchema>>({
        resolver: zodResolver(SummonSchema),
        defaultValues: {
            reason: "",
            hearingDate: "",
            hearingTime: "",
            sr_id: String(sr_id),
            template: ""
        },
    });

    const selectedTemplateId = form.watch("template");
    const selectedTemplate = templates.find(t => t.temp_id === Number(selectedTemplateId));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = await form.trigger();
        
        if (isValid && selectedTemplate) {
            setOpenPreview(true);
        }
    };

    const handleConfirmSave = () => {
        setOpenPreview(false);
        const values = form.getValues();
        console.log('Form Values', values);
        // createSummon(values); // Uncomment when ready
        if (onSuccess) onSuccess();
    };

    const onError = (errors: any) => {
        console.log('Form errors:', errors);
    };

    if (isLoading) {
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
        <div>
            <Form {...form}>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <FormSelect
                            control={form.control}
                            name="reason"
                            label="Reason"
                            options={reasons}
                        />

                        <FormDateTimeInput
                            control={form.control}
                            name="hearingDate"
                            label="Hearing Date"
                            type="date"
                        />

                        <FormDateTimeInput
                            control={form.control}
                            name="hearingTime"
                            label="Hearing Time"
                            type="time"
                        />

                        <FormSelect
                            control={form.control}
                            name="template"
                            label="Template"
                            options={templateOptions}
                        />
                    </div>

                    <div className="flex justify-end mt-6 gap-2">
                        <DialogLayout
                            isOpen={openPreview}
                            onOpenChange={setOpenPreview}
                            title="Summon Preview"
                            trigger={
                                <Button type="submit">Save</Button>
                            }
                            mainContent={
                                selectedTemplate ? (
                                    <div className="flex flex-col gap-4">
                                        <SummonPreview
                                            headerImage={selectedTemplate.temp_header}
                                            belowHeaderContent={selectedTemplate.temp_below_headerContent}
                                            title={selectedTemplate.temp_title}
                                            subtitle={selectedTemplate.temp_subtitle}
                                            body={selectedTemplate.temp_body}
                                            withSeal={selectedTemplate.temp_w_seal}
                                            withSignature={selectedTemplate.temp_w_sign}
                                            withSummon={selectedTemplate.temp_w_summon}
                                            paperSize={selectedTemplate.temp_paperSize}
                                            margin={selectedTemplate.temp_margin}
                                            summonData={form.getValues()}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                variant="outline" 
                                                onClick={() => setOpenPreview(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button 
                                                onClick={handleConfirmSave}
                                            >
                                                Confirm Save
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 text-center">
                                        No template selected for preview
                                    </div>
                                )
                            }
                        />
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default CreateNewSummon;