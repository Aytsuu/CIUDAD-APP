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
import { useAuth } from "@/context/AuthContext";
import { generateToken, messaging } from "@/firebase/firebase";
import { onMessage } from "firebase/messaging";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const Icon = showPassword ? LuEyeOff : LuEye;
  const navigate = useNavigate();
  const { login } = useAuth();

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
      const response = await axios.post("http://127.0.0.1:8000/user/login/", {
        email_or_username: data.usernameOrEmail, // Send as one field
        password: data.password,
      });

      if (response.status === 200) {
        login({
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          profile_image: response.data.profile_image,
          token: response.data.token,
          rp: response.data.rp,
          staff: response.data.staff,
        });

        generateToken().then((token) => {
          // Send token to your backend
          console.log("1: ", token);
          axios.post(
            "http://127.0.0.1:8000/notification/save-token/",
            { token: token },
            {
              headers: {
                Authorization: `Bearer ${response.data.token}`,
                "Content-Type": "application/json",
              },
            }
          );

          axios.post(
            "http://127.0.0.1:8000/notification/lists/",
            {
              sender: "System", // Required (CharField)
              message: "Login Successful", // Required (TextField)
              notification_type: "system", // Required (CharField)
              // Optional fields:
              related_object_id: null,
              related_object_type: null, 
              is_read: false,
            },
            {
              headers: {
                Authorization: `Token ${response.data.token}`,
                "Content-Type": "application/json",
              },
            }
          );

          // Set up message listener
          onMessage(messaging, (payload) => {
            console.log(payload);
            // Add code to show notification in UI or update notification count
          });
        });
        navigate("/dashboard");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error ||
            "Invalid credentials. Please try again."
        );
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
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
