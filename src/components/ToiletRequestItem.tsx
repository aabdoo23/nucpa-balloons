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
import { ToiletRequestDTO, UserRole, ToiletRequestStatusString } from '../types';

interface ToiletRequestItemProps {
  request: ToiletRequestDTO;
  showActions?: boolean;
  userRole?: UserRole;
  onStart?: (request: ToiletRequestDTO) => void;
  onComplete?: (request: ToiletRequestDTO) => void;
  onDelete?: (request: ToiletRequestDTO) => void;
}

export const ToiletRequestItem = ({
  request,
  showActions,
  userRole,
  onStart,
  onComplete,
  onDelete,
}: ToiletRequestItemProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return theme.palette.warning.main;
      case 'inprogress':
        return theme.palette.info.main;
      case 'completed':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[600];
    }
  };

  const getGenderColor = (isMale: boolean) => {
    return isMale ? theme.palette.primary.main : theme.palette.secondary.main;
  };

  const canStartRequest = () => {
    return (userRole === 'accompanier' || userRole === 'admin') && 
           request.status.toLowerCase() === ToiletRequestStatusString.Pending.toLowerCase();
  };

  const canCompleteRequest = () => {
    return (userRole === 'accompanier' || userRole === 'admin') && 
           request.status.toLowerCase() === ToiletRequestStatusString.InProgress.toLowerCase();
  };

  const canDeleteRequest = () => {
    return userRole === 'admin';
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        borderLeft: isMobile ? 15 : 25,
        borderColor: request.isUrgent ? theme.palette.error.main : getGenderColor(request.isMale),
        bgcolor: alpha(request.isUrgent ? theme.palette.error.main : getGenderColor(request.isMale), 0.02),
        '&:hover': {
          boxShadow: theme.shadows[3],
          bgcolor: alpha(request.isUrgent ? theme.palette.error.main : getGenderColor(request.isMale), 0.04),
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
              Team {request.teamName}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 1,
              width: isMobile ? '100%' : 'auto'
            }}>
              <Chip
                label={`Room ${request.roomName}`}
                size={isMobile ? "medium" : "small"}
                color="secondary"
                variant="outlined"
              />
              <Chip
                label={request.isMale ? "Male" : "Female"}
                size={isMobile ? "medium" : "small"}
                sx={{
                  backgroundColor: alpha(getGenderColor(request.isMale), 0.1),
                  color: getGenderColor(request.isMale),
                  borderColor: getGenderColor(request.isMale),
                  fontWeight: 'medium',
                }}
              />
              {request.isUrgent && (
                <Chip
                  label="Urgent"
                  size={isMobile ? "medium" : "small"}
                  color="error"
                  variant="outlined"
                />
              )}
              <Chip
                label={request.status}
                size={isMobile ? "medium" : "small"}
                sx={{
                  backgroundColor: alpha(getStatusColor(request.status), 0.1),
                  color: getStatusColor(request.status),
                  borderColor: getStatusColor(request.status),
                  fontWeight: 'medium',
                }}
              />
            </Box>
          </Box>
          
          <Divider />
          
          <Stack spacing={1}>
            <Typography 
              variant="body2" 
              sx={{ color: theme.palette.text.secondary }}
            >
              Submitted: {new Date(request.timestamp).toLocaleString()}
            </Typography>
            {request.statusChangedAt && (
              <Typography 
                variant="body2" 
                sx={{ color: theme.palette.text.secondary }}
              >
                Status changed: {new Date(request.statusChangedAt).toLocaleString()}
                {request.statusChangedBy && (
                  <Typography 
                    component="span" 
                    sx={{ 
                      color: theme.palette.primary.main,
                      ml: 0.5,
                      fontWeight: 'medium',
                    }}
                  >
                    by {request.statusChangedBy}
                  </Typography>
                )}
              </Typography>
            )}
            {request.comment && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontStyle: 'italic',
                }}
              >
                Comment: {request.comment}
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
          {canStartRequest() && onStart && (
            <Button
              variant="outlined"
              color="info"
              onClick={() => onStart(request)}
              fullWidth={isMobile}
              sx={{ mr: isMobile ? 0 : 1 }}
            >
              Start
            </Button>
          )}
          {canCompleteRequest() && onComplete && (
            <Button
              variant="outlined"
              color="success"
              onClick={() => onComplete(request)}
              fullWidth={isMobile}
              sx={{ mr: isMobile ? 0 : 1 }}
            >
              Complete
            </Button>
          )}
          {canDeleteRequest() && onDelete && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => onDelete(request)}
              fullWidth={isMobile}
            >
              Delete
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
}; 