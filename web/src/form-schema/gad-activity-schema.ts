import { z } from "zod";

// GAD Activity Form Schema
const GADActivityFormSchema = z.object({
    activityTitle: z.string().min(1, "Activity title is required"),
    activityDate: z.string().min(1, "Activity date is required"),
    activityTime: z.string().min(1, "Activity time is required"),
    venue: z.string().min(1, "Venue is required"),
    description: z.string().min(1, "Description is required"),
    expectedParticipants: z.string().min(1, "Expected participants is required"),
});

export default GADActivityFormSchema;


