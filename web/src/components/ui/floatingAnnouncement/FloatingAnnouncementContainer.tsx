import { useEffect, useState } from "react"
import FloatingAnnouncement from "./FloatingAnnouncement"
import supabase from "@/supabase/supabase"

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
