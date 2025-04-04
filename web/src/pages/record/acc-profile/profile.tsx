import { useState, useRef } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
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
  Camera,
  Bell,
  Shield,
  Menu,
  X,
  Settings,
  CreditCard,
  LogOut,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import CardLayout from "@/components/ui/card/card-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { updatePassword, updateProfilePicture } from "./restful-api/accountApi";
import { passwordFormSchema } from "@/form-schema/account";

type PasswordFormData = z.infer<typeof passwordFormSchema>;

const AccountSettings = () => {
  const { user, updateUser } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile image upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);

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
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    if (!user?.token) {
      toast.error("You must be logged in to change your password");
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePassword(data.old_password, data.new_password, user.token);
      toast.success("✅   Your password has been updated successfully!");
      reset();
    } catch (error: any) {
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigate = useNavigate();

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try{
      const imageUrl = await updateProfilePicture(file, user.token);
      updateUser({ profile_image: imageUrl });
    } catch (error: any) {
      setUploadError(error);
    } finally {
      setIsUploading(false);
    }
  };

  // Custom toggle button component
  const ToggleButton = ({
    enabled,
    onToggle,
    size = "default",
  }: {
    enabled: boolean;
    onToggle: () => void;
    size?: "default" | "sm";
  }) => {
    return (
      <Button
        type="button"
        variant="outline"
        size={size}
        className={`relative px-8 ${
          enabled ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
        onClick={onToggle}
      >
        <span
          className={`absolute left-2 transition-opacity ${
            enabled ? "opacity-100" : "opacity-0"
          }`}
        >
          <Check size={16} />
        </span>
        <span className="text-xs">{enabled ? "ON" : "OFF"}</span>
      </Button>
    );
  };

  return (
    <div className="h-screen w-screen bg-gray-50 p-4 flex justify-center items-center overflow-hidden">
      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
        id="profile-image-upload"
      />

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full bg-background shadow-md"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      <div className="w-full max-w-5xl h-[calc(100vh-40px)] flex flex-col md:flex-row bg-background rounded-xl shadow-lg overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
          md:w-56 bg-gray-50 border-r
          fixed inset-y-0 left-0 z-40 w-64 bg-background shadow-lg transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:h-auto md:shadow-none
        `}
        >
          <div className="flex flex-col h-full">
            <div className="p-5 border-b">
              
              <h2 className="font-bold text-xl">Settings</h2>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <Button
                variant={activeTab === "account" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("account")}
              >
                <User size={18} className="mr-2" /> Account
              </Button>

              <Button
                variant={activeTab === "settings" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("settings")}
              >
                <Settings size={18} className="mr-2" /> Preferences
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate("/billing")}
              >
                <CreditCard size={18} className="mr-2" /> Billing
              </Button>
            </nav>

            <div className="p-4 border-t mt-auto">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} className="mr-2" /> Log out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 h-full overflow-auto">
          <div className="p-6">
            {/* Header with back button */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {activeTab === "account" ? "Account Settings" : "Preferences"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {activeTab === "account"
                    ? "Manage your personal information and preferences"
                    : "Customize your experience"}
                </p>
              </div>
            </div>

            {/* Navigation Pills for mobile */}
            <div className="md:hidden mb-6">
              <div className="inline-flex rounded-md shadow-sm border p-1 bg-muted/30 w-full">
                <Button
                  variant={activeTab === "account" ? "secondary" : "ghost"}
                  className="flex-1 rounded-sm"
                  onClick={() => setActiveTab("account")}
                >
                  <User size={16} className="mr-2" />
                  <span>Account</span>
                </Button>
                <Button
                  variant={activeTab === "settings" ? "secondary" : "ghost"}
                  className="flex-1 rounded-sm"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings size={16} className="mr-2" />
                  <span>Settings</span>
                </Button>
              </div>
            </div>

            {activeTab === "account" && (
              <>
                {/* Profile Card */}
                <Card className="mb-6 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-20 relative z-0"></div>

                  <div className="px-6 pb-6 relative z-10 -mt-20">
                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-end pt-10 mb-6">
                      <div className="relative">
                        {/* Updated Avatar with image upload functionality */}
                        <label
                          htmlFor="profile-image-upload"
                          className="relative cursor-pointer block"
                        >
                          <Avatar className="h-20 w-20 border-4 border-background">
                            <AvatarImage
                              src={
                                user?.profile_image ||
                                "../assets/images/sanRoqueLogo.svg"
                              }
                              alt="Profile"
                            />
                            <AvatarFallback className="text-xl">
                              SR
                            </AvatarFallback>
                          </Avatar>
                          <Button
                            size="icon"
                            className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground"
                            onClick={(e) => {
                              e.preventDefault();
                              fileInputRef.current?.click();
                            }}
                          >
                            <Camera size={12} />
                          </Button>
                        </label>

                        {/* Image upload status messages */}
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
                          {user?.username || "Roque, San"}
                        </h2>
                        <p className="text-muted-foreground">Staff Position</p>
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
                              {user?.username || "Roque, San"}
                            </p>
                          </div>

                          <div>
                            <Label className="text-muted-foreground flex items-center gap-2 mb-1">
                              <Calendar size={14} /> Birthday
                            </Label>
                            <p className="font-medium">January 1, 1999</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-muted-foreground flex items-center gap-2 mb-1">
                              <Mail size={14} /> Email Address
                            </Label>
                            <p className="font-medium">
                              {user?.email || "sanroque@gmail.com"}
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
                                  <Label
                                    htmlFor="current_password"
                                    className="text-sm"
                                  >
                                    Current Password
                                  </Label>
                                  <div className="relative">
                                    <Input
                                      id="current_password"
                                      type={
                                        showCurrentPassword
                                          ? "text"
                                          : "password"
                                      }
                                      placeholder="Enter your current password"
                                      {...register("old_password")}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                                      onClick={() =>
                                        setShowCurrentPassword(
                                          !showCurrentPassword
                                        )
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
                                  <Label
                                    htmlFor="new_password"
                                    className="text-sm"
                                  >
                                    New Password
                                  </Label>
                                  <div className="relative">
                                    <Input
                                      id="new_password"
                                      type={
                                        showNewPassword ? "text" : "password"
                                      }
                                      placeholder="Create a new password"
                                      {...register("new_password")}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                                      onClick={() =>
                                        setShowNewPassword(!showNewPassword)
                                      }
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
                                  <Label
                                    htmlFor="confirm_password"
                                    className="text-sm"
                                  >
                                    Confirm Password
                                  </Label>
                                  <div className="relative">
                                    <Input
                                      id="confirm_password"
                                      type={
                                        showConfirmPassword
                                          ? "text"
                                          : "password"
                                      }
                                      placeholder="Confirm your new password"
                                      {...register("confirm_password")}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                                      onClick={() =>
                                        setShowConfirmPassword(
                                          !showConfirmPassword
                                        )
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
                                  {passwordRequirements.map((req, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <CheckCircle
                                        size={14}
                                        className={
                                          errors.new_password
                                            ? "text-muted-foreground"
                                            : "text-emerald-500"
                                        }
                                      />
                                      <span>{req.text}</span>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                  >
                                    {isSubmitting
                                      ? "Updating..."
                                      : "Update Password"}
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

                {/* Footer Info */}
                <Alert
                  variant="default"
                  className="bg-blue-50 border-blue-200 text-blue-800"
                >
                  <Info size={18} className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Only you can see these settings. You might also want to
                    review your settings for
                    <span className="font-medium">
                      {" "}
                      Personal Info, Privacy, Security, and Notifications.
                    </span>
                  </AlertDescription>
                </Alert>
              </>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Notifications Settings */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Bell size={18} /> Notifications
                    </CardTitle>
                    <CardDescription>
                      Manage how you receive notifications and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email notifications about account activity
                        </p>
                      </div>
                      <ToggleButton
                        enabled={emailNotifications}
                        onToggle={() =>
                          setEmailNotifications(!emailNotifications)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications on your devices
                        </p>
                      </div>
                      <ToggleButton
                        enabled={pushNotifications}
                        onToggle={() =>
                          setPushNotifications(!pushNotifications)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about new features and promotions
                        </p>
                      </div>
                      <ToggleButton
                        enabled={marketingEmails}
                        onToggle={() => setMarketingEmails(!marketingEmails)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Shield size={18} /> Privacy
                    </CardTitle>
                    <CardDescription>
                      Manage your privacy settings and data sharing preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see your profile information
                        </p>
                      </div>
                      <ToggleButton
                        enabled={profileVisibility}
                        onToggle={() =>
                          setProfileVisibility(!profileVisibility)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Data Collection</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow us to collect usage data to improve our services
                        </p>
                      </div>
                      <ToggleButton
                        enabled={dataCollection}
                        onToggle={() => setDataCollection(!dataCollection)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
export default AccountSettings;
