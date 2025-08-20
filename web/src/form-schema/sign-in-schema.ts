import { z } from 'zod'

const SignInSchema = z.object({

    email: z.string().min(1, { message: ""}),
    password: z.string().min(1, { message: ""})

});

export const SignInSchema2 = z.object({
    phone_number: z.string().min(1, {message: ""})
})
export default SignInSchema2;