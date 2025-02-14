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
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
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
        <div className="w-screen h-screen flex justify-center items-center bg-snow">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(()=>{})} className="w-1/5 h-2/5 flex flex-col gap-2 p-8 border bg-white rounded-[5px] shadow-md">
                    <Label className="text-2xl font-semibold text-center text-darkBlue1 mb-3">Sign In</Label>
                    <div className="w-full h-full flex flex-col gap-2">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Username/Email</FormLabel>
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>   
                                    <div className="relative">
                                        <Input 
                                            type={showPassword ? "text" : "password"} 
                                            {...field} 
                                            className="pr-8"
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
                        <Button type="submit" className="bg-blue hover:bg-blue/80">
                            Log in
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}