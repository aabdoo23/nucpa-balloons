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
} from '@mui/material';
import { BalloonRequestDTO, UserRole } from '../types';

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
        return 'default';
      case 'ReadyForPickup':
        return 'warning';
      case 'PickedUp':
        return 'info';
      case 'Delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        borderLeft: isMobile ? 15 : 25,
        borderColor: balloon.balloonColor.toLowerCase(),
        '&:hover': {
          boxShadow: 3,
        },
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
              sx={{ mb: isMobile ? 1 : 0 }}
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
                label={balloon.balloonColor}
                size={isMobile ? "medium" : "small"}
                sx={{
                  backgroundColor: balloon.balloonColor.toLowerCase(),
                  color: 'white',
                  fontWeight: 'bold',
                  minWidth: isMobile ? '100px' : '80px',
                  textAlign: 'center',
                }}
              />
              <Chip
                label={balloon.status}
                size={isMobile ? "medium" : "small"}
                color={getStatusColor(balloon.status)}
                variant="outlined"
              />
            </Box>
          </Box>
          
          <Divider />
          
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Submitted: {new Date(balloon.timestamp).toLocaleString()}
            </Typography>
            {balloon.statusChangedAt && (
              <Typography variant="body2" color="text.secondary">
                Status changed: {new Date(balloon.statusChangedAt).toLocaleString()}
                {balloon.statusChangedBy && (
                  <Typography component="span" color="primary" sx={{ ml: 0.5 }}>
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
              variant="contained"
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
              variant="contained"
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
              variant="contained"
              color="success"
              onClick={() => onDelivery(balloon)}
              fullWidth={isMobile}
            >
              Deliver
            </Button>
          )}
          {userRole === 'courier' && balloon.status === 'Delivered' && onRevert && (
            <Button
              variant="contained"
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