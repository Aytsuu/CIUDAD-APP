import { Footer } from "./Footer";
import { useGetAnnouncement } from "@/pages/announcement/queries/announcementFetchQueries";
import FloatingAnnouncement from "@/components/ui/floatingAnnouncement/FloatingAnnouncement";

export default function Services() {
  const { data: announcements } = useGetAnnouncement();
  const latest = announcements?.[0]; // or filter for active announcements
  const serviceCategories = [
    {
      id: 'documents',
      title: 'Document Services',
      icon: '📄',
      description: 'Official certificates and clearances',
      services: [
        { name: 'Barangay Clearance', description: 'For employment, business permits, and legal requirements', fee: '₱50' },
        { name: 'Certificate of Indigency', description: 'For financial assistance and scholarship applications', fee: '₱30' },
        { name: 'Certificate of Residency', description: 'Proof of residence for various purposes', fee: '₱40' },
        { name: 'Business Permit', description: 'For small-scale businesses within the barangay', fee: '₱200' },
        { name: 'Building Permit', description: 'For construction and renovation projects', fee: '₱500' }
      ]
    },
    {
      id: 'social',
      title: 'Social Services',
      icon: '🤝',
      description: 'Community support and assistance',
      services: [
        { name: 'Senior Citizens Benefits', description: 'Monthly allowance and healthcare assistance', fee: 'Free' },
        { name: 'PWD Assistance', description: 'Support services for persons with disabilities', fee: 'Free' },
        { name: 'Medical Assistance', description: 'Emergency medical support and referrals', fee: 'Free' },
        { name: 'Educational Assistance', description: 'Scholarship programs and school supplies', fee: 'Free' },
        { name: 'Livelihood Programs', description: 'Skills training and micro-enterprise support', fee: 'Free' }
      ]
    },
    {
      id: 'public-safety',
      title: 'Public Safety',
      icon: '🛡️',
      description: 'Security and emergency services',
      services: [
        { name: 'Barangay Patrol', description: '24/7 community security and monitoring', fee: 'Free' },
        { name: 'Emergency Response', description: 'First aid and disaster response team', fee: 'Free' },
        { name: 'Incident Reporting', description: 'Report crimes, accidents, and emergencies', fee: 'Free' },
        { name: 'CCTV Monitoring', description: 'Public area surveillance and security', fee: 'Free' },
        { name: 'Traffic Management', description: 'Road safety and traffic flow assistance', fee: 'Free' }
      ]
    },
    {
      id: 'justice',
      title: 'Justice & Mediation',
      icon: '⚖️',
      description: 'Conflict resolution and legal assistance',
      services: [
        { name: 'Katarungang Pambarangay', description: 'Mediation for civil disputes and conflicts', fee: 'Free' },
        { name: 'Blotter Reports', description: 'Official incident documentation', fee: 'Free' },
        { name: 'Legal Consultation', description: 'Basic legal advice and guidance', fee: 'Free' },
        { name: 'Settlement Hearings', description: 'Formal dispute resolution sessions', fee: 'Free' },
        { name: 'Case Referrals', description: 'Connection to higher courts when needed', fee: 'Free' }
      ]
    },
    {
      id: 'health',
      title: 'Health Services',
      icon: '🏥',
      description: 'Healthcare and wellness programs',
      services: [
        { name: 'Health Center Services', description: 'Basic medical checkups and consultations', fee: 'Free' },
        { name: 'Vaccination Programs', description: 'Immunization for children and adults', fee: 'Free' },
        { name: 'Family Planning', description: 'Reproductive health counseling and supplies', fee: 'Free' },
        { name: 'Nutrition Programs', description: 'Feeding programs for malnourished children', fee: 'Free' },
        { name: 'Health Education', description: 'Seminars on disease prevention and wellness', fee: 'Free' }
      ]
    },
    {
      id: 'environment',
      title: 'Environmental Services',
      icon: '🌱',
      description: 'Waste management and environmental programs',
      services: [
        { name: 'Waste Collection', description: 'Regular garbage pickup and disposal', fee: 'Free' },
        { name: 'Recycling Programs', description: 'Segregation and recycling initiatives', fee: 'Free' },
        { name: 'Tree Planting', description: 'Community greening and beautification', fee: 'Free' },
        { name: 'Clean-up Drives', description: 'Regular community cleaning activities', fee: 'Free' },
        { name: 'Environmental Education', description: 'Awareness programs on environmental protection', fee: 'Free' }
      ]
    }
  ];

  return (
    <main className="flex-1 bg-[#17294A]">
      <section className="relative w-full min-h-screen">
        <div className="px-4 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Barangay Services
              </h1>
              <div className="w-24 h-1 bg-blue-400 mx-auto mb-8"></div>
              <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                Comprehensive services designed to meet the needs of our community members
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              <div className="bg-blue-500/20 rounded-xl p-6 text-center border border-blue-400/30">
                <div className="text-3xl font-bold text-blue-300 mb-2">25+</div>
                <div className="text-blue-100 text-sm font-medium">Services Available</div>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-6 text-center border border-blue-400/30">
                <div className="text-3xl font-bold text-blue-300 mb-2">24/7</div>
                <div className="text-blue-100 text-sm font-medium">Emergency Response</div>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-6 text-center border border-blue-400/30">
                <div className="text-3xl font-bold text-blue-300 mb-2">1,200+</div>
                <div className="text-blue-100 text-sm font-medium">Monthly Requests</div>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-6 text-center border border-blue-400/30">
                <div className="text-3xl font-bold text-blue-300 mb-2">98%</div>
                <div className="text-blue-100 text-sm font-medium">Satisfaction Rate</div>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {serviceCategories.map((category) => (
                <div key={category.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
                  {/* Category Header */}
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4">{category.icon}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{category.title}</h2>
                      <p className="text-blue-200">{category.description}</p>
                    </div>
                  </div>

                  {/* Services List */}
                  <div className="space-y-4">
                    {category.services.map((service, index) => (
                      <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            service.fee === 'Free' 
                              ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                              : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                          }`}>
                            {service.fee}
                          </span>
                        </div>
                        <p className="text-blue-100 text-sm leading-relaxed">{service.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Category Action Button */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 hover:border-blue-400/50 text-blue-200 hover:text-white px-6 py-3 rounded-xl font-medium transition-all duration-300">
                      Request {category.title}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* How to Request Services */}
            <div className="mt-16 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl p-8 md:p-12 border border-blue-400/30">
              <h2 className="text-3xl font-bold text-white text-center mb-8">How to Request Services</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">1</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Choose Service</h3>
                  <p className="text-blue-100">Select the service you need from our categories above</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">2</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Submit Request</h3>
                  <p className="text-blue-100">Fill out the online form or visit our office with required documents</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">3</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Receive Service</h3>
                  <p className="text-blue-100">Get your documents or assistance within the specified timeframe</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-12 text-center">
              <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4">Need Help?</h3>
                <p className="text-blue-100 mb-6">Our staff is ready to assist you with any questions about our services</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                    Contact Us
                  </button>
                  <button className="bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                    Office Hours
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Announcement */}
      <FloatingAnnouncement announcement={latest ?? null} />
      
      <Footer/>
    </main>
  );
}