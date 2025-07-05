import React, { useState } from 'react'
import { useNotifications } from '@/context/NotificationContext'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { BellIcon } from 'lucide-react'

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer p-2">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="w-[350px]">
          <div className="p-4 border-b">
            <h4 className="font-medium leading-none">Notifications</h4>
          </div>
          <div className="divide-y">
            {notifications.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  markAsRead(item.id)
                  setOpen(false)
                }}
                className={`cursor-pointer px-4 py-3 hover:bg-accent ${
                  !item.is_read ? 'bg-accent/50' : ''
                }`}
              >
                <div className="space-y-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}