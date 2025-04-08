// Import necessary libraries and components
import { z } from 'zod'; // Schema validation library
import { zodResolver } from '@hookform/resolvers/zod'; // Resolver for integrating Zod with React Hook Form
import { Input } from '@/components/ui/input'; // Input component
import { Textarea } from '@/components/ui/textarea'; // Textarea component
import { Button } from '@/components/ui/button/button'; // Button component
import { useForm } from 'react-hook-form'; // Hook for managing forms
import ARSchema from '@/form-schema/acknowledgement-report-schema'; // Zod schema for form validation
import { SelectLayout } from '@/components/ui/select/select-layout'; // Custom select dropdown component

// Import Form components from shadcn/ui
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form/form';

// Main component for the DRR AR Form
export default function AcknowledgementForm() {

    // Initialize the form using react-hook-form and Zod for validation
    const form = useForm<z.infer<typeof ARSchema>>({
        resolver: zodResolver(ARSchema), // Integrate Zod validation
        defaultValues: {
            name: '', // Default value for the name field
            dateStarted: '', // Default value for the date started field
            timeStarted: '', // Default value for the time started field
            dateCompleted: '', // Default value for the date completed field
            timeCompleted: '', // Default value for the time completed field
            sitio: '', // Default value for the sitio field
            location: '', // Default value for the location field
            img: undefined, // Default value for the image upload field
        },
    });

    // Function to handle form submission
    const onSubmit = (values: z.infer<typeof ARSchema>) => {
        console.log(values); // Log the form values to the console
    };

    return (
        // Main container for the form
        <div className="w-screen h-screen bg-snow flex justify-center items-center">
            {/* Form wrapper from shadcn/ui */}
            <Form {...form}>
                {/* Form element with onSubmit handler */}
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className='w-1/2 h-2/3 bg-white border border-gray flex flex-col rounded-[5px] p-5 gap-5'>
                    
                    {/* First row: Name, Location, and Sitio fields */}
                    <div className='w-full flex gap-4'>
                        {/* Name of Incident/Activity field */}
                        <FormField
                            control={form.control}
                            name={'name'}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                    <FormLabel>Name of Incident/Activity</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage /> {/* Display validation errors */}
                                </FormItem>
                            )}
                        />

                        {/* Location field */}
                        <FormField
                            control={form.control}
                            name={'location'}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage /> {/* Display validation errors */}
                                </FormItem>
                            )}
                        />

                        {/* Sitio dropdown field */}
                        <FormField
                            control={form.control}
                            name={'sitio'}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sitio</FormLabel>
                                    <FormControl>
                                        <SelectLayout
                                            placeholder='Select a Sitio'
                                            options={[{ id: '1', name: 'bahog tae' }]} // Sample options
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage /> {/* Display validation errors */}
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Second row: Date and Time fields */}
                    <div className='w-full flex gap-3'>
                        {/* Date Started field */}
                        <FormField
                            control={form.control}
                            name={'dateStarted'}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                    <FormLabel>Date Started</FormLabel>
                                    <FormControl>
                                        <Input type='date' {...field} />
                                    </FormControl>
                                    <FormMessage /> {/* Display validation errors */}
                                </FormItem>
                            )}
                        />

                        {/* Time Started field */}
                        <FormField
                            control={form.control}
                            name={'timeStarted'}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                    <FormLabel>Time Started</FormLabel>
                                    <FormControl>
                                        <Input type='time' {...field} />
                                    </FormControl>
                                    <FormMessage /> {/* Display validation errors */}
                                </FormItem>
                            )}
                        />

                        {/* Date Completed field */}
                        <FormField
                            control={form.control}
                            name={'dateCompleted'}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                    <FormLabel>Date Completed</FormLabel>
                                    <FormControl>
                                        <Input type='date' {...field} />
                                    </FormControl>
                                    <FormMessage /> {/* Display validation errors */}
                                </FormItem>
                            )}
                        />

                        {/* Time Completed field */}
                        <FormField
                            control={form.control}
                            name={'timeCompleted'}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                    <FormLabel>Time Completed</FormLabel>
                                    <FormControl>
                                        <Input type='time' {...field} />
                                    </FormControl>
                                    <FormMessage /> {/* Display validation errors */}
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Actions Taken textarea field */}
                    <FormField
                        control={form.control}
                        name={'action'}
                        render={({ field }) => (
                            <FormItem className='flex-grow'>
                                <FormLabel>Actions Taken</FormLabel>
                                <FormControl>
                                    <Textarea className='h-[10rem]' {...field} />
                                </FormControl>
                                <FormMessage /> {/* Display validation errors */}
                            </FormItem>
                        )}
                    />

                    {/* Image upload field */}
                    <div className='w-full h-full flex'>
                        <FormField
                            control={form.control}
                            name={'img'}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Upload an Image</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='file'
                                            onChange={(e) => {
                                                const file = e.target.files ? e.target.files[0] : undefined;
                                                field.onChange(file); // Handle file upload
                                            }}
                                            ref={field.ref}
                                        />
                                    </FormControl>
                                    <FormMessage /> {/* Display validation errors */}
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Submit button */}
                    <div className='flex justify-end'>
                        <Button type='submit'>
                            Create
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}