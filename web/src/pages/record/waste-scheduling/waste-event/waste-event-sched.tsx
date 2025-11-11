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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog/dialog';
import { Plus } from 'lucide-react';
import { createWasteEvent, useGetStaffList, WasteEvent } from './queries/wasteEventQueries';
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { FormSelect } from '@/components/ui/form/form-select';
import { useSitioList } from '@/pages/record/profiling/queries/profilingFetchQueries';
import { useState, useMemo } from 'react';
import { useGetWasteEvents } from "./queries/wasteEventQueries";

const announcementOptions = [
    { id: "all", label: "All", checked: false },
    { id: "allbrgystaff", label: "All Barangay Staff", checked: false },
    { id: "residents", label: "Residents", checked: false },
    { id: "wmstaff", label: "Waste Committee", checked: false },
    { id: "drivers", label: "Driver Loader", checked: false },
    { id: "collectors", label: "Loaders", checked: false },
];

const wasteEventColumns = [
  { accessorKey: "we_name", header: "Event Name" },
  { accessorKey: "we_location", header: "Location" },
  { accessorKey: "we_date", header: "Date" },
  { accessorKey: "we_time", header: "Time" },
  { accessorKey: "we_description", header: "Event Description" },
  { accessorKey: "we_organizer", header: "Organizer" },
];

const filterWasteEvents = (wasteEventData: any[]) => {
  if (!Array.isArray(wasteEventData)) {
    return [];
  }
  return wasteEventData.filter((event: any) => 
    !event.we_is_archive && event.we_date && event.we_time
  );
};

// Helper function to safely extract array from API response
const safeExtractArray = (data: any): any[] => {
  return Array.isArray(data) ? data : data?.results || [];
};

// Custom hook to get Waste Events calendar source
export const useWasteCalendarSource = (enabled: boolean = true) => {
  // Fetch waste events (non-archived for calendar)
  const { data: wasteEventData = [] } = useGetWasteEvents(false);

  // Filter and transform waste events
  const filteredWasteEvents = useMemo(() => {
    if (!enabled) return [];
    const events = safeExtractArray(wasteEventData);
    return filterWasteEvents(events);
  }, [wasteEventData, enabled]);

  return useMemo(() => {
    if (!enabled || filteredWasteEvents.length === 0) return null;
    
    return {
      name: "Waste Events",
      data: filteredWasteEvents,
      columns: wasteEventColumns,
      titleAccessor: "we_name",
      dateAccessor: "we_date",
      timeAccessor: "we_time",
      defaultColor: "#f59e0b", // amber
    };
  }, [filteredWasteEvents, enabled]);
};

// Export legend item for Waste
export const wasteLegendItem = { label: "Waste Events", color: "#f59e0b" };

function WasteEventSched() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { data: sitioList = [], isLoading: isSitioLoading } = useSitioList();
    const sitioOptions = (sitioList || []).map((s: any) => ({ id: s.sitio_id, name: s.sitio_name }));
    const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();
    const staffOptions = (staffList || []).map((s: any) => ({ id: s.staff_id, name: s.full_name }));
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<z.infer<typeof WasteEventSchedSchema>>({
        resolver: zodResolver(WasteEventSchedSchema),
        defaultValues: {
            eventName: '',
            location: '',
            date: '',
            time: '',
            organizer: '',
            eventDescription: '',
            selectedAnnouncements: [],
            eventSubject: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof WasteEventSchedSchema>) => {
        setIsSubmitting(true);
        try {
            const staffId = user?.staff?.staff_id;
            
            if (!staffId) {
                showErrorToast("Staff information not available. Please log in again.");
                setIsSubmitting(false);
                return;
            }

            const formattedDate = values.date ? new Date(values.date).toISOString().split('T')[0] : null;
            const formattedTime = values.time || null;

            const selectedSitio = sitioOptions.find((o: { id: string; name: string }) => String(o.id) === String(values.location));
            const sitioName = selectedSitio?.name || '';

            const selectedStaff = staffOptions.find((o: { id: string; name: string }) => String(o.id) === String(values.organizer));
            const organizerName = selectedStaff?.name || '';

            const eventData: Omit<WasteEvent, 'we_num'> & { selectedAnnouncements?: string[]; eventSubject?: string } = {
                we_name: values.eventName,
                we_location: sitioName,
                we_date: formattedDate,
                we_time: formattedTime,
                we_description: values.eventDescription || '',
                we_organizer: organizerName,
                we_invitees: null, // Removed invitees field
                we_is_archive: false,
                staff: staffId,
                // Include announcement data
                selectedAnnouncements: values.selectedAnnouncements || [],
                eventSubject: values.eventSubject || ''
            };

            const response = await createWasteEvent(eventData);
            
            queryClient.invalidateQueries({ queryKey: ['wasteEvents'] });
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            
            // Show appropriate success message
            if (response?.announcement_created) {
                showSuccessToast("Event scheduled and announcement sent successfully!");
            } else {
                showSuccessToast("Event has been scheduled successfully!");
            }

            form.reset();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error creating waste event:', error);
            showErrorToast("Failed to schedule event. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedAnnouncements = form.watch('selectedAnnouncements') || [];

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Event
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-darkBlue2">Schedule Event</DialogTitle>
                    <p className="text-gray-600">Create and manage waste management events</p>
                </DialogHeader>
                
                <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
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
                                        <Label className="font-medium">Event Name</Label>
                                        <FormControl>
                                            <Input placeholder="Enter event name" {...field} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Location (Sitio) */}
                            <FormField
                                control={form.control}
                                name="location"
                                render={() => (
                                    <FormItem className="mb-4">
                                        <Label className="font-medium">Sitio</Label>
                                        <FormControl>
                                            <FormSelect
                                                control={form.control}
                                                name="location"
                                                options={sitioOptions}
                                                isLoading={isSitioLoading}
                                            />
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
                                            <Label className="font-medium">Date</Label>
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
                                            <Label className="font-medium">Time</Label>
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

                            {/* Organizer */}
                            <FormField
                                control={form.control}
                                name="organizer"
                                render={() => (
                                    <FormItem className="mb-4">
                                        <Label className="font-medium">Organizer</Label>
                                        <FormControl>
                                            <FormSelect
                                                control={form.control}
                                                name="organizer"
                                                options={staffOptions}
                                                isLoading={isStaffLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Event Description */}
                            <FormField
                                control={form.control}
                                name="eventDescription"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <Label className="font-medium">Event Description</Label>
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
                                        <Label className="font-medium">Announcement Settings</Label>
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
                                                                    const currentValue = field.value || [];
                                                                    
                                                                    if (option.id === "all") {
                                                                        // If "All" is checked, only select "All"
                                                                        field.onChange(checked ? ["all"] : []);
                                                                    } else {
                                                                        // If another option is checked, remove "All" if it exists
                                                                        let newSelected;
                                                                        if (checked) {
                                                                            newSelected = [...currentValue.filter(id => id !== "all"), option.id];
                                                                        } else {
                                                                            newSelected = currentValue.filter((id) => id !== option.id);
                                                                        }
                                                                        field.onChange(newSelected);
                                                                    }
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
                                            <Label className="font-medium">Event Subject</Label>
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
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Schedule event... Creating..." : "Schedule Event"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default WasteEventSched;