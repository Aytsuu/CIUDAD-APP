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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { passwordFormSchema } from "@/form-schema/account-schema";
import { useMutation } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

type PasswordFormData = z.infer<typeof passwordFormSchema>;

export default function Security() {
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    trigger,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    mode: "onChange",
  });

  const newPassword = watch("new_password", "");

  const passwordRequirements = [
    { text: "Minimum 8 characters", regex: /.{8,}/ },
    { text: "At least one uppercase letter", regex: /[A-Z]/ },
    { text: "At least one lowercase letter", regex: /[a-z]/ },
    { text: "At least one number", regex: /[0-9]/ },
    { text: "At least one special character", regex: /[^A-Za-z0-9]/ },
  ];

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      try {
        // First verify current password by attempting to sign in
        // const { error: signInError } = await supabase.auth.signInWithPassword({
        //   email: user?.email!,
        //   password: data.old_password,
        // });

        // if (signInError) {
        //   throw new Error("Current password is incorrect");
        // }

        // Update the password
        // const { error: updateError } = await supabase.auth.updateUser({
        //   password: data.new_password,
        // });

        // if (updateError) {
        //   throw new Error(updateError.message);
        // }

        return { success: true };
      } catch (error) {
        console.error("Password change error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Password change successful, showing toast");
      toast.success("Password updated successfully", {
        description: "Your password has been changed.",
      });
      reset();
      setIsChangingPassword(false);
    },
    onError: (error: any) => {
      console.error("Password change failed:", error);
      toast.error("Password change failed", {
        description: error.message || "Failed to update password.",
      });
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    if (!user?.email) {
      toast.error("Authentication required", {
        description: "You must be logged in to change your password",
      });
      return;
    }

    await changePasswordMutation.mutateAsync(data);
  };

  const handleCancel = () => {
    reset();
    setIsChangingPassword(false);
  };

  return (
    <div className="space-y-6 px-52">
      {/* Header */}
      <div className="">
        <h1 className="text-2xl font-semibold text-gray-700">Security & Privacy</h1>
        <p className="text-gray-500 text-sm">Manage your password and secure your account access.</p>
      </div>
      <div className="space-y-6">
        {/* Password Section */}
        <div className="space-y-4 p-6 border-2 rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5" />
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
                    autoComplete="current-password"
                    {...register("old_password", {
                      onChange: () => trigger("old_password"),
                    })}
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
                    autoComplete="new-password"
                    {...register("new_password", {
                      onChange: () => {
                        trigger("new_password");
                        trigger("confirm_password");
                      },
                    })}
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

                {newPassword && (
                  <div className="mt-2">
                    <PasswordStrengthMeter password={newPassword} />
                  </div>
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
                    autoComplete="new-password"
                    {...register("confirm_password", {
                      onChange: () => trigger("confirm_password"),
                    })}
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
                <p className="text-sm font-medium mb-2">
                  Password Requirements:
                </p>
                {passwordRequirements.map((req, index) => {
                  const isValid = newPassword
                    ? req.regex.test(newPassword)
                    : false;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
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
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={changePasswordMutation.isPending}
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
            <Shield className="w-5 h-5" />
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
            For security reasons, some changes may require you to
            re-authenticate.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

// Password Strength Meter Component
function PasswordStrengthMeter({ password }: { password: string }) {
  const getStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return Math.min(score, 4);
  };

  const strength = getStrength(password);
  const strengthText = [
    "Very Weak",
    "Weak",
    "Moderate",
    "Strong",
    "Very Strong",
  ][strength];
  const strengthColor = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ][strength];

  return (
    <div className="space-y-1">
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-full rounded-full flex-1 ${
              i <= strength ? strengthColor : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium">{strengthText}</span>
      </p>
    </div>
  );
}
