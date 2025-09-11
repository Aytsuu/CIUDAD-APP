import { z } from 'zod'

const SignInSchema = z.object({

    email: z.string().min(1, { message: "Email is required" }).optional(),
    password: z.string().min(1, { message: ""}),
    phone: z.string().min(1, {message: ""}).optional()
});

export default SignInSchema;