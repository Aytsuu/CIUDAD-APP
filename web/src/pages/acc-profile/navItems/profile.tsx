import type React from "react";
import { useState, useRef } from "react";
import { User, Camera, Loader2, Info, Cake, Mail, Building2, Heart, GraduationCap, Phone, MapPin, Home, Users, Edit3, Save, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { updateProfilePicture } from "../api-operations/restful-api/accountApi";
import sanRoqueLogo  from "@/assets/images/sanRoqueLogo.svg"

export default function Profile() {
  const { user, refreshSession } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [editMode, setEditMode] = useState({
    account: false,
    personal: false,
    address: false
  });
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
      toast.dismiss(loadingToast);
      toast.success("Profile picture updated");
      await refreshSession();
    } catch (error: any) {
      setUploadError(error.message || "Upload failed");
      toast.dismiss(loadingToast);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleEditMode = (section: 'account' | 'personal' | 'address') => {
    setEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!user?.supabase_id) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px] bg-white/50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header Section with Cover Photo Effect */}
        <div className="relative rounded-2xl shadow-xl overflow-hidden bg-gradient-to-r from-blue-400 via-sky-300 to-sky-400">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative px-8 pt-16 pb-8">
            
            {/* Profile Picture and Name */}
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="relative">
                <div className="relative group">
                  <Avatar className="h-36 w-36 shadow-2xl transition-all duration-300 ">
                    <AvatarImage
                      src={user?.profile_image || sanRoqueLogo}
                      alt="Profile"
                      className="object-cover"
                    />
                  </Avatar>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-all duration-300"></div>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-white text-gray-700 shadow-xl hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 hover:scale-110"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Camera size={20} />
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
              </div>

              {/* Name and Status */}
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">
                  {user?.resident?.per?.per_fname}{" "}
                  {user?.resident?.per?.per_lname}
                </h1>
                <div className="flex items-center gap-3">
                  {user.staff && (
                    <Badge className="text-white shadow-lg bg-blue-500 backdrop-blur-sm font-semibold px-4 py-2 hover:bg-white/10 hover:border-white/50 hover:text-white">
                      <Shield className="w-4 h-4 mr-2" />
                      {user.staff.staff_type || "Staff Member"}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-green-300 border-white/50 bg-white/10 backdrop-blur-sm font-medium px-4 py-2">
                    <Info className="w-4 h-4 mr-2 text-green-300" />
                    Verified Account {/* To be backend configured */}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {uploadError && (
          <Alert variant="destructive" className="border-red-300 bg-red-50/80 backdrop-blur-sm rounded-xl shadow-lg">
            <AlertDescription className="text-red-800 font-medium">
              {uploadError}
            </AlertDescription>
          </Alert>
        )}

        {/* Account Information Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black mb-1 flex items-center gap-3">
                  <Settings className="w-6 h-6" />
                  Account Information
                </h2>
                <p className="text-slate-500">
                  Manage your account credentials and security settings
                </p>
              </div>
              <Button
                onClick={() => toggleEditMode('account')}
                variant={editMode.account ? "secondary" : "outline"}
                className={`${editMode.account 
                  ? 'bg-blue-400 text-white hover:bg-blue-300' 
                  : 'border-white/30 text-slate-500 hover:bg-white/10'
                } transition-all duration-300`}
              >
                {editMode.account ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Username
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className={`pl-12 pr-4 py-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                    editMode.account 
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-800 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}>
                    {user?.username}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className={`pl-12 pr-4 py-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                    editMode.account 
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-800 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}>
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black mb-1 flex items-center gap-3">
                  <User className="w-6 h-6" />
                  Personal Information
                </h2>
                <p className="text-slate-500">
                  Your personal details and demographic information
                </p>
              </div>
              <Button
                onClick={() => toggleEditMode('personal')}
                variant={editMode.personal ? "secondary" : "outline"}
                className={`${editMode.personal 
                  ? 'bg-blue-400 text-white hover:bg-blue-300' 
                  : 'border-white/30 text-slate-500 hover:bg-white/10'
                } transition-all duration-300`}
              >
                {editMode.personal ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Full Name
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className={`pl-12 pr-4 py-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                    editMode.personal 
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-800 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}>
                    {user?.resident?.per?.per_fname} {user?.resident?.per?.per_lname}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Date of Birth
                </Label>
                <div className="relative group">
                  <Cake className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className={`pl-12 pr-4 py-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                    editMode.personal 
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-800 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}>
                    {user?.resident?.per?.per_dob}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Sex
                </Label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className={`pl-12 pr-4 py-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                    editMode.personal 
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-800 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}>
                    {user?.resident?.per?.per_sex}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Marital Status
                </Label>
                <div className="relative group">
                  <Heart className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className={`pl-12 pr-4 py-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                    editMode.personal 
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-800 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}>
                    {user?.resident?.per?.per_status}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Educational Attainment
                </Label>
                <div className="relative group">
                  <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className={`pl-12 pr-4 py-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                    editMode.personal 
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-800 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}>
                    {user?.resident?.per?.per_ed_attainment}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Religion
                </Label>
                <div className="relative group">
                  <Heart className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className={`pl-12 pr-4 py-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                    editMode.personal 
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-800 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}>
                    {user?.resident?.per?.per_religion}
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:col-span-2 lg:col-span-1">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Contact Number
                </Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className={`pl-12 pr-4 py-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                    editMode.personal 
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-800 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}>
                    {user?.resident?.per?.per_contact}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black mb-1 flex items-center gap-3">
                  <MapPin className="w-6 h-6" />
                  Address Information
                </h2>
                <p className="text-slate-500">
                  Your residential address and location details
                </p>
              </div>
              <Button
                onClick={() => toggleEditMode('address')}
                variant={editMode.address ? "secondary" : "outline"}
                className={`${editMode.address 
                   ? 'bg-blue-400 text-white hover:bg-blue-300' 
                  : 'border-white/30 text-slate-500 hover:bg-white/10'
                } transition-all duration-300`}
              >
                {editMode.address ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Street Address
                </Label>
                <div className="relative group">
                  <Home className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className={`pl-12 pr-4 py-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                    editMode.address 
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-800 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}>
                    {user?.resident?.address?.add_street || "Not specified"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Barangay
                </Label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className={`pl-12 pr-4 py-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                    editMode.address 
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-800 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}>
                    {user?.resident?.address?.add_barangay || "Not specified"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  City/Municipality
                </Label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div className={`pl-12 pr-4 py-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                    editMode.address 
                      ? 'border-blue-300 bg-blue-50/50 text-blue-900' 
                      : 'border-gray-200 bg-gray-50/50 text-gray-800 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}>
                    {user?.resident?.address?.add_city || "Not specified"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}