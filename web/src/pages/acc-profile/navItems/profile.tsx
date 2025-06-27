import { useState, useRef } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, KeyRound, CheckCircle, AlertCircle, Camera, Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent } from "@/components/ui/card/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import sanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";
import { api } from "@/api/api";
import { passwordFormSchema } from "@/form-schema/account-schema";
import supabase from "@/supabase/supabase";

type PasswordFormData = z.infer<typeof passwordFormSchema>;

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // First change password in Supabase
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: data.new_password,
      });

      if (supabaseError) throw supabaseError;

      // Then update in Django
      const response = await api.post('/api/account/change-password/', {
        old_password: data.old_password,
        new_password: data.new_password
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
        // Supabase errors
        toast.error(error.message);
      } else {
        toast.error("An error occurred while updating password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setUploadError("");

    try {
      // First upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.supabase_id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update user profile in Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: urlData.publicUrl }
      });

      if (updateError) throw updateError;

      // Update in Django
      const response = await api.post('/api/account/upload-image/', {
        profile_image: urlData.publicUrl
      });

     
      
      toast.success("Profile picture updated successfully!");
      
    } catch (error: any) {
      console.error("Image upload error:", error);
      const errorMsg = error.message || "Failed to upload image";
      setUploadError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user?.supabase_id) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading user profile...</p>
      </div>
    );
  }

  // Helper function to get display name
  const getDisplayName = () => {
    return user?.username|| user.email || "User";
  };

  // Helper function to get profile image
  const getProfileImage = () => {
    return user?.profile_image || sanRoqueLogo;
  };

  return (
    <div>
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-20 relative z-0"></div>

        <div className="px-6 pb-6 relative z-10 -mt-20">
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-end pt-10 mb-6">
            <div className="relative">
              <div className="relative cursor-pointer block group">
                <Avatar className="h-20 w-20 border-4 border-background">
                  <AvatarImage
                    src={getProfileImage()}
                    alt="Profile"
                  />
                  <AvatarFallback className="text-xl">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                  disabled={isUploading}
                >
                  <Camera size={12} />
                </Button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                id="profile-image-upload"
              />

              {isUploading && (
                <p className="text-blue-500 text-xs mt-1 text-center">
                  Uploading...
                </p>
              )}
              {uploadError && (
                <p className="text-destructive text-xs mt-1 flex items-center justify-center gap-1">
                  <AlertCircle size={12} /> {uploadError}
                </p>
              )}
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">
                {getDisplayName()}
              </h2>
              {user.staff && (
                <p className="text-muted-foreground">
                  {user.staff.staff_type || "Staff Member"}
                </p>
              )}
            </div>
          </div>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2 mb-1">
                    <User size={14} /> Full Name
                  </Label>
                  <p className="font-medium">
                    {getDisplayName()}
                  </p>
                </div>
                
                {user.staff && (
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2 mb-1">
                      <Info size={14} /> Staff ID
                    </Label>
                    <p className="font-medium">
                      {user.staff.staff_id || "N/A"}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2 mb-1">
                    <Mail size={14} /> Email Address
                  </Label>
                  <p className="font-medium">
                    {user.email || "No email provided"}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground flex items-center gap-2 mb-1">
                    <Lock size={14} /> Password
                  </Label>
                  {isChangingPassword ? (
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-4 mt-2"
                    >
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
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
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
                            <AlertCircle size={14} />{" "}
                            {errors.old_password.message}
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
                            {showNewPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </Button>
                        </div>
                        {errors.new_password?.message && (
                          <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                            <AlertCircle size={14} />{" "}
                            {errors.new_password.message}
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
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
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
                            <AlertCircle size={14} />{" "}
                            {errors.confirm_password.message}
                          </p>
                        )}
                      </div>

                      {/* Password Requirements */}
                      <div className="rounded-md bg-muted p-3 space-y-1">
                        <p className="text-sm font-medium mb-2">
                          Password Requirements:
                        </p>
                        {passwordRequirements.map((req, index) => {
                          const isValid = newPassword ? req.regex.test(newPassword) : false;
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle
                                size={14}
                                className={
                                  isValid
                                    ? "text-emerald-500"
                                    : "text-muted-foreground"
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
                          disabled={isSubmitting}
                        >
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
                        <KeyRound size={14} className="mr-2" /> Change
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <Alert
        variant="default"
        className="bg-blue-50 border-blue-200 text-blue-800"
      >
        <Info size={18} className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Only you can see these settings. You might also want to review your
          settings for
          <span className="font-medium">
            Personal Info, Privacy, Security, and Notifications.
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
}