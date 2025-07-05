import type React from "react";
import { useState, useRef } from "react";
import {
  User,
  Camera,
  Info,
  AlertCircle,
  Loader2,
  Shield,
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user } = useAuth(); 
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPEG, PNG, or WebP)");
      toast.error("Invalid file type", {
        description: "Please select a JPEG, PNG, or WebP image file.",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      toast.error("File too large", {
        description: "Please select an image smaller than 5MB.",
      });
      return;
    }

    setIsUploading(true);
    setUploadError("");

    // Show loading toast
    const loadingToast = toast.loading("Uploading profile picture...", {
      description: "Please wait while we update your profile picture.",
    });

    try {

      toast.dismiss(loadingToast);
      toast.success("🎉 Profile picture updated!", {
        description: "Your new profile picture has been saved successfully.",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Image upload error:", error);
      const errorMsg = error.message || "Failed to upload image";
      setUploadError(errorMsg);

      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error("Upload failed", {
        description: errorMsg,
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!user?.supabase_id) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-blue/20 to-transparent" />
        </div>

        <CardContent className="relative -mt-16 pb-8 px-8">
          {/* Profile Picture - Left aligned */}
          <div className="flex items-end gap-8 mb-8">
            <div className="relative group">
              <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                  <AvatarImage
                    src={user.profile_image || "/placeholder.svg"}
                    alt="Profile"
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {user?.resident?.per?.per_fname?.[0] || "U"}
                    {user?.resident?.per?.per_lname?.[0] || ""}
                  </AvatarFallback>
                </Avatar>

                {/* Upload Button */}
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full shadow-lg bg-blue hover:bg-blue border-2 border-background" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} stroke="currentColor" strokeWidth={2} /> 
                  )}
                </Button>

                {/* Upload overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 pt-4">
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {user?.resident?.per?.per_fname}{" "}
                    {user?.resident?.per?.per_lname}
                  </h1>
                  <p className="text-lg text-muted-foreground">{user.email}</p>
                </div>

                {user.staff && (
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="default"
                      className="bg-blue-100 text-blue-800 px-3 py-1"
                    >
                      <Shield className="h-3 w-3 mr-2" />
                      {user.staff.staff_type || "Staff Member"}
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1">
                      ID: {user.staff.staff_id || "N/A"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Error */}
          {uploadError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Personal Information Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-8">
          <div className="grid gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">
                Full Name
              </Label>
              <p className="text-base font-medium pl-4">
                {user?.resident?.per?.per_fname}{" "}
                {user?.resident?.per?.per_lname}
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">
                Email Address
              </Label>
              <p className="text-base font-medium pl-4">
                {user.email || "No email provided"}
              </p>
            </div>

            {user.staff && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Staff Information
                  </Label>
                  <div className="space-y-3 pl-4">
                    <p className="text-base">
                      <span className="font-medium text-muted-foreground">
                        Staff ID:
                      </span>{" "}
                      <span className="font-semibold">
                        {user.staff.staff_id || "N/A"}
                      </span>
                    </p>
                    <p className="text-base">
                      <span className="font-medium text-muted-foreground">
                        Role:
                      </span>{" "}
                      <span className="font-semibold">
                        {user.staff.staff_type || "Staff Member"}
                      </span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Status Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Shield className="h-5 w-5" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-8">
          {/* Account Active Status */}
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-green-800">
                Account Active
              </p>
              <p className="text-xs text-green-600 mt-1">
                Your account is in good standing
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Member since
                </span>
              </div>
              <span className="text-sm font-medium">
                {user?.resident?.per_dob}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Location</span>
              </div>
              <span className="text-sm font-medium">San Roque</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <p className="font-medium text-sm">Privacy & Security</p>
            <p className="text-sm leading-relaxed">
              Only you can see these settings. Your personal information is
              protected and secure. You can update your profile picture and view
              your account details here.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
