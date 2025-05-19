import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircleIcon from '@mui/icons-material/Circle'; // For status indicator

export interface ServiceCardProps {
  serviceName: string;
  status: 'Online' | 'Offline' | 'Starting' | 'Error';
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onViewLogs?: () => void;
}

const statusColors: Record<ServiceCardProps['status'], string> = {
  Online: 'green',
  Offline: 'grey',
  Starting: 'orange',
  Error: 'red',
};

const ServiceCard: React.FC<ServiceCardProps> = ({
  serviceName,
  status,
  onStart,
  onStop,
  onRestart,
  onViewLogs,
}) => {
  return (
    <Card sx={{ minWidth: 275, m: 1 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {serviceName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CircleIcon sx={{ color: statusColors[status], mr: 1, fontSize: 'small' }} />
          <Typography variant="body2" color="text.secondary">
            Status: {status}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        {onStart && <Button size="small" onClick={onStart} disabled={status === 'Online' || status === 'Starting'}>Start</Button>}
        {onStop && <Button size="small" onClick={onStop} disabled={status === 'Offline'}>Stop</Button>}
        {onRestart && <Button size="small" onClick={onRestart} disabled={status === 'Offline'}>Restart</Button>}
        {onViewLogs && <Button size="small" onClick={onViewLogs}>Logs</Button>}
      </CardActions>
    </Card>
  );
};

export default ServiceCard;
