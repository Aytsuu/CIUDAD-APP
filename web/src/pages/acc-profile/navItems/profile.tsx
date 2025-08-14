import type React from "react";
import { useState, useRef } from "react";
import { User, Camera, Loader2, Info, Cake, Mail, Building2, Heart, GraduationCap,  Phone, MapPin, Home, Users } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { updateProfilePicture } from "../api-operations/restful-api/accountApi";

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
    <div className="min-h-screen bg-gray-100">
      <div className="space-y-4">
        <div className="rounded-lg shadow-sm overflow-hidden">

          {/* Profile Info Section */}
          <div className="relative px-6 pb-6">
            {/* Profile Picture */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg bg-white">
                    <AvatarImage
                      src={user?.profile_image ?? undefined}
                      alt="Profile"
                      className="object-cover"
                    />
                  </Avatar>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-gray-100 text-gray-600 border-2 border-white shadow-lg hover:bg-gray-200"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Camera size={18} />
                    )}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                </div>

                {/* Name and Details */}
                <div>
                  <h1 className="text-3xl font-semibold text-darkBlue1 mb-1">
                    {user?.resident?.per?.per_fname}{" "}
                    {user?.resident?.per?.per_lname}
                  </h1>
                  {user.staff && (
                    <Badge
                      variant="secondary"
                      className="text-blue-700 bg-blue-100 border-blue-200 font-medium"
                    >
                      {user.staff.staff_type || "Staff Member"}
                      <Info className="w-3 h-3 ml-2" />
                    </Badge>
                  )}
                </div>
              </div>
            </div>
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

        {/* Account Information Section */}
        <div className="rounded-lg p-6">
          <div className="grid grid-cols-4 gap-x-8">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">
                Account Information
              </h2>
              <p className="text-sm text-gray-500">
                You can change your account information settings here.
              </p>
            </div>

            <div className="space-y-6 bg-white p-6 col-span-3 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-3 grid-rows-2 gap-x-6 gap-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <Button
                      variant="outline"
                      className="w-full justify-start pl-10 pr-4 py-2.5 h-10 text-left font-normal bg-white hover:bg-gray-50"
                    >
                      {user?.username}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <Button
                      variant="outline"
                      className="w-full justify-start pl-10 pr-4 py-2.5 h-10 text-left font-normal bg-white hover:bg-gray-50"
                    >
                      {user?.email}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Department
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <Button
                      variant="outline"
                      className="w-full justify-start pl-10 pr-4 py-2.5 h-10 text-left font-normal bg-white hover:bg-gray-50"
                    >
                      {user?.department}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="rounded-lg p-6">
          <div className="grid grid-cols-4 gap-x-8">
            {/* Column 1 - Header */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">
                Personal Info
              </h2>
              <p className="text-sm text-gray-500">
                You can change your personal information settings here.
              </p>
            </div>

            <div className="space-y-6 bg-white p-6 col-span-3 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-3 gap-x-6 gap-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <Button
                      variant="outline"
                      className="w-full justify-start pl-10 pr-4 py-2.5 h-10 text-left font-normal bg-white hover:bg-gray-50"
                    >
                      {user?.resident?.per?.per_fname}{" "}
                      {user?.resident?.per?.per_lname}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Date of Birth
                  </Label>
                  <div className="relative">
                    <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <Button
                      variant="outline"
                      className="w-full justify-start pl-10 pr-4 py-2.5 h-10 text-left font-normal bg-white hover:bg-gray-50"
                    >
                      {user?.resident?.per?.per_dob}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Sex
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <Button
                      variant="outline"
                      className="w-full justify-start pl-10 pr-4 py-2.5 h-10 text-left font-normal bg-white hover:bg-gray-50"
                    >
                      {user?.resident?.per?.per_sex}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <Button
                      variant="outline"
                      className="w-full justify-start pl-10 pr-4 py-2.5 h-10 text-left font-normal bg-white hover:bg-gray-50"
                    >
                      {user?.resident?.per?.per_status}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Educational Attainment
                  </Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <Button
                      variant="outline"
                      className="w-full justify-start pl-10 pr-4 py-2.5 h-10 text-left font-normal bg-white hover:bg-gray-50"
                    >
                      {user?.resident?.per?.per_ed_attainment}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Religion
                  </Label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <Button
                      variant="outline"
                      className="w-full justify-start pl-10 pr-4 py-2.5 h-10 text-left font-normal bg-white hover:bg-gray-50"
                    >
                      {user?.resident?.per?.per_religion}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Contact
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <Button
                      variant="outline"
                      className="w-full justify-start pl-10 pr-4 py-2.5 h-10 text-left font-normal bg-white hover:bg-gray-50"
                    >
                      {user?.resident?.per?.per_contact}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="rounded-lg p-6">
          <div className="grid grid-cols-4 gap-x-8">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">
                Address
              </h2>
              <p className="text-sm text-gray-500">
                Address information and location details.
              </p>
            </div>

            <div className="space-y-6 bg-white p-6 col-span-3 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-3 gap-x-6 gap-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Street Address
                  </Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <Button
                      variant="outline"
                      className="w-full justify-start pl-10 pr-4 py-2.5 h-10 text-left font-normal bg-white hover:bg-gray-50"
                    >
                      {user?.resident?.address?.add_street || "Not specified"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Barangay
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <Button
                      variant="outline"
                      className="w-full justify-start pl-10 pr-4 py-2.5 h-10 text-left font-normal bg-white hover:bg-gray-50"
                    >
                      {user?.resident?.address?.add_barangay || "Not specified"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    City/Municipality
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <Button
                      variant="outline"
                      className="w-full justify-start pl-10 pr-4 py-2.5 h-10 text-left font-normal bg-white hover:bg-gray-50"
                    >
                      {user?.resident?.address?.add_city || "Not specified"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}