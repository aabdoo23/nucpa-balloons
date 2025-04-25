import { Box, Grid, Paper, Typography, useTheme, alpha, Tooltip, Stack } from '@mui/material';
import { BalloonRequestDTO } from '../types';
import { balloonColors, getBalloonColor } from '../config/colors';

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

  // Sort all balloons by timestamp from earliest to latest
  const allBalloons = [
    ...pendingBalloons,
    ...readyForPickupBalloons,
    ...pickedUpBalloons,
    ...deliveredBalloons
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
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
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Statistics
      </Typography>
      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Tooltip title={stat.tooltip}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: alpha(stat.color, 0.1),
                  border: `1px solid ${alpha(stat.color, 0.2)}`,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  {stat.title}
                </Typography>
                <Typography variant="h4" color={stat.color} fontWeight="bold">
                  {stat.count}
                </Typography>
              </Paper>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
      {colorCounts.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Balloons by Color
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {colorCounts.map(({ color, count }) => (
              <Tooltip key={color} title={`${count} ${color} balloons`}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: alpha(getBalloonColor(color), 0.1),
                    border: `1px solid ${alpha(getBalloonColor(color), 0.2)}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: getBalloonColor(color),
                    }}
                  />
                  <Typography variant="body2">
                    {color} ({count})
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}; 