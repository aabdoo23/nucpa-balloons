import { Box, Grid, Paper, Typography, useTheme, alpha, Tooltip, Stack } from '@mui/material';
import { BalloonRequestDTO } from '../types';

const colorMap: { [key: string]: string } = {
  purple: '#9c27b0',
  red: '#f44336',
  blue: '#2196f3',
  green: '#4caf50',
  yellow: '#ffeb3b',
  orange: '#ff9800',
  pink: '#e91e63',
  brown: '#795548',
  black: '#212121',
  white: '#fafafa',
  gray: '#9e9e9e',
  cyan: '#00bcd4',
  lime: '#cddc39',
  indigo: '#3f51b5',
  violet: '#9c27b0',
  magenta: '#e91e63',
};

interface StatisticsProps {
  pendingBalloons: BalloonRequestDTO[];
  readyForPickupBalloons: BalloonRequestDTO[];
  pickedUpBalloons: BalloonRequestDTO[];
  deliveredBalloons: BalloonRequestDTO[];
  userName: string;
  userRole: string;
}

interface ColorCount {
  color: string;
  count: number;
}

export const Statistics = ({
  pendingBalloons,
  readyForPickupBalloons,
  pickedUpBalloons,
  deliveredBalloons,
  userName,
  userRole,
}: StatisticsProps) => {
  const theme = useTheme();

  const allBalloons = [...pendingBalloons, ...readyForPickupBalloons, ...pickedUpBalloons, ...deliveredBalloons];
  
  const getBalloonColor = (color: string): string => {
    const normalizedColor = color.toLowerCase();
    return colorMap[normalizedColor] || '#9e9e9e'; // fallback to grey if color not found
  };

  // Get color counts
  const colorCounts = allBalloons.reduce<ColorCount[]>((acc, balloon) => {
    const existingColor = acc.find(c => c.color.toLowerCase() === balloon.balloonColor.toLowerCase());
    if (existingColor) {
      existingColor.count++;
    } else {
      if (userRole === 'courier' && balloon.status === 'ReadyForPickup') {
          acc.push({ 
            color: balloon.balloonColor,
            count: 1 
          });
      } else if (userRole === 'balloonPrep' && balloon.status === 'Pending') {
        acc.push({ 
          color: balloon.balloonColor,
            count: 1 
        });
      }
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  const stats = [
    {
      title: 'Total',
      count: allBalloons.length,
      color: theme.palette.primary.main,
      tooltip: 'Total balloons in the system',
    },
    {
      title: 'Ready',
      count: readyForPickupBalloons.length,
      color: theme.palette.warning.main,
      tooltip: 'Balloons ready for pickup',
    },
    {
      title: 'Active',
      count: pickedUpBalloons.length,
      color: theme.palette.info.main,
      tooltip: 'Balloons currently being delivered',
    },
    {
      title: 'Done',
      count: deliveredBalloons.length,
      color: theme.palette.success.main,
      tooltip: 'Successfully delivered balloons',
    },
  ];

  const myStats = [
    {
      title: 'My Pickups',
      count: pickedUpBalloons.filter(b => b.statusChangedBy === userName).length,
      color: theme.palette.primary.main,
    },
    {
      title: 'My Deliveries',
      count: deliveredBalloons.filter(b => b.statusChangedBy === userName).length,
      color: theme.palette.success.main,
    },
  ];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 3,
        bgcolor: alpha(theme.palette.primary.main, 0.02),
      }}
    >
      <Grid container spacing={2}>
        {/* Main stats */}
        <Grid item xs={12} md={4}>
          <Stack direction="row" spacing={2} justifyContent="center">
            {stats.map((stat) => (
              <Tooltip key={stat.title} title={stat.tooltip}>
                <Paper
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1,
                    textAlign: 'center',
                    bgcolor: alpha(stat.color, 0.05),
                    flex: 1,
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: stat.color,
                      fontWeight: 'bold',
                      lineHeight: 1,
                    }}
                  >
                    {stat.count}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      fontWeight: 'medium',
                    }}
                  >
                    {stat.title}
                  </Typography>
                </Paper>
              </Tooltip>
            ))}
          </Stack>
        </Grid>

        {/* Color distribution */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {colorCounts.map(({ color, count }) => {
              const hexColor = getBalloonColor(color);
              return (
                <Tooltip key={color} title={`${color} Balloons`}>
                  <Paper
                    elevation={0}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: alpha(hexColor, 0.1),
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: hexColor,
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 'medium',
                        color: theme.palette.text.primary,
                      }}
                    >
                      {count}
                    </Typography>
                  </Paper>
                </Tooltip>
              );
            })}
          </Box>
        </Grid>

        {/* Personal stats */}
        <Grid item xs={12} md={3}>
          <Stack direction="row" spacing={1} justifyContent="center">
            {myStats.map((stat) => (
              <Tooltip key={stat.title} title={stat.title}>
                <Paper
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1,
                    textAlign: 'center',
                    bgcolor: alpha(stat.color, 0.05),
                    flex: 1,
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: stat.color,
                      fontWeight: 'bold',
                      lineHeight: 1,
                    }}
                  >
                    {stat.count}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      fontWeight: 'medium',
                    }}
                  >
                    {stat.title.split(' ')[1]}
                  </Typography>
                </Paper>
              </Tooltip>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}; 