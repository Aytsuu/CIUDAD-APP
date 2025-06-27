import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/api/api";
import { passwordFormSchema } from "@/form-schema/account-schema";
import supabase from "@/supabase/supabase";
import { Switch } from "@radix-ui/react-switch";

type PasswordFormData = z.infer<typeof passwordFormSchema>;

export default function Security() {
  const { user, isAuthenticated } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRequirements = [
    { text: "At least 8 characters", regex: /.{8,}/ },
    { text: "At least one uppercase letter", regex: /[A-Z]/ },
    { text: "At least one lowercase letter", regex: /[a-z]/ },
    { text: "At least one number", regex: /[0-9]/ },
    { text: "At least one special character", regex: /[^A-Za-z0-9]/ },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
  });

  const newPassword = watch("new_password");

  const onSubmit = async (data: PasswordFormData) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to change your password");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: data.new_password,
      });

      if (supabaseError) throw supabaseError;

      const response = await api.post("/api/account/change-password/", {
        old_password: data.old_password,
        new_password: data.new_password,
      });

      if (response.status === 200) {
        toast.success("✅ Your password has been updated successfully!");
        reset();
        setIsChangingPassword(false);
      }
    } catch (error: any) {
      console.error("Password change error:", error);

      if (error.response) {
        // Handle Django validation errors
        const errorData = error.response.data;
        if (errorData.old_password) {
          toast.error(errorData.old_password[0]);
        } else if (errorData.new_password) {
          toast.error(errorData.new_password[0]);
        } else {
          toast.error("Failed to update password in our system");
        }
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred while updating password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Section */}
      <div className="space-y-4 p-6 border rounded-lg">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Password</h2>
        </div>

        {isChangingPassword ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {/* Current Password */}
            <div>
              <Label htmlFor="current_password" className="text-sm">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  {...register("old_password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </Button>
              </div>
              {errors.old_password?.message && (
                <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                  <AlertCircle size={14} /> {errors.old_password.message}
                </p>
              )}
            </div>

            <Separator />

            {/* New Password */}
            <div>
              <Label htmlFor="new_password" className="text-sm">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Create a new password"
                  {...register("new_password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.new_password?.message && (
                <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                  <AlertCircle size={14} /> {errors.new_password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirm_password" className="text-sm">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  {...register("confirm_password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </Button>
              </div>
              {errors.confirm_password?.message && (
                <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                  <AlertCircle size={14} /> {errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="rounded-md bg-muted p-3 space-y-1">
              <p className="text-sm font-medium mb-2">Password Requirements:</p>
              {passwordRequirements.map((req, index) => {
                const isValid = newPassword
                  ? req.regex.test(newPassword)
                  : false;
                return (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle
                      size={14}
                      className={
                        isValid ? "text-emerald-500" : "text-muted-foreground"
                      }
                    />
                    <span className={isValid ? "text-emerald-700" : ""}>
                      {req.text}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsChangingPassword(false);
                  reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <p className="font-medium">••••••••••</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingPassword(true)}
            >
              <KeyRound size={14} className="mr-2" /> Change Password
            </Button>
          </div>
        )}
      </div>

      {/* Two-Factor Authentication */}
      <div className="space-y-4 p-6 border rounded-lg">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable 2FA</Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch />
        </div>
      </div>

      <Alert
        variant="default"
        className="bg-blue-50 border-blue-200 text-blue-800"
      >
        <Info size={18} className="h-4 w-4" />
        <AlertDescription className="text-sm">
          For security reasons, some changes may require you to re-authenticate.
        </AlertDescription>
      </Alert>
    </div>
  );
}
