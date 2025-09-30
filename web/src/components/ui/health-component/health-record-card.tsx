import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DataField } from "./data-field"
import { cn } from "@/lib/utils"

interface HealthRecordCardProps {
  record: any
  type: "ncd" | "tb"
  className?: string
}

export function HealthRecordCard({ record, type, className }: HealthRecordCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getTypeConfig = (type: string) => {
    if (type === "ncd") {
      return {
        bgColor: "from-red-50 to-red-100/50",
        badgeColor: "bg-red-100 text-red-800 border-red-200",
        avatarColor: "from-red-500 to-red-600"
      }
    }
    return {
      bgColor: "from-orange-50 to-orange-100/50",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
      avatarColor: "from-orange-500 to-orange-600"
    }
  }

  const config = getTypeConfig(type)

  const renderNCDFields = (ncd: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DataField 
        label="Risk Class (40+ years)" 
        value={ncd.health_data.risk_class_age_group} 
      />
      <DataField 
        label="Comorbidities" 
        value={`${ncd.health_data.comorbidities}${ncd.health_data.comorbidities_others ? ` (${ncd.health_data.comorbidities_others})` : ''}`} 
      />
      <DataField 
        label="Lifestyle Risk" 
        value={`${ncd.health_data.lifestyle_risk}${ncd.health_data.lifestyle_risk_others ? ` (${ncd.health_data.lifestyle_risk_others})` : ''}`} 
      />
      <DataField 
        label="Maintenance" 
        value={ncd.health_data.in_maintenance === 'yes' ? 'Yes' : 'No'} 
      />
    </div>
  )

  const renderTBFields = (tb: any) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DataField 
        label="Medication Source" 
        value={`${tb.health_data.src_anti_tb_meds}${tb.health_data.src_anti_tb_meds_others ? ` (${tb.health_data.src_anti_tb_meds_others})` : ''}`} 
      />
      <DataField 
        label="Days Taking Meds" 
        value={`${tb.health_data.no_of_days_taking_meds} days`} 
      />
      <DataField 
        label="TB Status" 
        value={tb.health_data.tb_status} 
      />
    </div>
  )

  return (
    <Card className={cn(`bg-gradient-to-br ${config.bgColor} border-0 shadow-sm hover:shadow-md transition-all duration-200`, className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarFallback className={`bg-gradient-to-br ${config.avatarColor} text-white font-semibold text-sm`}>
                {getInitials(record.resident_info.personal_info.first_name, record.resident_info.personal_info.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-gray-900">
                {record.resident_info.personal_info.first_name} {record.resident_info.personal_info.last_name}
              </h4>
            </div>
          </div>
          <Badge className={cn("text-xs font-medium", config.badgeColor)}>
            {record.resident_info.resident_id}
          </Badge>
        </div>

        {type === "ncd" ? renderNCDFields(record) : renderTBFields(record)}
      </CardContent>
    </Card>
  )
}