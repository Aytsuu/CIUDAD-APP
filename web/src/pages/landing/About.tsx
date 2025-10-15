import { useEffect, useRef, useState } from "react";
import BackgroundPHMap from "@/assets/background/background-ph-map.svg";
import SanRoqueMap from "./SanRoqueMap";

export default function About() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [isQuoteVisible, setIsQuoteVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isCardsVisible, setIsCardsVisible] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const headerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsHeaderVisible(true);
        }
      });
    }, observerOptions);

    const quoteObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsQuoteVisible(true);
        }
      });
    }, observerOptions);

    const mapObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsMapVisible(true);
        }
      });
    }, observerOptions);

    const cardsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsCardsVisible(true);
        }
      });
    }, observerOptions);

    if (headerRef.current) headerObserver.observe(headerRef.current);
    if (quoteRef.current) quoteObserver.observe(quoteRef.current);
    if (mapRef.current) mapObserver.observe(mapRef.current);
    if (cardsRef.current) cardsObserver.observe(cardsRef.current);

    return () => {
      headerObserver.disconnect();
      quoteObserver.disconnect();
      mapObserver.disconnect();
      cardsObserver.disconnect();
    };
  }, []);

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
          <div
            ref={headerRef}
            className={`transition-all duration-700 ${
              isHeaderVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-3xl md:text-5xl font-bold text-darkBlue1 mb-6">
              Our Barangay
            </h1>
            <div className="w-24 h-1 bg-darkBlue1 mx-auto mb-16" />
          </div>

          <div
            ref={quoteRef}
            className={`flex gap-16 transition-all duration-700 delay-200 ${
              isQuoteVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
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
          <div
            ref={mapRef}
            className={`w-4/5 transition-all duration-700 delay-300 ${
              isMapVisible
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
          >
            <SanRoqueMap />
          </div>

          <div
            ref={cardsRef}
            className={`w-4/5 grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 delay-500 ${
              isCardsVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div
              className={`bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-500 ${
                isCardsVisible ? "delay-100" : ""
              }`}
            >
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-gray-600">
                Building a stronger, more connected community through innovative
                digital solutions and responsive governance.
              </p>
            </div>

            <div
              className={`bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-500 ${
                isCardsVisible ? "delay-200" : ""
              }`}
            >
              <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
              <p className="text-gray-600">
                A progressive barangay where technology empowers citizens and
                transparency builds trust.
              </p>
            </div>

            <div
              className={`bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-500 ${
                isCardsVisible ? "delay-300" : ""
              }`}
            >
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