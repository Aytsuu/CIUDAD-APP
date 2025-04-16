import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { CheckCheck, MailOpen, Ellipsis } from "lucide-react";
import CardLayout from "../../../../components/ui/card/card-layout";
import DropdownLayout from "../../../../components/ui/dropdown/dropdown-layout";
import type { Notification } from "./types-notification";
import { useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function AccNotification(): JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notificationPopover = (
    <div>
      <hr className="mb-2" />
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="flex items-center p-3 hover:bg-lightBlue hover:rounded-md cursor-pointer"
        >
          <img
            src={notif.profile_image || "/default-profile.png"}
            alt="User Avatar"
            className="w-10 h-10"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <p className="text-sm font-semibold">{notif.sender}</p>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
              </div>
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {dayjs(notif.created_at).fromNow()}
            </p>
          </div>
        </div>
      ))}
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
  
  return (
    <div>
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
    </div>
  );
}
