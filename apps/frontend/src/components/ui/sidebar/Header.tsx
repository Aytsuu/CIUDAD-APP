import { Check, MailOpen, User, Settings, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Button } from "../button";
import CardLayout from "../card/card-layout";
import sanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";

export function Navbar() {
  const profileOptions = [
    {
      title: "View Profile",
      icons: <User />,
    },
    {
      title: "Settings",
      icons: <Settings />,
    },
    {
      title: "Sign out",
      icons: <LogOut />,
    },
  ];

  const notificationPopover = (
    <div>
      <hr className="pb-2"/>
      <div className="flex items-center p-2 hover:bg-lightBlue cursor-pointer">
        <div className="flex space-y-1 items-center gap-x-4">
          <img src={sanRoqueLogo} alt="Barangay Logo" className="w-10 h-10"/>
          <div>
            <p className="flex text-sm font-medium leading-none items-center gap-x-2">
              Sef
              <span className="flex text-sm font-sans text-muted-foreground">
                Updated his profile picture
              </span>
            </p>
            <p className="flex text-sm text-muted-foreground">25 mins. ago</p>
          </div>
        </div>
      </div>
      <Button className="w-full mt-4">
        <Check />
        Mark all as read
      </Button>
    </div>
  );

  const profilePopoverContent = (
    <div>
      <hr className="pb-2"/>
      {profileOptions.map((item, index) => (
        <div
          key={index}
          className="flex gap-x-4 p-2 hover:bg-lightBlue hover:bg-gray-100 rounded-md cursor-pointer text-darkGray"
        >
          {item.icons}
          <p>{item.title}</p>
        </div>
      ))}
    </div>
  );

  const profilePopOverHeaderDesc = (
    <div>
      <div className="flex items-center gap-x-2">
        <img src={sanRoqueLogo} alt="Barangay Logo" className="h-12 w-12" />
        <div className="flex flex-col">
          <p className="text-lg font-medium text-black">Paolo Araneta</p>
          <p>paoloAraneta@gmail.com</p>
        </div>
      </div>
    </div>
  );

  return (
    <header className="w-full h-14 bg-white text-[#263D67] flex items-center justify-between px-6 drop-shadow-md">
      <div className="flex items-center space-x-4 text-lg font-semibold cursor-pointer">
        <div className="h-[30px] w-[30px] rounded-full">
          <img src={sanRoqueLogo} alt="Barangay Logo" />
        </div>
        <p>CIUDAD</p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger className="flex items-center">
            <MailOpen size={22} />
          </PopoverTrigger>
          <PopoverContent className="absolute right-0 top-2">
            <CardLayout
              cardClassName="w-[25rem]"
              cardHeaderClassName="pb-2"
              cardTitle="Notifications"
              cardDescription="You have 1 unread message"
              cardContentClassName="gap-4 mt-2 pb-4"
              cardContent={notificationPopover}
            />
          </PopoverContent>
        </Popover>

        {/*  Profile Popover */}
        <Popover>
          <PopoverTrigger className="flex items-center space-x-2">
            <img src={sanRoqueLogo} alt="Barangay Logo" />
            <h2 className="hidden sm:block text-sm font-medium">Paolo Araneta</h2>
          </PopoverTrigger>
          <PopoverContent className="absolute right-0 top-2">
            <CardLayout
              cardClassName="w-[18rem]"
              cardHeaderClassName="pb-2"
              cardTitle=""
              cardDescription={profilePopOverHeaderDesc}
              cardContentClassName="gap-4 mt-2 pb-4"
              cardContent={profilePopoverContent}
            />
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
