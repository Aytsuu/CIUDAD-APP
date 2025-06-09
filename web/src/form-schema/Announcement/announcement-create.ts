import {z} from 'zod';  


const AnnouncementCreateSchema = z.object({     
    // ann_id: z.string().optional(),
    ann_title: z.string().nonempty({message: 'Title is required'}),
    ann_details: z.string().nonempty({message: 'Details are required'}),
    ann_created_at: z.string().nonempty({message: 'Created at is required'}),
    ann_start_at: z.string().nonempty({message: 'Start at is required'}),
    ann_end_at: z.string().nonempty({message: 'End at is required'}),
    ann_type: z.string().nonempty({message: 'Type is required'}),
    // staff: z.string().nonempty({message: 'Staff is required'}),
});

export default AnnouncementCreateSchema;

