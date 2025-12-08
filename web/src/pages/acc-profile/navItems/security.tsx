import { useState } from "react";
import {
  Shield,
  Key,
  Smartphone,
  Mail,
  LogOut,
  Eye,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Bell,
  Smartphone as Device,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Security() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: "Chrome on Windows", location: "Manila, PH", lastActive: "Just now", current: true },
    { id: 2, device: "Safari on iPhone", location: "Cebu, PH", lastActive: "2 hours ago", current: false },
    { id: 3, device: "Firefox on Mac", location: "Davao, PH", lastActive: "1 day ago", current: false },
  ]);
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    emailNotifications: true,
    loginAlerts: true,
    suspiciousActivityAlerts: true,
    showMaskedInfo: true,
  });

  const handleLogoutAll = async () => {
    setIsLoading(true);
    try {
      // API call to logout all devices
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Logged out from all other devices");
      // Keep only current session
      setActiveSessions(prev => prev.filter(session => session.current));
    } catch (error) {
      toast.error("Failed to logout all devices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSecuritySettings(prev => ({ 
        ...prev, 
        twoFactorAuth: !prev.twoFactorAuth 
      }));
      toast.success(
        securitySettings.twoFactorAuth 
          ? "Two-factor authentication disabled" 
          : "Two-factor authentication enabled"
      );
    } catch (error) {
      toast.error("Failed to update 2FA settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = (sessionId: number) => {
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    toast.success("Session revoked");
  };

  const handleChangePassword = () => {
    toast.info("Password change feature coming soon");
  };

  const handleSetup2FA = () => {
    toast.info("2FA setup wizard coming soon");
  };

  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px] bg-white/50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Loading security settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-52">
      {/* Header */}
      <div className="">
        <h1 className="text-2xl font-semibold text-gray-700">Security</h1>
        <p className="text-gray-500 text-sm">
          Manage your account security, privacy, and authentication settings.
        </p>
      </div>

      {/* Security Status Card */}
      <Card className="border-darkBlue1 bg-gradient-to-r from-darkBlue1 to-darkBlue2 text-white overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-white">Security Status</CardTitle>
                <CardDescription className="text-white/80">
                  Review and improve your account security
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${securitySettings.twoFactorAuth ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
                  {securitySettings.twoFactorAuth ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-white/70">
                    {securitySettings.twoFactorAuth 
                      ? "Protects against unauthorized access" 
                      : "Add an extra layer of security"}
                  </p>
                </div>
              </div>
              <Button
                variant={securitySettings.twoFactorAuth ? "outline" : "default"}
                size="sm"
                onClick={securitySettings.twoFactorAuth ? handleToggle2FA : handleSetup2FA}
                disabled={isLoading}
                className={`${securitySettings.twoFactorAuth 
                  ? 'border-white/30 text-white hover:bg-white/10' 
                  : 'bg-white text-darkBlue1 hover:bg-white/90'}`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : securitySettings.twoFactorAuth ? (
                  "Disable"
                ) : (
                  "Enable"
                )}
              </Button>
            </div>

            <Separator className="bg-white/20" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg">
                <Device className="w-8 h-8 mb-2" />
                <p className="font-semibold">Active Sessions</p>
                <p className="text-sm text-white/70">{activeSessions.length} devices</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogoutAll}
                  disabled={isLoading}
                  className="mt-2 text-white hover:bg-white/20"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Logout All"
                  )}
                </Button>
              </div>

              <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg">
                <Bell className="w-8 h-8 mb-2" />
                <p className="font-semibold">Security Alerts</p>
                <p className="text-sm text-white/70">
                  {securitySettings.loginAlerts ? "Enabled" : "Disabled"}
                </p>
                <Switch 
                  checked={securitySettings.loginAlerts}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, loginAlerts: checked }))
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout for Security Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Authentication Methods */}
        <Card className="border-darkBlue1">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-darkBlue1 rounded-full">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Authentication Methods</CardTitle>
                <CardDescription>
                  Manage how you sign in to your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Authentication */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <Badge variant="outline" className="mt-1 bg-green-50 text-green-700">
                    Primary
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>

            {/* Phone Authentication */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Phone Number</p>
                  <p className="text-sm text-gray-500">
                    {user.phone ? user.phone : "Not set up"}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                {user.phone ? "Change" : "Add"}
              </Button>
            </div>

            {/* 2FA Setup */}
            <div className={`p-4 rounded-lg ${securitySettings.twoFactorAuth ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${securitySettings.twoFactorAuth ? 'bg-green-100' : 'bg-amber-100'}`}>
                    <ShieldAlert className={`w-5 h-5 ${securitySettings.twoFactorAuth ? 'text-green-600' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">
                      {securitySettings.twoFactorAuth 
                        ? "Protects against unauthorized access" 
                        : "Add an extra layer of security"}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={handleToggle2FA}
                  disabled={isLoading}
                />
              </div>
              {!securitySettings.twoFactorAuth && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSetup2FA}
                  className="mt-3 w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Set Up 2FA
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Privacy Settings */}
        <Card className="border-darkBlue1">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-darkBlue1 rounded-full">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Control your privacy and security preferences
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Security Notifications */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Security Notifications</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Login Alerts</p>
                  <p className="text-sm text-gray-500">Get notified of new logins</p>
                </div>
                <Switch 
                  checked={securitySettings.loginAlerts}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, loginAlerts: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Suspicious Activity</p>
                  <p className="text-sm text-gray-500">Alerts for unusual activity</p>
                </div>
                <Switch 
                  checked={securitySettings.suspiciousActivityAlerts}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, suspiciousActivityAlerts: checked }))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Privacy Options */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Privacy Options</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Mask Personal Info</p>
                  <p className="text-sm text-gray-500">Show masked email/phone in public</p>
                </div>
                <Switch 
                  checked={securitySettings.showMaskedInfo}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, showMaskedInfo: checked }))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Account Recovery */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Account Recovery</h3>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Recovery Email</p>
                    <p className="text-sm text-gray-600">
                      {user.email} <span className="text-green-600">• Verified</span>
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleChangePassword}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card className="border-darkBlue1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-darkBlue1 rounded-full">
                <Device className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Devices currently logged into your account
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {activeSessions.length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div 
                key={session.id} 
                className={`flex items-center justify-between p-4 rounded-lg border ${session.current ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${session.current ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Device className={`w-5 h-5 ${session.current ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device}</p>
                      {session.current && (
                        <Badge className="bg-blue-500 hover:bg-blue-600">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{session.location}</span>
                      <span>•</span>
                      <span>Last active: {session.lastActive}</span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Security Tip</p>
                <p className="text-sm text-amber-700">
                  Log out from devices you don't recognize or no longer use. 
                  Consider enabling two-factor authentication for added security.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-800">Danger Zone</CardTitle>
              <CardDescription className="text-red-700">
                Irreversible actions that affect your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
            <div>
              <p className="font-medium text-red-800">Log Out of All Devices</p>
              <p className="text-sm text-red-700">
                This will log you out from all devices except this one
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleLogoutAll}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out All
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
            <div>
              <p className="font-medium text-red-800">Delete Account</p>
              <p className="text-sm text-red-700">
                Permanently delete your account and all data
              </p>
            </div>
            <Button 
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={() => toast.error("Account deletion must be confirmed via email")}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">
          Security settings last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}