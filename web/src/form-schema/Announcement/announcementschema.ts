import {z} from 'zod';  

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

const AnnouncementSchema = z.object({
  ann_title: z.string().nonempty({ message: "Title is required" }),
  ann_details: z.string().nonempty({ message: "Details are required" }),
  ann_start_at: z.string().regex(datetimeLocalRegex, { message: "Invalid datetime format" }),
  ann_end_at: z.string().regex(datetimeLocalRegex, { message: "Invalid datetime format" }),
  ann_type: z.string().nonempty({ message: "Type is required" }),
  ar_type: z.array(z.string()).nonempty({ message: "Recipient type is required" }),
  ar_mode: z.array(z.string()).nonempty({ message: "Announcement mode is required" }), 
});

export default AnnouncementSchema;

