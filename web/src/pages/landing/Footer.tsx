import {
  Facebook,
  Twitter,
  Instagram,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { RefObject } from "react";

export const Footer = ({data, homeRef, aboutRef, mobileAppRef, announcementRef, scrollTo} : {
  data: Record<string, any>
  homeRef: RefObject<HTMLDivElement>
  aboutRef: RefObject<HTMLDivElement>
  mobileAppRef: RefObject<HTMLDivElement>
  announcementRef: RefObject<HTMLDivElement>
  scrollTo: (value: RefObject<HTMLDivElement>) => void
}) => {
  return (
    <footer className="bg-[#0F1F3A] text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-3/4 mx-auto flex flex-col md:flex-row justify-between gap-28">
        {/* About Section */}
        <div className="w-full space-y-4">
          <h3 className="text-xl font-bold">Barangay San Roque (Ciudad)</h3>
          <p className="text-gray-300">
            Connecting communities through digital innovation and transparent
            governance
          </p>
        </div>

        {/* Quick Links */}
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <span onClick={() => scrollTo(homeRef)} className="text-gray-300 hover:text-white transition">
                Home
              </span>
            </li>
            <li>
              <span onClick={() => scrollTo(aboutRef)} className="text-gray-300 hover:text-white transition">
                Our Barangay
              </span>
            </li>
            <li>
              <span onClick={() => scrollTo(announcementRef)} className="text-gray-300 hover:text-white transition">
                Announcement
              </span>
            </li>
            <li>
              <span onClick={() => scrollTo(mobileAppRef)} className="text-gray-300 hover:text-white transition">
                Mobile App
              </span>
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
