import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Heart, Users } from "lucide-react"

export function ANCVisitsGuide() {
  const visitStages = [
    {
      period: "1-3 Months",
      visits: "At least 1 visit",
      description: "Initial prenatal assessment and health screening",
      icon: <Heart className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-500 border-blue-200",
    },
    {
      period: "4-6 Months",
      visits: "Minimum 2 visits",
      description: "Regular monitoring and developmental assessments",
      icon: <Calendar className="h-5 w-5" />,
      color: "bg-green-100 text-green-700 border-green-200",
    },
    {
      period: "7-9 Months",
      visits: "At least 5 visits",
      description: "Intensive monitoring as delivery approaches",
      icon: <Clock className="h-5 w-5" />,
      color: "bg-primary/10 text-primary border-primary/20",
    },
  ]

  return (
    <Card className="w-full mx-auto bg-card border-border/50 shadow-sm">
      <CardHeader className="text-center pb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="h-6 w-6 text-healthcare-blue" />
          <Badge
            variant="secondary"
            className="bg-white border border-black/60"
          >
            ANC Guidelines
          </Badge>
        </div>
        <CardTitle className="text-2xl font-semibold text-foreground text-balance">Guide for 8 ANC Visits</CardTitle>
        <p className="text-muted-foreground text-sm mt-2">
          Recommended antenatal care schedule for optimal maternal and fetal health
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visitStages.map((stage, index) => (
            <div
              key={index}
              className={`relative p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${stage.color}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 p-2 rounded-lg bg-white/80 shadow-sm">{stage.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base leading-tight">{stage.period}</h3>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                  <p className="text-sm font-medium">{stage.visits}</p>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{stage.description}</p>
              </div>

              {/* Subtle progress indicator */}
              <div className="absolute bottom-2 right-2 text-xs opacity-40 font-mono">{index + 1}/3</div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-healthcare-neutral border border-border/30">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-1.5 rounded-full bg-healthcare-blue/10">
              <Heart className="h-4 w-4 text-healthcare-blue" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Important:</span> These are minimum recommendations. Your
                healthcare provider may suggest additional visits based on individual health needs and risk factors.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
