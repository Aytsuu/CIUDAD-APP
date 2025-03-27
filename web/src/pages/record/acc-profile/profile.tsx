import { useState, useRef } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountFormSchema } from "@/form-schema/accountSettings";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  User,
  Mail,
  Calendar,
  Lock,
  KeyRound,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Info,
  Image,
  Upload,
} from "lucide-react";

type AccountFormData = z.infer<typeof accountFormSchema>;

const AccountSettings = () => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profile_image") ||
      "https://isxckceeyjcwvjipndfd.supabase.co/storage/v1/object/public/userimage//sanRoqueLogo.svg"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
  });

  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  // const handleImageClick = () => {
  //   fileInputRef.current?.click();
  // };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    if (!token) {
      setUploadError("Please login again");
      return;
    }
  
    try {
      setIsUploading(true);
      setUploadError("");
  
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await axios.post(
        "http://localhost:8000/user/upload/",
        formData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      setProfileImage(response.data.url);
      localStorage.setItem("profile_image", response.data.url);
  
    } catch (error: any) {
      setUploadError(error.response?.data?.error || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: AccountFormData) => {
    if (!emailVerified) {
      alert("Verification email sent! Please check your inbox.");
      setEmailVerified(true);
    } else {
      alert(`Password changed successfully to: ${data.newPassword}`);
      setIsChangingPassword(false);
      setEmailVerified(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6 relative font-poppins">
      {/* Back Button */}
      <button
        className="absolute top-6 right-10 flex items-center gap-2 text-gray-500 hover:text-gray-700 cursor-pointer justify-start"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-gray-500">Info about you and your preferences</p>
      </div>

      <div className="bg-white shadow-md rounded-md w-full max-w-2xl p-6">
        {/* Basic Info Section */}
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
            <User size={20} /> Basic Info
          </h2>
          <p className="text-gray-500">
            Some info may be visible to other people.
          </p>

          <div className="flex flex-col items-center my-4 relative">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              id="profile-image-upload" // Added ID for better targeting
            />

            {/* Clickable image with label */}
            <label
              htmlFor="profile-image-upload" // Connect label to input
              className="relative cursor-pointer" // Make sure cursor changes
            >
              <img
                src={profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Upload size={24} className="text-white" />
              </div>
            </label>

            {isUploading && (
              <p className="text-blue-500 text-sm mt-2">Uploading...</p>
            )}
            {uploadError && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={16} /> {uploadError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="flex items-center gap-2 text-gray-600">
                <User size={16} /> Username
              </span>
              <span className="font-bold">{username}</span>
            </div>

            <div className="flex justify-between">
              <span className="flex items-center gap-2 text-gray-600">
                <Mail size={16} /> Email
              </span>
              <span className="font-bold">{email}</span>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
            <Lock size={20} /> Password
          </h2>
          <p className="text-gray-500">
            A password that helps secure your account.
          </p>

          {isChangingPassword ? (
            <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
              <input
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className="w-full p-2 border rounded-md"
              />
              {errors.email?.message && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle size={16} /> {errors.email.message}
                </p>
              )}

              {emailVerified && (
                <input
                  type="password"
                  placeholder="Enter new password"
                  {...register("newPassword")}
                  className="w-full p-2 border rounded-md mt-2"
                />
              )}
              {errors.newPassword?.message && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle size={16} /> {errors.newPassword.message}
                </p>
              )}

              <button
                className={`rounded-md px-4 py-2 mt-2 w-full ${
                  emailVerified ? "bg-green-500" : "bg-blue-500"
                } text-white flex items-center justify-center gap-2`}
                type="submit"
              >
                {emailVerified ? (
                  <KeyRound size={18} />
                ) : (
                  <CheckCircle size={18} />
                )}
                {emailVerified ? "Change Password" : "Send Verification Email"}
              </button>
            </form>
          ) : (
            <div className="flex justify-between items-center mt-2">
              <span className="font-bold">••••••••••</span>
              <button
                className="bg-green-500 text-white rounded-md px-4 py-2 flex items-center gap-2"
                onClick={() => setIsChangingPassword(true)}
              >
                <KeyRound size={18} /> Change Password
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-8 text-sm text-gray-500 text-center flex items-center gap-2">
        <Info size={18} className="text-blue-500" />
        <span>
          Only you can see the settings. You might also want to review your
          settings for
          <span className="font-medium text-gray-700">
            {" "}
            Personal Info, Privacy, Security, and Notifications.
          </span>
        </span>
      </div>
    </div>
  );
};

export default AccountSettings;
