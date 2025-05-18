import React, { useEffect, useState } from 'react';
import { 
  CssBaseline, 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Chip, 
  TextField, 
  Button, 
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import GavelIcon from '@mui/icons-material/Gavel';
import ModActions from './ModActions';
import TestPanel from './TestPanel';

// Use the same port as the API Gateway's WebSocket server
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

function App() {
  const [chatMessages, setChatMessages] = useState([]);
  const [bans, setBans] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [platform, setPlatform] = useState('twitch');
  const [username, setUsername] = useState('TestUser');

  // Connect to WebSocket server for real-time chat with reconnection
  useEffect(() => {
    let ws;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 1000; // Start with 1 second delay
    
    const connect = () => {
      console.log(`Connecting to WebSocket server (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
      ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        console.log('Connected to WebSocket server');
        setWsConnected(true);
        setWsError(null);
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);
          
          // Handle chat messages (from /chat/message endpoint)
          if (message.platform) {
            setChatMessages(msgs => [...msgs, message].slice(-100)); // Keep last 100 messages
          }
          // Handle ban events (if needed)
          else if (message.type === 'ban') {
            setBans(bs => [...bs, message].slice(-20)); // Keep last 20 bans
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsError('Failed to connect to chat server');
        setWsConnected(false);
      };
      
      ws.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} ${event.reason || 'No reason provided'}`);
        setWsConnected(false);
        
        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts < maxReconnectAttempts - 1) {
          const delay = reconnectDelay * Math.pow(2, reconnectAttempts); // Exponential backoff
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, delay);
        } else {
          setWsError('Disconnected from chat server. Please refresh the page to reconnect.');
        }
      };
    };
    
    // Initial connection
    connect();
    
    // Cleanup function
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          <ChatIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Nimbus8 Mod Dashboard</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={wsConnected ? 'Connected' : 'Disconnected'} 
              color={wsConnected ? 'success' : 'error'} 
              size="small" 
            />
            <IconButton color="inherit"><GavelIcon /></IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <TestPanel />
        <ModActions />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Paper sx={{ flex: 2, p: 2, minHeight: 500, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Unified Chat</Typography>
              <Chip 
                label={`${chatMessages.length} messages`} 
                size="small" 
                variant="outlined"
              />
            </Box>
            
            {/* Message Input */}
            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Send Test Message</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Platform</InputLabel>
                  <Select
                    value={platform}
                    label="Platform"
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    <MenuItem value="twitch">Twitch</MenuItem>
                    <MenuItem value="discord">Discord</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Message"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && messageInput.trim()) {
                      const testMessage = {
                        platform,
                        username,
                        content: messageInput,
                        timestamp: Date.now(),
                      };
                      setChatMessages(msgs => [...msgs, testMessage].slice(-100));
                      setMessageInput('');
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={() => {
                    if (messageInput.trim()) {
                      const testMessage = {
                        platform,
                        username,
                        content: messageInput,
                        timestamp: Date.now(),
                      };
                      setChatMessages(msgs => [...msgs, testMessage].slice(-100));
                      setMessageInput('');
                    }
                  }}
                >
                  Send
                </Button>
              </Stack>
              <FormHelperText>This is for testing. In production, messages will come from Twitch/Discord.</FormHelperText>
            </Box>
            <List sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.paper', borderRadius: 1, p: 1 }}>
              {chatMessages.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="No messages yet" 
                    secondary={wsError || 'Waiting for chat activity...'} 
                    sx={{ textAlign: 'center', color: 'text.secondary' }}
                  />
                </ListItem>
              ) : (
                chatMessages.map((msg, i) => (
                  <ListItem 
                    key={i} 
                    alignItems="flex-start"
                    sx={{
                      borderLeft: `3px solid ${msg.platform === 'twitch' ? '#9147ff' : '#5865F2'}`,
                      mb: 0.5,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={msg.platform || 'unknown'} 
                            size="small" 
                            sx={{ 
                              height: 18, 
                              fontSize: '0.65rem',
                              bgcolor: msg.platform === 'twitch' ? '#9147ff33' : '#5865F233',
                              color: msg.platform === 'twitch' ? '#bf94ff' : '#9ca3f0',
                            }}
                          />
                          <Typography component="span" fontWeight="bold" color="primary">
                            {msg.username}:
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography component="span" sx={{ wordBreak: 'break-word' }}>
                          {msg.content}
                        </Typography>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
          <Paper sx={{ flex: 1, p: 2, minHeight: 500, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Bans</Typography>
            <List sx={{ flex: 1, overflowY: 'auto' }}>
              {bans.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="No recent bans" 
                    secondary="Bans will appear here" 
                    sx={{ textAlign: 'center', color: 'text.secondary' }}
                  />
                </ListItem>
              ) : (
                bans.map((ban, i) => (
                  <ListItem key={i} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography component="span" fontWeight="medium">
                            {ban.username}
                          </Typography>
                          <Chip 
                            label={ban.platform || 'unknown'} 
                            size="small" 
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" display="block">
                            {ban.reason || 'No reason provided'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(ban.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Box>
      </Box>
    </>
  );
}

export default App;
