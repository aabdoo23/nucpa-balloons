import { Box, Button, Card, CardContent, Typography, useTheme } from '@mui/material';
import { BalloonRequestDTO } from '../types';
import { getBalloonColor } from '../config/colors';

interface ColorBalloonListProps {
  balloons: BalloonRequestDTO[];
  onMarkReady: (balloon: BalloonRequestDTO) => void;
}

export const ColorBalloonList = ({ balloons, onMarkReady }: ColorBalloonListProps) => {
  const theme = useTheme();

  // Sort all balloons by timestamp from earliest to latest
  const sortedBalloons = [...balloons].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Group balloons by color
  const balloonsByColor = sortedBalloons.reduce((acc, balloon) => {
    const color = balloon.balloonColor.toLowerCase();
    if (!acc[color]) {
      acc[color] = [];
    }
    acc[color].push(balloon);
    return acc;
  }, {} as Record<string, BalloonRequestDTO[]>);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      {Object.entries(balloonsByColor).map(([color, colorBalloons]) => (
        <Card 
          key={color} 
          sx={{ 
            minWidth: 200,
            flex: '1 1 auto',
            backgroundColor: getBalloonColor(color),
            color: theme.palette.getContrastText(getBalloonColor(color)),
          }}
        >
          <CardContent>
            <Typography variant="h5" component="div" sx={{ mb: 1 }}>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </Typography>
            <Typography variant="h3" component="div" sx={{ mb: 2 }}>
              {colorBalloons.length}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                if (colorBalloons.length > 0) {
                  onMarkReady(colorBalloons[0]); // This will now be the oldest balloon
                }
              }}
              sx={{
                backgroundColor: theme.palette.common.white,
                color: 'black',
                '&:hover': {
                  backgroundColor: theme.palette.common.white,
                  opacity: 0.9,
                },
              }}
            >
              Mark One Ready
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}; 