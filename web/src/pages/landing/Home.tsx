import SanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";
import { Label } from "@/components/ui/label";
import Autoplay from "embla-carousel-autoplay";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { MediaUploadType } from "@/components/ui/media-upload";

export default function Home({ carousel }: { carousel: MediaUploadType }) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <div className="relative w-full h-full bg-[#17294A] overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0 w-full h-full">
        <Carousel
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          className="hidden lg:block"
        >
          <CarouselContent>
            {carousel.map((file: any) => (
              <CarouselItem key={file.name} className="basis-full p-0">
                <img
                  src={file.url}
                  className="w-full h-full object-cover"
                  alt="Barangay landscape"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#17294A] via-[#17294A]/70 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <div className="w-full max-w-[90rem] flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="lg:hidden flex-shrink-0 mb-10">
            <img
              src={SanRoqueLogo}
              alt="San Roque Logo"
              className="w-[250px] h-[250px]"
              style={{
                border: "5px solid transparent",
                borderRadius: "100%",
                backgroundImage:
                  "linear-gradient(white, white), conic-gradient(from 225deg, #3b82f6 92deg, #3b82f6 0deg, #fbbf24 90deg, #fbbf24 177deg, #ef4444 90deg, #ef4444 315deg, #3b82f6 90deg)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                boxShadow:
                  "-30px 0 40px rgba(59, 130, 246, 0.6), -50px 0 60px rgba(59, 130, 246, 0.4), 0 -30px 40px rgba(251, 191, 36, 0.6), 0 -50px 60px rgba(251, 191, 36, 0.4), 30px 0 40px rgba(239, 68, 68, 0.6), 50px 0 60px rgba(239, 68, 68, 0.4)",
              }}
            />
          </div>
          {/* Text Content */}
          <div className="flex-1 flex flex-col">
            <div className="items-center gap-4 hidden lg:flex">
              <div className="flex flex-col text-white">
                <Label className="text-2xl font-poppins font-medium">
                  BARANGAY SAN ROQUE (CIUDAD)
                </Label>
                <Label className="text-md font-poppins text-white/90">
                  Cebu City, Province of Cebu
                </Label>
              </div>
            </div>

            <div
              className="w-24 h-2 hidden lg:block rounded-full mt-6 mb-14"
              style={{
                background:
                  "linear-gradient(to right, #3b82f6, #ef4444, #eab308)",
              }}
            />

            <h1 className="text-7xl font-poppins font-bold text-white mb-6 leading-[70px]">
              Welcome to Our Barangay
            </h1>
            <p className="text-lg text-white/90 leading-relaxed max-w-2xl">
              A community where neighbors help neighbors, families grow
              together, and everyone works to make our barangay a better place
              to live. Welcome to San Roque (Ciudad).
            </p>
          </div>

          {/* Logo */}
          <div className="hidden lg:block lg:flex-shrink-0">
            <img
              src={SanRoqueLogo}
              alt="San Roque Logo"
              className="w-[300px] h-[300px]"
              style={{
                border: "5px solid transparent",
                borderRadius: "100%",
                backgroundImage:
                  "linear-gradient(white, white), conic-gradient(from 225deg, #3b82f6 92deg, #3b82f6 0deg, #fbbf24 90deg, #fbbf24 177deg, #ef4444 90deg, #ef4444 315deg, #3b82f6 90deg)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                boxShadow:
                  "-30px 0 40px rgba(59, 130, 246, 0.6), -50px 0 60px rgba(59, 130, 246, 0.4), 0 -30px 40px rgba(251, 191, 36, 0.6), 0 -50px 60px rgba(251, 191, 36, 0.4), 30px 0 40px rgba(239, 68, 68, 0.6), 50px 0 60px rgba(239, 68, 68, 0.4)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}