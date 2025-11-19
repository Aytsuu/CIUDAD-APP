import { Separator } from "@/components/ui/separator";
import CTULogo from '@/assets/images/CTU_logo.png'
import BagongPilipinas from '@/assets/images/bagong_pilipinas.png'
import SanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";
import img1 from "@/assets/images/training_highlights/1.jpeg"
import img2 from "@/assets/images/training_highlights/2.jpg"
import img3 from "@/assets/images/training_highlights/3.jpeg"
import img4 from "@/assets/images/training_highlights/4.jpeg"
import img5 from "@/assets/images/training_highlights/5.jpeg"
import img6 from "@/assets/images/training_highlights/6.jpeg"
import img7 from "@/assets/images/training_highlights/7.jpeg"
import img8 from "@/assets/images/training_highlights/8.jpeg"
import img9 from "@/assets/images/training_highlights/9.jpeg"
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import React from "react";

export default function Featured() {
  // ================ STATE INITIALIZATION ================
  const slide = [img1, img2, img3, img4, img5, img6, img7, img8, img9]
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  // ================ SIDE EFFECTS ================
  React.useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // ================ HANDLERS ================
  const handleImageSelect = (index: number) => {
    api?.scrollTo(index, false)
  }

  // ================ RENDER ================
  return (
    <div className="w-full h-screen bg-[#0F1F3A] overflow-hidden">
      <div className="container mx-auto h-full px-4 lg:px-8 py-8 lg:py-16">
        <div className="w-full lg:w-4/5 mx-auto">
          <div className="flex justify-between items-center gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl font-semibold text-white/90 mb-2">
              BarangayConnect Training
            </h1>
            <div className="flex items-center">
              <img 
                src={SanRoqueLogo}
                className="w-[30px] h-[30px] mr-2"
              />
              <img 
                src={CTULogo}
                className="w-[30px] h-[30px]"
              />
              <img 
                src={BagongPilipinas}
                className="w-[40px] h-[40px]"
              />
            </div>
          </div>
          <Separator className="bg-white/80"/>
          <div className="mt-12">
            <Carousel setApi={setApi}>
              <CarouselContent>
                {slide.map((image: any, index: number) => (
                <CarouselItem className="relative pl-0 md:basis-1/2 lg:basis-1/2">
                  <div className={`absolute bg-black w-full h-full transition-opacity duration-300 ${index == current ? 'opacity-0' : 'opacity-70'}`}/>
                  <img 
                    src={image}
                    className="h-[450px]"
                  />
                </CarouselItem>
              ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            <div className="flex mt-8 overflow-hidden gap-2">
              {slide.map((image: any, index: number) => (
                <img 
                  src={image}
                  className={`w-[100] h-[100px] cursor-pointer ${index == current ? 'border-2 border-blue-500' : ''}`}
                  onClick={() => handleImageSelect(index)}
                /> 
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}