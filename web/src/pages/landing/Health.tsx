"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import {
  Heart,
  Stethoscope,
  CalendarIcon,
  Clock,
  Phone,
  MapPin,
  Users,
  Baby,
  Shield,
  Activity,
  UserCheck,
  AlertTriangle,
  Thermometer,
  SmileIcon as Tooth,
  Syringe,
  HeartHandshake,
  BookOpen,
  Ambulance,
} from "lucide-react"
import { Footer } from "./Footer"

const healthServices = [
  {
    id: "general",
    title: "General Consultation",
    description: "Basic medical checkups, diagnosis, and treatment of common illnesses",
    icon: Stethoscope,
    available: "Mon-Sat, 8:00 AM - 5:00 PM",
    fee: "Free",
    color: "bg-blue-500",
  },
  {
    id: "maternal",
    title: "Maternal & Child Health",
    description: "Prenatal care, immunization, family planning, and child health services",
    icon: Baby,
    available: "Mon-Fri, 8:00 AM - 4:00 PM",
    fee: "Free",
    color: "bg-pink-500",
  },
  {
    id: "immunization",
    title: "Immunization Program",
    description: "Vaccines for children and adults, including COVID-19 vaccination",
    icon: Syringe,
    available: "Tue, Thu, Sat - 9:00 AM - 3:00 PM",
    fee: "Free",
    color: "bg-green-500",
  },
  {
    id: "dental",
    title: "Dental Services",
    description: "Basic dental checkups, cleaning, tooth extraction, and oral health education",
    icon: Tooth,
    available: "Mon, Wed, Fri - 9:00 AM - 4:00 PM",
    fee: "₱50-200",
    color: "bg-yellow-500",
  },
  {
    id: "laboratory",
    title: "Laboratory Services",
    description: "Basic lab tests including blood sugar, blood pressure monitoring, urinalysis",
    icon: Activity,
    available: "Mon-Fri, 8:00 AM - 12:00 PM",
    fee: "₱20-100",
    color: "bg-purple-500",
  },
  {
    id: "emergency",
    title: "Emergency Care",
    description: "First aid, emergency treatment, and referral to higher medical facilities",
    icon: Ambulance,
    available: "24/7",
    fee: "Free",
    color: "bg-red-500",
  },
]

const healthPrograms = [
  {
    title: "Hypertension Control Program",
    description: "Regular blood pressure monitoring and medication for hypertensive patients",
    participants: 245,
    icon: Heart,
  },
  {
    title: "Diabetes Management",
    description: "Blood sugar monitoring, dietary counseling, and medication management",
    participants: 128,
    icon: Thermometer,
  },
  {
    title: "Tuberculosis DOTS Program",
    description: "Directly Observed Treatment Short-course for TB patients",
    participants: 32,
    icon: Shield,
  },
  {
    title: "Mental Health Support",
    description: "Counseling services and mental health awareness programs",
    participants: 89,
    icon: HeartHandshake,
  },
]

const healthStats = [
  { label: "Registered Patients", value: "3,247", icon: Users },
  { label: "Monthly Consultations", value: "892", icon: Stethoscope },
  { label: "Immunizations Given", value: "1,456", icon: Syringe },
  { label: "Emergency Cases", value: "67", icon: AlertTriangle },
]

const staffMembers = [
  {
    name: "Dr. Maria Santos",
    position: "Municipal Health Officer",
    specialization: "Family Medicine",
    schedule: "Mon-Fri, 8:00 AM - 5:00 PM",
  },
  {
    name: "Nurse Jane Dela Cruz",
    position: "Public Health Nurse",
    specialization: "Community Health",
    schedule: "Mon-Sat, 7:00 AM - 4:00 PM",
  },
  {
    name: "Dr. Robert Garcia",
    position: "Dentist",
    specialization: "General Dentistry",
    schedule: "Mon, Wed, Fri - 9:00 AM - 4:00 PM",
  },
  {
    name: "Midwife Rosa Reyes",
    position: "Rural Health Midwife",
    specialization: "Maternal Care",
    schedule: "Mon-Fri, 8:00 AM - 4:00 PM",
  },
]

