import { Box, Paper, Grid, Typography, useTheme } from '@mui/material';
import { ToiletRequestDTO, UserRole } from '../types';

interface ToiletRequestStatisticsProps {
  pendingRequests: ToiletRequestDTO[];
  inProgressRequests: ToiletRequestDTO[];
  completedRequests: ToiletRequestDTO[];
  userName: string;
  userRole: UserRole;
}

export const ToiletRequestStatistics = ({
  pendingRequests,
  inProgressRequests,
  completedRequests,
  userName,
  userRole,
}: ToiletRequestStatisticsProps) => {
  const theme = useTheme();

  const totalRequests = pendingRequests.length + inProgressRequests.length + completedRequests.length;
  const urgentRequests = [...pendingRequests, ...inProgressRequests].filter(req => req.isUrgent).length;
  const activeRequests = pendingRequests.length + inProgressRequests.length;
  const myRequests = [...pendingRequests, ...inProgressRequests, ...completedRequests]
    .filter(req => req.statusChangedBy === userName).length;

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const StatCard = ({ title, value, total, color }: { 
    title: string; 
    value: number;
    total: number;
    color: string;
  }) => (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[2],
        },
      }}
    >
      <Typography 
        variant="h4" 
        component="div" 
        sx={{ 
          color: color,
          fontWeight: 'bold',
          mb: 1,
        }}
      >
        {value}
      </Typography>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          color: theme.palette.text.secondary,
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          color: theme.palette.text.secondary,
        }}
      >
        {getPercentage(value, total)}% of total
      </Typography>
    </Paper>
  );

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