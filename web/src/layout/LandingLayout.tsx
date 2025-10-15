import { Label } from "@/components/ui/label";
import { Link } from "react-router";
import { FaFacebook, FaPhoneAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import SignIn from "@/pages/landing/signin/signin";
import CebuCitySeal from "@/assets/images/cebucity_seal.svg";
import SanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";
import { BadgeCheck } from "lucide-react";
import Home from "@/pages/landing/Home";
import About from "@/pages/landing/About";
import Announcements from "@/pages/landing/Announcements";
import MobileApp from "@/pages/landing/MobileApp";
import React from "react";
import { Footer } from "@/pages/landing/Footer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function LandingLayout() {
  const { user } = useAuth();
  const homeRef = React.useRef<HTMLDivElement>(null);
  const aboutRef = React.useRef<HTMLDivElement>(null);
  const announcementRef = React.useRef<HTMLDivElement>(null);
  const healthRef = React.useRef<HTMLDivElement>(null);
  const mobileAppRef = React.useRef<HTMLDivElement>(null);

  const NavItemList = [
    { path: homeRef, title: "Home" },
    { path: aboutRef, title: "Our Barangay" },
    { path: announcementRef, title: "Announcement" },
    { path: mobileAppRef, title: "Mobile App" },
  ];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      homeRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);

    return () => clearTimeout(timer);
  }, [])

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full min-h-screen bg-snow">
      {/* Fixed Headers Container */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Top Header */}
        <header className="w-full bg-darkBlue1 flex justify-center px-4 py-3">
          <div className="w-[90%] text-white/80 flex items-center gap-5">
            <Label className="font-poppins border-r-2 pr-4 flex items-center gap-1">
              <BadgeCheck size={16} className="fill-green-600" /> The Official
              Website of Barangay San Roque (Ciudad)
            </Label>
            <div className="flex gap-3">
              <FaFacebook className="hover:text-white cursor-pointer" 
                onClick={() => {
                  window.open('https://www.facebook.com/brgysanroqueciudad', '_black')
                }}
              />
              <Popover>
                <PopoverTrigger>
                  <FaPhoneAlt className="hover:text-white cursor-pointer" />
                </PopoverTrigger>
                <PopoverContent>
                  
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <img
            src={CebuCitySeal}
            alt="Cebu city official seal"
            className="w-[30px] h-[30px]"
          />
        </header>
        {/* Main Header */}
        <header className="w-full bg-white flex justify-center shadow-lg">
          <div className="w-full h-full flex justify-between items-center">
            <div className="w-1/3 h-full flex items-center slope-right p-3 bg-[#1273B8]">
              <div className="w-full flex justify-center items-center gap-3">
                <img
                  src={SanRoqueLogo}
                  alt="San Roque Logo"
                  className="w-[50px] h-[50px]"
                />
                <div className="grid text-white">
                  <Label className="text-[15px]">
                    BARANGAY SAN ROQUE (CIUDAD)
                  </Label>
                  <Label className="font-poppins">Cebu City</Label>
                </div>
              </div>
            </div>
            {/* Navigation */}
            <nav className="w-1/2 flex items-center gap-3">
              {NavItemList.map(({ path, title }) => (
                <div key={title} onClick={() => scrollTo(path)}>
                  <Label className="p-[10px] rounded-lg hover:bg-lightBlue cursor-pointer">
                    {title}
                  </Label>
                </div>
              ))}
              {user?.staff?.staff_id ? (
                <Link to={"/dashboard"}>
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <DialogLayout
                  trigger={<Button>Sign in</Button>}
                  className="p-0 m-0 border-0 bg-transparent shadow-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-0 focus:shadow-none max-w-none w-auto h-auto"
                  mainContent={<SignIn />}
                />
              )}
            </nav>
          </div>
        </header>
      </div>

      {/* Spacer to push content below fixed headers */}
      <div className="h-[120px]"></div>

      {/* Scrollable Page Content */}
      <main className="w-full">
        <section 
          ref={homeRef}
          className="w-full h-screen flex justify-center items-center"
        >
          <Home/>
        </section>
        <section 
          ref={aboutRef}
          className="w-full h-[150vh] flex justify-center items-center"
        >
          <About/>
        </section>
        <section 
          ref={announcementRef}
          className="w-full min-h-screen flex justify-center items-center"
        >
          <Announcements/>
        </section>
        <section 
          ref={mobileAppRef}
          className="w-full min-h-screen flex justify-center items-center"
        >
          <MobileApp/>
        </section>
        <Footer/>
      </main>
    </div>
  );
}