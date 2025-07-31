import { z } from 'zod';

const DataRequirement = z.union([
    z.string()
        .default("")
        .refine((val) => val.trim() !== "", { message: "This field is required" }) 
        .transform((val) => parseFloat(val))
        .refine((val) => val > -1, { message: "Value must be a positive number" }), 
    z.number()
        .refine((val) => val > -1, { message: "Value must be a positive number" }) 
]).transform((val) => String(val));

const TruckFormSchema = z.object({
  truck_plate_num: z.string().min(1, 'Plate number is required'),
  truck_model: z.string().min(1, 'Model is required'),
  truck_capacity: DataRequirement,
  truck_status: z.enum(['Operational', 'Maintenance']),
  truck_last_maint: z.string().min(1, 'Last maintenance date is required'),
});

export default TruckFormSchema;