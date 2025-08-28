import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ArrowLeft,
  Menu,
  X,
  Settings,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button/button";
import Profile from "./navItems/profile";
import Preferences from "./navItems/account-preference";
import Security from "./navItems/security"; 

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState("personalInfo");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-gray-50 p-4 flex justify-center items-center overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full bg-background"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      <div className="w-full max-w-5xl h-[calc(100vh-40px)] flex flex-col md:flex-row bg-background overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
          md:w-56
          fixed inset-y-0 left-0 z-40 w-64 bg-background transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:h-auto
        `}
        >
          <div className="flex flex-col h-full">
            <div className="p-5 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} />
              </Button>
              <h2 className="font-bold text-xl ">Settings</h2>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <Button
                variant={activeTab === "personalInfo" ? "secondary" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => setActiveTab("personalInfo")}
              >
                <User size={18} className="mr-2" /> Personal Info
              </Button>

              <Button
                variant={activeTab === "security" ? "secondary" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => setActiveTab("security")}
              >
                <Lock size={18} className="mr-2" /> Security
              </Button>
              <Button
                variant={activeTab === "preference" ? "secondary" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => setActiveTab("preference")}
              >
                <Settings size={18} className="mr-2" /> Preferences
              </Button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 h-full overflow-auto">
          <div className="p-6">
            {/* Header with back button */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {activeTab === "personalInfo" 
                    ? "Personal Information" 
                    : activeTab === "security"
                    ? "Security Settings"
                    : "Preferences"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {activeTab === "personalInfo"
                    ? "Manage your personal information and preferences"
                    : activeTab === "security"
                    ? "Manage your security settings"
                    : "Customize your experience"}
                </p>
              </div>
            </div>

            {/* Navigation Pills for mobile */}
            <div className="md:hidden mb-6">
              <div className="inline-flex bg-muted/30 w-full">
                <Button
                  variant={activeTab === "personalInfo" ? "secondary" : "ghost"}
                  className="flex-1"
                  onClick={() => setActiveTab("personalInfo")}
                >
                  <User size={16} className="mr-2" />
                  <span>Personal Info</span>
                </Button>
                <Button
                  variant={activeTab === "security" ? "secondary" : "ghost"}
                  className="flex-1"
                  onClick={() => setActiveTab("security")}
                >
                  <Lock size={16} className="mr-2" />
                  <span>Security</span>
                </Button>
                <Button
                  variant={activeTab === "preference" ? "secondary" : "ghost"}
                  className="flex-1"
                  onClick={() => setActiveTab("preference")}
                >
                  <Settings size={16} className="mr-2" />
                  <span>Preferences</span>
                </Button>
              </div>
            </div>

            {activeTab === "personalInfo" && <Profile/>}
            {activeTab === "security" && <Security/>}
            {activeTab === "preference" && <Preferences/>}
          </div>
        </main>
      </div>
    </div>
  );
};
export default AccountSettings;