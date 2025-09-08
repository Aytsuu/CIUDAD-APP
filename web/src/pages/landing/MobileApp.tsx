import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Download,
  Star,
  Users,
  Clock,
  Smartphone,
  Bell,
  MessageSquare,
  Calendar,
  Heart,
  Shield,
  CreditCard,
  BarChart3,
  Play,
  ArrowRight,
  Check,
} from "lucide-react"
import { Footer } from "./Footer"

const features = [
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Quick Document Requests",
    description:
      "Request certificates and clearances with just a few taps. Track your application status in real-time.",
    benefit: "Save time and avoid long queues",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Instant Notifications",
    description: "Get notified about community events, emergency alerts, and important barangay announcements.",
    benefit: "Stay informed and never miss important updates",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Direct Communication",
    description: "Message barangay officials directly, report issues, and get quick responses to your concerns.",
    benefit: "Direct line to your local government",
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Event Management",
    description: "Browse upcoming events, register for activities, and receive reminders for important meetings.",
    benefit: "Never miss community activities",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Health Services",
    description: "Schedule medical consultations, check vaccination schedules, and access health programs.",
    benefit: "Easy access to healthcare services",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Emergency Services",
    description: "One-tap emergency reporting with automatic location sharing and direct hotline access.",
    benefit: "Quick response during emergencies",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Digital Payments",
    description: "Pay fees and taxes securely through the app with multiple payment options available.",
    benefit: "Cashless and convenient transactions",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Service History",
    description: "View your complete service history, download digital copies of documents, and track expenses.",
    benefit: "Organized record keeping",
  },
]

const testimonials = [
  {
    name: "Maria Santos",
    role: "Local Resident",
    comment: "The app made getting my barangay clearance so much easier. No more waiting in long lines!",
    rating: 5,
    avatar: "MS",
  },
  {
    name: "Juan Dela Cruz",
    role: "Business Owner",
    comment: "Perfect for busy entrepreneurs. I can handle all my barangay needs while managing my business.",
    rating: 5,
    avatar: "JD",
  },
  {
    name: "Ana Rodriguez",
    role: "Senior Citizen",
    comment: "Even at my age, the app is so simple to use. My grandchildren taught me and now I love it!",
    rating: 5,
    avatar: "AR",
  },
]

const appBenefits = [
  "Free to download and use",
  "Available in Filipino and English",
  "Works offline for essential features",
  "Regular updates and improvements",
  "24/7 customer support",
  "Secure and encrypted data",
]

export default function MobileApp() {
  return (
    <main className="w-screen h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative w-full h-full">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge
                  variant="secondary"
                  className="bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Now Available for Download
                </Badge>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Your Barangay
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    {" "}
                    in Your Pocket
                  </span>
                </h1>

                <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
                  Access all barangay services anytime, anywhere with our powerful mobile app. Experience government
                  services like never before.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">50K+</div>
                  <div className="text-slate-400 text-sm">Downloads</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-3xl font-bold text-blue-400">
                    4.8
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 ml-1" />
                  </div>
                  <div className="text-slate-400 text-sm">App Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">99%</div>
                  <div className="text-slate-400 text-sm">Uptime</div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white h-14 px-6 rounded-xl">
                  <div className="flex items-center">
                    <Smartphone className="w-6 h-6 mr-3" />
                    <div className="text-left">
                      <div className="text-xs text-gray-300">Download on the</div>
                      <div className="text-base font-bold">App Store</div>
                    </div>
                  </div>
                </Button>

                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white h-14 px-6 rounded-xl">
                  <div className="flex items-center">
                    <Play className="w-6 h-6 mr-3" />
                    <div className="text-left">
                      <div className="text-xs text-green-100">Get it on</div>
                      <div className="text-base font-bold">Google Play</div>
                    </div>
                  </div>
                </Button>
              </div>

              {/* Demo CTA */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Play className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Try Interactive Demo</h3>
                      <p className="text-slate-300 text-sm mb-4">
                        Experience the app's features with our interactive demo
                      </p>
                      <Button
                        variant="outline"
                        className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10 bg-transparent"
                      >
                        Launch Demo
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Phone Mockup */}
            <div className="relative flex justify-center">
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-80 h-[600px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2.5rem] relative overflow-hidden">
                    {/* Status Bar */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-white/30 rounded-full" />

                    {/* App Content */}
                    <div className="flex flex-col items-center justify-center h-full text-white p-8">
                      <div className="text-6xl mb-6">🏛️</div>
                      <h2 className="text-2xl font-bold mb-2">BarangayApp</h2>
                      <p className="text-blue-100 text-center mb-8">Your Local Government Hub</p>

                      {/* Quick Actions Grid */}
                      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                        {[
                          { icon: "📄", label: "Documents" },
                          { icon: "🔔", label: "Alerts" },
                          { icon: "💬", label: "Chat" },
                          { icon: "🆘", label: "Emergency" },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/30 transition-colors"
                          >
                            <div className="text-2xl mb-2">{item.icon}</div>
                            <div className="text-xs font-medium">{item.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notification */}
                    <div className="absolute top-16 right-4 bg-green-500 text-white px-3 py-2 rounded-lg text-xs shadow-lg animate-pulse">
                      <div className="font-semibold">New Update!</div>
                      <div className="text-green-100">Document ready</div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center text-2xl animate-bounce">
                  ⭐
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center text-xl animate-pulse">
                  ⚡
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full h-full py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-blue-400/50 text-blue-400 mb-4">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need in One App</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Streamlined services designed for modern citizens who value efficiency and convenience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-blue-400/50 transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed">{feature.description}</p>
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-400/20">
                    <p className="text-blue-300 text-xs font-medium flex items-center">
                      <Check className="w-3 h-3 mr-2" />
                      {feature.benefit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-blue-400/50 text-blue-400 mb-4">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Loved by Our Community</h2>
            <p className="text-xl text-slate-400">Real feedback from real residents</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{testimonial.name}</h4>
                      <p className="text-slate-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-slate-300 leading-relaxed">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 backdrop-blur-sm border-blue-400/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Barangay Experience?
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of residents who have already revolutionized how they interact with their local
                government
              </p>

              {/* Benefits List */}
              <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
                {appBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-slate-300">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white h-14 px-8 rounded-xl">
                  <Smartphone className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Download on the</div>
                    <div className="text-base font-bold">App Store</div>
                  </div>
                </Button>

                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white h-14 px-8 rounded-xl">
                  <Play className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="text-xs text-green-100">Get it on</div>
                    <div className="text-base font-bold">Google Play</div>
                  </div>
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-6 text-slate-400 text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  50K+ Active Users
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Available 24/7
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </main>
  )
}
