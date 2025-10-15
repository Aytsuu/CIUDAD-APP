import BackgroundPHMap from "@/assets/background/background-ph-map.svg";
import SanRoqueMap from "./SanRoqueMap";

export default function About() {
  return (
    <section className="relative w-full h-full bg-white py-16 overflow-hidden">
      {/* Background Map */}
      <img
        src={BackgroundPHMap}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[35%] opacity-10 pointer-events-none"
        alt="map"
      />

      {/* Content Container */}
      <div className="relative h-full container mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="text-center flex flex-col items-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-darkBlue1 mb-6">
            Our Barangay
          </h1>
          <div className="w-24 h-1 bg-darkBlue1 mx-auto mb-16"></div>
          <div className="flex gap-16">
            <p className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed text-gray-700 mt-16">
              "We take pride in our dedication to serve every resident through
              accessible programs, responsive public services, and active
              community engagement."
            </p>
            <div className="mb-4">
              <img
                src=""
                alt="Barangay Captain"
                className="w-[250px] h-[250px] bg-gray-200 rounded-lg"
              />
              <p className="text-lg font-medium mt-4">Barangay Captain</p>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col items-center mt-8 gap-6">
          <div className="w-4/5">
            <SanRoqueMap />
          </div>

          <div className="w-4/5 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-gray-600">
                Building a stronger, more connected community through innovative
                digital solutions and responsive governance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
              <p className="text-gray-600">
                A progressive barangay where technology empowers citizens and
                transparency builds trust.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-3">Our Values</h3>
              <p className="text-gray-600">
                Integrity, service, innovation, and community-centered
                governance in everything we do.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
