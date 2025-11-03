import { useState } from "react";
import { Bell, Shield, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button/button";

export default function Preferences() {
  // Toggle states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);

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
    <div className="space-y-6 px-52">
      <div className="">
        <h1 className="text-2xl font-semibold text-gray-700">User Preferences</h1>
        <p className="text-gray-500 text-sm">Customize your account settings and notifications.</p>
      </div>
      {/* Notifications Settings */}
      <Card>
        <CardHeader className="">
          <CardTitle className="flex text-xl items-center gap-2">
            Notifications
          </CardTitle>
          <CardDescription className="pb-4">
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
              onToggle={() => setEmailNotifications(!emailNotifications)}
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
            <ToggleButton
              enabled={dataCollection}
              onToggle={() => setDataCollection(!dataCollection)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
