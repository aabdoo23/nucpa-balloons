import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Stack,
  Typography,
  Chip,
  Box,
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
    <ListItem
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <ListItemText
        primary={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1">
              Team {balloon.teamName}
            </Typography>
            <Chip
              label={`Problem ${balloon.problemIndex}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={balloon.balloonColor}
              size="small"
              sx={{
                backgroundColor: balloon.balloonColor.toLowerCase(),
                color: 'white',
              }}
            />
            <Chip
              label={balloon.status}
              size="small"
              color={getStatusColor(balloon.status)}
            />
          </Stack>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              Submitted at: {new Date(balloon.timestamp).toLocaleString()}
            </Typography>
            {balloon.statusChangedAt && (
              <Typography variant="body2" color="text.secondary">
                Status changed at: {new Date(balloon.statusChangedAt).toLocaleString()}
                {balloon.statusChangedBy && ` by ${balloon.statusChangedBy}`}
              </Typography>
            )}
          </Box>
        }
      />
      {showActions && (
        <ListItemSecondaryAction>
          {userRole === 'balloonPrep' && balloon.status === 'Pending' && onMarkReady && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => onMarkReady(balloon)}
              sx={{ mr: 1 }}
            >
              Mark Ready
            </Button>
          )}
          {userRole === 'courier' && balloon.status === 'ReadyForPickup' && onPickup && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => onPickup(balloon)}
              sx={{ mr: 1 }}
            >
              Pick Up
            </Button>
          )}
          {balloon.status === 'PickedUp' && onDelivery && (
            <Button
              variant="contained"
              color="success"
              onClick={() => onDelivery(balloon)}
            >
              Deliver
            </Button>
          )}
          {balloon.status === 'Delivered' && onRevert && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => onRevert(balloon)}
            >
              Revert to Picked Up
            </Button>
          )}
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
}; 