import MobileHome from "@/assets/images/m_home.jpg";
import MobileLanding from "@/assets/images/m_landing.jpg";
import MobileSignup from "@/assets/images/m_signup.jpg";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function MobileApp() {
  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20 overflow-hidden">
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
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
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
                <svg
                  className="w-6 h-6 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
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
                <svg
                  className="w-6 h-6 text-rose-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
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
