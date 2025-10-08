import Demo1 from "@/assets/demo/demo-1.webp";
import { Footer } from "./Footer";
import SanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";
import { Label } from "@/components/ui/label";
import Autoplay from "embla-carousel-autoplay";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 10000, stopOnInteraction: true })
  );

  return (
    <main className="flex-1 bg-[#17294A]">
      <section className="relative w-full h-full flex overflow-x-hidden">
        {/* <img
          src={Demo1}
          className="bg-gray w-full h-full object-cover"
          alt="Barangay landscape"
        /> */}
        <div className="w-full h-full overflow-hidden object-cover">
          <Carousel
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            className="w-full h-full"
          >
            <CarouselContent>
              <CarouselItem key={1} className="basis-full p-0">
                <img
                  src={Demo1}
                  className="bg-gray w-full h-[80%] object-cover"
                  alt="Barangay landscape"
                />
              </CarouselItem>
              <CarouselItem key={2} className="basis-full p-0">
                <img
                  src={Demo1}
                  className="bg-gray w-full h-full object-cover"
                  alt="Barangay landscape"
                />
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#17294A] via-[#17294A]/70 to-transparent animate-in slide-in-from-left duration-700" />{" "}
        {/* Background overlay */}
        <div className="absolute w-1/2 h-1/2 top-[40%] left-1/3 transform -translate-x-1/2 -translate-y-1/2 p-8 rounded-lg flex flex-col items-center z-10">
          <div className="w-full flex items-center mb-10 animate-in slide-in-from-left duration-700 fade-in">
            <div className="flex items-center gap-4 border-b pb-10">
              <img
                src={SanRoqueLogo}
                alt="San Roque Logo"
                className="w-[65px] h-[65px]"
              />
              <div className="flex flex-col text-white">
                <Label className="text-2xl font-poppins font-medium">
                  BARANGAY SAN ROQUE (CIUDAD)
                </Label>
                <Label className="text-md font-poppins">
                  Cebu City, Province of Cebu
                </Label>
              </div>
            </div>
          </div>
          {/* <Separator /> */}
          <div className="flex flex-col animate-in slide-in-from-left duration-700 fade-in">
            <h1 className="text-8xl font-poppins font-bold text-white mb-4">
              Welcome to Our Barangay
            </h1>
            <p className="text-lg text-white/90 mb-6 mt-8 leading-relaxed">
              A community where neighbors help neighbors, families grow
              together, and everyone works to make our barangay a better place
              to live. Welcome home to San Roque (Ciudad).
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
