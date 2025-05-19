import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { SxProps, Theme } from '@mui/material/styles';

export interface ChatMessageProps {
  id: string | number;
  platform: 'Discord' | 'Twitch' | 'System' | 'Test'; // Added System/Test for internal messages
  username: string;
  message: string;
  timestamp?: string; // e.g., "10:30 AM"
  userColor?: string; // For username color, if available
  avatarUrl?: string; // URL for user avatar
}

const platformColors: Record<ChatMessageProps['platform'], string> = {
  Discord: '#5865F2', // Discord Blurple
  Twitch: '#9146FF',  // Twitch Purple
  System: '#FF6347', // Tomato (for system messages)
  Test: '#20B2AA',    // LightSeaGreen (for test messages)
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  platform,
  username,
  message,
  timestamp,
  userColor,
  avatarUrl,
}) => {
  const platformIndicatorStyle: SxProps<Theme> = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: platformColors[platform],
    display: 'inline-block',
    marginRight: 1,
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5, p: 1, '&:hover': { backgroundColor: 'action.hover' } }}>
      {avatarUrl ? (
        <Avatar src={avatarUrl} alt={username} sx={{ width: 32, height: 32, mr: 1.5 }} />
      ) : (
        <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: platformColors[platform] }}>
          {username.substring(0, 1).toUpperCase()}
        </Avatar>
      )}
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box component="span" sx={platformIndicatorStyle} title={platform} />
          <Typography 
            variant="subtitle2" 
            component="span" 
            sx={{ fontWeight: 'bold', color: userColor || platformColors[platform], mr: 1 }}
          >
            {username}
          </Typography>
          {timestamp && (
            <Typography variant="caption" color="text.secondary">
              {timestamp}
            </Typography>
          )}
        </Box>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage;
