import Demo1 from "@/assets/demo/demo-1.webp"
import { Button } from "@/components/ui/button/button";
import { MoveRight } from "lucide-react";
import { Footer } from "./Footer";

export default function Home() {
  return (
    <main className="flex-1 bg-[#17294A]">
      <section className="relative w-full h-full flex">
          <img src={Demo1} className="bg-gray w-full h-full object-cover" alt="Barangay landscape"/>
          <div className="absolute w-1/2 h-1/2 bg-white/90 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 rounded-lg flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-[#17294A] mb-4">Welcome to Our Barangay</h1>
            <p className="text-lg text-gray-700 mb-6">
              A peaceful and vibrant community dedicated to progress, unity, and the well-being of all residents. 
              Join us in building a better future together.
            </p>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-[#17294A]">Our Services</h2>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Community assistance programs</li>
                <li>Health and wellness initiatives</li>
                <li>Youth development activities</li>
                <li>Environmental protection projects</li>
              </ul>
            </div>
            <Button className="w-32 mt-5">
              Learn More <MoveRight className="ml-2 h-4 w-4"/>
            </Button>
          </div>
      </section>
      <Footer/>
    </main>
  );
}