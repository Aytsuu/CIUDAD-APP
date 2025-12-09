import type React from "react";
import { useState, useRef } from "react";
import {
  User,
  Camera,
  Loader2,
  Cake,
  Mail,
  Heart,
  GraduationCap,
  Phone,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { updateProfilePicture } from "../api-operations/restful-api/accountApi";
import sanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";

export default function Profile() {
  const { user } = useAuth();
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

    setUploadError("");
    const loadingToast = toast.loading("Uploading profile picture...");

    try {
      await updateProfilePicture(file);

      toast.dismiss(loadingToast);
    } catch (error: any) {
      setUploadError(error.message || "Upload failed");
      toast.error("Upload failed");
    }
  };

  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px] bg-white/50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-52">
      {/* Header */}
      <div className="">
        <h1 className="text-2xl font-semibold text-gray-700">Account</h1>
        <p className="text-gray-500 text-sm">
          Customize your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col items-center p-6 rounded-lg border-2 bg-darkBlue2">
          <div className="relative group mb-4">
            <Avatar className="w-40 h-40">
              <AvatarImage
                src={user?.profile_image || sanRoqueLogo}
                alt="Profile"
                className="object-cover"
              />
            </Avatar>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-blue-500 bg-white hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-md"
          >
            <Camera className="w-4 h-4 mr-2" />
            Upload New Photo
          </Button>
          <p className="text-xs text-white/80 mt-2">JPG, PNG. Max 5MB.</p>
        </div>

        <div className="lg:col-span-2 p-6 rounded-lg border border-darkBlue1 shadow-sm">
          {/* Header Section */}
          <div className="mb-6 pb-4 border-b border-darkBlue1">
            <h2 className="text-xl font-bold text-darkBlue1 mb-2">
              Login Credentials
            </h2>
            <p className="text-gray-600 text-sm">
              Change or add email/phone to use for login. Keep your contact
              information up to date.
            </p>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border-1 bg-darkBlue1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-darkBlue3 rounded-full">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white">Email Address</p>
                    <p className="font-medium text-white">{user?.email ? user?.email : "Not provided"}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-darkBlue1 rounded-lg ">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-darkBlue3 rounded-full">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white">Phone Number</p>
                    <p className="font-medium text-white">
                      {user?.phone || "No phone number added"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  {user?.phone ? "Change" : "Add"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {uploadError && (
        <Alert
          variant="destructive"
          className="border-red-300 bg-red-50/80 backdrop-blur-sm rounded-xl"
        >
          <AlertDescription className="text-red-800 font-medium">
            {uploadError}
          </AlertDescription>
        </Alert>
      )}

      {/* Personal Information Section */}
      <div className="bg-white rounded-2xl border border-darkBlue1 overflow-hidden">
        <div className="bg-white px-8 py-6 border-b border-darkBlue1 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-darkBlue1 mb-1 flex items-center gap-3">
                Personal Information
              </h2>
              <p className="text-slate-500">
                Personal details and demographic information
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="space-y-6">
            {/* Personal Info List - Each in separate row */}
            <div className="space-y-4">
              {/* Full Name */}
              <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">
                      {user?.personal?.per_fname} {user?.personal?.per_lname}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Cake className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium text-gray-900">
                      {user?.personal?.per_dob || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sex */}
              <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sex</p>
                    <p className="font-medium text-gray-900">
                      {user?.personal?.per_sex || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Marital Status */}
              <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Heart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Marital Status</p>
                    <p className="font-medium text-gray-900">
                      {user?.personal?.per_status || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Educational Attainment */}
              <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Educational Attainment
                    </p>
                    <p className="font-medium text-gray-900">
                      {user?.personal?.per_edAttainment || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Religion */}
              <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Heart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Religion</p>
                    <p className="font-medium text-gray-900">
                      {user?.personal?.per_religion || "Not specified"}
                    </p>
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
