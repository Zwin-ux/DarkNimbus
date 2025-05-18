import React, { useState } from 'react';
import { Box, Paper, Typography, Button, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';

const TESTS = [
  {
    name: 'Discord Kick User',
    endpoint: '/unified/mod_action/ban',
    payload: { platform: 'discord', user_id: 'testuser123' },
  },
  {
    name: 'Discord Timeout User',
    endpoint: '/unified/mod_action/timeout',
    payload: { platform: 'discord', user_id: 'testuser123', duration: 60 },
  },
  {
    name: 'Discord Assign Role',
    endpoint: '/unified/mod_action/role',
    payload: { platform: 'discord', user_id: 'testuser123', role: 'moderator' },
  },
  {
    name: 'Twitch Ban User',
    endpoint: '/unified/mod_action/ban',
    payload: { platform: 'twitch', user_id: 'testuser123' },
  },
];

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function TestPanel() {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const runTests = async () => {
    setRunning(true);
    setResults([]);
    setError(null);
    const out = [];
    for (const test of TESTS) {
      try {
        const resp = await fetch(API_URL + test.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(test.payload),
        });
        const data = await resp.json();
        out.push({ name: test.name, status: resp.ok ? 'pass' : 'fail', response: data });
      } catch (err) {
        out.push({ name: test.name, status: 'fail', response: err.message });
      }
    }
    setResults(out);
    setRunning(false);
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Integration Test Panel</Typography>
      <Button variant="contained" color="secondary" onClick={runTests} disabled={running} sx={{ mt: 2 }}>
        {running ? <><CircularProgress size={20} sx={{ mr: 1 }} />Running...</> : 'Run Test Suite'}
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <List sx={{ mt: 2 }}>
        {results.map((res, i) => (
          <ListItem key={i} divider>
            <ListItemText
              primary={<>{res.name}: <b style={{ color: res.status === 'pass' ? 'green' : 'red' }}>{res.status.toUpperCase()}</b></>}
              secondary={<pre style={{ margin: 0 }}>{JSON.stringify(res.response, null, 2)}</pre>}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
