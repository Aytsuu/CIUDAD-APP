// import { Label } from "@/components/ui/label";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";

// // Schema
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import MarkAttendeesSchema from "@/form-schema/markAttendees";

// function Attendees() {
//     const form = useForm<z.infer<typeof MarkAttendeesSchema>>({
//         resolver: zodResolver(MarkAttendeesSchema),
//         defaultValues: {
//             attendees: [], // Default state is an empty array
//         },
//     });

//     function onSubmit(values: z.infer<typeof MarkAttendeesSchema>) {
//         console.log(values); // This will log the selected attendees
//     }

//     // Attendees list
//     let attendees = [
//         "Hon. Katty Sheen", "Hon. Lewdie Pie Kewpie",
//         "Hon. Sem Luiz Warain", "Hon. Helow World Lorem Ipsum",
//         "Hon. Las Palabras Sheen", "Hon. Denise Troy Bower",
//         "Hon. Lorem Eschu Sheen", "Hon. Jar Hertz Layne",
//         "Hon. Hinge Ipsum Sheen", "Hon. Former Bayne Lanie",
//         "Hon. How Are You", "Hon. Castor Troy Bower",        
//     ];

//     // Handle "Select All" checkbox
//     const handleSelectAll = (checked: boolean) => {
//         if (checked) {
//             form.setValue("attendees", attendees); // Select all attendees
//         } else {
//             form.setValue("attendees", []); // Deselect all attendees
//         }
//     };

//     // Check if all attendees are selected
//     const selectedAttendees = form.watch("attendees") ?? [];
//     const isAllSelected = selectedAttendees.length === attendees.length;



//     return (
//         <div className="w-full h-screen flex flex-col">
//             {/* Form */}
//             <div className="p-4 flex-grow">
//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

//                         <div className="flex items-center space-x-3 border border-gray-opacity p-1.5 rounded-sm">
//                             <Checkbox
//                                 id="select-all"
//                                 className="h-5 w-5"
//                                 checked={isAllSelected}
//                                 onCheckedChange={(checked) => handleSelectAll(!!checked)}
//                             />
//                             <Label htmlFor="select-all" className="cursor-pointer">
//                                 Select All
//                             </Label>
//                         </div>
                                                
//                         <div className="grid grid-cols-2 gap-4 pt-3">
//                             {attendees.map((attendee, index) => (
//                                 <FormField
//                                     key={index}
//                                     control={form.control}
//                                     name="attendees"
//                                     render={({ field }) => {
//                                         const selectedAttendees = field.value ?? [];
//                                         return (
//                                             <FormItem className="flex flex-row items-start space-x-3 space-y-0.5 border border-gray-opacity p-1.5 rounded-sm">
//                                                 <FormControl>
//                                                     <Checkbox
//                                                         id={`attendee-${index}`}
//                                                         className="h-5 w-5"
//                                                         checked={selectedAttendees.includes(attendee)}
//                                                         onCheckedChange={(checked) => {
//                                                             field.onChange(
//                                                                 checked
//                                                                     ? [...selectedAttendees, attendee]
//                                                                     : selectedAttendees.filter((name: string) => name !== attendee)
//                                                             );
//                                                         }}
//                                                     />
//                                                 </FormControl>
//                                                 <FormLabel
//                                                     htmlFor={`attendee-${index}`}
//                                                     className="cursor-pointer whitespace-normal break-words flex-1"
//                                                     style={{ wordBreak: "break-all" }} // Ensures long words break
//                                                 >
//                                                     {attendee}
//                                                 </FormLabel>
//                                             </FormItem>
//                                         );
//                                     }}
//                                 />
//                             ))}
//                         </div>

//                         {/* Save Button */}
//                         <div className="flex justify-end pt-10">
//                             <Button type="submit" className="w-20">Save</Button>
//                         </div>
//                     </form>
//                 </Form>
//             </div>
//         </div>
//     );
// }

// export default Attendees;



import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

// Schema
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import MarkAttendeesSchema from "@/form-schema/markAttendees";

function Attendees() {
    const form = useForm<z.infer<typeof MarkAttendeesSchema>>({
        resolver: zodResolver(MarkAttendeesSchema),
        defaultValues: {
            attendees: [], // Default state is an empty array
        },
    });

    function onSubmit(values: z.infer<typeof MarkAttendeesSchema>) {
        console.log(values); // This will log the selected attendees
    }

    // Attendees list
    const attendees = [
        "Hon. Katty Sheen", "Hon. Lewdie Pie Kewpie",
        "Hon. Sem Luiz Warain", "Hon. Helow World Lorem Ipsum",
        "Hon. Las Palabras Sheen", "Hon. Denise Troy Bower",
        "Hon. Lorem Eschu Sheen", "Hon. Jar Hertz Layne",
        "Hon. Hinge Ipsum Sheen", "Hon. Former Bayne Lanie",
        "Hon. How Are You", "Hon. Castor Troy Bower",        
    ];

    // Handle "Select All" checkbox
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            form.setValue("attendees", attendees); // Select all attendees
        } else {
            form.setValue("attendees", []); // Deselect all attendees
        }
    };

    // Check if all attendees are selected
    const selectedAttendees = form.watch("attendees") ?? [];
    const isAllSelected = selectedAttendees.length === attendees.length;

    return (
        <div className="w-full h-auto flex flex-col">
            {/* Form */}
            <div className="p-4 flex-grow">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Select All Checkbox */}
                        <div className="flex items-center space-x-3 border border-gray-opacity p-1.5 rounded-sm">
                            <Checkbox
                                id="select-all"
                                className="h-5 w-5"
                                checked={isAllSelected}
                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                            />
                            <Label htmlFor="select-all" className="cursor-pointer">
                                Select All
                            </Label>
                        </div>

                        {/* Attendees List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                            {attendees.map((attendee, index) => (
                                <FormField
                                    key={index}
                                    control={form.control}
                                    name="attendees"
                                    render={({ field }) => {
                                        const selectedAttendees = field.value ?? [];
                                        return (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0.5 border border-gray-opacity p-1.5 rounded-sm">
                                                <FormControl>
                                                    <Checkbox
                                                        id={`attendee-${index}`}
                                                        className="h-5 w-5"
                                                        checked={selectedAttendees.includes(attendee)}
                                                        onCheckedChange={(checked) => {
                                                            field.onChange(
                                                                checked
                                                                    ? [...selectedAttendees, attendee]
                                                                    : selectedAttendees.filter((name: string) => name !== attendee)
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel
                                                    htmlFor={`attendee-${index}`}
                                                    className="cursor-pointer whitespace-normal break-words flex-1"
                                                    style={{ wordBreak: "break-all" }} // Ensures long words break
                                                >
                                                    {attendee}
                                                </FormLabel>
                                            </FormItem>
                                        );
                                    }}
                                />
                            ))}
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-10">
                            <Button type="submit" className="w-full sm:w-20">Save</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default Attendees;