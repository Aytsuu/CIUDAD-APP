import React from "react";
import { useForm } from "react-hook-form";
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import SignInSchema from "@/form-schema/sign-in-schema";
import { Input } from "@/components/ui/input";
import { LuEye, LuEyeOff } from "react-icons/lu";

import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form/form";
import { Button } from "@/components/ui/button";


export default function SignIn(){

    const [showPassword, setShowPassword] = React.useState(false);
    const Icon = showPassword ? LuEyeOff : LuEye; 

    const form = useForm<z.infer<typeof SignInSchema>>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {
            username: '',
            password: ''
        }
    })


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(()=>{})} className="w-full h-full flex flex-col gap-2">
                <div className="w-full h-full flex flex-col gap-2">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Username/Email</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter your username or email here..." {...field}/>
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>   
                                <div className="relative">
                                    <Input 
                                        type={showPassword ? "text" : "password"} 
                                        {...field} 
                                        className="pr-8"
                                        placeholder="Enter your password here..."
                                    />

                                    {
                                        form.getValues().password.length > 0 && 
                                        <Icon
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 text-gray-400 cursor-pointer"
                                            onClick={()=>{setShowPassword(!showPassword)}}
                                        />
                                    }
                                </div>
                            </FormControl>
                            <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="w-full flex items-end justify-end">
                    <Button type="submit">
                        Log in
                    </Button>
                </div>
            </form>
        </Form>
    );
}