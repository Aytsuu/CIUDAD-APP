import { useState } from "react";
import {
  CheckCheck,
  MailOpen,
  User,
  Settings,
  LogOut,
  Ellipsis,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CardLayout from "../card/card-layout";
import sanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";
import DropdownLayout from "../dropdown/dropdown-layout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const navigate = useNavigate();
  const {user, logout} = useAuth();

  const profileOptions = [
    {
      id: "view-profile",
      name: "Manage your Account",
      icons: <User size={20} />,
      action: () => navigate("/account-view-profile"),
    },
    {
      id: "settings",
      name: "Settings",
      icons: <Settings size={20} />,
      action: () => navigate("/account-settings"),
    },
    {
      id: "sign-out",
      name: "Sign out",
      icons: <LogOut size={20} />,
      action: () => setShowLogoutAlert(true),
    },
  ];

  const notificationPopover = (
    <div>
      <hr className="mb-2" />
      <div className="flex items-center p-3 hover:bg-lightBlue hover:rounded-md cursor-pointer">
        <img
          src={user?.profile_image || "Profile Picture"}
          alt="Barangay Logo"
          className="w-10 h-10"
        />
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <p className="text-sm font-semibold">Sef</p>
              <p className="text-sm text-muted-foreground">
                Waiting for Approval
              </p>
            </div>
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">25 mins. ago</p>
        </div>
      </div>
    </div>
  );

  const notificationPopoverHeader = (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-x-2">
        <p className="text-base font-medium text-black">Notifications</p>
        <p className="flex items-center justify-center text-xs font-semibold text-white bg-red-500 w-5 h-5 rounded-full">
          1
        </p>
      </div>
      <div className="flex items-center">
        <DropdownLayout
          trigger={
            <div className="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 cursor-pointer hover:text-white hover:bg-darkBlue2">
              <Ellipsis size={16} />
            </div>
          }
          contentClassName="p-2"
          options={[
            {
              id: "mark-as-read",
              name: "Mark as Read",
              icon: <CheckCheck size={16} />,
            },
          ]}
          onSelect={(id: any) => console.log(`Selected: ${id}`)}
        />
      </div>
    </div>
  );

  const handleLogout = () => {
    
    logout()

    // Redirect to login page
    navigate("/home");
    setShowLogoutAlert(false);
  };

  const profilePopoverContent = (
    <div>
      <hr className="pb-2" />
      {profileOptions.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-x-4 p-2 hover:bg-lightBlue hover:bg-gray-100 rounded-md cursor-pointer text-darkGray text-sm font-sans"
          onClick={item.action}
        >
          {item.icons}
          <p>{item.name}</p>
        </div>
      ))}
    </div>
  );
  

  const profilePopOverHeaderDesc = (
    <div className="flex items-center gap-x-2">
      <img
        src={user?.profile_image || "Profile Picture"}
        alt="Profile Picture"
        className="h-10 w-10 rounded-full flex-shrink-0 object-cover"
      />
      <div className="flex flex-col max-w-[180px]">
        <p className="font-medium truncate">
          {user?.username}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {user?.email}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <header className="w-full h-14 bg-white text-[#263D67] flex items-center justify-between px-6 drop-shadow-md">
        <div className="flex items-center space-x-4 text-lg font-semibold cursor-pointer">
          <div className="h-[30px] w-[30px] rounded-full">
            <img
              src={sanRoqueLogo}
              alt="Barangay Logo"
              className="rounded-full"
            />
          </div>
          <p>CIUDAD</p>
        </div>

        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger className="relative flex items-center">
              <MailOpen size={22} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </PopoverTrigger>
            <PopoverContent className="absolute right-0 top-2 p-0 w-80 z-50 bg-white rounded-md shadow-lg">
              <CardLayout
                cardClassName="px-2"
                headerClassName="p-2"
                description={notificationPopoverHeader}
                contentClassName="p-0"
                content={notificationPopover}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger className="flex items-center space-x-2">
              <img
                src={user?.profile_image || "Profile Picture"}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <h2 className="hidden sm:block text-sm font-medium">
                {user?.username}
              </h2>
            </PopoverTrigger>
            <PopoverContent className="absolute right-0 top-2 p-0 w-64 z-50 bg-white rounded-md shadow-lg">
              <CardLayout
                cardClassName="w-full"
                headerClassName="pb-0 pt-2 px-4"
                description={profilePopOverHeaderDesc}
                contentClassName="gap-4 mt-2 pb-2 px-2"
                content={profilePopoverContent}
              />
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You'll need to log in again to
              access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
