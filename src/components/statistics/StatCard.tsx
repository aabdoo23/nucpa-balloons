import { Paper, Typography, useTheme } from '@mui/material';

interface StatCardProps {
  title: string;
  value: number;
  total: number;
  color: string;
}

export const StatCard = ({ title, value, total, color }: StatCardProps) => {
  const theme = useTheme();

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
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
}; 