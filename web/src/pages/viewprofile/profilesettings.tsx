"use client"

import { useState } from "react"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"

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
  Eye,
  Moon,
  Sun,
  Menu,
  X,
  Home,
  Settings,
  CreditCard,
  LogOut,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/button/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Email & Password verification
const accountFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }).optional().or(z.literal("")),
})

type AccountFormData = z.infer<typeof accountFormSchema>

const AccountSettings = () => {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [activeTab, setActiveTab] = useState("account")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState("light")

  // Toggle states
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [profileVisibility, setProfileVisibility] = useState(true)
  const [dataCollection, setDataCollection] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
  })

  const navigate = useNavigate()

  const onSubmit = (data: AccountFormData) => {
    if (!emailVerified) {
      alert("Verification email sent! Please check your inbox.")
      setEmailVerified(true)
    } else {
      alert(`Password changed successfully to: ${data.newPassword}`)
      setIsChangingPassword(false)
      setEmailVerified(false)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  // Custom toggle button component
  const ToggleButton = ({
    enabled,
    onToggle,
    size = "default",
  }: {
    enabled: boolean
    onToggle: () => void
    size?: "default" | "sm"
  }) => {
    return (
      <Button
        type="button"
        variant="outline"
        size={size}
        className={`relative px-8 ${enabled ? "bg-primary text-primary-foreground" : "bg-muted"}`}
        onClick={onToggle}
      >
        <span className={`absolute left-2 transition-opacity ${enabled ? "opacity-100" : "opacity-0"}`}>
          <Check size={16} />
        </span>
        <span className="text-xs">{enabled ? "ON" : "OFF"}</span>
      </Button>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full bg-background shadow-md"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside
          className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-background shadow-lg transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static lg:h-screen
        `}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="../assets/images/sanRoqueLogo.svg" alt="Logo" />
                  <AvatarFallback>SR</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold">San Roque</h2>
                  <p className="text-xs text-muted-foreground">Premium Account</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
                <Home size={18} className="mr-2" /> Dashboard
              </Button>

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
                <Settings size={18} className="mr-2" /> Settings
              </Button>

              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/billing")}>
                <CreditCard size={18} className="mr-2" /> Billing
              </Button>
            </nav>

            <div className="p-4 border-t mt-auto">
              <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut size={18} className="mr-2" /> Log out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 lg:ml-0">
          <div className="max-w-4xl mx-auto">
            {/* Header with back button */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {activeTab === "account" ? "Account Settings" : "Preferences"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {activeTab === "account"
                    ? "Manage your personal information and preferences"
                    : "Customize your experience"}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </div>

            {/* Navigation Pills for mobile */}
            <div className="lg:hidden mb-6">
              <div className="inline-flex rounded-md shadow-sm border p-1 bg-muted/30 w-full">
                <Button
                  variant={activeTab === "account" ? "secondary" : "ghost"}
                  className="flex-1 rounded-sm"
                  onClick={() => setActiveTab("account")}
                >
                  <User size={16} className="mr-2 md:mr-0 lg:mr-2" />
                  <span className="hidden md:inline">Account</span>
                </Button>
                <Button
                  variant={activeTab === "settings" ? "secondary" : "ghost"}
                  className="flex-1 rounded-sm"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings size={16} className="mr-2 md:mr-0 lg:mr-2" />
                  <span className="hidden md:inline">Settings</span>
                </Button>
              </div>
            </div>

            {activeTab === "account" && (
              <>
                {/* Profile Card */}
                <Card className="mb-6 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-24 relative"></div>

                  <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-12 mb-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-background">
                          <AvatarImage src="../assets/images/sanRoqueLogo.svg" alt="Profile" />
                          <AvatarFallback className="text-2xl">SR</AvatarFallback>
                        </Avatar>
                        <Button
                          size="icon"
                          className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground"
                        >
                          <Camera size={14} />
                        </Button>
                      </div>

                      <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-bold">Roque, San</h2>
                        <p className="text-muted-foreground">Premium Account</p>
                      </div>
                    </div>

                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-muted-foreground flex items-center gap-2 mb-1.5">
                              <User size={14} /> Full Name
                            </Label>
                            <p className="font-medium">Roque, San</p>
                          </div>

                          <div>
                            <Label className="text-muted-foreground flex items-center gap-2 mb-1.5">
                              <Calendar size={14} /> Birthday
                            </Label>
                            <p className="font-medium">January 1, 1999</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-muted-foreground flex items-center gap-2 mb-1.5">
                              <Mail size={14} /> Email Address
                            </Label>
                            <p className="font-medium">sanroque@gmail.com</p>
                          </div>

                          <div>
                            <Label className="text-muted-foreground flex items-center gap-2 mb-1.5">
                              <Lock size={14} /> Password
                            </Label>
                            {isChangingPassword ? (
                              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
                                <div>
                                  <Input type="email" placeholder="Confirm your email" {...register("email")} />
                                  {errors.email?.message && (
                                    <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                                      <AlertCircle size={14} /> {errors.email.message}
                                    </p>
                                  )}
                                </div>

                                {emailVerified && (
                                  <div>
                                    <Input
                                      type="password"
                                      placeholder="Enter new password"
                                      {...register("newPassword")}
                                    />
                                    {errors.newPassword?.message && (
                                      <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                                        <AlertCircle size={14} /> {errors.newPassword.message}
                                      </p>
                                    )}
                                  </div>
                                )}

                                <Button
                                  type="submit"
                                  className="w-full"
                                  variant={emailVerified ? "default" : "outline"}
                                >
                                  {emailVerified ? (
                                    <>
                                      <KeyRound size={16} className="mr-2" />
                                      Change Password
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle size={16} className="mr-2" />
                                      Send Verification Email
                                    </>
                                  )}
                                </Button>
                              </form>
                            ) : (
                              <div className="flex items-center justify-between">
                                <p className="font-medium">••••••••••</p>
                                <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>
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
                <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
                  <Info size={18} className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Only you can see these settings. You might also want to review your settings for
                    <span className="font-medium"> Personal Info, Privacy, Security, and Notifications.</span>
                  </AlertDescription>
                </Alert>
              </>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Notifications Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell size={18} /> Notifications
                    </CardTitle>
                    <CardDescription>Manage how you receive notifications and alerts</CardDescription>
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
                        onToggle={() => setEmailNotifications(!emailNotifications)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive push notifications on your devices</p>
                      </div>
                      <ToggleButton
                        enabled={pushNotifications}
                        onToggle={() => setPushNotifications(!pushNotifications)}
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
                      <ToggleButton enabled={marketingEmails} onToggle={() => setMarketingEmails(!marketingEmails)} />
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield size={18} /> Privacy
                    </CardTitle>
                    <CardDescription>Manage your privacy settings and data sharing preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">Allow others to see your profile information</p>
                      </div>
                      <ToggleButton
                        enabled={profileVisibility}
                        onToggle={() => setProfileVisibility(!profileVisibility)}
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
                      <ToggleButton enabled={dataCollection} onToggle={() => setDataCollection(!dataCollection)} />
                    </div>
                  </CardContent>
                </Card>

                {/* Appearance Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye size={18} /> Appearance
                    </CardTitle>
                    <CardDescription>Customize how the application looks and feels</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun size={16} className={theme === "light" ? "text-amber-500" : "text-muted-foreground"} />
                        <ToggleButton enabled={theme === "dark"} onToggle={toggleTheme} />
                        <Moon size={16} className={theme === "dark" ? "text-blue-500" : "text-muted-foreground"} />
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Compact Mode</Label>
                        <p className="text-sm text-muted-foreground">Display more content with less spacing</p>
                      </div>
                      <ToggleButton enabled={compactMode} onToggle={() => setCompactMode(!compactMode)} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AccountSettings

