import {z} from 'zod';  

    
const AnnouncementViewSchema = z.object({
  ann_title: z.string().nonempty({ message: "Title is required" }),
  ann_details: z.string().nonempty({ message: "Details are required" }),
  ann_created_at: z.string().nonempty({ message: "Created at is required" }),
  ann_start_at: z.string().nonempty({ message: "Start date is required" }),
  ann_end_at: z.string().nonempty({ message: "End date is required" }),
  ann_type: z.string().nonempty({ message: "Type is required" }),
  staff: z.string().nonempty({ message: "Staff is required" }),
  ar_type: z.string().nonempty({ message: "Recipient type is required" }),
  ar_mode: z.string().nonempty({ message: "Announcement mode is required" }),

});

export default AnnouncementViewSchema;