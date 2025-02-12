import { useForm } from "react-hook-form";
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import SignInSchema from "@/form-schema/sign-in-schema";
import { Input } from "@/components/ui/input";

import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";


export default function SignIn(){

    const form = useForm<z.infer<typeof SignInSchema>>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    })

    return (
        <Form {...form}>
                <form className="w-full h-screen flex flex-col">
                    <div>
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel></FormLabel>
                                <FormControl>
                                    <Input type="text" {...field}/>
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel></FormLabel>
                                <FormControl>   
                                    <Input type="password" {...field}/>
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
        </Form>
    );
}