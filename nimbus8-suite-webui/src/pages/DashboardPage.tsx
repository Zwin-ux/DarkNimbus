import React from 'react';
import { Box, Typography } from '@mui/material';
import type { ServiceCardProps } from '../components/ServiceCard';
import ServiceCard from '../components/ServiceCard';

// Mock data for services - in a real app, this would come from state/API
const mockServices: ServiceCardProps[] = [
  {
    serviceName: 'Discord Bot',
    status: 'Online',
    onStop: () => console.log('Stopping Discord Bot'),
    onRestart: () => console.log('Restarting Discord Bot'),
    onViewLogs: () => console.log('Viewing Discord Bot Logs'),
  },
  {
    serviceName: 'Twitch Integration',
    status: 'Offline',
    onStart: () => console.log('Starting Twitch Integration'),
    onViewLogs: () => console.log('Viewing Twitch Integration Logs'),
  },
  {
    serviceName: 'Minecraft Bridge',
    status: 'Error',
    onStart: () => console.log('Starting Minecraft Bridge'),
    onRestart: () => console.log('Restarting Minecraft Bridge'),
    onViewLogs: () => console.log('Viewing Minecraft Bridge Logs'),
  },
  {
    serviceName: 'API Gateway',
    status: 'Online',
    onStop: () => console.log('Stopping API Gateway'),
    onRestart: () => console.log('Restarting API Gateway'),
    onViewLogs: () => console.log('Viewing API Gateway Logs'),
  },
  {
    serviceName: 'Overlay Frontend',
    status: 'Starting',
    onStop: () => console.log('Stopping Overlay Frontend'),
    onViewLogs: () => console.log('Viewing Overlay Frontend Logs'),
  },
];

const DashboardPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Dashboard - Mission Control
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {mockServices.map((service) => (
            <Box key={service.serviceName}>
              <ServiceCard
                serviceName={service.serviceName}
                status={service.status}
                onStart={service.onStart}
                onStop={service.onStop}
                onRestart={service.onRestart}
                onViewLogs={service.onViewLogs}
              />
            </Box>
          ))}
        </Box>
      </Box>
      {/* Placeholder for System Health, Latest Logs, Alerts - to be added later */}
    </Box>
  );
};

export default DashboardPage;
