
import { useState } from 'react';

import { SelectLayout } from "@/components/ui/select/select-layout";
import {Textarea} from '../../../../components/ui/textarea.tsx';
import {Button} from '../../../../components/ui/button/button.tsx';
import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form/form.tsx";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { ChevronLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { Link, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ordinanceUploadFormSchema, amendOrdinanceUploadSchema, repealOrdinanceUploadSchema } from '@/form-schema/council/ordinanceUploadSchema';
import { createOrdinance, transformFormDataToBackend } from './restful-api/OrdinancePostApi';
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { useAuth } from '@/context/AuthContext';

type OrdinanceOption = 'new' | 'amend' | 'repeal' | null;

function AddOrdinancePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [selectedOption, setSelectedOption] = useState<OrdinanceOption>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const form = useForm<z.infer<typeof ordinanceUploadFormSchema>>({
        mode: 'onSubmit', // Only validate on submit
        reValidateMode: 'onSubmit', // Only re-validate on submit
        criteriaMode: 'all', // Show all validation errors
        shouldFocusError: false, // Don't focus on first error
        defaultValues: {
            ordTitle: "",       
            ordTag: "",
            ordDesc: "", 
            ordDate: "",
            ordDetails: "",
            ordAreaOfFocus: [],
            ordRepealed: false,
            ordinanceFile: "",
        },
    });

    const ordAreaOfFocus = [
        "Council", "GAD", 
        "Waste Committee", "Finance"
    ];

    // Get the appropriate schema based on selected option
    const getSchemaForOption = (option: OrdinanceOption) => {
        if (option === 'amend') {
            return amendOrdinanceUploadSchema;
        } else if (option === 'repeal') {
            return repealOrdinanceUploadSchema;
        }
        // Default: new ordinance
        return ordinanceUploadFormSchema;
    };


    async function onSubmit(values: z.infer<typeof ordinanceUploadFormSchema>) {
        try {
            setIsSubmitting(true);
            setHasAttemptedSubmit(true); // Mark that user has attempted to submit
            
            // Manual validation using the appropriate schema
            const schema = getSchemaForOption(selectedOption);
            const validationResult = schema.safeParse(values);
            if (!validationResult.success) {
                // Set form errors manually
                const errors = validationResult.error.flatten().fieldErrors;
                Object.entries(errors).forEach(([field, messages]) => {
                    form.setError(field as any, {
                        type: 'manual',
                        message: messages?.[0] || 'Invalid value'
                    });
                });
                return;
            }
            
            // Get staff ID from auth context
            const staffId = user?.staff?.staff_id;
            console.log('🔍 Frontend - staffId from user:', staffId);
            console.log('🔍 Frontend - staffId type:', typeof staffId);
            console.log('🔍 Frontend - user object:', user);
            
            if (!staffId) {
                showErrorToast("Staff information not available. Please log in again.");
                return;
            }
            
            // Transform frontend form data to backend format using the separated function
            const backendData = transformFormDataToBackend(values, staffId);
            
            console.log("Frontend form data:", values);
            console.log("Backend API data:", backendData);
            
            const response = await createOrdinance(backendData);
            console.log("Ordinance created successfully:", response);
            
            showSuccessToast("Ordinance created successfully!");
            navigate('/ord-page');
            
        } catch (error) {
            console.error("Error creating ordinance:", error);
            showErrorToast("Failed to create ordinance. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex p-5 w-full mx-auto h-full justify-center">
            <div className="space-y-4">
                <div className="text-[#394360] pb-2">
                    <Link to="/ord-page">
                        <Button 
                            className="text-black p-2 self-start"
                            variant={"outline"}
                        >
                            <ChevronLeft />
                        </Button>                        
                    </Link>
                </div>

                    {/* Ordinance Type Selection */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Choose Ordinance Type</h3>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setSelectedOption('new')}
                                className={`px-4 py-2 rounded-md font-medium ${
                                    selectedOption === 'new' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                New Ordinance
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedOption('amend')}
                                className={`px-4 py-2 rounded-md font-medium ${
                                    selectedOption === 'amend' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Amend Existing
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedOption('repeal')}
                                className={`px-4 py-2 rounded-md font-medium ${
                                    selectedOption === 'repeal' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Repeal Ordinance
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end p-[40px]">
                        {/* Dialog with Form Inside */}
                        <DialogLayout
                            trigger={
                                <div 
                                    className={`px-6 py-2 rounded-md cursor-pointer flex items-center text-sm font-medium ${
                                        selectedOption 
                                            ? 'bg-primary hover:bg-primary/90 text-white' 
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    onClick={() => selectedOption && setOpenDialog(true)}
                                >
                                    Next
                                </div>
                            }
                            isOpen={openDialog}
                            onOpenChange={setOpenDialog}
                            className="max-w-[30%] h-[460px] flex flex-col overflow-auto scrollbar-custom"
                            title={`Ordinance Details - ${selectedOption?.toUpperCase() || 'NEW'}`}
                            description={`Add ordinance metadata for ${selectedOption || 'new'} ordinance.`}
                            mainContent={
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    {/* Ordinance Title Field */}
                                    <FormField
                                        control={form.control}
                                        name="ordTitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ordinance Title</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        className="w-full p-2 shadow-sm h-20 mt-[12px] rounded-[5px] resize-none"
                                                        placeholder="Enter Ordinance Title"
                                                        {...field}>
                                                    </Textarea>                                                            
                                                </FormControl>
                                                {hasAttemptedSubmit && <FormMessage />}
                                            </FormItem>
                                        )}
                                    />

                                    {/* Conditionally show Amend field only for 'amend' option */}
                                    {selectedOption === 'amend' && (
                                        <FormField
                                            control={form.control}
                                            name="ordTag"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Amend</FormLabel>
                                                    <FormControl>
                                                        <SelectLayout
                                                            className="w-full"
                                                            label="Ordinances"
                                                            placeholder="Select Amended Ordinance"
                                                            options={[
                                                                {id: "001-1", name: "001-1"},
                                                                {id: "002-2", name: "002-2"}                                                   
                                                            ]}
                                                            value={field.value || ""}
                                                            onChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    {hasAttemptedSubmit && <FormMessage />}
                                                </FormItem>
                                            )}
                                        />
                                    )}            

                                    <FormField
                                        control={form.control}
                                        name="ordDesc"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ordinance Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        className="w-full p-2 shadow-sm h-20 mt-[12px] rounded-[5px] resize-none"
                                                        placeholder="Description"
                                                        {...field}>
                                                    </Textarea>                                                            
                                                </FormControl>
                                                {hasAttemptedSubmit && <FormMessage />}
                                            </FormItem>
                                        )}
                                    />

                                    {/* Ordinance Details Field */}
                                    <FormField
                                        control={form.control}
                                        name="ordDetails"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ordinance Details</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        className="w-full p-2 shadow-sm h-20 mt-[12px] rounded-[5px] resize-none"
                                                        placeholder="Enter ordinance details"
                                                        {...field}>
                                                    </Textarea>                                                            
                                                </FormControl>
                                                {form.formState.errors.ordDetails && (
                                                    <p className="text-sm font-medium text-destructive">
                                                        {form.formState.errors.ordDetails.message}
                                                    </p>
                                                )}
                                            </FormItem>
                                        )}
                                    />                                            
                                    {/* Date Approved Field */}
                                    <FormField
                                        control={form.control}
                                        name="ordDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date Approved</FormLabel>
                                                <FormControl>
                                                    <input 
                                                        type="date" 
                                                        {...field} 
                                                        className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" 
                                                    />
                                                </FormControl>
                                                {hasAttemptedSubmit && <FormMessage />}
                                            </FormItem>
                                        )}
                                    />

                                    {/* Categories Field */}
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value="category-list">
                                            <AccordionTrigger>Select Area of Focus</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2">
                                                    {ordAreaOfFocus.map((area, index) => (
                                                        <FormField
                                                            key={index}
                                                            control={form.control}
                                                            name="ordAreaOfFocus"
                                                            render={({ field }) => {
                                                                const selectedCategory = field.value ?? [];
                                                                return (
                                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0.5">
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                id={`area-${index}`}
                                                                                className="h-5 w-5"
                                                                                checked={selectedCategory.includes(area)}
                                                                                onCheckedChange={(checked) => {
                                                                                    field.onChange(
                                                                                        checked
                                                                                            ? [...selectedCategory, area]
                                                                                            : selectedCategory.filter((name: string) => name !== area)
                                                                                    );
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel
                                                                            htmlFor={`area-${index}`}
                                                                            className="cursor-pointer whitespace-normal break-words flex-1"
                                                                            style={{ wordBreak: "break-all" }}
                                                                        >
                                                                            {area}
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                );
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>                                            

                    

                                    {/* Submit Button (Inside Dialog) */}
                                    <div className="flex items-center justify-end pt-4">
                                        <Button 
                                            type="submit" 
                                            className="w-[100px]"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Creating..." : "Create"}
                                        </Button>
                                    </div>
                                </form>
                                </Form>
                            }
                        />
                    </div>
                </div>
            </div>
    );
}

export default AddOrdinancePage;