import { useFormContext } from "react-hook-form"
import { ImageIcon, Users, AlertTriangle, FolderOpen, Calendar, Clock, MapPin, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

export const ReviewInfo = () => {
  const { getValues } = useFormContext()
  const data = getValues()
  const [activeAccusedTab, setActiveAccusedTab] = useState(0)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    } else if (fileType === "application/pdf") {
      return <ImageIcon className="h-4 w-4 text-red-500" />
    } else if (fileType.startsWith("video/")) {
      return <ImageIcon className="h-4 w-4 text-purple-500" />
    }
    return <ImageIcon className="h-4 w-4 text-gray-500" />
  }

  const formatAddress = (address: any) => {
    if (!address) return "Not provided"
    const parts = [address.street, address.barangay, address.city, address.province].filter(Boolean)
    return parts.join(", ")
  }

  const renderAccusedPersonDetails = (person: any) => (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="font-semibold text-black/80">Full Name</p>
          <p className="text-lg font-medium text-gray-900">
            {person.firstName} {person.lastName}
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-black/80">Contact Number</p>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <p className="text-gray-900">{person.contactNumber || "Not provided"}</p>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-black/80">Address</p>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <p className="text-gray-900">{formatAddress(person.address)}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid gap-6">
        {/* Complainant Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-darkBlue1">
              <div className="p-2 bg-blue/10 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              Complainant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="font-semibold text-black/80">Full Name</p>
                <p className="text-normal text-black">
                  {data.complainant?.firstName} {data.complainant?.lastName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-black/80">Contact Number</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{data.complainant?.contactNumber || "Not provided"}</p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="font-semibold text-black/80">Address</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <p className="text-gray-900">{formatAddress(data.complainant?.address)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accused Persons */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-darkBlue1">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="h-5 w-5 text-red-600" />
              </div>
              Accused Persons
              <Badge variant="secondary" className="ml-auto">
                {data.accused?.length || 0} {data.accused?.length === 1 ? "Person" : "People"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {data.accused?.length > 0 ? (
              <div className="space-y-0">
                {data.accused.length > 1 ? (
                  <>
                    <div className="flex border-b border-gray-200 b gap-x-2">
                      {data.accused.map((person: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setActiveAccusedTab(index)}
                          className={`
                            relative p-2 text-sm font-semibold w-20 transition-all duration-200 whitespace-nowrap truncate
                            ${activeAccusedTab === index
                              ? 'text-blue border-b-2 border-blue'
                              : 'text-black/50 hover:text-black/80'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                              ${activeAccusedTab === index 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-gray-100 text-gray-600'
                              }
                            `}>
                              {index + 1}
                            </div>
                            <span className="hidden sm:inline">
                              {person.firstName} {person.lastName}
                            </span>
                            <span className="sm:hidden">
                              Person {index + 1}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Tab Content */}
                    <div className="min-h-[200px] bg-white">
                      {renderAccusedPersonDetails(data.accused[activeAccusedTab])}
                    </div>
                  </>
                ) : (
                  // Single person 
                  <div className="px-6 pb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline">Person 1</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="font-semibold text-black/80">Full Name</p>
                        <p className="text-lg font-medium text-gray-900">
                          {data.accused[0].firstName} {data.accused[0].lastName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-black/80">Contact Number</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-900">{data.accused[0].contactNumber || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-1">
                      <p className="font-semibold text-black/80">Address</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{formatAddress(data.accused[0].address)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                <p className="text-gray-500 text-center py-4">No accused persons specified</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Incident Details */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-darkBlue1">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              Incident Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="font-semibold text-black/80">Incident Type</p>
                <Badge variant="destructive" className="text-sm">
                  {data.incident?.type === "other" ? data.incident?.otherType : data.incident?.type}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-black/80">Date & Time</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{data.incident?.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{data.incident?.time}</span>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="font-semibold text-black/80">Description</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-line leading-relaxed">
                  {data.incident?.description || "No description provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supporting Documents */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-darkBlue1">
              <div className="p-2 bg-green-100 rounded-lg">
                <FolderOpen className="h-5 w-5 text-green-600" />
              </div>
              Supporting Documents
              <Badge variant="secondary" className="ml-auto">
                {data.documents?.length || 0} {data.documents?.length === 1 ? "File" : "Files"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.documents?.length > 0 ? (
              <div className="grid gap-3">
                {data.documents.map((file: File, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {file.type.split("/")[1]?.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No supporting documents uploaded</p>
                <p className="text-sm text-gray-400 mt-1">Documents can help strengthen your complaint</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}