import sanRoqueLogo  from "@/assets/images/sanRoqueLogo.svg"
import AccNotification from "./navItems/notification/accNotification";
import AccountProfile from "./navItems/user/accountProfile";

export function Header() {
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
          <AccNotification />
          <AccountProfile />
        </div>
      </header>
    </>
  );
}
