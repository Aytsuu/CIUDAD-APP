import { Footer } from "./Footer";
import BackgroundPHMap from "@/assets/background/background-ph-map.svg";




export default function About() {
  return (
    <main className="w-screen h-screen bg-white">
      <section className="w-full h-full flex justify-center items-center">
        {/* Hero Section */}
        <div className="relative container w-full h-full py-16 justify-center">
          <img
            src={BackgroundPHMap}
            className="absolute z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[35%] opacity-40"
            alt="map"
          />
          <div className="relative container w-full h-full py-16 justify-center z-10">
            <div className="text-center mb-16 z-10">
              <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
                About Our Barangay
              </h1>
              <div className="w-24 h-1 bg-black mx-auto mb-8"></div>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                Connecting communities through digital innovation and
                transparent governance
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center z-10">
              {/* Left Column - What is a Barangay */}
              <div className="space-y-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">
                    What is a Barangay?
                  </h2>
                  <p className=" text-lg leading-relaxed mb-4">
                    A barangay is the smallest administrative division in the
                    Philippines, serving as the basic unit of local government.
                    It represents the heart of Filipino community life, where
                    neighbors become family and collective action drives
                    positive change.
                  </p>
                  <p className=" text-lg leading-relaxed">
                    Our barangay is home to diverse families, local businesses,
                    and community organizations working together to create a
                    safe, prosperous, and inclusive environment for all
                    residents.
                  </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-6 z-10">
                  <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-6 text-center border border-blue-400/30">
                    <div className="text-3xl font-bold text-blue-500 mb-2">
                      2,500+
                    </div>
                    <div className=" font-medium">Residents</div>
                  </div>
                  <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-6 text-center border border-blue-400/30">
                    <div className="text-3xl font-bold text-blue-500 mb-2">
                      650+
                    </div>
                    <div className=" font-medium">Households</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Our Digital Platform */}
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 border border-blue-400">
                  <h2 className=" text-white text-2xl md:text-3xl font-bold mb-6">
                    Our Digital Platform
                  </h2>
                  <p className="text-white text-lg leading-relaxed mb-6">
                    This website serves as your digital gateway to barangay
                    services, making government processes more accessible,
                    transparent, and efficient for every resident.
                  </p>

                  {/* Services List */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full"/>
                      <span className="text-white">
                        Online document requests and certificates
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full"/>
                      <span className="text-white">
                        Community announcements and updates
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full"/>
                      <span className="text-white">
                        Event registration and scheduling
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full"/>
                      <span className="text-white">
                        Direct communication with barangay officials
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mission Statement */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                  <p className="leading-relaxed text-lg">
                    To foster a connected, informed, and empowered community
                    through innovative digital solutions that make barangay
                    services accessible to all residents, promoting transparency
                    and civic engagement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full h-1/2 flex justify-center items-center">
        {/* Call to Action */}
        <div className="text-center">
          <div className="p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Get Involved in Your Community
            </h3>
            <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
              Join us in building a stronger, more connected barangay. Explore
              our services, stay informed, and be part of positive change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                Explore Services
              </button>
              <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
