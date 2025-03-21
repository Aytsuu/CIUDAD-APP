import { z } from 'zod'

const SignInSchema = z.object({

    username: z.string().min(1, { message: "Must be atleast 6 characters."}),
    password: z.string().min(1, { message: "Must be atleast 6 characters"})

});

export default SignInSchema;