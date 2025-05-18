import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/unified/mod_action';

export default function ModActions() {
  const [platform, setPlatform] = useState('discord');
  const [userId, setUserId] = useState('');
  const [duration, setDuration] = useState(600);
  const [role, setRole] = useState('moderator');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const handleAction = async (action) => {
    let url = API_URL;
    let body = { platform, user_id: userId };
    if (action === 'ban') url += '/ban';
    if (action === 'timeout') { url += '/timeout'; body.duration = duration; }
    if (action === 'role') { url += '/role'; body.role = role; }
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Action failed');
      setResult(data);
      setError(null);
      setOpen(true);
    } catch (err) {
      setError(err.message);
      setOpen(true);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Mod Actions</Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Platform</InputLabel>
          <Select value={platform} label="Platform" onChange={e => setPlatform(e.target.value)}>
            <MenuItem value="discord">Discord</MenuItem>
            <MenuItem value="twitch">Twitch</MenuItem>
          </Select>
        </FormControl>
        <TextField label="User ID / Username" value={userId} onChange={e => setUserId(e.target.value)} />
        <TextField label="Timeout (s)" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} sx={{ width: 120 }} />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Role</InputLabel>
          <Select value={role} label="Role" onChange={e => setRole(e.target.value)}>
            <MenuItem value="moderator">Moderator</MenuItem>
            <MenuItem value="member">Member</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="error" onClick={() => handleAction('ban')}>Ban/Kick</Button>
        <Button variant="contained" color="warning" onClick={() => handleAction('timeout')}>Timeout</Button>
        <Button variant="contained" color="primary" onClick={() => handleAction('role')}>Assign Role</Button>
      </Box>
      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
        {error ? <Alert severity="error">{error}</Alert> : result && <Alert severity="success">{JSON.stringify(result)}</Alert>}
      </Snackbar>
    </Paper>
  );
}
