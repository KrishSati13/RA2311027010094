import { useEffect, useState } from 'react';
import { Typography, CircularProgress, Box } from '@mui/material';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications, logger } from '../utils/api';

export default function Home() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    logger('info', 'page', 'Home page mounted');
    
    // Load read state from localStorage
    const storedRead = localStorage.getItem('readNotifications');
    if (storedRead) {
      setReadIds(new Set(JSON.parse(storedRead)));
    }

    const loadData = async () => {
      setLoading(true);
      const data = await fetchNotifications();
      setNotifications(data);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleMarkRead = (id: string) => {
    setReadIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      localStorage.setItem('readNotifications', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>All Notifications</Typography>
      {notifications.length === 0 ? (
        <Typography color="text.secondary">No notifications available.</Typography>
      ) : (
        notifications.map(n => (
          <NotificationCard 
            key={n.ID}
            id={n.ID}
            type={n.Type}
            message={n.Message}
            timestamp={n.Timestamp}
            isRead={readIds.has(n.ID)}
            onMarkRead={handleMarkRead}
          />
        ))
      )}
    </Box>
  );
}
