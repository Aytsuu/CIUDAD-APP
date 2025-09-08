import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button/button';
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form/form';
import WasteEventSchedSchema from '@/form-schema/waste-event-form-schema';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, MapPin, Users, User, FileText, Bell } from 'lucide-react';
import { createWasteEvent } from './queries/wasteEventQueries';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

const announcementOptions = [
    { id: "all", label: "All", checked: false },
    { id: "allbrgystaff", label: "All Barangay Staff", checked: false },
    { id: "residents", label: "Residents", checked: false },
    { id: "wmstaff", label: "Waste Management Staff", checked: false },
    { id: "drivers", label: "Drivers", checked: false },
    { id: "collectors", label: "Collectors", checked: false },
    { id: "watchmen", label: "Watchmen", checked: false },
];

function WasteEventSched() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    
    const form = useForm<z.infer<typeof WasteEventSchedSchema>>({
        resolver: zodResolver(WasteEventSchedSchema),
        defaultValues: {
            eventName: '',
            location: '',
            date: '',
            time: '',
            organizer: '',
            invitees: '',
            eventDescription: '',
            selectedAnnouncements: [],
            eventSubject: '',
        },
    });

    // const handleResetAnnouncements = () => {
    //     form.setValue('selectedAnnouncements', []);
    // };

    const onSubmit = async (values: z.infer<typeof WasteEventSchedSchema>) => {
        try {
            // Get staff_id from current user using the correct pattern
            const staffId = user?.staff?.staff_id;
            
            if (!staffId) {
                toast.error("Staff information not available. Please log in again.");
                return;
            }

            // Format date and time properly for Django
            const formattedDate = values.date ? new Date(values.date).toISOString().split('T')[0] : null;
            const formattedTime = values.time || null;

            const eventData = {
                we_name: values.eventName,
                we_location: values.location,
                we_date: formattedDate,
                we_time: formattedTime,
                we_description: values.eventDescription || '',
                we_organizer: values.organizer,
                we_invitees: values.invitees,
                we_is_archive: false,
                staff: staffId  // Use the current user's staff_id
            };

            await createWasteEvent(eventData);
            
            // Invalidate and refetch calendar data
            queryClient.invalidateQueries({ queryKey: ['wasteEvents'] });
            
            toast.success("Event has been scheduled successfully!");

            // Reset form
            form.reset();
        } catch (error) {
            console.error('Error creating waste event:', error);
            toast.error("Failed to schedule event. Please try again.");
        }
    };

    const selectedAnnouncements = form.watch('selectedAnnouncements') || [];

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-darkBlue2">Schedule Event</h1>
                <p className="text-gray-600">Create and manage waste management events</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            {/* Event Name */}
                            <FormField
                                control={form.control}
                                name="eventName"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                            <Label className="font-medium">Event Name</Label>
                                        </div>
                                        <FormControl>
                                            <Input placeholder="Enter event name" {...field} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Location */}
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <Label className="font-medium">Location</Label>
                                        </div>
                                        <FormControl>
                                            <Input placeholder="Enter location/venue" {...field} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Date and Time */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center gap-2 mb-2">
                                                <CalendarDays className="w-4 h-4 text-gray-500" />
                                                <Label className="font-medium">Date</Label>
                                            </div>
                                            <FormControl>
                                                <input 
                                                    type="date" 
                                                    {...field} 
                                                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="time"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <Label className="font-medium">Time</Label>
                                            </div>
                                            <FormControl>
                                                <input 
                                                    type="time" 
                                                    {...field} 
                                                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Organizer and Invitees */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <FormField
                                    control={form.control}
                                    name="organizer"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <Label className="font-medium">Organizer</Label>
                                            </div>
                                            <FormControl>
                                                <Input placeholder="Enter organizer name" {...field} className="w-full" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="invitees"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-4 h-4 text-gray-500" />
                                                <Label className="font-medium">Invitees</Label>
                                            </div>
                                            <FormControl>
                                                <Input placeholder="Enter invitees" {...field} className="w-full" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Event Description */}
                            <FormField
                                control={form.control}
                                name="eventDescription"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                            <Label className="font-medium">Event Description</Label>
                                        </div>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Enter event description" 
                                                {...field} 
                                                className="w-full min-h-[100px]" 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Announcement Section */}
                            <FormField
                                control={form.control}
                                name="selectedAnnouncements"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Bell className="w-4 h-4 text-gray-500" />
                                            <Label className="font-medium">Announcement Settings</Label>
                                        </div>
                                        <Card className="border border-gray-200">
                                            <CardContent className="p-4">
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Select audience for mobile app announcement:
                                                </p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {announcementOptions.map((option) => (
                                                        <div key={option.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                                            <Checkbox
                                                                id={option.id}
                                                                checked={field.value?.includes(option.id) || false}
                                                                onCheckedChange={(checked) => {
                                                                    const newSelected = checked
                                                                        ? [...(field.value || []), option.id]
                                                                        : (field.value || []).filter((id) => id !== option.id);
                                                                    field.onChange(newSelected);
                                                                }}
                                                            />
                                                            <Label htmlFor={option.id} className="text-sm">{option.label}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {selectedAnnouncements.length > 0 && (
                                <FormField
                                    control={form.control}
                                    name="eventSubject"
                                    render={({ field }) => (
                                        <FormItem className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-4 h-4 text-gray-500" />
                                                <Label className="font-medium">Event Subject</Label>
                                            </div>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Enter event subject for announcement" 
                                                    {...field} 
                                                    className="w-full" 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 mt-6">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => form.reset()}
                                    className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-white border-yellow-400 hover:border-yellow-500"
                                >
                                    Reset
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                                >
                                    Schedule Event
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}

export default WasteEventSched;