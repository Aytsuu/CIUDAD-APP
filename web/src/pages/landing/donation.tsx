"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Users, GraduationCap, Stethoscope, Utensils, CreditCard, Smartphone, Building2 } from "lucide-react"
import { Footer } from "./Footer"

const donationCategories = [
  {
    id: "education",
    title: "Education Support",
    description: "School supplies, scholarships, and learning materials",
    icon: GraduationCap,
    raised: 45000,
    goal: 100000,
    color: "bg-blue-500",
  },
  {
    id: "healthcare",
    title: "Healthcare Services",
    description: "Medical supplies, health programs, and emergency care",
    icon: Stethoscope,
    raised: 32000,
    goal: 80000,
    color: "bg-green-500",
  },
  {
    id: "infrastructure",
    title: "Infrastructure",
    description: "Road repairs, lighting, and community facilities",
    icon: Building2,
    raised: 28000,
    goal: 150000,
    color: "bg-orange-500",
  },
  {
    id: "food",
    title: "Food Security",
    description: "Feeding programs and emergency food assistance",
    icon: Utensils,
    raised: 18000,
    goal: 60000,
    color: "bg-red-500",
  },
]

const presetAmounts = [100, 250, 500, 1000, 2500, 5000]

export default function Donation() {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [donationAmount, setDonationAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount.toString())
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setDonationAmount(value)
  }

  const totalRaised = donationCategories.reduce((sum, cat) => sum + cat.raised, 0)
  const totalGoal = donationCategories.reduce((sum, cat) => sum + cat.goal, 0)

  return (
    <main className="flex-1 bg-[#17294A]">
      {/* Hero Section */}
      <section className="relative w-full py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white">Support Our Barangay</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Help us build a stronger, more resilient community. Your donation directly impacts the lives of families
              in our barangay through education, healthcare, infrastructure, and food security programs.
            </p>

            {/* Overall Progress */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-left">
                    <p className="text-white font-semibold">Community Goal Progress</p>
                    <p className="text-blue-200 text-sm">
                      ₱{totalRaised.toLocaleString()} raised of ₱{totalGoal.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    {Math.round((totalRaised / totalGoal) * 100)}% Complete
                  </Badge>
                </div>
                <Progress value={(totalRaised / totalGoal) * 100} className="h-3" />
                <div className="flex items-center mt-4 text-blue-200">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="text-sm">1,247 families served • 3,891 community members impacted</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Donation Categories */}
      <section className="py-16 px-4 bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Choose Your Impact Area</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {donationCategories.map((category) => {
              const Icon = category.icon
              const progress = (category.raised / category.goal) * 100

              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedCategory === category.id
                      ? "ring-2 ring-blue-400 bg-white/15"
                      : "bg-white/10 hover:bg-white/15"
                  } border-white/20 backdrop-blur-sm`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8 text-blue-300" />
                      <Badge variant="outline" className="text-xs border-white/30 text-white">
                        {Math.round(progress)}%
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg">{category.title}</CardTitle>
                    <CardDescription className="text-blue-200 text-sm">{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-blue-200">
                        <span>₱{category.raised.toLocaleString()}</span>
                        <span>₱{category.goal.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-white text-center">Make Your Donation</CardTitle>
              <CardDescription className="text-blue-200 text-center">
                Every peso counts towards building a better community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Amount Selection */}
              <div>
                <Label className="text-white text-lg mb-4 block">Select Donation Amount</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={donationAmount === amount.toString() ? "default" : "outline"}
                      className={`h-12 ${
                        donationAmount === amount.toString()
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "border-white/30 text-white hover:bg-white/10"
                      }`}
                      onClick={() => handleAmountSelect(amount)}
                    >
                      ₱{amount}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="custom-amount" className="text-white">
                    Custom Amount:
                  </Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-blue-200"
                  />
                </div>
              </div>

              <Separator className="bg-white/20" />

              {/* Payment Method */}
              <div>
                <Label className="text-white text-lg mb-4 block">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2 p-4 rounded-lg border border-white/30 hover:bg-white/5">
                      <RadioGroupItem value="gcash" id="gcash" />
                      <Label htmlFor="gcash" className="flex items-center text-white cursor-pointer">
                        <Smartphone className="h-5 w-5 mr-2 text-blue-400" />
                        GCash
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 rounded-lg border border-white/30 hover:bg-white/5">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center text-white cursor-pointer">
                        <CreditCard className="h-5 w-5 mr-2 text-blue-400" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 rounded-lg border border-white/30 hover:bg-white/5">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank" className="flex items-center text-white cursor-pointer">
                        <Building2 className="h-5 w-5 mr-2 text-blue-400" />
                        Bank Transfer
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator className="bg-white/20" />

              {/* Donor Information */}
              <div>
                <Label className="text-white text-lg mb-4 block">Donor Information</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={donorInfo.name}
                      onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                      className="bg-white/10 border-white/30 text-white placeholder:text-blue-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={donorInfo.email}
                      onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                      className="bg-white/10 border-white/30 text-white placeholder:text-blue-200"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={donorInfo.phone}
                      onChange={(e) => setDonorInfo({ ...donorInfo, phone: e.target.value })}
                      className="bg-white/10 border-white/30 text-white placeholder:text-blue-200"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-white">
                      Message (Optional)
                    </Label>
                    <Textarea
                      id="message"
                      value={donorInfo.message}
                      onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                      className="bg-white/10 border-white/30 text-white placeholder:text-blue-200"
                      placeholder="Leave a message of support"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Donation Summary */}
              {donationAmount && (
                <Card className="bg-blue-600/20 border-blue-400/30">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold mb-2">Donation Summary</h3>
                    <div className="flex justify-between items-center text-white">
                      <span>Amount:</span>
                      <span className="text-xl font-bold">
                        ₱{Number.parseInt(donationAmount || "0").toLocaleString()}
                      </span>
                    </div>
                    {selectedCategory && (
                      <div className="flex justify-between items-center text-blue-200 mt-1">
                        <span>Category:</span>
                        <span>{donationCategories.find((cat) => cat.id === selectedCategory)?.title}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4"
                disabled={!donationAmount || !paymentMethod || !donorInfo.name || !donorInfo.email}
              >
                <Heart className="h-5 w-5 mr-2" />
                Donate ₱{Number.parseInt(donationAmount || "0").toLocaleString()}
              </Button>

              <p className="text-blue-200 text-sm text-center">
                Your donation is secure and will be processed safely. You will receive a confirmation email with your
                donation receipt.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 px-4 bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Your Impact in Action</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-center">
              <CardContent className="p-6">
                <GraduationCap className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Education</h3>
                <p className="text-blue-200 text-sm">₱500 provides school supplies for 5 students for one month</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-center">
              <CardContent className="p-6">
                <Stethoscope className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Healthcare</h3>
                <p className="text-blue-200 text-sm">₱1,000 covers basic medical checkups for 10 community members</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-center">
              <CardContent className="p-6">
                <Utensils className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Food Security</h3>
                <p className="text-blue-200 text-sm">₱250 provides nutritious meals for a family of 4 for one week</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
