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
      <div className="flex items-center">
        <div className="flex space-y-1 items-center gap-x-4">
          <div className="w-10 h-10 rounded-full bg-black"></div>
          <div>
            <p className="flex text-sm font-medium leading-none items-center gap-x-4">
              Sef{" "}
              <span className="flex text-sm text-muted-foreground">
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
      <hr />
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
        <div className="w-9 h-9 bg-black rounded-full"></div>
        <div className="flex flex-col">
          <p className="text-lg font-medium text-black">Paolo Araneta</p>
          <p>paoloAraneta@gmail.com</p>
        </div>
      </div>
    </div>
  );

  return (
    <header className="h-14 bg-white text-[#263D67] flex items-center justify-between px-6 w-full drop-shadow-md">
      <div className="flex items-center space-x-4 text-lg font-semibold cursor-pointer">
        <div className="h-[30px] w-[30px] rounded-full">
          <img src={sanRoqueLogo} alt="Barangay Logo" />{" "}
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
              cardTitle="Notifications"
              cardDescription="You have 3 unread messages."
              cardContentClassName="gap-4 mt-2"
              cardContent={notificationPopover}
            />
          </PopoverContent>
        </Popover>

        {/*  Profile Popover */}
        <Popover>
          <PopoverTrigger className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-black"></div>
            <h2 className="text-sm font-medium">paoloAraneta@gmail.com</h2>
          </PopoverTrigger>
          <PopoverContent className="absolute right-0 top-2">
            <CardLayout
              cardClassName="w-[18rem]"
              cardTitle=""
              cardDescription={profilePopOverHeaderDesc}
              cardContentClassName="gap-4 mt-2"
              cardContent={profilePopoverContent}
            />
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
