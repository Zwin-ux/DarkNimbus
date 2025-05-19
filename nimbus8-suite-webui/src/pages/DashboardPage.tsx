import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import type { ServiceCardProps } from '../components/ServiceCard';
import ServiceCard from '../components/ServiceCard';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const DashboardPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper square>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Analytics" {...a11yProps(1)} />
          <Tab label="Services" {...a11yProps(2)} />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h4" gutterBottom>Overview</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 3 }}>
          <Box>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            {/* Add quick action buttons here */}
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>System Status</Typography>
            {/* Add system status indicators here */}
          </Box>
        </Box>
        <Typography variant="h6" gutterBottom>Services</Typography>
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
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <AnalyticsDashboard />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h4" gutterBottom>Services Management</Typography>
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
      </TabPanel>
    </Box>
  );
};

export default DashboardPage;
