import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import { ArrowRight, Check } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 space-y-5">
      <section className="w-full h-full flex">
        <div className="w-full h-full px-4 md:px-6">
            <div className="w-full h-full grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit">
                    🚀 New Feature Launch
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Build Amazing Products Faster Than Ever
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Transform your ideas into reality with our powerful platform. Join thousands of creators who trust
                    us to bring their vision to life.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="h-12 px-8">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" className="h-12 px-8 bg-background text-foreground">
                    Watch Demo
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Free 14-day trial</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  alt="Hero"
                  className="aspect-video overflow-hidden rounded-xl object-cover shadow-2xl"
                  height="400"
                  src="/placeholder.svg?height=400&width=600"
                  width="600"
                />
              </div>
            </div>
          </div>
      </section>
    </main>
  );
}
