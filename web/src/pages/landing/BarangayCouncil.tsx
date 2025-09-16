 import React from "react";
import { Footer } from "./Footer";
import { useBrgyCouncil } from "./queries/landingFetchQueries";


export default function BarangayCouncil() {
  const { data: brgyCouncil } = useBrgyCouncil();

  const brgyCaptain = React.useMemo(() => brgyCouncil?.find((member: any) => 
    member.position.toLowerCase() == 'barangay captain'
  ), [brgyCouncil]);

  const filteredMembers = React.useMemo(() => brgyCouncil?.filter((member: any) => 
    member.position.toLowerCase() !== 'barangay captain'
  ), [brgyCouncil]);

  const committees = [
    {
      name: "Committee on Health",
      chair: "Juan dela Cruz",
      focus:
        "Healthcare services, sanitation, and environmental health programs",
      members: 3,
    },
    {
      name: "Committee on Education",
      chair: "Rosa Mendoza",
      focus: "Educational support, youth development, and scholarship programs",
      members: 3,
    },
    {
      name: "Committee on Peace & Order",
      chair: "Roberto Reyes",
      focus: "Public safety, security measures, and emergency response",
      members: 4,
    },
    {
      name: "Committee on Social Services",
      chair: "Carmen Flores",
      focus:
        "Welfare programs, senior citizen support, and community assistance",
      members: 3,
    },
    {
      name: "Committee on Infrastructure",
      chair: "Antonio Garcia",
      focus: "Public works, road maintenance, and facility development",
      members: 3,
    },
    {
      name: "Committee on Agriculture",
      chair: "Elena Bautista",
      focus:
        "Agricultural development, livelihood programs, and economic growth",
      members: 3,
    },
  ];

  return (
    <main className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen">
        <div className="py-16 md:py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Barangay Council
            </h1>
            <div className="w-24 h-1 bg-blue-400 mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed">
              Meet your elected officials dedicated to serving our community
              with transparency and excellence
            </p>
          </div>

          {/* Council Overview */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-blue-500/20 rounded-xl p-6 text-center border border-blue-400/30">
              <div className="text-4xl mb-4">🗳️</div>
              <div className="text-2xl font-bold text-blue-300 mb-2">
                Elected 2023
              </div>
              <div className="text-blue-100">Democratic mandate</div>
            </div>
            <div className="bg-blue-500/20 rounded-xl p-6 text-center border border-blue-400/30">
              <div className="text-4xl mb-4">👥</div>
              <div className="text-2xl font-bold text-blue-300 mb-2">
                9 Officials
              </div>
              <div className="text-blue-100">Serving our community</div>
            </div>
            <div className="bg-blue-500/20 rounded-xl p-6 text-center border border-blue-400/30">
              <div className="text-4xl mb-4">⏰</div>
              <div className="text-2xl font-bold text-blue-300 mb-2">
                3-Year Term
              </div>
              <div className="text-blue-100">2023-2026</div>
            </div>
          </div>

          {/* Barangay Captain - Featured */}
          <div className="">
            <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl p-8 md:p-12 border border-blue-400/30">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="text-8xl lg:text-9xl">
                  <img src={brgyCaptain?.photo_url} />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
                    {brgyCaptain?.name}
                  </h2>
                  <p className="text-xl text-black mb-4">
                    {brgyCaptain?.position}
                  </p>
                  <p className="text-black mb-6 leading-relaxed">
                    Leading our barangay with dedication and vision, ensuring
                    that every resident's voice is heard and every community
                    need is addressed with care and efficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Council Members Grid */}
          <div className="grid justify-center items-center py-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Council Members
            </h2>
            <div className="container grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers?.map((member: any, index:number) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300"
                >
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3">{member.image}</div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-300 text-sm font-medium mb-2">
                      {member.position}
                    </p>
                    <span className="inline-block bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-xs border border-blue-400/30">
                      {member.term}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <h4 className="text-white font-medium text-sm mb-2">
                        Key Responsibilities:
                      </h4>
                      <ul className="text-blue-100 text-xs space-y-1">
                        
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="text-blue-200 text-xs">
                        📧 {member.contact}
                      </div>
                      <div className="text-blue-200 text-xs">
                        🕒 {member.schedule}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Committees Section */}
      <section className="w-full bg-white/5">
        <div className="px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Standing Committees
              </h2>
              <p className="text-blue-100 text-lg max-w-3xl mx-auto">
                Specialized committees focused on specific areas of community
                development and governance
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {committees.map((committee, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <h3 className="text-xl font-bold text-white mb-3">
                    {committee.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-blue-200">
                      <span className="text-blue-400 mr-2">👤</span>
                      <span className="text-sm">Chair: {committee.chair}</span>
                    </div>
                    <div className="flex items-center text-blue-200">
                      <span className="text-blue-400 mr-2">👥</span>
                      <span className="text-sm">
                        {committee.members} Members
                      </span>
                    </div>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      {committee.focus}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Meeting Schedule */}
            <div className="mt-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl p-8 border border-blue-400/30">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Council Meetings
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-300 mb-4">
                      Regular Session
                    </h4>
                    <div className="space-y-2 text-blue-100">
                      <p>📅 Every 2nd Monday of the month</p>
                      <p>🕒 7:00 PM - 9:00 PM</p>
                      <p>📍 Barangay Hall Conference Room</p>
                      <p>👥 Open to the public</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-blue-300 mb-4">
                      Special Session
                    </h4>
                    <div className="space-y-2 text-blue-100">
                      <p>📅 As needed for urgent matters</p>
                      <p>🕒 Time varies by agenda</p>
                      <p>📍 Barangay Hall or designated venue</p>
                      <p>📢 Announced 48 hours in advance</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                    View Meeting Schedule
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-12 text-center">
              <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Connect with Your Officials
                </h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Your barangay council is here to serve you. Don't hesitate to
                  reach out with your concerns, suggestions, or questions about
                  our community.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                    Schedule a Meeting
                  </button>
                  <button className="bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                    Send a Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
