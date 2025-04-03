import { Box, Grid, Typography, useTheme } from '@mui/material';
import { ToiletRequestDTO } from '../../types';
import { StatCard } from './StatCard';

interface ToiletRequestStatisticsProps {
  pendingRequests: ToiletRequestDTO[];
  inProgressRequests: ToiletRequestDTO[];
  completedRequests: ToiletRequestDTO[];
  userName: string;
}

export const ToiletRequestStatistics = ({
  pendingRequests,
  inProgressRequests,
  completedRequests,
  userName,
}: ToiletRequestStatisticsProps) => {
  const theme = useTheme();

  const totalRequests = pendingRequests.length + inProgressRequests.length + completedRequests.length;
  const urgentRequests = [...pendingRequests, ...inProgressRequests].filter(req => req.isUrgent).length;
  const activeRequests = pendingRequests.length + inProgressRequests.length;
  const myRequests = [...pendingRequests, ...inProgressRequests, ...completedRequests]
    .filter(req => req.statusChangedBy === userName).length;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h5" 
        component="h2" 
        sx={{ 
          mb: 2,
          fontWeight: 'bold',
          color: theme.palette.text.primary,
        }}
      >
        Statistics
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Requests"
            value={activeRequests}
            total={totalRequests}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Urgent Requests"
            value={urgentRequests}
            total={activeRequests}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Requests"
            value={myRequests}
            total={totalRequests}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={completedRequests.length}
            total={totalRequests}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>
    </Box>
  );
}; 