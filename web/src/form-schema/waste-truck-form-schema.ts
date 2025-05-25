import { z } from "zod";

const TruckFormSchema = z.object({
  truck_plate_num: z.string().min(1, "Plate number is required"),
  truck_model: z.string().min(1, "Model is required"),
  truck_capacity: z.string().min(1, "Capacity is required"),
  truck_status: z.enum(["Operational", "Maintenance"]),
  truck_last_maint: z.string().min(1, "Last maintenance date is required"),
});

export default TruckFormSchema;