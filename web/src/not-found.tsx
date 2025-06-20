
import { MapPin } from "lucide-react"

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Oops! Page Not Found</h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            The page you're looking for seems to have wandered off into the digital wilderness.
          </p>
        </div>

        {/* Possible Reasons Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm max-w-md mx-auto text-left">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            📌
            Possible reasons:
          </h3>
          <ul className="text-gray-600 space-y-2">
            <li>• The URL was typed incorrectly</li>
            <li>• The page has been moved or deleted</li>
            <li>• You don't have permission to access this page</li>
            <li>• The link you followed is broken</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
