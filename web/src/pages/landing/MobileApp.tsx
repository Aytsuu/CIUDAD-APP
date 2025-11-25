  import MobileHome from "@/assets/images/m_home.jpg";
import MobileLanding from "@/assets/images/m_landing.jpg";
import MobileSignup from "@/assets/images/m_signup.jpg";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AlertTriangle, BellRing, FileText } from "lucide-react";

export default function MobileApp() {
  return (
    <section className="relative w-full min-h-screen bg-blue-950 py-20 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
            Download Our App
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Access barangay services anytime, anywhere with our mobile
            application
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mt-8 rounded-full"></div>
        </div>

        {/* Main Content */}
        <div className="grid gap-12 items-center max-w-6xl mx-auto mb-16">
          {/* Feature List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <BellRing className="text-blue-500"/>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Real-time Notifications
              </h3>
              <p className="text-slate-300">
                Get instant updates on announcements, events, and emergencies
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <FileText className="text-green-500"/>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Document Requests
              </h3>
              <p className="text-slate-300">
                Request barangay certificates and clearances on-the-go
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-rose-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle  className="text-red-500"/>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Emergency Reports
              </h3>
              <p className="text-slate-300">
                Report emergencies and incidents quickly and efficiently
              </p>
            </div>
          </div>

          <ScrollArea className="w-full">
            <div className="flex justify-center min-w-max px-4 gap-16 pb-4">
              {/* Phone Frame 1 */}
              <div className="relative w-64 h-[542px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-700 overflow-hidden flex-shrink-0">
                <img
                  src={MobileLanding}
                  className="rounded-[1.5rem] w-full h-full object-cover"
                  alt="Mobile Landing"
                />
              </div>

              {/* Phone Frame 2 */}
              <div className="relative w-64 h-[542px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-700 overflow-hidden flex-shrink-0">
                <img
                  src={MobileSignup}
                  className="rounded-[1.5rem] w-full h-full object-cover"
                  alt="Mobile Signup"
                />
              </div>

              {/* Phone Frame 3 */}
              <div className="relative w-64 h-[542px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-700 overflow-hidden flex-shrink-0">
                <img
                  src={MobileHome}
                  className="rounded-[1.5rem] w-full h-full object-cover"
                  alt="Mobile Home"
                />
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </section>
  );
}
