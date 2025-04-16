import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ArrowLeft,
  Menu,
  X,
  Settings,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button/button";

import Profile from "./navItems/profile";
import Preferences from "./navItems/account-preference";

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState("account");
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
          className="rounded-full bg-background shadow-md"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      <div className="w-full max-w-5xl h-[calc(100vh-40px)] flex flex-col md:flex-row bg-background rounded-xl shadow-md overflow-hidden">
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
            <div className="p-5 border-b flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} />
              </Button>
              <h2 className="font-bold text-xl">Settings</h2>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <Button
                variant={activeTab === "account" ? "secondary" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => setActiveTab("account")}
              >
                <User size={18} className="mr-2" /> Account
              </Button>

              <Button
                variant={activeTab === "settings" ? "secondary" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => setActiveTab("settings")}
              >
                <Settings size={18} className="mr-2" /> Preferences
              </Button>
            </nav>

            {/* <div className="p-4 border-t mt-auto">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} className="mr-2" /> Log out
              </Button>
            </div> */}
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
                <Profile/>
            )}

            {activeTab === "settings" && (
              <Preferences/>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
export default AccountSettings;
