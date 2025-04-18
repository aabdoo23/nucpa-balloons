import {
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Typography,
  Chip,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { BalloonRequestDTO, UserRole } from '../types';
import { getRoomFromTeamName } from '../utils/roomMapping';

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

interface BalloonItemProps {
  balloon: BalloonRequestDTO;
  showActions?: boolean;
  userRole?: UserRole;
  onMarkReady?: (balloon: BalloonRequestDTO) => void;
  onPickup?: (balloon: BalloonRequestDTO) => void;
  onDelivery?: (balloon: BalloonRequestDTO) => void;
  onRevert?: (balloon: BalloonRequestDTO) => void;
}

export const BalloonItem = ({
  balloon,
  showActions,
  userRole,
  onMarkReady,
  onPickup,
  onDelivery,
  onRevert,
}: BalloonItemProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return theme.palette.grey[600];
      case 'ReadyForPickup':
        return theme.palette.warning.main;
      case 'PickedUp':
        return theme.palette.info.main;
      case 'Delivered':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[600];
    }
  };

  const getBalloonColor = (color: string): string => {
    const normalizedColor = color.toLowerCase();
    return colorMap[normalizedColor] || '#9e9e9e'; // fallback to grey if color not found
  };

  const balloonColor = getBalloonColor(balloon.balloonColor);

  return (
    <Card 
      sx={{ 
        mb: 2,
        borderLeft: isMobile ? 15 : 25,
        borderColor: balloonColor,
        bgcolor: alpha(balloonColor, 0.02),
        '&:hover': {
          boxShadow: theme.shadows[3],
          bgcolor: alpha(balloonColor, 0.04),
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: 1 
          }}>
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              component="div"
              sx={{ 
                mb: isMobile ? 1 : 0,
                color: theme.palette.text.primary,
                fontWeight: 'bold',
              }}
            >
              Team {balloon.teamName}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 1,
              width: isMobile ? '100%' : 'auto'
            }}>
              <Chip
                label={`Problem ${balloon.problemIndex}`}
                size={isMobile ? "medium" : "small"}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${getRoomFromTeamName(balloon.teamName)}`}
                size={isMobile ? "medium" : "small"}
                color="secondary"
                variant="outlined"
              />
              <Chip
                label={balloon.balloonColor}
                size={isMobile ? "medium" : "small"}
                sx={{
                  backgroundColor: balloonColor,
                  color: theme.palette.getContrastText(balloonColor),
                  fontWeight: 'bold',
                  minWidth: isMobile ? '100px' : '80px',
                  textAlign: 'center',
                }}
              />
              <Chip
                label={balloon.status}
                size={isMobile ? "medium" : "small"}
                sx={{
                  backgroundColor: alpha(getStatusColor(balloon.status), 0.1),
                  color: getStatusColor(balloon.status),
                  borderColor: getStatusColor(balloon.status),
                  fontWeight: 'medium',
                }}
              />
            </Box>
          </Box>
          
          <Divider sx={{ borderColor: alpha(balloonColor, 0.1) }} />
          
          <Stack spacing={1}>
          <Typography 
              variant="body1" 
              fontWeight='medium'
              sx={{ color: theme.palette.text.primary }}
            >
              Team Id: {balloon.teamId}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: theme.palette.text.secondary }}
            >
              Submitted: {new Date(balloon.timestamp).toLocaleString()}
            </Typography>
            {balloon.statusChangedAt && (
              <Typography 
                variant="body2" 
                sx={{ color: theme.palette.text.secondary }}
              >
                Status changed: {new Date(balloon.statusChangedAt).toLocaleString()}
                {balloon.statusChangedBy && (
                  <Typography 
                    component="span" 
                    sx={{ 
                      color: theme.palette.primary.main,
                      ml: 0.5,
                      fontWeight: 'medium',
                    }}
                  >
                    by {balloon.statusChangedBy}
                  </Typography>
                )}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
      
      {showActions && (
        <CardActions 
          sx={{ 
            justifyContent: 'flex-end', 
            pt: 0,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0
          }}
        >
          {userRole === 'balloonPrep' && balloon.status === 'Pending' && onMarkReady && (
            <Button
              variant="outlined"
              color="warning"
              onClick={() => onMarkReady(balloon)}
              fullWidth={isMobile}
              sx={{ mr: isMobile ? 0 : 1 }}
            >
              Mark Ready
            </Button>
          )}
          {userRole === 'courier' && balloon.status === 'ReadyForPickup' && onPickup && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => onPickup(balloon)}
              fullWidth={isMobile}
              sx={{ mr: isMobile ? 0 : 1 }}
            >
              Pick Up
            </Button>
          )}
          {userRole === 'courier' && balloon.status === 'PickedUp' && onDelivery && (
            <Button
              variant="outlined"
              color="success"
              onClick={() => onDelivery(balloon)}
              fullWidth={isMobile}
            >
              Deliver
            </Button>
          )}
          {userRole === 'courier' && balloon.status === 'Delivered' && onRevert && (
            <Button
              variant="outlined"
              color="warning"
              onClick={() => onRevert(balloon)}
              fullWidth={isMobile}
            >
              Revert to Picked Up
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
}; 