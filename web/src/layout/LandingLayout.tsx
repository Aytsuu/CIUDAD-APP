import { Label } from "@/components/ui/label";
import { Link, Outlet } from "react-router";
import { FaFacebook, FaPhoneAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import SignIn from "@/pages/landing/signin/signin";
import CebuCitySeal from "@/assets/images/cebucity_seal.svg";
import { BadgeCheck } from "lucide-react";

const NavItemList = [
  { path: "/home", title: "Home" },
  { path: "/about", title: "About" },
  { path: "/announcements", title: "Announcement" },
  { path: "/health", title: "Health" },
  { path: "/mobile-app", title: "Mobile App" },
];

export default function LandingLayout() {
  const { user } = useAuth();
  return (
    <div className="w-screen h-screen bg-snow overflow-hidden flex flex-col">
      {/* Fixed Headers Container */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Top Header */}
        <header className="w-full bg-darkBlue1 flex justify-center px-4 py-3">
          <div className="w-[90%] text-white/80 flex items-center gap-5">
            <Label className="font-poppins border-r-2 pr-4 flex items-center gap-1">
               <BadgeCheck size={16} className="fill-green-600" /> The Official Website of Barangay San Roque (Ciudad)
            </Label>
            <div className="flex gap-3">
              <FaFacebook className="hover:text-white cursor-pointer" />
              <FaPhoneAlt className="hover:text-white cursor-pointer" />
            </div>
          </div>
          <img
            src={CebuCitySeal}
            alt="San Roque Logo"
            className="w-[30px] h-[30px]"
          />
        </header>
        {/* Main Header */}
        <header className="w-full bg-white flex justify-center shadow-lg">
          <div className="w-full h-full flex justify-center items-center py-4">
            {/* Navigation */}
            <nav className="flex items-center gap-3">
              {NavItemList.map(({ path, title }) => (
                <Link key={path} to={path}>
                  <Label className="p-[10px] rounded-lg hover:bg-lightBlue cursor-pointer">
                    {title}
                  </Label>
                </Link>
              ))}
              {user?.staff?.staff_id ? (
                <Link to={"/dashboard"}>
                  <Button>Dashboard</Button>
                </Link> 
              ) : (
              <DialogLayout
                trigger={<Button>Sign in</Button>}
                className="p-0 m-0 border-0 bg-transparent shadow-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-0 focus:shadow-none max-w-none w-auto h-auto"
                mainContent={
                  <SignIn/>
                }
              />
              )}
            </nav>
          </div>
        </header>
        <header>

        </header>
      </div>

      {/* Spacer to push content below fixed headers */}
      <div className="h-[120px]"></div>

      {/* Scrollable Page Content */}
      <section className="flex-1 overflow-y-auto w-full flex justify-center bg-[#17294A]">
        <Outlet />
      </section>
    </div>
  );
}
