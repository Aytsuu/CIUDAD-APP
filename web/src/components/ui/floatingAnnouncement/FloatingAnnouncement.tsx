
import { useEffect, useState } from "react"
import { Bell, X } from "lucide-react"

interface FloatingAnnouncementProps {
  announcement: {
    ann_title: string
  } | null
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
    }, 100) // Update every 100ms for smooth animation

    return () => {
      clearTimeout(timer)
      clearInterval(progressTimer)
    }
  }, [])

  if (!visible || !announcement) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 slide-in-from-right-4 duration-500">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl shadow-lg shadow-blue-900/10 backdrop-blur-sm">
        {/* Header with icon and close button */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">New Announcement</span>
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
