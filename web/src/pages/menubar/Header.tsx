import ciudadLogo from "@/assets/images/ciudad_logo.svg"
import AccountProfile from "./navItems/user/accountProfile";
// import { NotificationBell } from "./navItems/notification/notification_bell";
import { useNavigate } from "react-router";

export function Header() {
  const navigate = useNavigate();
  return (
    <>
      <header className="w-full h-14 bg-white text-[#263D67] flex items-center justify-between px-6 drop-shadow-md">
        <div className="flex items-center space-x-4 text-lg font-semibold cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={ciudadLogo}
            alt="Barangay Logo"
            className="w-[70px]"
          />
        </div>
        

        <div className="flex items-center space-x-4">
          {/* <NotificationBell /> */}
          <AccountProfile />
        </div>
      </header>
    </>
  );
}
