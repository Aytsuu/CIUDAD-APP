import { z } from 'zod';

const IllegalDumpResSchema = z.object({
    rep_date: z.string().nonempty("Date and Time is required"),
    rep_contact: z.string().optional(),
    rep_violator: z.string().nonempty("Violator is required"),
    rep_add_details: z.string().optional(),
    rep_location: z.string().nonempty("Location is required"),
    rep_matter: z.string().nonempty("Report Matter is required"),
    rep_anonymous: z.boolean(),
    sitio_id: z.string().nonempty("Sitio is required"),
});

export default IllegalDumpResSchema;