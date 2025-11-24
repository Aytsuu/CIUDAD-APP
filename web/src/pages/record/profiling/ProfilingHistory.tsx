import { Button } from "@/components/ui/button/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { getDateTimeFormat } from "@/helpers/dateHelper"
import { Calendar, Clock, User } from "lucide-react"

export const RenderHistory = ({
  history,
  isLoadingHistory,
  itemTitle,
  handleHistoryItemClick
} : {
  history: Record<string, any>
  isLoadingHistory: boolean
  itemTitle: string
  handleHistoryItemClick: (index: number) => void
}) => {
    if (isLoadingHistory) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 p-4">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Loading History...</p>
        </div>
      )
    }

    if (!history || history.length === 0) {
      return (
        <div className="p-4">
          <EmptyState icon={Clock} title="No history found" description="No recorded updates." />
        </div>
      )
    }

    return (
      <div className="my-5 max-h-[80vh] overflow-y-auto px-2">
        <div className="space-y-2">

          {history.map((historyItem: any, index: number) => (
            <div
              key={historyItem.history_id}
              className={`border rounded-md p-3 hover:bg-gray-50 transition-all duration-300`}
              style={{
                opacity: 0,
                animation: `fadeInUp 0.4s ease-out ${index * 0.1}s forwards`,
              }}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-green-700">{itemTitle}</h4>
                  {(index + 1) < history.length ? (<Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleHistoryItemClick(index)
                    }}
                  >
                    View
                  </Button>) : (
                    <Label className="text-xs mb-1 text-gray-500">Created</Label>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{historyItem.history_user_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    <span className="whitespace-nowrap truncate max-w-[120px]">{getDateTimeFormat(historyItem.history_date)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <style>
          {`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </div>
    )
  }