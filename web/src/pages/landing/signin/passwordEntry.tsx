import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Phone, Mail, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import SignInSchema from "@/form-schema/sign-in-schema";

interface PasswordEntryProps {
  userId: string;
  method: "phone" | "email";
  contact: string;
  onSuccess: () => void;
}

export default function PasswordEntry({ method, contact, onSuccess }: PasswordEntryProps) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<{
    email?: string;
    phone?: string;
    password: string;
  }>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      password: "",
      // Set the appropriate field based on method
      ...(method === "email" ? { email: contact } : { phone: contact }),
    },
  });

  const handlePasswordSubmit = async (data: {
    email?: string;
    phone?: string;
    password: string;
  }) => {
    setLoading(true);
    setErrorMessage("");

    try {
      // Create the credentials object with phone/email and password
      const credentials = {
        password: data.password,
        method,
        contact,
        ...(method === "email" ? { email: data.email } : { phone: data.phone }),
      };

      await login(credentials);
      toast.success("Successfully signed in!");
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Password verification error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Invalid password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatContact = (contact: string, method: "phone" | "email") => {
    if (method === "phone") {
      // Format phone number for display (e.g., +63 *** *** **45)
      if (contact.length >= 4) {
        const lastFour = contact.slice(-4);
        const hidden = "*".repeat(contact.length - 4);
        return `${hidden}${lastFour}`;
      }
      return contact;
    } else {
      // Format email for display (e.g., j***@gmail.com)
      const [username, domain] = contact.split('@');
      if (username && domain) {
        const hiddenPart = username.length > 2 
          ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
          : username;
        return `${hiddenPart}@${domain}`;
      }
      return contact;
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">

        {/* Verification Status */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="text-left">
              <p className="text-green-800 font-semibold text-sm">
                {method === "phone" ? "Phone Number Verified" : "Email Address Verified"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {method === "phone" ? (
                  <Phone className="h-4 w-4 text-green-600" />
                ) : (
                  <Mail className="h-4 w-4 text-green-600" />
                )}
                <span className="text-green-700 text-sm font-mono">
                  {formatContact(contact, method)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Password Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handlePasswordSubmit)} className="space-y-6">
          {/* Hidden field to maintain the phone/email value */}
          {method === "email" ? (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <input type="hidden" {...field} />
              )}
            />
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }: { field: ControllerRenderProps<any, any> }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...field}
                      disabled={loading}
                      className="w-full py-4 pl-12 pr-14 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-base"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-gray-100 rounded-xl"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Error Alert */}
          {errorMessage && (
            <Alert variant="destructive" className="rounded-2xl border-0 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm text-red-700">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <Lock className="mr-3 h-5 w-5" />
                <span>Complete Sign In</span>
              </>
            )}
          </Button>
        </form>
      </Form>


      {/* Additional Options */}
      <div className="text-center space-y-3">
        <Button
          type="button"
          variant="ghost"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium text-sm"
          onClick={() => {
            // Handle forgot password
            toast.info("Forgot password functionality coming soon!");
          }}
        >
          Forgot your password?
        </Button>
      </div>
    </div>
  );
}