
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DataField } from "./data-field"
import { Heart, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface MemberCardProps {
  member: any
  className?: string
}

export function MemberCard({ member, className }: MemberCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A'
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
  }

  const getRoleBadgeColor = (role: string) => {
    const roleColors: Record<string, string> = {
      'Father': 'bg-blue-100 text-blue-800 border-blue-200',
      'Mother': 'bg-pink-100 text-pink-800 border-pink-200',
      'Child': 'bg-green-100 text-green-800 border-green-200',
      'Head': 'bg-purple-100 text-purple-800 border-purple-200',
    }
    return roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <Card className={cn("hover:shadow-md transition-all duration-200 border-0 bg-gradient-to-br from-white to-gray-50/30", className)}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
              {getInitials(member.personal_info.first_name, member.personal_info.last_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">
                  {member.personal_info.first_name} {member.personal_info.last_name}
                </h4>
                <p className="text-sm text-gray-500">ID: {member.resident_id}</p>
              </div>
              <Badge className={cn("text-xs font-medium", getRoleBadgeColor(member.role))}>
                {member.role}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DataField 
                label="Age" 
                value={`${calculateAge(member.personal_info.date_of_birth)} years`} 
              />
              <DataField 
                label="Contact" 
                value={member.personal_info.contact || 'N/A'} 
              />
            </div>

            {/* Health Details */}
            {(member.health_details.blood_type || member.health_details.philhealth_id || member.health_details.covid_vax_status) && (
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-gray-700 text-sm">Health Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {member.health_details.blood_type && (
                    <DataField 
                      label="Blood Type" 
                      value={member.health_details.blood_type} 
                    />
                  )}
                  {member.health_details.philhealth_id && (
                    <DataField 
                      label="PhilHealth" 
                      value={member.health_details.philhealth_id} 
                    />
                  )}
                  {member.health_details.covid_vax_status && (
                    <div className="sm:col-span-2">
                      <DataField 
                        label="COVID Vaccination Status" 
                        value={member.health_details.covid_vax_status} 
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mother Health Info */}
            {member.mother_health_info && (
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-pink-500" />
                  <span className="font-medium text-pink-700 text-sm">Mother Health Information</span>
                </div>
                <div className="bg-pink-50 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <DataField 
                      label="Health Risk Class" 
                      value={member.mother_health_info.health_risk_class}
                      orientation="horizontal"
                    />
                    <DataField 
                      label="Immunization Status" 
                      value={member.mother_health_info.immunization_status}
                      orientation="horizontal"
                    />
                    <DataField 
                      label="Family Planning Method" 
                      value={member.mother_health_info.family_planning_method}
                      orientation="horizontal"
                    />
                    <DataField 
                      label="FP Source" 
                      value={member.mother_health_info.family_planning_source}
                      orientation="horizontal"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}