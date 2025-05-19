import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar'; // To provide spacing at the top of the drawer

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import DnsIcon from '@mui/icons-material/Dns'; // For Services
import ChatIcon from '@mui/icons-material/Chat';
import SecurityIcon from '@mui/icons-material/Security'; // For Moderation
import LinkIcon from '@mui/icons-material/Link'; // For Account Linking
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment'; // For Logs & Health
import BuildIcon from '@mui/icons-material/Build'; // For Dev Tools
import HelpIcon from '@mui/icons-material/Help';

const drawerWidth = 240;

interface SidebarItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const mainItems: SidebarItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Services', icon: <DnsIcon />, path: '/services' },
  { text: 'Unified Chat', icon: <ChatIcon />, path: '/chat' },
  { text: 'Moderation Center', icon: <SecurityIcon />, path: '/moderation' },
  { text: 'Account Linking', icon: <LinkIcon />, path: '/account-linking' },
];

const utilityItems: SidebarItem[] = [
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Logs & Health', icon: <AssessmentIcon />, path: '/logs-health' },
  { text: 'Dev Tools', icon: <BuildIcon />, path: '/dev-tools' },
];

const helpItem: SidebarItem[] = [
  { text: 'Help/Docs', icon: <HelpIcon />, path: '/help' },
];

const Sidebar: React.FC = () => {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar /> {/* For spacing, matches AppBar height */}
      <List>
        {mainItems.map((item) => (
          <ListItem key={item.text} disablePadding component={RouterLink} to={item.path} sx={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {utilityItems.map((item) => (
          <ListItem key={item.text} disablePadding component={RouterLink} to={item.path} sx={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {helpItem.map((item) => (
          <ListItem key={item.text} disablePadding component={RouterLink} to={item.path} sx={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
