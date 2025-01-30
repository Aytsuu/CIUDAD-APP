import { z } from "zod"

// Shaping the complain form schema

const ComplaintformSchema = z.object({
    accusedName: z.string({
        message: "Username must be at least 2 characters.",
    }),
    accusedAddress: z.string({
        message: "Username must be at least 2 characters.",
    }),
    complainantName: z.string({
        message: " ",
    }),
    complainantAddress: z.string({
        message: " ",
    }),
    complaintDate: z.string({
        message: " ",
    }).date(),
    complaintType: z.string({
        message: " ",
    }),
    complaintAllegation: z.string({
        message: " ",
    })
});

export default ComplaintformSchema;
