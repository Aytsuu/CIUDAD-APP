import { z } from "zod";

export const BusinessFormSchema = z.object({
  bus_name: z.string().min(1, 'Business Name is required'),
  bus_gross_sales: z.string().min(1, 'Gross Sales is required'),
  bus_location: z.string().min(1, 'Business Address is required'),
}); 