import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { logger } from '../utils/api';

interface NotificationProps {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  onMarkRead: (id: string) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Placement': return <WorkIcon fontSize="small" />;
    case 'Result': return <AssessmentIcon fontSize="small" />;
    case 'Event': return <EventIcon fontSize="small" />;
    default: return <EventIcon fontSize="small" />;
  }
};

const getTypeColor = (type: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (type) {
    case 'Placement': return 'success';
    case 'Result': return 'info';
    case 'Event': return 'warning';
    default: return 'default';
  }
};

export default function NotificationCard({ id, type, message, timestamp, isRead, onMarkRead }: NotificationProps) {
  
  const handleReadClick = () => {
    logger('info', 'component', `User marked notification ${id} as read`);
    onMarkRead(id);
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
        },
        borderLeft: isRead ? '4px solid transparent' : '4px solid #90caf9',
        bgcolor: isRead ? 'background.paper' : 'rgba(144, 202, 249, 0.05)'
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Chip 
              icon={getTypeIcon(type)} 
              label={type} 
              size="small" 
              color={getTypeColor(type)} 
              variant="outlined"
              sx={{ mr: 2, fontWeight: 'bold' }}
            />
            <Typography variant="caption" color="text.secondary">
              {new Date(timestamp).toLocaleString()}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: isRead ? 'normal' : 'bold' }}>
            {message}
          </Typography>
        </Box>
        
        {!isRead && (
          <IconButton 
            color="primary" 
            onClick={handleReadClick} 
            title="Mark as read"
            sx={{ ml: 2, mt: -1, mr: -1 }}
          >
            <CheckCircleOutlineIcon />
          </IconButton>
        )}
      </CardContent>
    </Card>
  );
}
