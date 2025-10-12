import { useEffect, useState } from "react"
import { supabase}  from "@/lib/supabaseClient" 
import FloatingAnnouncement from "./FloatingAnnouncement"

export default function FloatingAnnouncementContainer() {
  const [announcement, setAnnouncement] = useState<any | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel("realtime-announcements")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Announcement",
        },
        (payload) => {
          const newAnnouncement = payload.new
          if (newAnnouncement.ann_type === "public") {
            setAnnouncement(newAnnouncement)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <FloatingAnnouncement announcement={announcement} />
}
