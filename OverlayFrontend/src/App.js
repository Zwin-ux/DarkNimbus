import React, { useEffect, useState } from 'react';
import { CssBaseline, Box, Typography, Paper, List, ListItem, ListItemText, AppBar, Toolbar, IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import GavelIcon from '@mui/icons-material/Gavel';
import ModActions from './ModActions';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:4002';

function App() {
  const [messages, setMessages] = useState([]);
  const [bans, setBans] = useState([]);

  useEffect(() => {
    const ws = new window.WebSocket(WS_URL);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') setMessages(msgs => [...msgs, data]);
      if (data.type === 'ban') setBans(bs => [...bs, data]);
    };
    return () => ws.close();
  }, []);

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          <ChatIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Nimbus8 Mod Dashboard</Typography>
          <IconButton color="inherit"><GavelIcon /></IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <ModActions />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Paper sx={{ flex: 2, p: 2, minHeight: 400 }}>
            <Typography variant="h6">Chat Feed</Typography>
            <List>
              {messages.map((msg, i) => (
                <ListItem key={i} divider>
                  <ListItemText
                    primary={<>{msg.userstate?.['display-name'] || msg.userstate?.username}: {msg.message}</>}
                    secondary={msg.channel}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
          <Paper sx={{ flex: 1, p: 2, minHeight: 400 }}>
            <Typography variant="h6">Ban Feed</Typography>
            <List>
              {bans.map((ban, i) => (
                <ListItem key={i} divider>
                  <ListItemText
                    primary={<>{ban.username} banned in {ban.channel}</>}
                    secondary={ban.reason || 'No reason provided'}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
    </>
  );
}

export default App;
