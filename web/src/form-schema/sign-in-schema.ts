import { z } from 'zod'

const SignInSchema = z.object({

    email: z.string().min(1, { message: ""}),
    password: z.string().min(1, { message: ""})

});

export default SignInSchema;