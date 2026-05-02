import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InboxIcon from '@mui/icons-material/Inbox';
import Home from './pages/Home';
import PriorityInbox from './pages/PriorityInbox';
import { useEffect } from 'react';
import { logger } from './utils/api';

function App() {
  useEffect(() => {
    logger('info', 'component', 'App initialized');
  }, []);

  return (
    <Router>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Container maxWidth="md">
          <Toolbar disableGutters>
            <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Campus Notify
            </Typography>
            <Button color="inherit" component={Link} to="/" startIcon={<NotificationsIcon />}>
              All
            </Button>
            <Button color="primary" variant="contained" component={Link} to="/priority" startIcon={<InboxIcon />} sx={{ ml: 2, borderRadius: 20 }}>
              Priority Inbox
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ py: 4, minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
        <Container maxWidth="md">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/priority" element={<PriorityInbox />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;
