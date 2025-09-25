import { useFormContext } from "react-hook-form"
import {
  ImageIcon,
  Users,
  AlertTriangle,
  FolderOpen,
  Calendar,
  Clock,
  MapPin,
  Phone,
  ChevronDown,
  ChevronUp,
  FileText,
  File,
  Video,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { Button } from "@/components/ui/button/button"
import { cn } from "@/lib/utils"

export const ReviewInfo = () => {
  const { getValues } = useFormContext()
  const data = getValues()
  const [activeAccusedTab, setActiveAccusedTab] = useState(0)
  const [activeComplainantTab, setActiveComplainantTab] = useState(0)
  const [expandedSections, setExpandedSections] = useState({
    complainant: true,
    accused: true,
    incident: true,
    files: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "Size unknown"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (!fileType) return <File className="h-4 w-4 text-gray-500" />
    
    if (fileType.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-blue-500" />
    if (fileType === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />
    if (fileType.startsWith("video/")) return <Video className="h-4 w-4 text-purple-500" />
    if (fileType.startsWith("audio/")) return <FileText className="h-4 w-4 text-green-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  const getFileTypeDisplay = (fileType: string) => {
    if (!fileType) return "FILE"
    
    if (fileType.startsWith("image/")) return "IMAGE"
    if (fileType === "application/pdf") return "PDF"
    if (fileType.startsWith("video/")) return "VIDEO"
    if (fileType.startsWith("audio/")) return "AUDIO"
    if (fileType.startsWith("text/")) return "TEXT"
    
    const parts = fileType.split("/")
    return parts.length > 1 ? parts[1].toUpperCase() : "FILE"
  }

  const getFileProperties = (file: any) => {
    return {
      // Use schema property names
      name: file.comp_file_name || file.name || "Unknown file",
      type: file.comp_file_type || file.type || "document",
      size: file.size || 0,
      status: file.status || "unknown",
      url: file.comp_file_url || file.url || ""
    }
  }

  const formatAddress = (address: any) => {
    if (!address) return "Not provided"
    const parts = [address.street, address.barangay, address.city, address.province].filter(Boolean)
    return parts.join(", ")
  }

  const renderPersonDetails = (person: any, type: 'complainant' | 'accused') => (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Full Name</p>
          <p className="text-base font-medium text-foreground">
            {type === 'complainant' ? person.cpnt_name : person.acsd_name || "Not provided"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Age & Gender</p>
          <p className="text-base font-medium text-foreground">
            {(type === 'complainant' ? person.cpnt_age : person.acsd_age) || "N/A"} / 
            {(type === 'complainant' ? person.cpnt_gender : person.acsd_gender) || "N/A"}
          </p>
        </div>
        {type === 'complainant' && (
          <>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
              <p className="text-base font-medium text-foreground">{person.cpnt_number || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Relation to Respondent</p>
              <p className="text-base font-medium text-foreground">{person.cpnt_relation_to_respondent || "Not provided"}</p>
            </div>
          </>
        )}
        {type === 'accused' && (
          <div className="md:col-span-2 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-base font-medium text-foreground">{person.acsd_description || "Not provided"}</p>
          </div>
        )}
      </div>
      <Separator className="my-3" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Address</p>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <p className="text-base font-medium text-foreground">
            {type === 'complainant' ? 
              (person.cpnt_address || formatAddress(person.address) || "Not provided") : 
              (person.acsd_address || formatAddress(person.address) || "Not provided")
            }
          </p>
        </div>
      </div>
    </div>
  )

  const renderTabButtons = (count: number, activeTab: number, setActiveTab: (index: number) => void, prefix: string) => {
    if (count <= 1) return null
    
    return (
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <div className="flex space-x-1">
          {Array.from({ length: count }).map((_, i) => (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              className={cn(
                "px-3 py-1 h-auto rounded-md font-medium text-sm",
                activeTab === i
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
              onClick={() => setActiveTab(i)}
            >
              {`${prefix}-${i + 1}`}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return { date: "N/A", time: "N/A" };
    
    try {
      const date = new Date(dateTimeString);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      return { date: "Invalid date", time: "Invalid time" };
    }
  };

  const { date: incidentDate, time: incidentTime } = formatDateTime(data.incident?.comp_datetime);

  const documents = Array.isArray(data.documents) ? data.documents : [];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Complainant Info */}
      <Card className="border">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-base font-medium">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>Complainant Information</span>
              <Badge variant="secondary" className="ml-2">
                {Array.isArray(data.complainant) ? data.complainant.length : 0}
              </Badge>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
              onClick={() => toggleSection('complainant')}
            >
              {expandedSections.complainant ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.complainant && (
          <CardContent className="p-0">
            {renderTabButtons(data.complainant?.length || 0, activeComplainantTab, setActiveComplainantTab, "COMP")}
            {data.complainant?.length > 0 ? (
              renderPersonDetails(data.complainant[activeComplainantTab || 0], 'complainant')
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No complainant information provided
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Accused Section */}
      <Card className="border">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-base font-medium">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>Accused Persons</span>
              <Badge variant="secondary" className="ml-2">
                {Array.isArray(data.accused) ? data.accused.length : 0}
              </Badge>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
              onClick={() => toggleSection('accused')}
            >
              {expandedSections.accused ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.accused && (
          <CardContent className="p-0">
            {renderTabButtons(data.accused?.length || 0, activeAccusedTab, setActiveAccusedTab, "ACSD")}
            {data.accused?.length > 0 ? (
              renderPersonDetails(data.accused[activeAccusedTab || 0], 'accused')
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No accused persons specified
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Incident Details */}
      <Card className="border">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-base font-medium">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <span>Incident Details</span>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
              onClick={() => toggleSection('incident')}
            >
              {expandedSections.incident ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.incident && (
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incident Type</p>
                <div className="mt-1">
                  <Badge variant="destructive" className="text-sm">
                    {data.incident?.comp_incident_type === "Other"
                      ? data.incident?.otherType
                      : data.incident?.comp_incident_type || "N/A"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-base font-medium text-foreground">{incidentDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-base font-medium text-foreground">{incidentTime}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-base font-medium text-foreground">
                  {data.incident?.comp_location || "Not provided"}
                </span>
              </div>
            </div>

            <Separator className="my-3" />
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Allegation/Description</p>
              <div className="bg-muted/50 p-4 rounded-md mt-1">
                <p className="text-foreground whitespace-pre-line">
                  {data.incident?.comp_allegation || "No description provided"}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Documents - FIXED */}
      <Card className="border">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-base font-medium">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
              <span>Supporting Documents</span>
              <Badge variant="secondary" className="ml-2">
                {documents.length}
              </Badge>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
              onClick={() => toggleSection('files')}
            >
              {expandedSections.files ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.files && (
          <CardContent className="p-6">
            {documents.length > 0 ? (
              <div className="grid gap-3">
                {documents.map((file: any, index: number) => {
                  const fileProps = getFileProperties(file);
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getFileIcon(fileProps.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {fileProps.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileProps.size)} • {fileProps.status.toUpperCase()}
                        </p>
                        {fileProps.url && (
                          <p className="text-xs text-blue-600 truncate mt-1">
                            {fileProps.url.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getFileTypeDisplay(fileProps.type)}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <FolderOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No supporting documents uploaded</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Documents can help strengthen your complaint
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}