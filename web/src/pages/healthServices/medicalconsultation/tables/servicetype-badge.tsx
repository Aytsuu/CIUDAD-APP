export function getServiceTypeColor(serviceType: string) {
    switch (serviceType) {
      case "Family Planning":
        return "text-purple-600 bg-purple-100"
      case "Medical Consultation":
        return "text-blue-600 bg-blue-100"
      case "Health Profiling":
        return "text-green-600 bg-green-100"
      case "Maternal":
        return "text-pink-600 bg-pink-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }
  