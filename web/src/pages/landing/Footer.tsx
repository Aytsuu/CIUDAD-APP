import {
  Facebook,
  Twitter,
  Instagram,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export const Footer = ({data} : {
  data: Record<string, any>
}) => {
  return (
    <footer className="bg-[#0F1F3A] text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-3/4 mx-auto flex justify-between gap-28">
        {/* About Section */}
        <div className="w-full space-y-4">
          <h3 className="text-xl font-bold">Barangay San Roque (Ciudad)</h3>
          <p className="text-gray-300">
            Connecting communities through digital innovation and transparent
            governance
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-300 hover:text-white">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-gray-300 hover:text-white transition">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-300 hover:text-white transition">
                Our Barangay
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-300 hover:text-white transition">
                Announcement
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-300 hover:text-white transition">
                Mobile App
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3">
            <li className="flex items-start space-x-2">
              <MapPin className="h-5 w-5 mt-0.5 text-gray-300" />
              <span className="text-gray-300">
                {data?.address}
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-gray-300" />
              <span className="text-gray-300">{data?.contact}</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-gray-300" />
              <span className="text-gray-300">{data?.email}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-700 text-center text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} Barangay San Roque (Ciudad). All rights reserved.
        </p>
      </div>
    </footer>
  );
};
