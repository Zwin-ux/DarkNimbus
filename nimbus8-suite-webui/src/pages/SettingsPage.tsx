import { useEffect, useState } from 'react';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';

interface ApiSettings {
  discordBotToken: string;
  twitchClientId: string;
  twitchClientSecret: string; // Added as per typical Twitch setup
}

// Mock function to load settings (e.g., from localStorage or backend in future)
const loadSettings = (): ApiSettings => {
  // For now, return defaults or previously mock-saved values
  // In a real app, this would be an async call
  console.log('Pretending to load settings...');
  return {
    discordBotToken: localStorage.getItem('settings_discordBotToken') || '',
    twitchClientId: localStorage.getItem('settings_twitchClientId') || '',
    twitchClientSecret: localStorage.getItem('settings_twitchClientSecret') || '',
  };
};

// Mock function to save settings
const saveSettings = (settings: ApiSettings) => {
  // In a real app, this would be an async call to a backend
  console.log('Saving settings:', settings);
  localStorage.setItem('settings_discordBotToken', settings.discordBotToken);
  localStorage.setItem('settings_twitchClientId', settings.twitchClientId);
  localStorage.setItem('settings_twitchClientSecret', settings.twitchClientSecret);
  alert('Settings saved to console and localStorage (mock)!'); // User feedback
};

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<ApiSettings>(loadSettings());
  const [initialSettings, setInitialSettings] = useState<ApiSettings>(loadSettings());

  useEffect(() => {
    // Simulate loading settings on component mount
    const loaded = loadSettings();
    setSettings(loaded);
    setInitialSettings(loaded);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSave = () => {
    saveSettings(settings);
    setInitialSettings(settings); // Update initial settings to reflect saved state
  };

  const handleCancel = () => {
    setSettings(initialSettings); // Revert to last saved/loaded state
    console.log('Cancelled changes, reverted to:', initialSettings);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Application Settings
      </Typography>
      
      <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2, mb: 1 }}>
        API Keys & Tokens
      </Typography>

      <Box component="form" noValidate autoComplete="off">
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Box>
            <TextField
              fullWidth
              type="password" // Use password type for sensitive tokens
              label="Discord Bot Token"
              name="discordBotToken"
              value={settings.discordBotToken}
              onChange={handleChange}
              variant="outlined"
              helperText="Enter your Discord application's bot token."
              sx={{ mb: 2 }}
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                label="Twitch Client ID"
                name="twitchClientId"
                value={settings.twitchClientId}
                onChange={handleChange}
                variant="outlined"
                helperText="Enter your Twitch application's Client ID."
                sx={{ mb: 2 }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                type="password"
                label="Twitch Client Secret"
                name="twitchClientSecret"
                value={settings.twitchClientSecret}
                onChange={handleChange}
                variant="outlined"
                helperText="Enter your Twitch application's Client Secret."
                sx={{ mb: 2 }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleCancel} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} color="primary">
            Save Settings
          </Button>
        </Box>
      </Box>
      
      {/* Placeholder for Feature Toggles and Export/Import - to be added later */}
    </Paper>
  );
};

export default SettingsPage;
