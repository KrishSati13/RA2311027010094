import { useEffect, useState } from 'react';
import { Typography, CircularProgress, Box, FormControl, InputLabel, Select, MenuItem, Slider } from '@mui/material';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications, logger } from '../utils/api';

const PRIORITY_WEIGHTS: Record<string, number> = {
  'Placement': 3,
  'Result': 2,
  'Event': 1
};

export default function PriorityInbox() {
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  
  const [limit, setLimit] = useState<number>(10);
  const [filterType, setFilterType] = useState<string>('All');

  useEffect(() => {
    logger('info', 'page', 'PriorityInbox page mounted');
    
    const storedRead = localStorage.getItem('readNotifications');
    if (storedRead) {
      setReadIds(new Set(JSON.parse(storedRead)));
    }

    const loadData = async () => {
      setLoading(true);
      const data = await fetchNotifications();
      setAllNotifications(data);
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

  // Compute Priority
  const getPriorityNotifications = () => {
    // Note: The stage 1 logic specifies priority based on weight and recency.
    let filtered = allNotifications;
    
    // The requirement says: "enabling display of limited top 'n' notifications as well as filter on notification type"
    // Wait, if a filter is selected, do we only show that type? Yes.
    if (filterType !== 'All') {
      filtered = filtered.filter(n => n.Type === filterType);
    }
    
    // Also the priority logic: "Priority should be determined based on a combination of weight and recency."
    // and "display top 'n' most important unread notifications first".
    // Does PriorityInbox show ONLY unread? "displays always the top n most important unread notifications first". 
    // We will separate unread and read, but mostly sort by priority. Let's just sort by priority for the filtered set, keeping unreads at top if required.
    // Actually, weight + recency is the core priority.
    
    const sorted = [...filtered].sort((a, b) => {
      // If we need to put unread first:
      const aUnread = !readIds.has(a.ID);
      const bUnread = !readIds.has(b.ID);
      
      if (aUnread !== bUnread) {
         return aUnread ? -1 : 1;
      }

      const weightA = PRIORITY_WEIGHTS[a.Type] || 0;
      const weightB = PRIORITY_WEIGHTS[b.Type] || 0;
      
      if (weightA !== weightB) {
          return weightB - weightA;
      }
      
      const timeA = new Date(a.Timestamp).getTime();
      const timeB = new Date(b.Timestamp).getTime();
      return timeB - timeA;
    });

    return sorted.slice(0, limit);
  };

  const displayedNotifications = getPriorityNotifications();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Priority Inbox</Typography>
      
      <Box sx={{ display: 'flex', gap: 4, mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Box sx={{ minWidth: 200 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Notification Type</InputLabel>
            <Select
              value={filterType}
              label="Notification Type"
              onChange={(e) => {
                setFilterType(e.target.value);
                logger('info', 'component', `User changed filter type to ${e.target.value}`);
              }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography gutterBottom>Show top: {limit}</Typography>
          <Slider
            value={limit}
            onChange={(_, val) => setLimit(val as number)}
            onChangeCommitted={(_, val) => {
                logger('info', 'component', `User changed limit to ${val}`);
            }}
            step={5}
            marks
            min={5}
            max={30}
            valueLabelDisplay="auto"
          />
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : displayedNotifications.length === 0 ? (
        <Typography color="text.secondary">No priority notifications found.</Typography>
      ) : (
        displayedNotifications.map(n => (
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
