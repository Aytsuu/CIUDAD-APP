import React, { useState, useEffect } from 'react'
import { useNotifications } from '@/context/NotificationContext'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Bell, MoreHorizontal, Eye, EyeOff, Filter, CheckCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Notification } from '@/context/auth-types'
import DropdownLayout from '@/components/ui/dropdown/dropdown-layout'

const formatTimeAgo = (dateString: string | number | Date) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    console.log('Notifications updated:', notifications)
    console.log('Unread count:', unreadCount)
  }, [notifications, unreadCount])

  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'unread') return !notification.is_read
      if (filter === 'read') return notification.is_read
      return true
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by newest first

  const handleNotificationClick = (notification: Notification) => {
    console.log('Marking notification as read:', notification.id)
    markAsRead(notification.id)
    setOpen(false)
  }

  const handleNotificationMenuAction = (action: string, notificationId: string) => {
    if (action === 'read') {
      markAsRead(notificationId)
    }
    // Add other actions as needed
  }

  const handleSettingsMenuAction = (action: string) => {
    if (action === 'all' || action === 'unread' || action === 'read') {
      setFilter(action)
    } else if (action === 'mark_all_read') {
      markAllAsRead()
    }
  }

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.is_read) {
        markAsRead(notification.id)
      }
    })
  }

  // Settings dropdown options
  const settingsOptions = [
    {
      id: 'all',
      name: 'Show All',
      icon: <Filter className="h-4 w-4" />,
      variant: filter === 'all' ? 'default' : undefined
    },
    {
      id: 'unread',
      name: 'Show Unread',
      icon: <Eye className="h-4 w-4" />,
      variant: filter === 'unread' ? 'default' : undefined
    },
    {
      id: 'read',
      name: 'Show Read',
      icon: <EyeOff className="h-4 w-4" />,
      variant: filter === 'read' ? 'default' : undefined
    },
    ...(unreadCount > 0 ? [{
      id: 'mark_all_read',
      name: 'Mark All as Read',
      icon: <CheckCheck className="h-4 w-4" />,
      variant: undefined
    }] : [])
  ]

  // Generate notification menu options for each notification
  const getNotificationMenuOptions = (notification: Notification) => [
    {
      id: 'read',
      name: notification.is_read ? 'Mark as Unread' : 'Mark as Read',
      icon: notification.is_read ? 
        <EyeOff className="h-4 w-4 text-gray-500" /> : 
        <Eye className="h-4 w-4 text-blue-500" />,
      variant: undefined
    }
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer p-3 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300">
          <Bell className={`h-6 w-6 transition-all duration-300 ${unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'}`} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs shadow-lg">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden" align="end" side="bottom" sideOffset={8} alignOffset={-50}>
        <div className="w-full">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Notifications</h4>
                {unreadCount > 0 && (
                  <p className="text-xs text-gray-600">{unreadCount} unread</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <DropdownLayout
                trigger={
                  <button 
                    className="p-2 hover:bg-white/70 rounded-xl transition-all duration-200"
                    title="Settings"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                  </button>
                }
                options={settingsOptions}
                onSelect={handleSettingsMenuAction}
                contentClassName="w-48"
              />
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No notifications yet</p>
                <p className="text-gray-400 text-sm mt-1">We'll let you know when something happens</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`group cursor-pointer px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${
                      !item.is_read ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-l-4 border-blue-400' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-11 w-11 ring-2 ring-white shadow-lg">
                          <AvatarImage 
                            src={item.metadata?.sender_avatar} 
                            alt={item.metadata?.sender_name || 'System'}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-medium">
                            {item.metadata?.sender_name?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`font-semibold text-sm ${!item.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {item.title}
                              </p>
                              {!item.is_read && (
                                <div className="h-2 w-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                              {item.message}
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 font-medium">
                                {formatTimeAgo(item.created_at)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {item.metadata?.sender_name || 'System'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <DropdownLayout
                              trigger={
                                <button
                                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                  title="More options"
                                >
                                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                </button>
                              }
                              options={getNotificationMenuOptions(item)}
                              onSelect={(action) => handleNotificationMenuAction(action, item.id)}
                              contentClassName="w-40"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 10 && (
            <div className="p-3 text-center text-sm text-gray-500 border-t bg-gradient-to-r from-gray-50 to-blue-50">
              <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline">
                View all {filteredNotifications.length} notifications
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}