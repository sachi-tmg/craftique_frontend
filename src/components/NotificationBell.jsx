// src/components/NotificationBell.jsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/notification-context';

export const NotificationBell = () => {
  const { 
    notifications, 
    unreadCount, 
    hasNew, 
    loading,
    markAllAsRead 
  } = useNotifications();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {(hasNew || unreadCount > 0) && (
            <Badge 
              className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 0 ? unreadCount : ''}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notifications
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-1" />
            Mark all as read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <>
            {notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem 
                key={notification._id} 
                className="flex flex-col items-start gap-1"
                asChild
              >
                <Link 
                  to={getNotificationLink(notification)} 
                  className="w-full"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {getNotificationMessage(notification)}
                    </span>
                    {!notification.seen && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/notifications" className="w-full text-center">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Helper functions
const getNotificationMessage = (notification) => {
  switch (notification.type) {
    case 'like':
      return 'Someone liked your creation';
    case 'comment':
      return 'New comment on your creation';
    case 'comment_reply':
      return 'Someone replied to your comment';
    case 'comment_like':
      return 'Someone liked your comment';
    case 'purchase':
      return 'New purchase of your creation';
    default:
      return 'New notification';
  }
};

const getNotificationLink = (notification) => {
  switch (notification.type) {
    case 'like':
    case 'comment':
    case 'purchase':
      return `/creation/${notification.creation?.creation_id || ''}`;
    case 'comment_reply':
    case 'comment_like':
      return `/creation/${notification.creation?.creation_id || ''}#comment-${notification.comment}`;
    default:
      return '/notifications';
  }
};