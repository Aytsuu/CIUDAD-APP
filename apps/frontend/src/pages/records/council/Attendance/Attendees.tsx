import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
    let attendees = [
        "Hon. Katty Sheen", "Hon. Lewdie Pie Kewpie",
        "Hon. Sem Luiz Warain", "Hon. Helow World Lorem Ipsum",
        "Hon. Warrior Hannah Sheen", "Hon. Castor Troy Bower"
    ];

    return (
        <div className="w-full h-screen flex flex-col">
            {/* Form */}
            <div className="p-4 flex-grow">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 pt-3">
                            {attendees.map((attendee, index) => (
                                <FormField
                                    key={index}
                                    control={form.control}
                                    name="attendees"
                                    render={({ field }) => {
                                        const selectedAttendees = field.value ?? [];
                                        return (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0.5">
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
                        <div className="flex justify-end pt-10 pb-10">
                            <Button type="submit" className="w-20">Save</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default Attendees;