import { MessageCircle, Search } from "lucide-react";
import SanRoqueLogo from "../../assets/images/sanRoqueLogo.svg";

export function Navbar() {
  return (
    <header className="h-14 bg-white text-[#263D67] flex items-center justify-between px-6 w-full drop-shadow-md">
      <div className="flex items-center space-x-4 text-lg font-semibold cursor-pointer">
        <div className="h-[30px] w-[30px] rounded-full">
          {" "}
          <img src={SanRoqueLogo} alt="Barangay Logo" />{" "}
        </div>
        <p>CIUDAD</p>
      </div>

      <div className="flex-1 mx-6 pl-28 md:shrink-0">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            className="w-2/6 h-9 px-10 py-2 bg-white border-2 border-[#CECECE] rounded-[10px] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-300 hover:rounded-md transition">
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Profile */}
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-full bg-black"></div>
          <h2 className="text-sm font-medium">Miss u</h2>
        </div>
      </div>
    </header>
  );
}
