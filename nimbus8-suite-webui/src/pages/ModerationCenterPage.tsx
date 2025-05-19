import React, { useState } from 'react';
import {
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  PersonRemove as PersonRemoveIcon,
  ChatBubbleOutline as ChatIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Chat as DiscordIcon,
  LiveTv as TwitchIcon
} from '@mui/icons-material';

type User = {
  id: string;
  username: string;
  platform: 'discord' | 'twitch' | 'minecraft';
  avatar?: string;
  status: 'active' | 'muted' | 'banned' | 'warning';
  lastActivity: string;
  joinDate: string;
  messages: number;
  warnings: number;
};

const ModerationCenterPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Mock data - in a real app, this would come from an API
  const mockUsers: User[] = [
    {
      id: '1',
      username: 'StreamFan123',
      platform: 'twitch',
      status: 'active',
      lastActivity: '2 min ago',
      joinDate: '2023-01-15',
      messages: 42,
      warnings: 1
    },
    {
      id: '2',
      username: 'GamerPro',
      platform: 'discord',
      status: 'muted',
      lastActivity: '1 hour ago',
      joinDate: '2022-11-03',
      messages: 128,
      warnings: 0
    },
    {
      id: '3',
      username: 'MineCrafter99',
      platform: 'minecraft',
      status: 'warning',
      lastActivity: '5 min ago',
      joinDate: '2023-02-20',
      messages: 15,
      warnings: 2
    },
    {
      id: '4',
      username: 'TwitchViewer',
      platform: 'twitch',
      status: 'banned',
      lastActivity: '3 days ago',
      joinDate: '2023-01-10',
      messages: 5,
      warnings: 3
    },
  ];

  const filteredUsers = mockUsers.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleAction = (action: string) => {
    console.log(`${action} user:`, selectedUser?.username);
    // In a real app, this would dispatch an action to your backend
    handleMenuClose();
  };

  const getStatusChip = (status: User['status']) => {
    const statusConfig = {
      active: { label: 'Active', color: 'success' as const },
      muted: { label: 'Muted', color: 'warning' as const },
      banned: { label: 'Banned', color: 'error' as const },
      warning: { label: 'Warning', color: 'warning' as const },
    };

    return (
      <Chip 
        label={statusConfig[status].label}
        color={statusConfig[status].color}
        size="small"
        variant="outlined"
      />
    );
  };

  const getPlatformIcon = (platform: User['platform']) => {
    const platformIcons = {
      discord: <DiscordIcon sx={{ color: '#5865F2' }} />,
      twitch: <TwitchIcon sx={{ color: '#9146FF' }} />,
      minecraft: '🎮',
    };

    return platformIcons[platform];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Moderation Center
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" color="primary">
            Add Moderator
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Users" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Active</span>
                <Chip label={mockUsers.filter(u => u.status === 'active').length} size="small" />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Muted</span>
                <Chip label={mockUsers.filter(u => u.status === 'muted').length} size="small" color="warning" />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Banned</span>
                <Chip label={mockUsers.filter(u => u.status === 'banned').length} size="small" color="error" />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Warnings</span>
                <Chip label={mockUsers.filter(u => u.warnings > 0).length} size="small" color="warning" />
              </Box>
            } 
          />
        </Tabs>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Platform</TableCell>
                <TableCell>Messages</TableCell>
                <TableCell>Warnings</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {getPlatformIcon(user.platform)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {user.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{getStatusChip(user.status)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.platform.charAt(0).toUpperCase() + user.platform.slice(1)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{user.messages}</TableCell>
                    <TableCell>
                      {user.warnings > 0 ? (
                        <Chip 
                          label={user.warnings}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      ) : (
                        <CheckCircleIcon color="success" fontSize="small" />
                      )}
                    </TableCell>
                    <TableCell>{user.lastActivity}</TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('message')}>
          <ListItemIcon>
            <ChatIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Message</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleAction('warn')}>
          <ListItemIcon>
            <WarningIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Issue Warning</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('mute')}>
          <ListItemIcon>
            <BlockIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Mute User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('kick')}>
          <ListItemIcon>
            <PersonRemoveIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Kick User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('ban')}>
          <ListItemIcon>
            <CancelIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Ban User</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ModerationCenterPage;
