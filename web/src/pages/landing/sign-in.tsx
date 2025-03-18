import React from "react";
import { useForm } from "react-hook-form";
<<<<<<< HEAD
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
=======
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
>>>>>>> master
import SignInSchema from "@/form-schema/sign-in-schema";
import { Input } from "@/components/ui/input";
import { LuEye, LuEyeOff } from "react-icons/lu";

<<<<<<< HEAD
import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
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
=======
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const Icon = showPassword ? LuEyeOff : LuEye;

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof SignInSchema>) => {
    setLoading(true);
    setErrorMessage("");

    try {
      
      const response = await axios.get("http://192.168.1.55:8000/api/login/", {
        params: {
          email: data.username,
          password: data.password,
        },
      });

      if (response.status === 200) {
        console.log("Login successful!", response.data);
        // Handle login success (redirect, store token, etc.)
        
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Invalid email or password.");
    }

    setLoading(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full h-full flex flex-col gap-2"
      >
        <div className="w-full h-full flex flex-col gap-2">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                <Input
                    type="text"
                    placeholder="Enter your username or email..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
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
                      placeholder="Enter your password..."
                    />
                    {form.getValues().password?.length > 0 && (
                      <Icon
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 text-gray-400 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Error Message */}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        {/* Submit Button */}
        <div className="w-full flex items-end justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </div>
      </form>
    </Form>
  );
>>>>>>> master
}