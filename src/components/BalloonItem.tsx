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
import { getRoomFromTeamName } from '../config/roomMapping';
import { getBalloonColor, getStatusColor } from '../config/colors';

interface BalloonItemProps {
  balloon: BalloonRequestDTO;
  showActions?: boolean;
  userRole?: UserRole;
  onMarkReady?: (balloon: BalloonRequestDTO) => void;
  onPickup?: (balloon: BalloonRequestDTO) => void;
  onDelivery?: (balloon: BalloonRequestDTO) => void;
  onRevert?: (balloon: BalloonRequestDTO) => void;
  onRevertToReady?: (balloon: BalloonRequestDTO) => void;
  onRevertToPending?: (balloon: BalloonRequestDTO) => void;
}

export const BalloonItem = ({
  balloon,
  showActions,
  userRole,
  onMarkReady,
  onPickup,
  onDelivery,
  onRevert,
  onRevertToReady,
  onRevertToPending,
}: BalloonItemProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          
          {userRole === 'courier' && balloon.status === 'Delivered' && onRevert && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => onRevert(balloon)}
              fullWidth={isMobile}
              sx={{ mr: isMobile ? 0 : 1 }}
            >
              Revert to Picked Up
            </Button>
          )}
          {/* Revert buttons */}
          {userRole === 'courier' && balloon.status === 'PickedUp' && onRevertToReady && (
            <Button
              variant="outlined"
              color="warning"
              onClick={() => onRevertToReady(balloon)}
              fullWidth={isMobile}
              sx={{ 
                mr: isMobile ? 0 : 1,
                borderColor: theme.palette.warning.light,
                color: theme.palette.warning.dark,
                '&:hover': {
                  borderColor: theme.palette.warning.main,
                  backgroundColor: alpha(theme.palette.warning.light, 0.1),
                }
              }}
            >
              Revert to Ready
            </Button>
          )}
          {userRole === 'courier' && balloon.status === 'ReadyForPickup' && onRevertToPending && (
            <Button
              variant="outlined"
              color="warning"
              onClick={() => onRevertToPending(balloon)}
              fullWidth={isMobile}
              sx={{ 
                mr: isMobile ? 0 : 1,
                borderColor: theme.palette.warning.light,
                color: theme.palette.warning.dark,
                '&:hover': {
                  borderColor: theme.palette.warning.main,
                  backgroundColor: alpha(theme.palette.warning.light, 0.1),
                }
              }}
            >
              Revert to Pending
            </Button>
          )}
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
              sx={{ mr: isMobile ? 0 : 1 }}
            >
              Deliver
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
}; 