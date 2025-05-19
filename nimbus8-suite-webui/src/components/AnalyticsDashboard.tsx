import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsService, AnalyticsData } from '../services/AnalyticsService';

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={1}>
        <Box mr={1} color={color}>
          {icon}
        </Box>
        <Typography color="textSecondary" variant="body2">
          {title}
        </Typography>
      </Box>
      <Typography variant="h5">{value}</Typography>
    </CardContent>
  </Card>
);

const PlatformViewers = ({ data }: { data: AnalyticsData['viewers']['platforms'] }) => {
  const chartData = Object.entries(data).map(([platform, count]) => ({
    platform,
    viewers: count
  }));

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Viewers by Platform</Typography>
        <Box height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="viewers" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const ServerMetrics = ({ metrics }: { metrics: AnalyticsData['serverMetrics'] }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>Server Metrics</Typography>
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">CPU Usage</Typography>
          <Typography variant="body2">{metrics.cpu.toFixed(1)}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={metrics.cpu} color="secondary" />
      </Box>
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">Memory Usage</Typography>
          <Typography variant="body2">{metrics.memory.toFixed(1)}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={metrics.memory} color="primary" />
      </Box>
      <Box>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">Response Time</Typography>
          <Typography variant="body2">{metrics.responseTime.toFixed(0)}ms</Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={Math.min(100, metrics.responseTime / 10)} 
          color={metrics.responseTime > 500 ? 'error' : 'success'}
        />
      </Box>
    </CardContent>
  </Card>
);

const ChatActivity = ({ data }: { data: AnalyticsData['chatActivity'] }) => {
  const [history, setHistory] = useState<{time: string; messages: number}[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      setHistory(prev => {
        const newHistory = [...prev, { time, messages: data.messagesPerMinute }];
        return newHistory.slice(-10); // Keep last 10 data points
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [data.messagesPerMinute]);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Chat Activity</Typography>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <div>
            <Typography variant="body2" color="textSecondary">Messages/min</Typography>
            <Typography variant="h4">{data.messagesPerMinute}</Typography>
          </div>
          <div>
            <Typography variant="body2" color="textSecondary">Active Chatters</Typography>
            <Typography variant="h4">{data.activeChatters}</Typography>
          </div>
          <div>
            <Typography variant="body2" color="textSecondary">Sentiment</Typography>
            <Typography variant="h4" color={data.sentiment > 0 ? 'success.main' : data.sentiment < 0 ? 'error.main' : 'text.primary'}>
              {data.sentiment > 0 ? '😊' : data.sentiment < 0 ? '😞' : '😐'}
            </Typography>
          </div>
        </Box>
        <Box height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="messages" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export const AnalyticsDashboard = () => {
  const [data, setData] = useState(analyticsService.getCurrentData());

  useEffect(() => {
    const onUpdate = (newData: AnalyticsData) => {
      setData(newData);
    };

    analyticsService.on('update', onUpdate);
    return () => {
      analyticsService.off('update', onUpdate);
    };
  }, []);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>Analytics Dashboard</Typography>
      
      {/* Stats Row */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3
      }}>
        <Box>
          <StatCard 
            title="Total Viewers" 
            value={data.viewers.total.toLocaleString()} 
            icon="👥"
            color="#3f51b5"
          />
        </Box>
        <Box>
          <StatCard 
            title="Chat Activity" 
            value={`${data.chatActivity.activeChatters} active`} 
            icon="💬"
            color="#4caf50"
          />
        </Box>
        <Box>
          <StatCard 
            title="Server Load" 
            value={`${data.serverMetrics.cpu.toFixed(1)}% CPU`} 
            icon="⚡"
            color={data.serverMetrics.cpu > 80 ? "#f44336" : "#ff9800"}
          />
        </Box>
        <Box>
          <StatCard 
            title="Response Time" 
            value={`${data.serverMetrics.responseTime.toFixed(0)}ms`} 
            icon="⏱️"
            color={data.serverMetrics.responseTime > 500 ? "#f44336" : "#2196f3"}
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        gap: 3,
        mb: 3
      }}>
        <Box>
          <PlatformViewers data={data.viewers.platforms} />
        </Box>
        <Box>
          <ServerMetrics metrics={data.serverMetrics} />
        </Box>
      </Box>
      <Box sx={{ width: '100%' }}>
        <ChatActivity data={data.chatActivity} />
      </Box>
    </Box>
  );
};

export default AnalyticsDashboard;
