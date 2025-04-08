import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import SignInSchema from "@/form-schema/sign-in-schema";
import { Input } from "@/components/ui/input";
import { LuEye, LuEyeOff } from "react-icons/lu";
import Loading from "@/components/ui/loading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router-dom"; 
import { supabase } from "@/supabaseClient"; // Import Supabase client

<<<<<<< HEAD
import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form/form";
import { Button } from "@/components/ui/button";
=======
export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const Icon = showPassword ? LuEyeOff : LuEye;
  const navigate = useNavigate();
>>>>>>> backend/feature/healthinventory

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      usernameOrEmail: "", // Combined field for username or email
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof SignInSchema>) => {
    setLoading(true);
    setErrorMessage("");

    try {
      
      const response = await axios.post("http://localhost:8000/api/login/", {
        username: data.usernameOrEmail, 
        password: data.password,
      });

      if (response.status === 200) {
        console.log("Login successful!", response.data);

        // Store user data in localStorage
        localStorage.setItem("user_id", response.data.user_id);
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("email", response.data.email);
        localStorage.setItem("token", response.data.token);

        // Redirect to the home page or dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login failed:", error);

      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setErrorMessage("Invalid username or password.");
        } else {
          setErrorMessage("An error occurred. Please try again later.");
        }
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
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
          {/* Username/Email Field */}
          <FormField
            control={form.control}
            name="usernameOrEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username or Email</FormLabel>
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
            {loading ? <Loading /> : "Log in"}
          </Button>
        </div>
      </form>
    </Form>
  );
}