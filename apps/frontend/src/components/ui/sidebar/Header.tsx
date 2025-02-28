import {
  CheckCheck,
  MailOpen,
  User,
  Settings,
  LogOut,
  Ellipsis,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import CardLayout from "../card/card-layout";
import sanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";
import DropdownLayout from "../dropdown/dropdown-layout";

export function Navbar() {
  const profileOptions = [
    {
      id: "view-profile",
      name: "View Profile",
      icons: <User size={20} />,
    },
    {
      id: "settings",
      name: "Settings",
      icons: <Settings size={20} />,
    },
    {
      id: "sign-out",
      name: "Sign out",
      icons: <LogOut size={20} />,
    },
  ];

  const notificationPopover = (
    <div>
      <hr className="mb-2" />
      <div className="flex items-center p-3 hover:bg-lightBlue hover:rounded-md cursor-pointer">
        <img src={sanRoqueLogo} alt="Barangay Logo" className="w-10 h-10" />
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
      {/* Left Section */}
      <div className="flex items-center gap-x-2">
        <p className="text-base font-medium text-black">Notifications</p>
        <p className="flex items-center justify-center text-xs font-semibold text-white bg-red-500 w-5 h-5 rounded-full">
          1
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center">
        <DropdownLayout
          label={
            <div className="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 cursor-pointer hover:text-white hover:bg-darkBlue2">
              <Ellipsis size={16} />
            </div>
          }
          contentClassName="p-2"
          options={[
            {
              id: "mark-as-read",
              name: "Mark as Read",
              icons: <CheckCheck size={16} />,
            },
          ]}
          onChange={(id) => console.log(`Selected: ${id}`)}
        />
      </div>
    </div>
  );

  const profilePopoverContent = (
    <div>
      <hr className="pb-2" />
      {profileOptions.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-x-4 p-2 hover:bg-lightBlue hover:bg-gray-100 rounded-md cursor-pointer text-darkGray text-sm font-sans"
        >
          {item.icons}
          <p>{item.name}</p>
        </div>
      ))}
    </div>
  );

  const profilePopOverHeaderDesc = (
    <div className="flex items-center gap-x-2">
      <img src={sanRoqueLogo} alt="Barangay Logo" className="h-10 w-10" />
      <div className="flex flex-col">
        <p className="text-base font-medium text-black">Paolo Araneta</p>
        <p>paoloAraneta@gmail.com</p>
      </div>
    </div>
  );

  const handleOptionSelect = (id: string) => {
    // Add the logic here based on the selected option
  };

  return (
    <header className="w-full h-14 bg-white text-[#263D67] flex items-center justify-between px-6 drop-shadow-md">
      <div className="flex items-center space-x-4 text-lg font-semibold cursor-pointer">
        <div className="h-[30px] w-[30px] rounded-full">
          <img src={sanRoqueLogo} alt="Barangay Logo" />
        </div>
        <p>CIUDAD</p>
      </div>

      <div className="flex items-center space-x-4">
        <Popover>
          <PopoverTrigger className="relative flex items-center">
            <MailOpen size={22} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </PopoverTrigger>
          <PopoverContent className="absolute right-0 top-2 p-0 w-80">
            <CardLayout
              cardClassName="px-2"
              cardHeaderClassName="p-2"
              cardDescription={notificationPopoverHeader}
              cardContentClassName="p-0"
              cardContent={notificationPopover}
            />
          </PopoverContent>
        </Popover>

        {/*  Profile Popover */}
        <Popover>
          <PopoverTrigger className="flex items-center space-x-2">
            <img src={sanRoqueLogo} alt="Barangay Logo" />
            <h2 className="hidden sm:block text-sm font-medium">
              Paolo Araneta gwapa
            </h2>
          </PopoverTrigger>
          <PopoverContent className="absolute right-0 top-2 p-0">
            <CardLayout
              cardClassName="w-[16rem]"
              cardHeaderClassName="pb-0 pt-2"
              cardDescription={profilePopOverHeaderDesc}
              cardContentClassName="gap-4 mt-2 pb-2"
              cardContent={profilePopoverContent}
            />
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}