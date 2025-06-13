import { Button } from "@/components/ui/button/button"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { ARTemplatePage } from "@/template/report/acknowledgement/ARTemplatePage"
import { CircleAlert, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"

export default function ReportDocument() {
  return (
    <LayoutWithBack title="AR Document" description="Review and manage your AR document">
      <div className="w-full h-full flex">
        <div className="w-80 pr-6">
          <Card className="rounded-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Status</h3>
                <div className="flex items-center gap-2">
                  <CircleAlert className="h-4 w-4 text-amber-500" />
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Unsigned
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Status will update to <span className="font-medium text-red-500">LAPSED</span> by the end of the week
                  if no document is uploaded.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-medium">Actions</h3>
                <Button className="w-full gap-2" size="sm">
                  <Upload className="h-4 w-4" />
                  Upload signed document
                </Button>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium">Document Info</h3>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className="text-muted-foreground">Created:</span>
                  <span>June 10, 2025</span>
                  <span className="text-muted-foreground">Last modified:</span>
                  <span>June 12, 2025</span>
                  <span className="text-muted-foreground">Document ID:</span>
                  <span>AR-2025-06-1234</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document - Scrollable content */}
        <div className="w-full flex flex-col gap-4">
          <ARTemplatePage />
        </div>
      </div>
    </LayoutWithBack>
  )
}
