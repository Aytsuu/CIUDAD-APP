import type React from "react";
import { useState, useRef } from "react";
import {
  User,
  Camera,
  Loader2,
  Shield,
  Calendar,
  MapPin,
  Edit,
  ChevronRight,
  Settings,
  Phone,
  Mail,
  GraduationCap,
  Heart,
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
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { updateProfilePicture } from "../restful-api/accountApi";

export default function Profile() {
  const { user, refreshSession } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please select a JPEG, PNG, or WebP image");
      toast.error("Invalid file type");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File must be smaller than 5MB");
      toast.error("File too large");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    const loadingToast = toast.loading("Uploading profile picture...");

    try {
      await updateProfilePicture(file);
      // toast.dismiss(loadingToast);
      // toast.success("Profile picture updated");
      // await refreshSession();
    } catch (error: any) {
      setUploadError(error.message || "Upload failed");
      toast.dismiss(loadingToast);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  if (!user?.supabase_id) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px] bg-gray-50">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <div className="relative">
            <Avatar className="h-24 w-24 border border-gray-200 shadow-sm">
              <AvatarImage
                src={user?.profile_image ?? undefined}
                alt="Profile"
              />
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white text-gray-600 border border-gray-300 shadow-sm hover:bg-gray-50"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                handleImageUpload(e);
              }}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              {user?.resident?.per?.per_fname} {user?.resident?.per?.per_lname}
            </h1>
            <p className="text-gray-600">{user.email}</p>
            {user.staff && (
              <div className="flex items-center gap-2 mt-3">
                <Badge
                  variant="secondary"
                  className="text-blue-700 bg-blue-50 border-blue-200 font-medium"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {user.staff.staff_type || "Staff Member"}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {uploadError && (
          <Alert
            variant="destructive"
            className="border-red-200 bg-red-50 rounded-lg"
          >
            <AlertDescription className="text-red-800">
              {uploadError}
            </AlertDescription>
          </Alert>
        )}

        {/* Personal Information */}
        <Card className="border border-gray-200 shadow-sm rounded-lg bg-white">
          <CardHeader className="pb-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium text-darkGray flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                Personal information
              </CardTitle>
             
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Full Name
                </Label>
                <p className="text-base text-gray-900">
                  {user?.resident?.per?.per_fname}{" "}
                  {user?.resident?.per?.per_lname}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Email
                </Label>
                <p className="text-base text-gray-900">
                  {user.email || "No email provided"}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Birthday
                </Label>
                <p className="text-base text-gray-900">
                  {user?.resident?.per.per_dob}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Sex
                </Label>
                <p className="text-base text-gray-900">
                  {user?.resident?.per.per_sex}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Status
                </Label>
                <p className="text-base text-gray-900">
                  {user?.resident?.per.per_status}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Education
                </Label>
                <p className="text-base text-gray-900">
                  {user?.resident?.per.per_edAttainment}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Religion
                </Label>
                <p className="text-base text-gray-900">
                  {user?.resident?.per.per_religion}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Contact
                </Label>
                <p className="text-base text-gray-900">
                  {user?.resident?.per.per_contact}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