export default function Health() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [appointmentForm, setAppointmentForm] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    reason: "",
  })

  return (
    <main className="flex-1 bg-[#17294A]">
      {/* Hero Section */}
      <section className="relative w-full py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white">Barangay Health Center</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Providing quality healthcare services to our community. Your health is our priority - accessible,
              affordable, and comprehensive medical care for all residents.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {healthStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <Icon className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-blue-200">{stat.label}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-white/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Health Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthServices.map((service) => {
              const Icon = service.icon
              return (
                <Card
                  key={service.id}
                  className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-8 w-8 text-blue-300" />
                      <Badge variant="outline" className="text-green-300 border-green-300">
                        {service.fee}
                      </Badge>
                    </div>
                    <CardTitle className="text-white">{service.title}</CardTitle>
                    <CardDescription className="text-blue-200">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-blue-200">
                        <Clock className="h-4 w-4 mr-2" />
                        {service.available}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="appointment" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
              <TabsTrigger value="appointment" className="text-white data-[state=active]:bg-blue-600">
                Book Appointment
              </TabsTrigger>
              <TabsTrigger value="programs" className="text-white data-[state=active]:bg-blue-600">
                Health Programs
              </TabsTrigger>
              <TabsTrigger value="staff" className="text-white data-[state=active]:bg-blue-600">
                Our Staff
              </TabsTrigger>
              <TabsTrigger value="info" className="text-white data-[state=active]:bg-blue-600">
                Health Info
              </TabsTrigger>
            </TabsList>

            {/* Appointment Booking */}
            <TabsContent value="appointment" className="mt-8">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Book an Appointment
                    </CardTitle>
                    <CardDescription className="text-blue-200">
                      Schedule your visit to our health center
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-white">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          value={appointmentForm.name}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, name: e.target.value })}
                          className="bg-white/10 border-white/30 text-white placeholder:text-blue-200"
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-white">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          value={appointmentForm.phone}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                          className="bg-white/10 border-white/30 text-white placeholder:text-blue-200"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Service Needed *</Label>
                      <Select
                        value={appointmentForm.service}
                        onValueChange={(value) => setAppointmentForm({ ...appointmentForm, service: value })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/30 text-white">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {healthServices.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Preferred Date *</Label>
                        <Input
                          type="date"
                          value={appointmentForm.date}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                          className="bg-white/10 border-white/30 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Preferred Time *</Label>
                        <Select
                          value={appointmentForm.time}
                          onValueChange={(value) => setAppointmentForm({ ...appointmentForm, time: value })}
                        >
                          <SelectTrigger className="bg-white/10 border-white/30 text-white">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8:00">8:00 AM</SelectItem>
                            <SelectItem value="9:00">9:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="13:00">1:00 PM</SelectItem>
                            <SelectItem value="14:00">2:00 PM</SelectItem>
                            <SelectItem value="15:00">3:00 PM</SelectItem>
                            <SelectItem value="16:00">4:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reason" className="text-white">
                        Reason for Visit
                      </Label>
                      <Textarea
                        id="reason"
                        value={appointmentForm.reason}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                        className="bg-white/10 border-white/30 text-white placeholder:text-blue-200"
                        placeholder="Briefly describe your concern"
                        rows={3}
                      />
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Contact & Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-white">
                        <MapPin className="h-5 w-5 mr-3 text-blue-300" />
                        <div>
                          <div className="font-semibold">Address</div>
                          <div className="text-blue-200 text-sm">123 Barangay Road, Municipality, Province</div>
                        </div>
                      </div>

                      <div className="flex items-center text-white">
                        <Phone className="h-5 w-5 mr-3 text-blue-300" />
                        <div>
                          <div className="font-semibold">Phone</div>
                          <div className="text-blue-200 text-sm">(02) 123-4567 / 0917-123-4567</div>
                        </div>
                      </div>

                      <div className="flex items-center text-white">
                        <Clock className="h-5 w-5 mr-3 text-blue-300" />
                        <div>
                          <div className="font-semibold">Operating Hours</div>
                          <div className="text-blue-200 text-sm">
                            Mon-Fri: 8:00 AM - 5:00 PM
                            <br />
                            Saturday: 8:00 AM - 12:00 PM
                            <br />
                            Sunday: Emergency Only
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                      <div className="flex items-center text-red-300 mb-2">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Emergency Hotline</span>
                      </div>
                      <div className="text-white text-lg font-bold">911 or (02) 911-1234</div>
                      <div className="text-red-200 text-sm">Available 24/7 for medical emergencies</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Health Programs */}
            <TabsContent value="programs" className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                {healthPrograms.map((program, index) => {
                  const Icon = program.icon
                  return (
                    <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Icon className="h-8 w-8 text-blue-300" />
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                            {program.participants} participants
                          </Badge>
                        </div>
                        <CardTitle className="text-white">{program.title}</CardTitle>
                        <CardDescription className="text-blue-200">{program.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                        >
                          Learn More
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* Staff Information */}
            <TabsContent value="staff" className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                {staffMembers.map((staff, index) => (
                  <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <UserCheck className="h-8 w-8 text-blue-300" />
                        </div>
                        <div>
                          <CardTitle className="text-white">{staff.name}</CardTitle>
                          <CardDescription className="text-blue-200">{staff.position}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-white">
                          <span className="font-semibold">Specialization:</span>
                          <span className="text-blue-200 ml-2">{staff.specialization}</span>
                        </div>
                        <div className="text-white">
                          <span className="font-semibold">Schedule:</span>
                          <span className="text-blue-200 ml-2">{staff.schedule}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Health Information */}
            <TabsContent value="info" className="mt-8">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Health Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-blue-200 text-sm">
                      • Drink at least 8 glasses of water daily
                      <br />• Exercise for 30 minutes, 3 times a week
                      <br />• Get 7-8 hours of sleep every night
                      <br />• Eat 5 servings of fruits and vegetables daily
                      <br />• Wash hands frequently with soap and water
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Prevention Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-blue-200 text-sm">
                      • Regular health checkups and screenings
                      <br />• Keep vaccinations up to date
                      <br />• Practice safe food handling
                      <br />• Maintain good personal hygiene
                      <br />• Avoid smoking and excessive alcohol
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      When to Seek Help
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-blue-200 text-sm">
                      • Persistent fever above 38.5°C
                      <br />• Difficulty breathing or chest pain
                      <br />• Severe headache or dizziness
                      <br />• Unusual bleeding or severe pain
                      <br />• Signs of infection or allergic reactions
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </main>
  )
}
