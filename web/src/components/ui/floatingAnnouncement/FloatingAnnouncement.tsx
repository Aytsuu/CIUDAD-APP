import { useEffect, useState } from "react"
import { Bell, X } from "lucide-react"

interface FloatingAnnouncementProps {
  announcement: {
    ann_title: string
    ann_end_at: string
    ann_event_start?: string | null // Made optional and nullable
    ann_event_end?: string | null // Made optional and nullable
  } | null
}

function formatDateToManila(dateString: string | null | undefined): string {
  if (!dateString) return ""

  try {
    const date = new Date(dateString)
    return date.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  } catch (error) {
    return dateString
  }
}

export default function FloatingAnnouncement({ announcement }: FloatingAnnouncementProps) {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000)

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 1
        return newProgress <= 0 ? 0 : newProgress
      })
    }, 100) 

    return () => {
      clearTimeout(timer)
      clearInterval(progressTimer)
    }
  }, [])

  if (!visible || !announcement) return null

  const formattedEventStart = formatDateToManila(announcement.ann_event_start)
  const formattedEventEnd = formatDateToManila(announcement.ann_event_end)
  const hasEventDates = announcement.ann_event_start && announcement.ann_event_end

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 slide-in-from-right-4 duration-500">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl shadow-lg shadow-blue-900/10 backdrop-blur-sm">
        {/* Header with icon and close button */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-blue-700 tracking-wide">New Announcement</span>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="p-1 rounded-lg hover:bg-blue-100 transition-colors duration-200 group"
            aria-label="Close announcement"
          >
            <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{announcement.ann_title}</p>
          {hasEventDates && (
            <div className="mt-3 p-2 bg-blue-50/50 rounded-lg border border-blue-100">
              <p className="text-xs text-gray-600 font-medium">Event Schedule:</p>
              <p className="text-xs text-gray-700 mt-1">
                {formattedEventStart} - {formattedEventEnd}
              </p>
            </div>
          )}
        </div>


        {/* Progress bar for auto-dismiss */}
        <div className="h-1 bg-blue-100 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
