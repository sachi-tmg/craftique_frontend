// src/pages/NotificationsPage.jsx
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    countNotifications,
    getNotifications,
    markAllNotificationsAsRead
} from '../api/api';
import { useAuth } from '../contexts/auth-context';

export default function NotificationsPage() {
  const { userAuth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      if (!userAuth?.token) return;
      setLoading(true);
      
      try {
        // Fetch notifications
        const notificationsRes = await getNotifications(
          { page, filter, deletedDocCount: 0 },
          userAuth.token
        );
        setNotifications(notificationsRes.data.notifications);
        
        // Fetch count
        const countRes = await countNotifications(
          { filter },
          userAuth.token
        );
        setUnreadCount(countRes.data.totalDocs);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userAuth?.token, page, filter]);

  const handleMarkAllAsRead = async () => {
    if (!userAuth?.token) return;
    
    try {
      await markAllNotificationsAsRead(userAuth.token);
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page when changing filters
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button 
          variant="outline" 
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={handleFilterChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="like">Likes</TabsTrigger>
          <TabsTrigger value="comment">Comments</TabsTrigger>
          <TabsTrigger value="purchase">Purchases</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {loading && page === 1 ? (
            <div className="text-center py-8">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notifications found
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification._id} 
                  notification={notification}
                />
              ))}
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

const getDisplayName = (notification) => {
  return notification?.user?.fullName || notification?.user?.username || "Someone";
};

const NotificationItem = ({ notification }) => {
  const displayName = getDisplayName(notification);
  const profilePic = notification.user?.profilePicture || "/default-avatar.png";

  return (
    <Link
      to={getNotificationLink(notification)}
      className={`flex items-start p-4 rounded-lg transition-colors hover:bg-muted ${
        !notification.seen ? 'bg-muted/50' : ''
      }`}
    >
      {/* Avatar */}
      <img
        src={profilePic}
        alt={displayName}
        className="h-10 w-10 rounded-full object-cover mr-3"
        loading="lazy"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">
            {getNotificationMessage(notification, displayName)}
          </p>
          {!notification.seen && (
            <span className="h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </Link>
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
      return `/craft/${notification.creation?.creation_id || ''}`;
    case 'comment_reply':
    case 'comment_like':
      return `/craft/${notification.creation?.creation_id || ''}#comment-${notification.comment}`;
    default:
      return '/notifications';
  }
};