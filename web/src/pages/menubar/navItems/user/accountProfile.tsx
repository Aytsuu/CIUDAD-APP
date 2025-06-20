import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import {
  User,
  LogOut,
} from "lucide-react";
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
import CardLayout from "../../../../components/ui/card/card-layout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import sanRoqueLogo  from "@/assets/images/sanRoqueLogo.svg"

export default function AccountProfile(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);


  const handleLogout = () => {
    logout()
    navigate("/home");
    setShowLogoutAlert(false);
  };

  const profileOptions = [
    {
      id: "view-profile",
      name: "Manage your Account",
      icons: <User size={20} />,
      action: () => navigate("/account-view-profile"),
    },
    {
      id: "sign-out",
      name: "Sign out",
      icons: <LogOut size={20} />,
      action: () => setShowLogoutAlert(true),
    },
  ];

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
        src={user?.profile_image || sanRoqueLogo}
        alt="Profile Picture"
        className="h-10 w-10 rounded-full flex-shrink-0 object-cover"
      />
      <div className="flex flex-col max-w-[180px]">
        <p className="font-medium truncate">{user?.username}</p>
        <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
      </div>
    </div>
  );

  return (
    <div>
      <Popover>
        <PopoverTrigger className="flex items-center space-x-2">
          <img
            src={user?.profile_image || sanRoqueLogo}
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
    </div>
  );
}
