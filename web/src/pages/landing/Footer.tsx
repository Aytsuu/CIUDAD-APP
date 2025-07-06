import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[#0F1F3A] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Barangay Name</h3>
            <p className="text-gray-300">
              Committed to serving our community with integrity, transparency, and compassion.
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
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Services</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">News & Events</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition">Barangay Clearance</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Business Permit</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Health Services</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Community Programs</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Document Requests</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 mt-0.5 text-gray-300" />
                <span className="text-gray-300">123 Barangay Street, City, Province</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-gray-300" />
                <span className="text-gray-300">(123) 456-7890</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-300" />
                <span className="text-gray-300">info@barangayname.gov</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Barangay Name. All rights reserved.</p>
        </div>
      </footer>
  )
}