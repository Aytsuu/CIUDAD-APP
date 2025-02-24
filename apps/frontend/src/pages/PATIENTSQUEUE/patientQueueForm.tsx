import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState } from "react";
import PatientQueueSchema from "@/form-schema/patientQueueForm";


export default function PatientQueueForm() {
    type PatientSchema = z.infer<typeof PatientQueueSchema>;

    // Form handling
    const form = useForm<PatientSchema>({
        resolver: zodResolver(PatientQueueSchema),
        defaultValues: {
            lname: "",
            fname: "",
            mname: "",
            age: "",
            sex: "",
            address: "",
            purok: "",
            service: "",
            // prioritynum: "",
            ispregnant: false,
            issenior: false,
            isregular: false,
            iswalkin: true,
            istransient: false,
        },
    });

    // State for dialog and priority number
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [priorityNumber, setPriorityNumber] = useState<string | null>(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false); // For confirmation modal

    // Checkbox fields configuration
    const checkboxFields = [
        { name: "istransient", label: "Transient" },
        { name: "ispregnant", label: "Pregnant" },
    ];

    // Text fields configuration
    const textFields = [
        { name: "lname", label: "Last Name" },
        { name: "fname", label: "First Name" },
        { name: "mname", label: "Middle Name" },
        { name: "address", label: "Address" },
        { name: "purok", label: "Purok" },
    ];

    // Form submission handler
    const onSubmit = async (data: PatientSchema) => {
        try {
            // Simulate form submission (replace with your actual API call)
            console.log("Form submitted", data);

            // Simulate priority number generation (replace with your logic)
            const generatedPriorityNumber = "12345"; // Example priority number
            setPriorityNumber(generatedPriorityNumber);

            // Show the confirmation modal
            setShowConfirmationModal(true);

            // Reset the form fields
            form.reset(); // Reset the form to default values

            // Close the form dialog
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Form submission failed", error);
        }
    };

    // Save button handler
    const handleSave = () => {
        // Trigger form submission
        form.handleSubmit(onSubmit)();
    };

    // Close confirmation modal
    const handleConfirmationClose = () => {
        setShowConfirmationModal(false);
    };

    return (
        <>
            {/* Main Form Dialog */}
            <DialogLayout
                trigger={
                    <div className="w-auto p-3 px-10 h-[35px] bg-blue text-white border flex justify-center items-center rounded-[5px] shadow-sm text-[13px] hover:bg-gray-50 cursor-pointer">
                        Add
                    </div>
                }
                className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px] h-full sm:h-auto"
                title="Patient Queue Form"
                description=""
                mainContent={
                    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Search & Add Resident */}
                                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center py-2">
                                    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-3">
                                        <Input
                                            placeholder="Search resident..."
                                            className="w-full sm:w-[300px]"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Label className="text-gray-500">or</Label>
                                            <button className="flex items-center gap-1.5 text-blue hover:text-blue-700">
                                                <UserPlus className="h-4 w-4" />
                                                <span className="underline">Add Resident</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Checkboxes */}
                                    <div className="flex gap-4">
                                        {checkboxFields.map(({ name, label }) => (
                                            <FormField
                                                key={name}
                                                control={form.control}
                                                name={name as keyof PatientSchema}
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value as boolean}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-sm font-medium">
                                                            {label}
                                                        </FormLabel>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Purpose Selection */}
                                <FormField
                                    control={form.control}
                                    name="service"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Purpose</FormLabel>
                                            <FormControl>
                                                <SelectLayout
                                                    className="w-full sm:w-[300px]"
                                                    label="Purpose"
                                                    placeholder="Select purpose"
                                                    options={[
                                                        { id: "prenatal", name: "Prenatal" },
                                                        { id: "maternal", name: "Maternal" },
                                                    ]}
                                                    value={String(field.value)}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Text Inputs */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {textFields.map(({ name, label }) => (
                                        <FormField
                                            key={name}
                                            control={form.control}
                                            name={name as keyof PatientSchema}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{label}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="text" value={String(field.value)} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}

                                    {/* Age and Sex Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="age"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Age</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="number" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="sex"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sex</FormLabel>
                                                    <FormControl>
                                                        <SelectLayout
                                                            className="w-full"
                                                            label="Sex"
                                                            placeholder="Select"
                                                            options={[
                                                                { id: "female", name: "Female" },
                                                                { id: "male", name: "Male" },
                                                            ]}
                                                            value={String(field.value)}
                                                            onChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                                    <Button type="submit" onClick={handleSave} className="w-[120px]">
                                        Save
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                }
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />

            {/* Confirmation Modal */}
            {showConfirmationModal && (
                <DialogLayout
                    trigger={<div />}
                    isOpen={showConfirmationModal}
                    onOpenChange={setShowConfirmationModal}
                    mainContent={
                        <div className="p-6 text-center">
                            <h3 className="text-lg font-semibold">Priority Number</h3>
                            <p className="mt-2 text-gray-600">Your priority number is:</p>
                            <p className="mt-4 text-2xl font-bold text-blue-600">{priorityNumber}</p>
                            <Button
                                onClick={handleConfirmationClose}
                                className="mt-6 w-[120px]"
                            >
                                Okay
                            </Button>
                        </div>
                    }
                />
            )}
        </>
    );
}