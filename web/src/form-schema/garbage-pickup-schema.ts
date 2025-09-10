import z from 'zod'

export const RejectPickupRequestSchema = z.object({
  reason: z.string().min(1, { message: "Reason is required." }),
  garb_id: z.string().default(''),
  staff_id: z.string().default('')
});

export const AcceptPickupRequestSchema = z.object({
    driver: z.string().min(1, { message: "Driver is required." }),
    collectors: z.array(z.string())
      .nonempty({ message: "At least one collector must be selected." })
      .min(1, { message: "At least one collector must be selected." }),
    truck: z.string().min(1, { message: "Truck is required." }),
    date: z.string().min(1, { message: "Date is required." }),
    time: z.string().min(1, { message: "Time is required." }),
    garb_id: z.string().default(''),
    staff_id: z.string().default('')
})

export const EditAcceptPickupRequestSchema = z.object({
    driver: z.string().min(1, { message: "Driver is required." }),
    collectors: z.array(z.string())
      .nonempty({ message: "At least one collector must be selected." })
      .min(1, { message: "At least one collector must be selected." }),
    truck: z.string().min(1, { message: "Truck is required." }),
    date: z.string().min(1, { message: "Date is required." }),
    time: z.string().min(1, { message: "Time is required." }),
    pick_id: z.string().default(''),
    acl_id: z.string().default(''),
})

