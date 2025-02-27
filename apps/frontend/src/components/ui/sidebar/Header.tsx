import { MessageCircle, Search } from "lucide-react";
import TooltipLayout from "../tooltip/tooltip-layout";


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
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Profile */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <div className="h-6 w-6 rounded-full bg-black"></div>
          <h2 className="text-sm font-medium">Miss u</h2>
        </div>
      </div>
    </header>
  );
}
