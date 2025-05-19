import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar'; // For content offset if an AppBar is used later

import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import ChatPage from './pages/ChatPage';
import ModsPage from './pages/ModsPage';
import AccountLinkingPage from './pages/AccountLinkingPage';
import SettingsPage from './pages/SettingsPage';
import LogsHealthPage from './pages/LogsHealthPage';
import DevToolsPage from './pages/DevToolsPage';
import HelpPage from './pages/HelpPage';

// Optional: Define AppBar if needed later, for now, focus on Sidebar and content
// import AppBar from '@mui/material/AppBar';
// import Typography from '@mui/material/Typography';

const App: React.FC = () => {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {/* <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Nimbus8 Suite
            </Typography>
          </Toolbar>
        </AppBar> */}
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            p: 3,
            // marginLeft: '240px', // Width of the sidebar if not using a persistent drawer that pushes content
          }}
        >
          <Toolbar /> {/* This is necessary to ensure content is not obscured by an AppBar if one is added */}
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/moderation" element={<ModsPage />} />
            <Route path="/account-linking" element={<AccountLinkingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/logs-health" element={<LogsHealthPage />} />
            <Route path="/dev-tools" element={<DevToolsPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default App;
