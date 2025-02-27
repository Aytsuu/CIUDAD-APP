import { Check, MailOpen } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card/card";
import { Button } from "../button";
import CardLayout from "../card/card-layout";

export function Navbar() {
  return (
    <header className="h-14 bg-white text-[#263D67] flex items-center justify-between px-6 w-full drop-shadow-md">
      <div className="flex items-center space-x-4 text-lg font-semibold cursor-pointer">
        <div className="h-[30px] w-[30px] rounded-full">
          {/* <img src={sanRoqueLogo} alt="Barangay Logo" />{" "} */}
        </div>
        <p>CIUDAD</p>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-300 hover:rounded-md transition">
          <Popover>
            <PopoverTrigger className="flex items-center">
              <MailOpen size={22} />
            </PopoverTrigger>
            <PopoverContent className="absolute right-0 top-2">
              <CardLayout cardHeader="" cardDescription="" cardContent="" />
              <Card className="w-[25rem]">
                <CardHeader className="flex items-start">
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>You have 3 unread messages.</CardDescription>
                </CardHeader>
                <hr />
                <CardContent className="gap-4 mt-2">
                  <div className="flex items-center">
                    <div className="flex space-y-1 items-center gap-x-3">
                      <div className="w-10 h-10 rounded-full bg-black"></div>
                      <div>
                        <p className="flex text-sm font-medium leading-none items-center gap-x-2">
                          Sef{" "}
                          <span className="flex text-sm text-muted-foreground">
                            Updated his profile picture
                          </span>
                        </p>
                        <p className="flex text-sm text-muted-foreground">
                          25 mins. ago
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    <Check />
                    Mark all as read
                  </Button>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
        </button>

        {/* Profile */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <Popover>
            <PopoverTrigger className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-black"></div>
              <h2 className="text-sm font-medium">Miss u</h2>
            </PopoverTrigger>
            <PopoverContent>
              <CardLayout cardHeader="" cardDescription="" cardContent="" />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
